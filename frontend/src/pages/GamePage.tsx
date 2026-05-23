import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { api } from '../api/client';
import { QuestionCard } from '../components/QuestionCard';
import { Timer } from '../components/Timer';

type Props = { sessionId: number; onEnd: () => void };

export function GamePage({ sessionId, onEnd }: Props) {
  const { questions, currentIndex, nextQuestion, addAnswer, appendQuestions } = useGameStore(s => s);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [pending, setPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const fetching = useRef(false);

  const question = questions[currentIndex];
  const remaining = questions.length - currentIndex;

  useEffect(() => {
    if (remaining < 8 && !fetching.current) {
      fetching.current = true;
      api.fetchNextBatch(sessionId)
        .then(r => { appendQuestions(r.questions); fetching.current = false; })
        .catch(() => { fetching.current = false; });
    }
  }, [remaining]);

  useEffect(() => {
    setStartedAt(Date.now());
    setFeedback(null);
    setPending(null);
  }, [currentIndex]);

  async function handleChoice(chosen: string) {
    if (pending || feedback) return;
    setPending(chosen); // instant visual feedback
    const responseTimeMs = Date.now() - startedAt;
    const result = await api.submitAnswer(sessionId, question.id, chosen, responseTimeMs);
    setPending(null);
    setFeedback(result);
    addAnswer({ questionId: question.id, userAnswer: chosen, isCorrect: result.isCorrect, correctAnswer: result.correctAnswer, responseTimeMs });
    setTimeout(nextQuestion, result.isCorrect ? 600 : 1000);
  }

  async function handleStop() {
    await api.endSession(sessionId);
    onEnd();
  }

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{currentIndex + 1} answered</span>
          <div className="flex items-center gap-3">
            <Timer startedAt={startedAt} />
            <button onClick={handleStop} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-full px-3 py-1 transition-colors">Stop</button>
          </div>
        </div>
        <QuestionCard question={question} />
        {feedback && (
          <div className={`rounded-xl p-4 text-center text-sm font-medium ${feedback.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.isCorrect ? 'Correct!' : `Answer: ${feedback.correctAnswer}`}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map(opt => {
            const isPending = pending === opt;
            const isCorrectOpt = feedback?.correctAnswer === opt;
            const isDimmed = (!!feedback || (!!pending && !isPending)) && !isCorrectOpt;
            return (
              <button key={opt} onClick={() => handleChoice(opt)} disabled={!!pending || !!feedback}
                className={`py-4 rounded-xl text-sm font-medium border transition-colors disabled:cursor-default
                  ${!pending && !feedback ? 'bg-white border-gray-200 hover:border-gray-900 hover:bg-gray-50' : ''}
                  ${isPending ? 'bg-gray-900 border-gray-900 text-white' : ''}
                  ${isCorrectOpt ? 'bg-green-50 border-green-400 text-green-700' : ''}
                  ${isDimmed ? 'bg-white border-gray-100 text-gray-300' : ''}`}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
