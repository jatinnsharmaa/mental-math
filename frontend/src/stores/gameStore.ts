import { create } from 'zustand';
import type { Question, SessionAnswer } from '../types';

export type PendingAnswer = { questionId: number; userAnswer: string; responseTimeMs: number };

type GameState = {
  questions: Question[];
  currentIndex: number;
  answers: SessionAnswer[];
  pendingAnswers: PendingAnswer[];
  setQuestions: (q: Question[]) => void;
  appendQuestions: (q: Question[]) => void;
  nextQuestion: () => void;
  addAnswer: (a: SessionAnswer) => void;
  addPending: (a: PendingAnswer) => void;
  flushPending: () => PendingAnswer[];
  reset: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  pendingAnswers: [],
  setQuestions: (questions) => set({ questions, currentIndex: 0, answers: [], pendingAnswers: [] }),
  appendQuestions: (more) => set(s => ({ questions: [...s.questions, ...more] })),
  nextQuestion: () => set(s => ({ currentIndex: s.currentIndex + 1 })),
  addAnswer: (a) => set(s => ({ answers: [...s.answers, a] })),
  addPending: (a) => set(s => ({ pendingAnswers: [...s.pendingAnswers, a] })),
  flushPending: () => {
    const flushed = get().pendingAnswers;
    set({ pendingAnswers: [] });
    return flushed;
  },
  reset: () => set({ questions: [], currentIndex: 0, answers: [], pendingAnswers: [] }),
}));
