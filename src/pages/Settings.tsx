import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Lock, User, Shield, HelpCircle, LogOut, ChevronRight, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('peachstack_user_name');
    if (savedName) {
      setUserName(savedName);
      setEmail(savedName.toLowerCase().replace(' ', '.') + '@university.edu');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('peachstack_user_name', userName);
    toast.success('Settings saved successfully!');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(apiUrl('/api/workspace/password'), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Failed to update password');
        return;
      }
      toast.success('Password updated successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setShowPasswordForm(false);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setPwSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your account preferences and security.</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full shrink-0 lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                    activeTab === tab.id
                      ? "bg-peach-500 text-white shadow-lg shadow-peach-100"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-peach-400 mb-4">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-sm">Privacy Guard</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Your data is encrypted and never shared with third parties without consent.
              </p>
            </div>
          </div>

          {/* Main Settings Area */}
          <div className="flex-grow">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
            >
              {activeTab === 'profile' && (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Professional Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your career goals..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-peach-500 px-8 py-3 font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95"
                    >
                      <Save size={18} />
                      Save Profile
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-900">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Project Matches', desc: 'Get notified when a new project matches your stack.' },
                      { label: 'Task Reminders', desc: 'Receive alerts for upcoming project deadlines.' },
                      { label: 'Platform Updates', desc: 'Stay informed about new features and announcements.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <div className="h-6 w-11 rounded-full bg-peach-500 relative cursor-pointer">
                          <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                            <Lock size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Change Password</p>
                            <p className="text-xs text-slate-500">Update your account password.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPasswordForm(v => !v)}
                          className="text-sm font-bold text-peach-600 hover:text-peach-700 transition-colors"
                        >
                          {showPasswordForm ? 'Cancel' : 'Update'}
                        </button>
                      </div>
                      {showPasswordForm && (
                        <form onSubmit={handlePasswordChange} className="mt-5 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
                            <input
                              type="password"
                              required
                              value={pwForm.current}
                              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                            <input
                              type="password"
                              required
                              value={pwForm.newPw}
                              onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                              placeholder="At least 8 characters"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              required
                              value={pwForm.confirm}
                              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                              placeholder="Re-enter new password"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={pwSaving}
                            className="flex items-center justify-center gap-2 rounded-xl bg-peach-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-peach-600 active:scale-95 disabled:opacity-50 transition-all"
                          >
                            <Save size={16} />
                            {pwSaving ? 'Saving...' : 'Save Password'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="mt-8 flex items-center justify-between p-6 rounded-3xl bg-red-50 border border-red-100">
              <div>
                <h3 className="text-sm font-bold text-red-900">Deactivate Account</h3>
                <p className="text-xs text-red-600">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
