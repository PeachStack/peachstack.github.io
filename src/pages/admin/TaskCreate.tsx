import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiUrl } from '../../lib/api';

const ROLE_OPTIONS = ['Technology', 'Marketing', 'Sales', 'Operations', 'Finance', 'Design'];

export default function TaskCreate() {
  const navigate = useNavigate();
  const [interns, setInterns] = useState<Array<{ id: string; name: string; intern_role?: string }>>([]);
  const [assignMode, setAssignMode] = useState<'individual' | 'role'>('individual');
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', assigned_role: '', priority: 'medium', due_date: '', estimated_hours: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/admin/interns?limit=100'), { credentials: 'include' })
      .then(r => r.json()).then(data => setInterns(data.data || []));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const body: Record<string, any> = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (assignMode === 'individual') {
        body.assigned_to = form.assigned_to || null;
      } else {
        body.assigned_role = form.assigned_role || null;
      }
      const res = await fetch(apiUrl('/api/admin/tasks'), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); setError(d.message); return; }
      const data = await res.json();
      navigate(`/admin/tasks/${data.id}`);
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/tasks" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="font-display text-2xl font-bold text-slate-900">Create Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="Task title..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
          <textarea required rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent resize-none" placeholder="Describe the task..." />
        </div>

        {/* Assignment Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-3">
            <button type="button" onClick={() => setAssignMode('individual')} className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${assignMode === 'individual' ? 'bg-peach-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              Individual Intern
            </button>
            <button type="button" onClick={() => setAssignMode('role')} className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${assignMode === 'role' ? 'bg-peach-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              By Role
            </button>
          </div>
          {assignMode === 'individual' ? (
            <select value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
              <option value="">Unassigned</option>
              {interns.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name}{i.intern_role ? `, ${i.intern_role}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <select value={form.assigned_role} onChange={e => setForm(p => ({ ...p, assigned_role: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
              <option value="">Select a role...</option>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          {assignMode === 'role' && form.assigned_role && (
            <p className="mt-1.5 text-xs text-slate-500">This task will be visible to all interns with the <strong>{form.assigned_role}</strong> role.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Est. Hours</label>
            <input type="number" step="0.5" value={form.estimated_hours} onChange={e => setForm(p => ({ ...p, estimated_hours: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="e.g. 4" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma-separated)</label>
          <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="frontend, design, research" />
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-peach-500 hover:bg-peach-600 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <Link to="/admin/tasks" className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
