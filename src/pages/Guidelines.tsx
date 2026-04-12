import { motion } from 'motion/react';
import { FileText, User, Shield, Briefcase, Code2, AlertTriangle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'April 11, 2026';

const sections = [
  {
    icon: User,
    title: 'Eligibility',
    content: (
      <p className="text-slate-600 leading-relaxed">
        You must be at least 18 years old to use Peach Stack. By using the platform, you represent
        and warrant that you are 18 or older. If we determine that you are under 18, your account
        will be terminated immediately and any agreements will be considered void.
      </p>
    ),
  },
  {
    icon: Shield,
    title: 'Accounts',
    content: (
      <p className="text-slate-600 leading-relaxed">
        You are responsible for keeping your login credentials secure. You may not share your
        account with anyone else. You are responsible for all activity that occurs under your
        account. We reserve the right to suspend or terminate your account at any time for any
        reason, including violation of these terms.
      </p>
    ),
  },
  {
    icon: Briefcase,
    title: 'Platform Use',
    content: (
      <p className="text-slate-600 leading-relaxed">
        You agree to use Peach Stack only for its intended purpose: participating in the internship
        program, completing assigned tasks, and communicating with the Peach Stack team. You may not
        use the platform to harass others, submit false information, attempt to gain unauthorized
        access to other accounts, or engage in any illegal activity.
      </p>
    ),
  },
  {
    icon: Briefcase,
    title: 'Internship Program',
    content: (
      <p className="text-slate-600 leading-relaxed">
        Participation in the Peach Stack internship program does not constitute employment. Interns
        are unpaid program participants unless otherwise agreed to in a separate written agreement.
        Peach Stack reserves the right to remove any intern from the program at any time.
      </p>
    ),
  },
  {
    icon: Code2,
    title: 'Intellectual Property',
    content: (
      <p className="text-slate-600 leading-relaxed">
        Any work product, code, designs, or deliverables you create as part of the Peach Stack
        program that are submitted through the platform are owned by Peach Stack unless a separate
        written agreement states otherwise.
      </p>
    ),
  },
  {
    icon: AlertTriangle,
    title: 'Disclaimer',
    content: (
      <p className="text-slate-600 leading-relaxed">
        The platform is provided as-is without warranties of any kind. We do not guarantee
        uninterrupted access or that the platform will be error-free.
      </p>
    ),
  },
  {
    icon: Scale,
    title: 'Limitation of Liability',
    content: (
      <p className="text-slate-600 leading-relaxed">
        To the fullest extent permitted by law, Peach Stack shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the platform.
      </p>
    ),
  },
  {
    icon: Scale,
    title: 'Governing Law',
    content: (
      <p className="text-slate-600 leading-relaxed">
        These terms are governed by the laws of the State of Georgia, United States. Any disputes
        shall be resolved in the courts of Fulton County, Georgia.
      </p>
    ),
  },
  {
    icon: FileText,
    title: 'Changes to These Terms',
    content: (
      <p className="text-slate-600 leading-relaxed">
        We may update these terms at any time. We will notify you by email if we make material
        changes. Continued use of the platform after changes are posted constitutes acceptance of
        the updated terms.
      </p>
    ),
  },
];

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">
                Last Updated: {LAST_UPDATED}
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-12">
            These Terms of Service govern your use of the Peach Stack platform. By creating an
            account or submitting an application, you agree to these terms.
          </p>

          <div className="space-y-12">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <s.icon className="text-blue-500 shrink-0" size={24} />
                  {s.title}
                </h2>
                {s.content}
              </section>
            ))}

            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Contact</h3>
              <p className="text-slate-600 text-sm">
                Questions about these terms? Email us at{' '}
                <a
                  href="mailto:peachstackadmin@gmail.com"
                  className="text-peach-600 font-bold hover:underline"
                >
                  peachstackadmin@gmail.com
                </a>.
              </p>
            </section>

            <section className="border-t border-slate-100 pt-8">
              <p className="text-slate-500 text-sm">
                Also read our{' '}
                <Link to="/safety" className="text-peach-600 font-bold hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
