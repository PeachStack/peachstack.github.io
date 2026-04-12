import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import PriorityBadge from '../../components/admin/PriorityBadge';

interface Comment { id: string; content: string; author_name: string; created_at: string; }
interface ActivityItem { action: string; actor_name: string; old_value?: string; new_value?: string; created_at: string; }
interface Task {
  id: string; title: string; description: string; status: string; priority: string;
  assignee_name?: string; assigned_to?: string; due_date?: string;
  estimated_hours?: number; actual_hours?: number; tags: string[];
  admin_feedback?: string; admin_score?: number;
  comments: Comment[]; activity: ActivityItem[];
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [interns, setInterns] = useState<Array<{ id: string; name: string; intern_role?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [form, setForm] = useState({ title: '', description: '', status: 'open', priority: 'medium', assigned_to: '', due_date: '', estimated_hours: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [statusError, setStatusError] = useState('');

  const asDateInput = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const reload = () => {
    setLoading(true);
    fetch(apiUrl(`/api/admin/tasks/${id}`), { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setTask(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'open',
          priority: data.priority || 'medium',
          assigned_to: data.assigned_to || '',
          due_date: asDateInput(data.due_date),
          estimated_hours: data.estimated_hours?.toString?.() || '',
          tags: (data.tags || []).join(', '),
        });
        setReviewFeedback(data.admin_feedback || '');
        setReviewScore(data.admin_score?.toString?.() || '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  useEffect(() => {
    fetch(apiUrl('/api/admin/interns?limit=100'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setInterns(data.data || []))
      .catch(() => setInterns([]));
  }, []);

  const updateStatus = async (status: string) => {
    setStatusError('');
    try {
      const res = await fetch(apiUrl(`/api/admin/tasks/${id}`), {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusError((data as any).message || 'Failed to update status.');
        return;
      }
      reload();
    } catch {
      setStatusError('Network error. Could not update status.');
    }
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

  const saveTask = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const res = await fetch(apiUrl(`/api/admin/tasks/${id}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          assigned_to: form.assigned_to || null,
          due_date: form.due_date || null,
          estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError((data as any).message || 'Failed to save changes.');
        return;
      }
      setSaveSuccess('Task updated.');
      reload();
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (decision: 'approve' | 'decline') => {
    setReviewing(true);
    setReviewError('');
    try {
      const score = reviewScore.trim() ? Number(reviewScore) : null;
      if (decision === 'approve' && score !== null && Number.isNaN(score)) {
        setReviewError('Score must be a number.');
        return;
      }
      let res: Response;
      try {
        res = await fetch(apiUrl(`/api/admin/tasks/${id}/review`), {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, feedback: reviewFeedback || null, score }),
        });
      } catch {
        setReviewError('Network error. Check your connection and try again.');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setReviewError((data as any).message || 'Failed to submit review.');
        return;
      }
      reload();
    } finally {
      setReviewing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(apiUrl(`/api/admin/tasks/${id}`), {
        method: 'DELETE', credentials: 'include',
      });
      if (res.ok) {
        navigate('/admin/tasks');
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError((data as any).message || 'Failed to delete task.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!task) return <div className="text-center py-16 text-slate-400">Task not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Delete Task?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will <span className="font-bold text-red-600">permanently delete</span> "{task.title}". This cannot be undone.
            </p>
            {deleteError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Link to="/admin/tasks" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="font-display text-xl font-bold text-slate-900 flex-1">{task.title}</h1>
        <PriorityBadge priority={task.priority} />
        <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
          <Trash2 size={14} />Delete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={saveTask} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">Edit Task</h3>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-peach-500 text-white text-sm font-bold hover:bg-peach-600 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <textarea rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
                  {['open', 'in_progress', 'in_review', 'completed', 'blocked'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
                  {['low', 'medium', 'high', 'urgent'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Assignee</label>
                <select value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
                  <option value="">Unassigned</option>
                  {interns.map(i => (
                    <option key={i.id} value={i.id}>{i.name}{i.intern_role ? `, ${i.intern_role}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Due date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Estimated hours</label>
                <input type="number" step="0.5" value={form.estimated_hours} onChange={e => setForm(p => ({ ...p, estimated_hours: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
              </div>
            </div>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            {saveSuccess && <p className="text-sm text-emerald-600">{saveSuccess}</p>}
          </form>

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
                  {['open', 'in_progress', 'in_review', 'completed', 'blocked'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                {statusError && <p className="text-xs text-red-600 mt-1">{statusError}</p>}
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
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Review</h3>
            <div className="space-y-3">
              <textarea rows={4} value={reviewFeedback} onChange={e => setReviewFeedback(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" placeholder="Feedback for intern..." />
              <input type="number" value={reviewScore} onChange={e => setReviewScore(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Score (optional for approve)" />
              {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={reviewing} onClick={() => handleReview('decline')} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">Decline</button>
                <button type="button" disabled={reviewing} onClick={() => handleReview('approve')} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">Approve</button>
              </div>
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
