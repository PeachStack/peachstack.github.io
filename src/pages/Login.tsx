import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      toast.success(`Welcome back, ${data.user.name}!`);
      
      // Store user info in localStorage for client-side persistence
      localStorage.setItem('peachstack_user_name', data.user.name);
      localStorage.setItem('peachstack_user_role', data.user.role);
      
      // Redirect based on role
      if (data.user.role === 'student') {
        navigate('/workspace');
      } else {
        navigate('/employer');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
            <Sparkles size={16} />
            <span>Welcome Back to Peachstack</span>
          </div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
            Sign In
          </h2>
          <p className="mt-4 text-slate-600">
            Access your professional stack and projects.
          </p>
        </div>

        <div className="mt-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100/50">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-peach-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-peach-500/10"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-slate-900">Password</label>
                <a href="#" className="text-xs font-bold text-peach-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-peach-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-peach-500/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/get-started" className="font-bold text-peach-600 hover:underline">
                Get Started
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-widest">Demo Credentials</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-bold">Student:</span> student@peachstack.com / password123</p>
            <p><span className="font-bold">Employer:</span> employer@peachstack.com / password123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
