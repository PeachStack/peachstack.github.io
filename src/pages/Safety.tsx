import { motion } from 'motion/react';
import { ShieldCheck, UserCheck, AlertTriangle, MessageSquare, Lock, Briefcase, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'April 11, 2026';

const sections = [
  {
    icon: UserCheck,
    title: 'How We Vet Employers',
    content: (
      <p className="text-slate-600 leading-relaxed">
        Every company or individual that partners with Peach Stack goes through a manual review before
        any student is matched with them. We verify business legitimacy, review the scope of proposed
        projects, and confirm that compensation terms are fair and clearly defined. We do not
        allow unpaid "exposure" projects. If an employer cannot meet our standards, we do not
        list them on the platform.
      </p>
    ),
  },
  {
    icon: Briefcase,
    title: 'Student Protections & Code of Conduct',
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed">
        <p>
          Peach Stack is committed to ensuring every student works in a professional, respectful
          environment. All employers and students agree to our Code of Conduct before participating.
          Key protections include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All project deliverables and compensation terms must be documented in writing before work begins.</li>
          <li>Students may not be asked to perform tasks outside the agreed project scope without renegotiated terms.</li>
          <li>Employers may not contact students outside of Peach Stack-facilitated channels without consent.</li>
          <li>Student work product is protected. Employers may not claim ownership of work without proper written agreement.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    title: 'Harassment Reporting',
    content: (
      <p className="text-slate-600 leading-relaxed">
        Zero tolerance for harassment. If a student experiences harassment, inappropriate communication,
        or any form of discriminatory treatment from an employer, they should report it immediately
        to{' '}
        <a href="mailto:peachstackadmin@gmail.com" className="text-peach-600 font-bold hover:underline">
          peachstackadmin@gmail.com
        </a>{' '}
        with the subject line "Safety Report." Reports are reviewed within 24 hours. The employer
        will be suspended from the platform pending investigation, and the student will be
        reassigned or compensated as appropriate.
      </p>
    ),
  },
  {
    icon: MessageSquare,
    title: 'Dispute Resolution',
    content: (
      <p className="text-slate-600 leading-relaxed">
        If a dispute arises between a student and an employer regarding payment, project scope,
        feedback, or conduct, either party may escalate to Peach Stack by emailing{' '}
        <a href="mailto:peachstackadmin@gmail.com" className="text-peach-600 font-bold hover:underline">
          peachstackadmin@gmail.com
        </a>
        {' '}with a summary of the issue. Our team will act as a neutral mediator and aim to resolve
        disputes within 5 business days. In cases of confirmed employer misconduct, students will
        not be penalized and will receive their agreed compensation.
      </p>
    ),
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: (
      <p className="text-slate-600 leading-relaxed">
        Student personal information (including contact details, resume, and school records) is
        never shared with employers without the student's explicit consent. We use industry-standard
        encryption for data in transit and at rest. Access to student records is restricted to
        Peach Stack staff only. For a full breakdown of how we handle your data, see our{' '}
        <Link to="/privacy" className="text-peach-600 font-bold hover:underline">
          Privacy Policy
        </Link>.
      </p>
    ),
  },
  {
    icon: Phone,
    title: 'Emergency Contact',
    content: (
      <p className="text-slate-600 leading-relaxed">
        For urgent safety concerns (including situations where a student feels unsafe or is being
        pressured), contact us immediately at{' '}
        <a href="mailto:peachstackadmin@gmail.com" className="text-peach-600 font-bold hover:underline">
          peachstackadmin@gmail.com
        </a>{' '}
        with the subject line "URGENT." If you are in immediate danger, please contact local
        emergency services (911) first.
      </p>
    ),
  },
];

export default function Safety() {
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
              <h1 className="font-display text-4xl font-bold text-slate-900">Safety</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">
                Last Updated: {LAST_UPDATED}
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-12">
            Peach Stack connects students with employers for real project work. That responsibility
            comes with a commitment to safety for everyone involved. This page explains how we vet
            partners, protect students from exploitation, handle disputes, and respond to
            emergencies.
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
              <h3 className="text-lg font-bold text-slate-900 mb-2">Questions or Concerns?</h3>
              <p className="text-slate-600 text-sm">
                If you have any questions about safety at Peach Stack, contact us at{' '}
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
                <Link to="/guidelines" className="text-peach-600 font-bold hover:underline">
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
