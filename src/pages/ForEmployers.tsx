import { motion } from 'motion/react';
import { Building2, ShieldCheck, BarChart3, Users, Clock, CheckCircle2, ArrowRight, Sparkles, LayoutDashboard, PieChart, TrendingUp, Receipt, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Helmet } from 'react-helmet-async';

const EMPLOYER_FORM_URL = 'https://docs.google.com/forms/d/1uz55KEIkH3XwnVJxvdQgMMByidmsQRB9dRkVWLJb8p0/viewform';

export default function ForEmployers() {
  return (
    <div className="overflow-hidden bg-white">
      <Helmet>
        <title>For Employers — Hire Pre-Vetted Student Talent | Peach Stack</title>
        <meta name="description" content="Hire motivated, pre-vetted college students for real projects through Peach Stack. Access early talent in Atlanta and beyond. Simple onboarding, real results." />
        <link rel="canonical" href="https://peachstack.github.io/for-employers" />
        <meta property="og:title" content="For Employers — Hire Pre-Vetted Student Talent | Peach Stack" />
        <meta property="og:description" content="Hire motivated, pre-vetted college students for real projects through Peach Stack. Access early talent in Atlanta and beyond. Simple onboarding, real results." />
        <meta property="og:url" content="https://peachstack.github.io/for-employers" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://peachstack.github.io/peach-logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="For Employers — Hire Pre-Vetted Student Talent | Peach Stack" />
        <meta name="twitter:description" content="Hire motivated, pre-vetted college students for real projects through Peach Stack. Access early talent in Atlanta and beyond. Simple onboarding, real results." />
        <meta name="twitter:image" content="https://peachstack.github.io/peach-logo.png" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative bg-slate-950 py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-peach-500/10 px-4 py-1.5 text-sm font-bold text-peach-400 mb-6 border border-peach-500/20">
                <Building2 size={16} />
                <span>For Enterprise & Small Business</span>
              </div>
              <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl mb-8">
                Scale Your Business with <span className="text-peach-500">Early Talent.</span>
              </h1>
              <p className="text-xl leading-relaxed text-slate-400 mb-10">
                Access a vetted pipeline of motivated students ready to deliver high impact results. Manage projects, track performance, and handle billing all in one place.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row justify-center">
                <a
                  href={EMPLOYER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-peach-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-peach-500/20 transition-all hover:bg-peach-600 hover:shadow-peach-500/30 active:scale-95"
                >
                  Get Started Now
                  <ExternalLink size={20} />
                </a>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-800 bg-transparent px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-900 active:scale-95"
                >
                  Talk to Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-peach-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      </section>

      {/* CRM Dashboard Section */}
      <section className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600 mb-6">
                <LayoutDashboard size={16} />
                <span>Product Feature</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Powerful CRM Dashboard for <span className="text-peach-500">Business Management</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our integrated CRM provides a comprehensive overview of your business operations. From tracking client growth to monitoring revenue trends, Peach Stack gives you the analytics you need to make data driven decisions.
              </p>
              
              <div className="space-y-6">
                {[
                  { 
                    title: 'Real time KPI Tracking', 
                    desc: 'Monitor total clients, revenue growth, and upcoming appointments at a glance.',
                    icon: TrendingUp
                  },
                  { 
                    title: 'Revenue Analytics', 
                    desc: 'Visualize your financial performance with detailed trend lines and service breakdowns.',
                    icon: BarChart3
                  },
                  { 
                    title: 'Client Management', 
                    desc: 'Keep track of your top clients and upcoming interactions to ensure premium service delivery.',
                    icon: Users
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-peach-50 text-peach-500 shadow-sm">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}crm-dashboard.png`}
                  alt="Peach Stack CRM Dashboard"
                  className="rounded-2xl w-full h-auto shadow-inner"
                />
              </div>
              {/* Decorative background element */}
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-peach-100 blur-3xl -z-10" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative z-10 rounded-3xl bg-white p-2 shadow-2xl border border-slate-100 overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}crm-revenue-pl.png`}
                  alt="Revenue & P&L Page"
                  className="rounded-2xl w-full h-auto shadow-inner"
                />
              </div>
              {/* Decorative background element */}
              <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-blue-100 blur-3xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-xl order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-bold text-green-600 mb-6">
                <PieChart size={16} />
                <span>Financial Insights</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Complete Financial <span className="text-peach-500">Transparency</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Manage your Profit & Loss with ease. Our financial dashboard tracks gross revenue, expenses, and net profit in real time, helping you maintain a healthy bottom line while scaling your operations.
              </p>
              
              <div className="space-y-6">
                {[
                  { 
                    title: 'P&L at a Glance', 
                    desc: 'Instantly see your net profit and unpaid invoices to stay on top of your cash flow.',
                    icon: Receipt
                  },
                  { 
                    title: 'Expense Categorization', 
                    desc: 'Track where your money is going with detailed breakdowns of rent, supplies, and marketing.',
                    icon: PieChart
                  },
                  { 
                    title: 'Manual Entry Support', 
                    desc: 'Easily add cash sales, tips, and other revenue sources not captured through bookings.',
                    icon: LayoutDashboard
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shadow-sm">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900">Why Employers Choose Peach Stack</h2>
            <p className="mt-4 text-lg text-slate-600">The most efficient way to manage projects and talent.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Vetted Talent',
                desc: 'Every student on our platform undergoes rigorous testing for logic, communication, and tool proficiency.',
                icon: ShieldCheck,
                color: 'bg-blue-500'
              },
              {
                title: 'All in One Platform',
                desc: 'From project matching to CRM management and billing, handle everything in a single, unified workspace.',
                icon: LayoutDashboard,
                color: 'bg-peach-500'
              },
              {
                title: 'Cost Effective',
                desc: 'Get high quality professional deliverables at a fraction of the cost of traditional agencies or consultants.',
                icon: Clock,
                color: 'bg-indigo-500'
              }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100"
              >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", benefit.color)}>
                  <benefit.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-20 text-center shadow-2xl sm:px-16">
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Ready to scale your business?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
                We're launching our first cohort Summer 2026. Early partners get priority access and direct support from our founding team.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={EMPLOYER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-2xl bg-peach-500 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-peach-600 sm:w-auto flex items-center justify-center gap-2"
                >
                  Get Started
                  <ExternalLink size={18} />
                </a>
                <Link
                  to="/contact"
                  className="w-full rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 sm:w-auto"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-peach-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
