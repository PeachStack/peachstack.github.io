import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { apiUrl } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed'); return; }
      navigate('/admin/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-peach-500 flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">Peachstack Admin</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Manage your<br />
            <span className="text-peach-400">internship program</span><br />
            from one place.
          </h1>
          <p className="mt-4 text-slate-400 text-lg">Interns, tasks, cohorts, and communications, all in one secure dashboard.</p>
        </div>
        <p className="text-slate-600 text-sm">© 2026 Peachstack · Atlanta, Georgia</p>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-peach-500 flex items-center justify-center"><ShieldCheck size={18} className="text-white" /></div>
            <span className="font-display font-bold text-slate-900">Peachstack Admin</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your admin account</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="admin@peachstack.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-peach-500 hover:bg-peach-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-slate-400">Admin access only. <a href="/" className="text-peach-600 hover:underline">Back to main site →</a></p>
        </motion.div>
      </div>
    </div>
  );
}
