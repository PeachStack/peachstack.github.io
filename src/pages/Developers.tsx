import { motion } from 'motion/react';
import { Code2, Database, Shield, Mail, Layers } from 'lucide-react';

const stack = [
  { label: 'Frontend', value: 'React, TypeScript, Vite, Tailwind CSS, deployed on GitHub Pages' },
  { label: 'Backend', value: 'Node.js, Express, TypeScript, deployed on Render' },
  { label: 'Database', value: 'Turso (hosted SQLite, edge-distributed)' },
  { label: 'Auth', value: 'JWT with httpOnly cookies, bcrypt, rate limiting, helmet security headers' },
  { label: 'Email', value: 'Resend' },
  { label: 'Design', value: 'Syne + Inter, Framer Motion, Lucide icons' },
];

export default function Developers() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 py-24 lg:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-500/10 px-4 py-1.5 text-sm font-bold text-peach-400 mb-8 border border-peach-500/20">
              <Code2 size={14} />
              <span>Developers</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl mb-8">
              Built for <span className="text-peach-500">Scale</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Peachstack is a full-stack platform built on a modern, production-grade architecture.
              We ship real products, for real clients, on a real tech stack.
            </p>
          </motion.div>
        </div>
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-peach-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-peach-50 text-peach-500 flex items-center justify-center">
                <Layers size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Stack</h2>
            </div>
            <div className="space-y-4">
              {stack.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-400 sm:w-24 shrink-0">{item.label}</span>
                  <span className="text-slate-700 leading-relaxed">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900 rounded-[2.5rem] p-10 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-peach-500 flex items-center justify-center">
                <Shield size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold">Production by Default</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              Our interns don't work in sandboxes. They commit to production repos, go through real
              code review, and ship features that external clients use. This is the environment we
              built to make that possible.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Mail size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Work with Us</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Interested in integrating with Peachstack or building on our platform?
            </p>
            <a
              href="mailto:peachstackadmin@gmail.com"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white hover:bg-slate-800 transition-all active:scale-95"
            >
              <Mail size={18} />
              peachstackadmin@gmail.com
            </a>
          </motion.div>

          {/* Security note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-peach-50 rounded-[2.5rem] p-10 border border-peach-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-peach-500" />
              <h3 className="font-bold text-slate-900">Data & Security</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              All API routes are protected with JWT authentication, rate limiting, and helmet
              security headers. Passwords are hashed with bcrypt (12 rounds). Cookies are
              httpOnly and SameSite=None/Secure for cross-origin authentication. The database
              is edge-distributed via Turso for low-latency access.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
