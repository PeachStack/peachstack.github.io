import { motion } from 'motion/react';
import { Users, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const GOOGLE_FORM_URL = 'https://forms.gle/8nDwdqpbnXuYnhj76';
const COMMUNITY_CTA_URL = `${GOOGLE_FORM_URL}?utm_source=peachstack&utm_medium=website&utm_campaign=community_page`;

export default function Community() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Community — Peach Stack | Student Network & Resources</title>
        <meta name="description" content="Join the Peach Stack community. Connect with fellow interns, access resources, and grow your professional network as a college student." />
        <link rel="canonical" href="https://peachstack.github.io/community" />
      </Helmet>
      <section className="bg-slate-950 py-24 lg:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-500/10 px-4 py-1.5 text-sm font-bold text-peach-400 mb-8 border border-peach-500/20">
              <Users size={14} />
              <span>Community</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl mb-8">
              The Peach Stack <span className="text-peach-500">Community</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              A space for current and alumni interns to connect, share work, and grow together.
              Coming soon.
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
              <Users size={40} />
            </div>
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              If you're a current Peach Stack intern, your workspace gives you access to team
              communications, task boards, and cohort updates. Log in to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/workspace/login"
                className="flex items-center gap-2 rounded-2xl bg-peach-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-peach-200 transition-all hover:bg-peach-600 active:scale-95"
              >
                Go to Workspace
                <ArrowRight size={18} />
              </Link>
              <a
                href={COMMUNITY_CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 text-base font-bold text-slate-900 transition-all hover:bg-slate-50 active:scale-95"
              >
                Apply to Join
                <ExternalLink size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
