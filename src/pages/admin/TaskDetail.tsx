import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';
import PriorityBadge from '../../components/admin/PriorityBadge';

interface Comment { id: string; content: string; author_name: string; created_at: string; }
interface ActivityItem { action: string; actor_name: string; old_value?: string; new_value?: string; created_at: string; }
interface Task {
  id: string; title: string; description: string; status: string; priority: string;
  assignee_name?: string; assigned_to?: string; due_date?: string;
  estimated_hours?: number; actual_hours?: number; tags: string[];
  comments: Comment[]; activity: ActivityItem[];
}

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reload = () => {
    fetch(apiUrl(`/api/admin/tasks/${id}`), { credentials: 'include' })
      .then(r => r.json()).then(setTask).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(apiUrl(`/api/admin/tasks/${id}`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    reload();
  };

  const addComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await fetch(apiUrl(`/api/admin/tasks/${id}/comments`), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment }),
    });
    setComment('');
    reload();
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!task) return <div className="text-center py-16 text-slate-400">Task not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/tasks" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="font-display text-xl font-bold text-slate-900 flex-1">{task.title}</h1>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Comments ({task.comments.length})</h3>
            <div className="space-y-4 mb-6">
              {task.comments.length === 0 ? <p className="text-slate-400 text-sm">No comments yet</p> : task.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center font-bold text-sm shrink-0">{c.author_name?.[0] || '?'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{c.author_name}</span>
                      <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={addComment} className="flex gap-3">
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" />
              <button type="submit" disabled={submitting || !comment.trim()} className="p-2.5 bg-peach-500 hover:bg-peach-600 text-white rounded-xl transition-colors disabled:opacity-50"><Send size={18} /></button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Status</p>
                <select value={task.status} onChange={e => updateStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
                  {['open','in_progress','in_review','completed','blocked'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Assignee</p>
                <p className="font-medium text-slate-900">{task.assignee_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Due Date</p>
                <p className="font-medium text-slate-900">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-slate-400 text-xs mb-1">Est. Hours</p><p className="font-medium text-slate-900">{task.estimated_hours ?? 'N/A'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Actual Hours</p><p className="font-medium text-slate-900">{task.actual_hours ?? 'N/A'}</p></div>
              </div>
              {task.tags.length > 0 && (
                <div><p className="text-slate-400 text-xs mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">{task.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{t}</span>)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Activity</h3>
            <div className="space-y-2">
              {task.activity.length === 0 ? <p className="text-slate-400 text-xs">No activity yet</p> : task.activity.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-peach-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-slate-900 font-medium">{a.actor_name}</span>{' '}
                    <span className="text-slate-500">{a.action.replace('_', ' ')}</span>
                    {a.new_value && <span className="text-slate-400"> → {a.new_value}</span>}
                    <p className="text-slate-300 mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
