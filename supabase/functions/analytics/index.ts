import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { verifyToken } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { aggregateAnswers, groupByDay, type AnswerRow } from './aggregate.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const user = await verifyToken(req);
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

  const supabase = getServiceClient();
  const url = new URL(req.url);

  if (url.pathname.endsWith('/summary')) {
    const { data: sessions } = await supabase.from('Session').select('id').eq('userId', user.userId);
    if (!sessions?.length) {
      return new Response(JSON.stringify({ totalAnswered: 0, accuracy: 0, avgResponseMs: 0, byCategory: {}, byDifficulty: {} }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const sessionIds = sessions.map((s: { id: number }) => s.id);
    const { data: answers } = await supabase
      .from('SessionAnswer')
      .select('isCorrect, responseTimeMs, question:Question(category, difficulty)')
      .in('sessionId', sessionIds);

    return new Response(JSON.stringify(aggregateAnswers((answers ?? []) as AnswerRow[])), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/daily')) {
    const days = parseInt(url.searchParams.get('days') ?? '7');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: sessions } = await supabase.from('Session').select('id').eq('userId', user.userId);
    const sessionIds = (sessions ?? []).map((s: { id: number }) => s.id);
    if (!sessionIds.length) return new Response(JSON.stringify({ daily: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: answers } = await supabase
      .from('SessionAnswer')
      .select('isCorrect, responseTimeMs, answeredAt')
      .in('sessionId', sessionIds)
      .gte('answeredAt', since.toISOString())
      .order('answeredAt');

    return new Response(JSON.stringify({ daily: groupByDay(answers ?? []) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
});
