import { motion } from 'motion/react';
import { BookOpen, Linkedin } from 'lucide-react';

export default function Blog() {
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
              <BookOpen size={14} />
              <span>Blog</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl mb-8">
              Peach Stack <span className="text-peach-500">Blog</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Insights on early career development, Atlanta's business landscape, and what it
              actually takes to build real skills before you graduate.
            </p>
          </motion.div>
        </div>
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-peach-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-peach-50 text-peach-500 flex items-center justify-center mx-auto mb-8">
              <BookOpen size={40} />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">Coming Soon</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Follow us on LinkedIn to stay in the loop.
            </p>
            <a
              href="https://www.linkedin.com/company/peach-stack"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              <Linkedin size={18} />
              Follow on LinkedIn
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
