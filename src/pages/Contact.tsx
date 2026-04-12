import { motion } from 'motion/react';
import { Mail, Sparkles, CheckCircle2, MessageSquare, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiUrl } from '../lib/api';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-24">
      <Helmet>
        <title>Contact — Peach Stack</title>
        <meta name="description" content="Get in touch with the Peach Stack team. Questions about internships, partnerships, or working together? We'd love to hear from you." />
        <link rel="canonical" href="https://peachstack.github.io/contact" />
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
              <Sparkles size={16} />
              <span>Get in Touch</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-slate-900 mb-8">
              Let's build your <span className="text-peach-500 italic">stack</span> together.
            </h1>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed">
              Whether you're a student looking to launch your career or an employer seeking top talent, we're here to help. Reach out directly and we'll get back to you.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", "bg-blue-50 text-blue-600")}>
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email Us</h3>
                  <a
                    href="mailto:peachstackadmin@gmail.com"
                    className="text-peach-500 font-medium hover:underline"
                  >
                    peachstackadmin@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-peach-400" />
                  Response Time
                </h4>
                <p className="text-slate-400 text-sm mb-6">Our team reviews messages Monday – Friday. We aim to respond within 1–2 business days.</p>
                <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                  <CheckCircle2 size={14} />
                  Average response time: 24 hours
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-peach-500/10 blur-2xl" />
            </div>
          </motion.div>

          {/* Right Side: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 lg:p-12"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="h-20 w-20 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">Message Sent!</h2>
                <p className="text-slate-600 leading-relaxed max-w-sm">
                  Thanks for reaching out. We'll get back to you within 1–2 business days.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-peach-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={18} /> Send Message</>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

