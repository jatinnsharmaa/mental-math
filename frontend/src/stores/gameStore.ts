import { create } from 'zustand';
import type { Question, SessionAnswer } from '../types';

type GameState = {
  questions: Question[];
  currentIndex: number;
  answers: SessionAnswer[];
  setQuestions: (q: Question[]) => void;
  appendQuestions: (q: Question[]) => void;
  nextQuestion: () => void;
  addAnswer: (a: SessionAnswer) => void;
  reset: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  setQuestions: (questions) => set({ questions, currentIndex: 0, answers: [] }),
  appendQuestions: (more) => set(s => ({ questions: [...s.questions, ...more] })),
  nextQuestion: () => set(s => ({ currentIndex: s.currentIndex + 1 })),
  addAnswer: (a) => set(s => ({ answers: [...s.answers, a] })),
  reset: () => set({ questions: [], currentIndex: 0, answers: [] }),
}));
