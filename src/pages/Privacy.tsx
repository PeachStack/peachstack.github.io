import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, Users, Trash2, FileText } from 'lucide-react';

const LAST_UPDATED = 'April 11, 2026';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: (
      <p className="text-slate-600 leading-relaxed">
        When you apply to or use Peach Stack, we may collect your name, email address, phone number,
        resume, school information, and any other information you voluntarily provide through our
        application form or account registration. When you use the platform, we also collect basic
        usage data such as login timestamps and activity on your account.
      </p>
    ),
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    content: (
      <p className="text-slate-600 leading-relaxed">
        We use your information to review your application, create and manage your account,
        communicate with you about your role and tasks, and send platform-related notifications.
        We do not sell your personal information to anyone, ever.
      </p>
    ),
  },
  {
    icon: Users,
    title: 'Third Parties',
    content: (
      <p className="text-slate-600 leading-relaxed">
        We use the following third-party services that may process your data: Resend (email
        delivery), Google Forms and Google Drive (application submissions), and GitHub Pages or
        Railway (hosting). Each of these has their own privacy policies governing how they handle
        data.
      </p>
    ),
  },
  {
    icon: Trash2,
    title: 'Data Retention',
    content: (
      <p className="text-slate-600 leading-relaxed">
        We retain your information for as long as your account is active or as needed to operate the
        platform. If you request deletion, we will remove your personal data within 30 days.
      </p>
    ),
  },
  {
    icon: FileText,
    title: 'Your Rights',
    content: (
      <p className="text-slate-600 leading-relaxed">
        You have the right to request access to, correction of, or deletion of your personal data
        at any time. To make a request, email us at{' '}
        <a href="mailto:peachstackadmin@gmail.com" className="text-peach-600 font-bold hover:underline">
          peachstackadmin@gmail.com
        </a>.
      </p>
    ),
  },
  {
    icon: ShieldCheck,
    title: 'Children and Age Requirements',
    content: (
      <p className="text-slate-600 leading-relaxed">
        Peach Stack is intended for users who are 18 years of age or older. We do not knowingly
        collect information from anyone under 18. If we become aware that a user is under 18, we
        will terminate their account immediately.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-peach-50 text-peach-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">
                Last Updated: {LAST_UPDATED}
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-12">
            Peach Stack ("we," "us," or "our") is operated out of Atlanta, Georgia. This Privacy
            Policy explains what information we collect, how we use it, and your rights regarding
            that information.
          </p>

          <div className="space-y-12">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <s.icon className="text-peach-500 shrink-0" size={24} />
                  {s.title}
                </h2>
                {s.content}
              </section>
            ))}

            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Contact</h3>
              <p className="text-slate-600 text-sm">
                If you have any questions about this Privacy Policy, contact us at{' '}
                <a
                  href="mailto:peachstackadmin@gmail.com"
                  className="text-peach-600 font-bold hover:underline"
                >
                  peachstackadmin@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

