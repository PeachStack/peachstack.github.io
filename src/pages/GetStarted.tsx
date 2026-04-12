import { motion } from 'motion/react';
import { GraduationCap, Building2, ArrowRight, CheckCircle2, Sparkles, Target, Rocket } from 'lucide-react';
import PeachLogo from '../components/ui/PeachLogo';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function GetStarted() {
  const [hoveredRole, setHoveredRole] = useState<'student' | 'employer' | null>(null);

  const EMPLOYER_FORM_URL = 'https://docs.google.com/forms/d/1uz55KEIkH3XwnVJxvdQgMMByidmsQRB9dRkVWLJb8p0/viewform';
  const STUDENT_FORM_URL = 'https://forms.gle/8nDwdqpbnXuYnhj76?utm_source=peachstack&utm_medium=website&utm_campaign=get_started_page';

  const handleSelection = (role: 'student' | 'employer') => {
    if (role === 'student') {
      window.open(STUDENT_FORM_URL, '_blank', 'noopener,noreferrer');
    } else {
      window.open(EMPLOYER_FORM_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
            <Sparkles size={16} />
            <span>Your Professional Journey Starts Here</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            How would you like to use <span className="text-peach-500">Peach Stack</span>?
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Choose your path and start building the future of corporate consulting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Student Path */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => setHoveredRole('student')}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleSelection('student')}
            className={cn(
              "group cursor-pointer relative overflow-hidden rounded-[2.5rem] border-2 p-8 transition-all duration-300",
              hoveredRole === 'student' ? "border-peach-500 bg-peach-50/30 shadow-2xl shadow-peach-100 scale-[1.02]" : "border-slate-100 bg-white hover:border-peach-200"
            )}
          >
            <div className="relative z-10">
              <div className={cn(
                "mb-8 flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-300",
                hoveredRole === 'student' ? "bg-peach-500 text-white shadow-lg shadow-peach-200" : "bg-slate-50 text-slate-400"
              )}>
                <GraduationCap size={40} />
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">I am a Student</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Build your "Stack Profile," learn industry tools, and land your first professional projects as a student.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Build a dynamic Stack Profile',
                  'Master industry standard tools',
                  'Match with paid projects',
                  'Earn verified skill badges'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 size={18} className="text-peach-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className={cn(
                "flex items-center gap-2 font-bold transition-all",
                hoveredRole === 'student' ? "text-peach-600 translate-x-2" : "text-slate-400"
              )}>
                Get Started as Student
                <ArrowRight size={20} />
              </div>
            </div>
            {/* Decorative background icon */}
            <PeachLogo className="absolute -right-8 -bottom-8 h-48 w-48 text-slate-50 opacity-10 group-hover:text-peach-100 group-hover:opacity-20 transition-all duration-500" />
          </motion.div>

          {/* Employer Path */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredRole('employer')}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleSelection('employer')}
            className={cn(
              "group cursor-pointer relative overflow-hidden rounded-[2.5rem] border-2 p-8 transition-all duration-300",
              hoveredRole === 'employer' ? "border-slate-900 bg-slate-50 shadow-2xl shadow-slate-200 scale-[1.02]" : "border-slate-100 bg-white hover:border-slate-200"
            )}
          >
            <div className="relative z-10">
              <div className={cn(
                "mb-8 flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-300",
                hoveredRole === 'employer' ? "bg-slate-900 text-white shadow-lg shadow-slate-300" : "bg-slate-50 text-slate-400"
              )}>
                <Building2 size={40} />
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">I am an Employer</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Access a pipeline of motivated, vetted early talent and get high impact projects completed efficiently.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Access vetted talent',
                  'Post project based roles',
                  'Streamlined matching dashboard',
                  'High ROI project outcomes'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 size={18} className="text-slate-900" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className={cn(
                "flex items-center gap-2 font-bold transition-all",
                hoveredRole === 'employer' ? "text-slate-900 translate-x-2" : "text-slate-400"
              )}>
                Partner with Peach Stack
                <ArrowRight size={20} />
              </div>
            </div>
            {/* Decorative background icon */}
            <Target className="absolute -right-8 -bottom-8 h-48 w-48 text-slate-50 opacity-10 group-hover:text-slate-200 group-hover:opacity-20 transition-all duration-500" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-slate-400">
            Already have an account? <a href="#" className="font-bold text-slate-900 hover:underline">Sign In</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
