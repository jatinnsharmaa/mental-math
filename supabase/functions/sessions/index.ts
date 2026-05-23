import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { verifyToken } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { formatQuestion } from '../_shared/distractors.ts';
import { matchRoute } from './routes.ts';

const BATCH = 30;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
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
    const questions = await fetchBatch(supabase, categories, difficulties);
    return new Response(JSON.stringify({ sessionId: session.id, questions }), {
      status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (route === 'next') {
    const sessionId = parseInt(url.pathname.match(/\/sessions\/(\d+)\/next$/)![1]);
    const { data: session } = await supabase.from('Session').select('categories, difficulties, userId').eq('id', sessionId).single();
    if (!session || session.userId !== user.userId) return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
    const questions = await fetchBatch(supabase, JSON.parse(session.categories), JSON.parse(session.difficulties));
    return new Response(JSON.stringify({ questions }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (route === 'answers') {
    const sessionId = parseInt(url.pathname.match(/\/sessions\/(\d+)\/answers$/)![1]);
    const { data: session } = await supabase.from('Session').select('userId').eq('id', sessionId).single();
    if (!session || session.userId !== user.userId) return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
    const { questionId, userAnswer, responseTimeMs } = await req.json();
    const { data: question } = await supabase.from('Question').select('answer').eq('id', questionId).single();
    if (!question) return new Response(JSON.stringify({ error: 'Question not found' }), { status: 404, headers: corsHeaders });
    const isCorrect = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    await supabase.from('SessionAnswer').insert({ sessionId, questionId, userAnswer, isCorrect, responseTimeMs });
    return new Response(JSON.stringify({ isCorrect, correctAnswer: question.answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (route === 'end') {
    const sessionId = parseInt(url.pathname.match(/\/sessions\/(\d+)\/end$/)![1]);
    const { data: session } = await supabase.from('Session').select('userId').eq('id', sessionId).single();
    if (!session || session.userId !== user.userId) return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
    const { data } = await supabase.from('Session').update({ endedAt: new Date().toISOString() }).eq('id', sessionId).select('endedAt').single();
    return new Response(JSON.stringify({ endedAt: data?.endedAt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
});
