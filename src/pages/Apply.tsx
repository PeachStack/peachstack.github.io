import { motion } from 'motion/react';
import { ArrowRight, Sparkles, TrendingUp, Briefcase, Code2, Megaphone, Users, HelpCircle, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const GOOGLE_FORM_URL = 'https://forms.gle/8nDwdqpbnXuYnhj76';
const APPLY_CTA_URL = `${GOOGLE_FORM_URL}?utm_source=peachstack&utm_medium=website&utm_campaign=apply_page`;

const roles = [
  {
    icon: TrendingUp,
    title: 'Sales & Business Development',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-100',
    desc: "You'll identify and connect with small business owners, build relationships, and bring in clients who are ready to grow. This is for people who are confident, personable, and hungry to learn how real business development works.",
  },
  {
    icon: Briefcase,
    title: 'Consulting, Business Track',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    desc: "You'll work directly with clients to understand their needs and build cost-effective solutions, focused on strategy and operations.",
  },
  {
    icon: Users,
    title: 'Consulting, Tech Track',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-100',
    desc: "You'll bridge the gap between what clients need and what our dev team builds. Business sense meets technical execution.",
  },
  {
    icon: Code2,
    title: 'Technology',
    color: 'bg-peach-500',
    lightColor: 'bg-peach-50',
    textColor: 'text-peach-700',
    borderColor: 'border-peach-100',
    desc: "You'll build real products that go live. Client websites, booking systems, CRMs, all shipped to production with real users on the other end. Best portfolio builder out there.",
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-100',
    desc: "You'll own how Peach Stack shows up online. Content, social, paid ads, campaign strategy. This is for people who understand how attention works and know how to turn it into action.",
  },
  {
    icon: HelpCircle,
    title: 'Open to anything / not sure yet',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-100',
    desc: "Not locked in on a track? That's totally fine. Tell us a bit about yourself and we'll find the best fit.",
  },
];

export default function Apply() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Apply — Peach Stack Internships for College Students</title>
        <meta name="description" content="Apply for a Peach Stack internship. Open roles in sales, consulting, technology, and marketing. Build a real portfolio and launch your career from day one." />
        <link rel="canonical" href="https://peachstack.github.io/apply" />
      </Helmet>
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
              <Sparkles size={16} />
              <span>Peach Stack Intern Application: Summer 2026</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Build something <span className="text-peach-500 italic">real</span> with us.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
              We're building something real and we want people who are ready to build with us. All roles are fully remote. Takes about 5 minutes. Be honest and show us who you are.
            </p>
            <p className="text-sm text-slate-400 mb-10">
              We review every application personally. You'll hear from us within 1–2 weeks.
            </p>
            <a
              href={APPLY_CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-peach-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-peach-200 transition-all hover:bg-peach-600 hover:shadow-peach-300 active:scale-95"
            >
              Apply Now
              <ExternalLink size={20} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">
              Open Roles
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the track that fits you best. You can apply to multiple roles in the same application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {roles.map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white rounded-[2rem] p-8 border ${role.borderColor} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-5 shadow-sm ${role.color}`}>
                  <role.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{role.title}</h3>
                <p className={`text-sm leading-relaxed ${role.textColor}`}>{role.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href={APPLY_CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-10 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-peach-500 hover:shadow-peach-200 active:scale-95"
            >
              Start Your Application
              <ArrowRight size={20} />
            </a>
            <p className="mt-4 text-sm text-slate-400">Fully remote · Summer 2026 · ~5 minutes to apply</p>
          </div>
        </div>
      </section>
    </div>
  );
}
