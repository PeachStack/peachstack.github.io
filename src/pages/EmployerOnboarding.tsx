import { motion } from 'motion/react';
import { Building2, Mail, FileText, DollarSign, ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Upload, Save, ChevronRight } from 'lucide-react';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';

export default function EmployerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    projectBudget: '',
    projectDescription: '',
    invoiceFile: null as File | null
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/employer', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Thank you! We will be in touch shortly.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, invoiceFile: e.target.files[0] });
      toast.info(`File "${e.target.files[0].name}" selected.`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* Left Side: Info */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-peach-500 text-white mb-8">
              <Building2 size={24} />
            </div>
            <h2 className="font-display text-4xl font-bold mb-6">Partner with the Best Early Talent.</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Access a vetted pipeline of students ready to deliver high impact results for your company.
            </p>
            <div className="space-y-6">
              {[
                { title: 'Vetted Talent', desc: 'Every student is tested for logic and tool proficiency.' },
                { title: 'Streamlined Billing', desc: 'Send invoices directly through the platform.' },
                { title: 'High ROI', desc: 'Get quality work at a fraction of traditional consulting costs.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-peach-500/20 text-peach-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white">
                <ShieldCheck size={24} />
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise grade security and compliance for all project data.</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-peach-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("h-1 flex-grow rounded-full transition-all", step >= 1 ? "bg-peach-500" : "bg-slate-100")} />
              <span className={cn("h-1 flex-grow rounded-full transition-all", step >= 2 ? "bg-peach-500" : "bg-slate-100")} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {step === 1 ? 'Company Details' : 'Project & Billing'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? 'Tell us about your organization.' : 'Submit your project details and initial invoice.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Acme Corp"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={e => setFormData({...formData, contactName: e.target.value})}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@acme.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Project Budget (Stipend)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.projectBudget}
                      onChange={e => setFormData({...formData, projectBudget: e.target.value})}
                      placeholder="e.g. $500 - $1,000"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Initial Invoice (Optional)</label>
                  <div className="relative">
                    <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-6 transition-all hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="mb-3 text-slate-400" size={24} />
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-bold text-peach-500">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">PDF, JPG or PNG (MAX. 5MB)</p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} />
                      {formData.invoiceFile && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-peach-50 px-3 py-1 text-xs font-bold text-peach-600">
                          <FileText size={14} />
                          {formData.invoiceFile.name}
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Project Brief</label>
                  <textarea
                    required
                    value={formData.projectDescription}
                    onChange={e => setFormData({...formData, projectDescription: e.target.value})}
                    rows={3}
                    placeholder="Briefly describe the project goals..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95"
              >
                {step === 1 ? 'Next Step' : 'Submit Onboarding'}
                <ChevronRight size={20} />
              </button>
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back to company info
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Secure billing and data protection enabled.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
