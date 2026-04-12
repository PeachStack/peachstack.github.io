import { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';
import { Mail, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  submitted_at: string;
  status: 'unread' | 'read';
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  const fetchSubmissions = () => {
    setLoading(true);
    fetch(apiUrl('/api/admin/contacts'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const markRead = async (id: string) => {
    await fetch(apiUrl(`/api/admin/contacts/${id}`), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'read' } : s));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'read' } : prev);
  };

  const openSubmission = (s: Submission) => {
    setSelected(s);
    if (s.status === 'unread') markRead(s.id);
  };

  const unreadCount = submissions.filter(s => s.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Contact Submissions</h1>
        <p className="text-slate-500 text-sm mt-1">
          {submissions.length} total{unreadCount > 0 ? `, ${unreadCount} unread` : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center text-slate-400">
          <Mail size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No contact submissions yet</p>
          <p className="text-sm mt-1">Messages from the contact form will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {submissions.map(s => (
              <div
                key={s.id}
                onClick={() => openSubmission(s)}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-sm',
                  selected?.id === s.id ? 'border-peach-300 bg-peach-50' : 'bg-white border-slate-100',
                  s.status === 'unread' && 'border-l-4 border-l-peach-500'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={cn('text-sm font-semibold text-slate-900 truncate', s.status === 'unread' && 'font-bold')}>{s.name}</p>
                  {s.status === 'unread' ? (
                    <Circle size={8} className="text-peach-500 fill-peach-500 shrink-0 mt-1" />
                  ) : (
                    <CheckCircle2 size={14} className="text-slate-300 shrink-0 mt-0.5" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{s.email}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.message}</p>
                <p className="text-[10px] text-slate-300 mt-2">{new Date(s.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-sm text-peach-600 hover:underline">{selected.email}</a>
                  </div>
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
                    selected.status === 'unread' ? 'bg-peach-50 text-peach-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {selected.status === 'unread' ? 'New' : 'Read'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Received: {new Date(selected.submitted_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your Peach Stack Inquiry`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-peach-500 text-white text-sm font-bold hover:bg-peach-600 transition-colors"
                  >
                    <Mail size={15} />
                    Reply via Email
                  </a>
                  {selected.status === 'unread' && (
                    <button
                      onClick={() => markRead(selected.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <CheckCircle2 size={15} />
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-slate-400 h-full min-h-[200px]">
                <Mail size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Select a message to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
