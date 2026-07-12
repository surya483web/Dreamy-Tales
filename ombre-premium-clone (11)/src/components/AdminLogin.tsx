import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'gyanuverma') {
      onLogin();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Lock className="w-12 h-12 text-zinc-900" />
        </div>
        <h2 className="text-xl font-serif text-center mb-6">Admin Access</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          className="w-full px-4 py-2 border border-zinc-300 rounded mb-4"
          required
        />
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded font-bold uppercase tracking-wider text-xs hover:bg-zinc-800 transition-colors"
        >
          Unlock Panel
        </button>
      </form>
    </div>
  );
}
