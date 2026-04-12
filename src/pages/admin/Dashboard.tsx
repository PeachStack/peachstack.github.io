import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, ListTodo, Mail, CheckCircle2 } from 'lucide-react';
import MetricCard from '../../components/admin/MetricCard';
import StatusBadge from '../../components/admin/StatusBadge';
import { apiUrl } from '../../lib/api';

interface Metrics {
  totalInterns: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalProjects: number;
  openProjects: number;
  unreadContacts: number;
  totalTasks: number;
  completedTasks: number;
  recentApplications: Array<{ name: string; email: string; status: string; created_at: string }>;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/admin/metrics'), { credentials: 'include' })
      .then(r => r.json())
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const allTasks = (metrics?.completedTasks ?? 0) + (metrics?.totalTasks ?? 0);
  const taskCompletionPct = allTasks > 0
    ? Math.round(((metrics?.completedTasks ?? 0) / allTasks) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your Peach Stack program</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
          <MetricCard label="Active Interns" value={metrics?.totalInterns ?? 0} icon={Users} color="peach" trend="Total registered students" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MetricCard label="Applications" value={metrics?.totalApplications ?? 0} icon={CheckCircle2} color="green" trend={`${metrics?.pendingApplications ?? 0} pending review`} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MetricCard label="Open Tasks" value={metrics?.totalTasks ?? 0} icon={ListTodo} color="blue" trend={`${metrics?.completedTasks ?? 0} completed`} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard label="Unread Messages" value={metrics?.unreadContacts ?? 0} icon={Mail} color="purple" trend="Contact form submissions" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Application Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Pending', value: metrics?.pendingApplications ?? 0, total: metrics?.totalApplications ?? 1, color: 'bg-yellow-400' },
              { label: 'Accepted', value: metrics?.acceptedApplications ?? 0, total: metrics?.totalApplications ?? 1, color: 'bg-green-400' },
              { label: 'Rejected', value: metrics?.rejectedApplications ?? 0, total: metrics?.totalApplications ?? 1, color: 'bg-red-400' },
            ].map(({ label, value, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task completion */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Task Completion</h3>
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${taskCompletionPct} ${100 - taskCompletionPct}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 font-display">{taskCompletionPct}%</span>
                <span className="text-xs text-slate-500">Complete</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Completed</span><span className="font-semibold">{metrics?.completedTasks ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">In Progress</span><span className="font-semibold">{metrics?.totalTasks ?? 0}</span></div>
          </div>
        </div>

        {/* Recent applications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Recent Applications</h3>
          {!metrics?.recentApplications?.length ? (
            <p className="text-slate-400 text-sm">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {metrics.recentApplications.slice(0, 5).map((app, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {app.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{app.name}</p>
                    <p className="text-xs text-slate-400 truncate">{app.email}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
