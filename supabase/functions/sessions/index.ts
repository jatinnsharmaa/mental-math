import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { verifyToken } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { formatQuestion } from '../_shared/distractors.ts';
import { matchRoute } from './routes.ts';

const BATCH = 80;

type PendingAnswer = { questionId: number; userAnswer: string; responseTimeMs: number };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function ok(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function notFound() {
  return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
}

async function fetchBatch(
  supabase: ReturnType<typeof getServiceClient>,
  categories: string[],
  difficulties: string[]
) {
  let query = supabase.from('Question').select('id, category, difficulty, prompt, answer');
  if (categories.length) query = query.in('category', categories);
  if (difficulties.length) query = query.in('difficulty', difficulties);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return shuffle(data ?? []).slice(0, BATCH).map(formatQuestion);
}

const MAX_BATCH = 200;

async function storeBatchAnswers(
  supabase: ReturnType<typeof getServiceClient>,
  sessionId: number,
  answers: PendingAnswer[]
) {
  if (!answers.length) return;
  if (answers.length > MAX_BATCH) answers = answers.slice(0, MAX_BATCH);
  const { data: questions } = await supabase
    .from('Question')
    .select('id, answer')
    .in('id', answers.map(a => a.questionId));
  const answerMap = new Map((questions ?? []).map((q: { id: number; answer: string }) => [q.id, q.answer]));
  const rows = answers.map(a => ({
    sessionId,
    questionId: a.questionId,
    userAnswer: a.userAnswer,
    isCorrect: a.userAnswer.trim().toLowerCase() === (answerMap.get(a.questionId) ?? '').trim().toLowerCase(),
    responseTimeMs: a.responseTimeMs,
  }));
  await supabase.from('SessionAnswer').insert(rows);
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const user = await verifyToken(req);
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

  const supabase = getServiceClient();
  const url = new URL(req.url);
  const route = matchRoute(req.method, url.pathname);

  if (route === 'create') {
    const { categories = [], difficulties = [] } = await req.json();
    const { data: session, error } = await supabase
      .from('Session')
      .insert({ userId: user.userId, categories: JSON.stringify(categories), difficulties: JSON.stringify(difficulties) })
      .select('id').single();
    if (error) return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: corsHeaders });
    let questions;
    try {
      questions = await fetchBatch(supabase, categories, difficulties);
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message ?? 'Failed to fetch questions' }), { status: 500, headers: corsHeaders });
    }
    return ok({ sessionId: session.id, questions }, 201);
  }

  if (route === 'next') {
    const sessionId = parseInt(url.pathname.match(/\/sessions\/(\d+)\/next$/)![1]);
    const { data: session } = await supabase.from('Session').select('categories, difficulties, userId').eq('id', sessionId).single();
    if (!session || session.userId !== user.userId) return notFound();
    const body = await req.json().catch(() => ({}));
    if (body.answers?.length) {
      await storeBatchAnswers(supabase, sessionId, body.answers);
    }
    const questions = await fetchBatch(supabase, JSON.parse(session.categories), JSON.parse(session.difficulties));
    return ok({ questions });
  }

  if (route === 'answers_batch') {
    const sessionId = parseInt(url.pathname.match(/\/sessions\/(\d+)\/answers\/batch$/)![1]);
    const { data: session } = await supabase.from('Session').select('userId').eq('id', sessionId).single();
    if (!session || session.userId !== user.userId) return notFound();
    const { answers } = await req.json();
    await storeBatchAnswers(supabase, sessionId, answers ?? []);
    return ok({});
  }

  if (route === 'end') {
    const sessionId = parseInt(url.pathname.match(/\/sessions\/(\d+)\/end$/)![1]);
    const { data: session } = await supabase.from('Session').select('userId').eq('id', sessionId).single();
    if (!session || session.userId !== user.userId) return notFound();
    const body = await req.json().catch(() => ({}));
    if (body.answers?.length) {
      await storeBatchAnswers(supabase, sessionId, body.answers);
    }
    const { data } = await supabase.from('Session').update({ endedAt: new Date().toISOString() }).eq('id', sessionId).select('endedAt').single();
    return ok({ endedAt: data?.endedAt });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
});
