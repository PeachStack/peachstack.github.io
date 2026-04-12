import { motion } from 'motion/react';
import { BookOpen, UserCheck, MessageSquare, Briefcase, Star, AlertTriangle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'April 12, 2026';

const sections = [
  {
    icon: UserCheck,
    title: 'Professional Conduct',
    content: (
      <div className="space-y-3 text-slate-600 leading-relaxed">
        <p>All Peach Stack participants (interns and employers alike) are expected to conduct themselves professionally at all times. This means:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Treat every person on the platform with respect, regardless of their role, background, or experience level.</li>
          <li>Communicate in a professional, constructive manner in all written communications.</li>
          <li>Honor your commitments. If you accept a task or project, complete it to the best of your ability by the agreed deadline.</li>
          <li>Disclose conflicts of interest promptly and honestly.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: MessageSquare,
    title: 'Communication Standards',
    content: (
      <div className="space-y-3 text-slate-600 leading-relaxed">
        <p>Clear, respectful communication is the foundation of every successful project. We expect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Respond to messages and task feedback within 48 hours on business days.</li>
          <li>Be direct and specific when providing feedback. Vague or dismissive responses are not helpful.</li>
          <li>No harassment, hate speech, discriminatory language, or personal attacks of any kind.</li>
          <li>Do not spam, send unsolicited promotional content, or use the platform's messaging for purposes unrelated to your internship work.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: Briefcase,
    title: 'Work Quality & Deliverables',
    content: (
      <div className="space-y-3 text-slate-600 leading-relaxed">
        <p>Peach Stack exists to build real skills through real work. Standards for deliverables:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Submit only original work. Plagiarism, passing off AI-generated content as your own without disclosure, or copying others' submissions is grounds for removal.</li>
          <li>If you are unable to complete a task by its deadline, notify your team admin <em>before</em> the deadline, not after.</li>
          <li>Task submissions should be complete and professionally presented. Rough drafts and placeholder content are not acceptable final submissions.</li>
          <li>Actively incorporate feedback from task reviews to improve your work and grow your skills.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: Star,
    title: 'Integrity & Honesty',
    content: (
      <div className="space-y-3 text-slate-600 leading-relaxed">
        <p>Trust is the currency of our platform. Integrity is non-negotiable:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Do not misrepresent your skills, experience, or credentials when applying or completing tasks.</li>
          <li>Do not share confidential project details, employer information, or other interns' work outside the platform.</li>
          <li>Report platform bugs, security issues, or suspicious behavior to <a href="mailto:peachstackadmin@gmail.com" className="text-peach-600 font-bold hover:underline">peachstackadmin@gmail.com</a> rather than exploiting them.</li>
          <li>Do not attempt to manipulate the points system, leaderboard, or any platform metric.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    title: 'Reporting Violations',
    content: (
      <p className="text-slate-600 leading-relaxed">
        If you witness or experience a violation of these guidelines (including harassment, discrimination, dishonesty, or any behavior that makes the platform unsafe), report it immediately to{' '}
        <a href="mailto:peachstackadmin@gmail.com" className="text-peach-600 font-bold hover:underline">
          peachstackadmin@gmail.com
        </a>{' '}
        with the subject line "Conduct Report." All reports are treated confidentially. Retaliation against anyone who files a good-faith report is itself a violation of these guidelines and grounds for removal.
      </p>
    ),
  },
  {
    icon: Scale,
    title: 'Consequences for Violations',
    content: (
      <div className="space-y-3 text-slate-600 leading-relaxed">
        <p>Violations of these guidelines are reviewed on a case-by-case basis. Depending on severity:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Minor violations</strong> (e.g., late submission without notice, unprofessional tone): formal warning and required acknowledgment.</li>
          <li><strong>Moderate violations</strong> (e.g., repeated lateness, dishonest submission): temporary suspension from the platform.</li>
          <li><strong>Severe violations</strong> (e.g., harassment, plagiarism, security exploitation): permanent removal with no opportunity for reinstatement.</li>
        </ul>
        <p>Peach Stack reserves the right to remove any participant from the program at any time for conduct that undermines the safety, integrity, or mission of the community.</p>
      </div>
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
              <BookOpen size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900">Community Guidelines</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">
                Last Updated: {LAST_UPDATED}
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-12">
            Peach Stack is built on the belief that ambitious students deserve a professional, respectful environment to grow. These guidelines set the standard of conduct for everyone on the platform: interns, employers, and administrators alike. By participating, you agree to uphold them.
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
              <h3 className="text-lg font-bold text-slate-900 mb-2">Questions?</h3>
              <p className="text-slate-600 text-sm">
                If you have questions about these guidelines, email us at{' '}
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
                <Link to="/terms" className="text-peach-600 font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-peach-600 font-bold hover:underline">
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
