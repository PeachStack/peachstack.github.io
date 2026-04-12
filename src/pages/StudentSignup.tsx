import { motion } from 'motion/react';
import { ExternalLink, Sparkles } from 'lucide-react';

const GOOGLE_FORM_URL = 'https://forms.gle/8nDwdqpbnXuYnhj76';

export default function StudentSignup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
          <Sparkles size={16} />
          <span>Peach Stack Applications</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Apply via Google Forms</h1>
        <p className="text-lg text-slate-600 mb-8">
          Applications are reviewed personally. Click below to fill out our short application form, which takes about 5 minutes.
        </p>
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-peach-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-peach-200 transition-all hover:bg-peach-600 active:scale-95"
        >
          Open Application Form
          <ExternalLink size={20} />
        </a>
      </motion.div>
    </div>
  );
}
