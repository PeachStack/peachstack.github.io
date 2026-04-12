import { motion } from 'motion/react';
import { Rocket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
      >
        <div className="mx-auto h-24 w-24 rounded-full bg-peach-50 flex items-center justify-center text-peach-500 mb-8">
          <Rocket size={48} className="animate-bounce" />
        </div>
        <h2 className="font-display text-4xl font-bold text-slate-900 mb-6">Coming Soon!</h2>
        <p className="text-lg text-slate-600 leading-relaxed mb-10">
          We're working hard to bring you this feature. Peach Stack is constantly evolving to better serve our community of ambitious students and partner firms.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-8 py-4 text-lg font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
