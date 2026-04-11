import { motion } from 'motion/react';
import { Cookie, Info, Lock, Settings } from 'lucide-react';

const LAST_UPDATED = 'April 11, 2026';

const sections = [
  {
    icon: Info,
    title: 'What Is a Cookie',
    content: (
      <p className="text-slate-600 leading-relaxed">
        A cookie is a small text file stored on your device when you visit a website or log into a
        platform. We use cookies solely for platform functionality, not for advertising or
        tracking.
      </p>
    ),
  },
  {
    icon: Lock,
    title: 'Cookies We Use',
    content: (
      <>
        <p className="text-slate-600 leading-relaxed mb-4">
          We use a single authentication cookie called <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">token</code>.
          This cookie is set when you log in and contains a JSON Web Token that identifies your
          session. It is <strong>httpOnly</strong> (cannot be accessed by JavaScript),{' '}
          <strong>secure</strong> (only transmitted over HTTPS), and expires after 24 hours.
          Without this cookie the platform cannot verify your identity and you will not be able to
          access your account.
        </p>
        <p className="text-slate-600 leading-relaxed">
          We do not use analytics cookies, advertising cookies, or any third-party tracking cookies.
        </p>
      </>
    ),
  },
  {
    icon: Settings,
    title: 'Managing Cookies',
    content: (
      <p className="text-slate-600 leading-relaxed">
        You can clear cookies at any time through your browser settings. Clearing the authentication
        cookie will log you out of the platform. Because our only cookie is essential for login
        functionality, there is no option to opt out of it while using the platform.
      </p>
    ),
  },
];

export default function Cookies() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <Cookie size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900">Cookie Policy</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">
                Last Updated: {LAST_UPDATED}
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-12">
            Peachstack uses cookies and similar technologies to operate the platform. This policy
            explains what we use and why.
          </p>

          <div className="space-y-12">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <s.icon className="text-amber-500 shrink-0" size={24} />
                  {s.title}
                </h2>
                {s.content}
              </section>
            ))}

            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Contact</h3>
              <p className="text-slate-600 text-sm">
                Questions about this Cookie Policy? Email us at{' '}
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
