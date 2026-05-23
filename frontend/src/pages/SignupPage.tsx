import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export function SignupPage({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) { setError(error.message); return; }
    if (!data.session) { setCheckEmail(true); return; }
    setAuth(data.session.access_token, { id: data.user!.id, email: data.user!.email!, name });
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
          <p className="text-sm text-gray-500">Confirmation sent to <strong>{email}</strong>. Click the link then sign in.</p>
          <button onClick={onLogin} className="text-sm text-gray-900 font-medium hover:underline">Back to sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Have an account?{' '}
          <button onClick={onLogin} className="text-gray-900 font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
