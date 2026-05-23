import { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';

type Screen = 'login' | 'signup' | 'home' | 'game' | 'results' | 'dashboard';

export default function App() {
  const { user } = useAuthStore();
  const [screen, setScreen] = useState<Screen>(user ? 'home' : 'login');
  const [sessionId, setSessionId] = useState<number | null>(null);

  if (!user) {
    if (screen === 'signup') return <SignupPage onLogin={() => setScreen('login')} />;
    return <LoginPage onSignup={() => setScreen('signup')} />;
  }
  if (screen === 'game' && sessionId !== null) return <GamePage sessionId={sessionId} onEnd={() => setScreen('results')} />;
  if (screen === 'results') return <ResultsPage onHome={() => setScreen('home')} />;
  if (screen === 'dashboard') return <DashboardPage onHome={() => setScreen('home')} />;
  return <HomePage onStart={(sid) => { setSessionId(sid); setScreen('game'); }} onDashboard={() => setScreen('dashboard')} />;
}
