import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiUrl } from '../../lib/api';

const ROLE_OPTIONS = ['Technology', 'Marketing', 'Sales', 'Operations', 'Finance', 'Design'];

export default function TaskCreate() {
  const navigate = useNavigate();
  const [interns, setInterns] = useState<Array<{ id: string; name: string; intern_role?: string }>>([]);
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [assignedInterns, setAssignedInterns] = useState<string[]>([]);
  const [form, setForm] = useState({ title: '', project_label: '', description: '', project_lead_id: '', priority: 'medium', due_date: '', estimated_hours: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/admin/interns?limit=100'), { credentials: 'include' })
      .then(r => r.json()).then(data => setInterns(data.data || []));
  }, []);

  const toggleRole = (role: string) => {
    setAssignedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleIntern = (id: string) => {
    setAssignedInterns(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const body: Record<string, any> = {
        title: form.title,
        project_label: form.project_label || null,
        project_lead_id: form.project_label && form.project_lead_id ? form.project_lead_id : null,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        assigned_to: assignedInterns.length > 0 ? assignedInterns : null,
        assigned_role: assignedRoles.length > 0 ? assignedRoles : null,
      };
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Label <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={form.project_label} onChange={e => setForm(p => ({ ...p, project_label: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="e.g. Client Website Build, Sales Outreach Q3" />
          <p className="mt-1 text-xs text-slate-400">Group related tasks under the same label for easy filtering.</p>
        </div>
        {form.project_label && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Lead <span className="text-slate-400 font-normal">(optional)</span></label>
            <select value={form.project_lead_id} onChange={e => setForm(p => ({ ...p, project_lead_id: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
              <option value="">No lead</option>
              {interns.map(i => (
                <option key={i.id} value={i.id}>{i.name}{i.intern_role ? `, ${i.intern_role}` : ''}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">Designate an intern to lead this project group.</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
          <textarea required rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent resize-none" placeholder="Describe the task..." />
        </div>

        {/* Assignment — roles and individual interns */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Assign To <span className="text-slate-400 font-normal">(optional — select any combination)</span></label>

          {/* Roles */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">By Role</p>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${assignedRoles.includes(role) ? 'bg-peach-500 text-white border-peach-500' : 'bg-white text-slate-600 border-slate-200 hover:border-peach-400'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Individual interns */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Individual Interns</p>
            <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {interns.length === 0 && (
                <p className="text-sm text-slate-400 p-3">No interns found</p>
              )}
              {interns.map(i => (
                <label key={i.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={assignedInterns.includes(i.id)}
                    onChange={() => toggleIntern(i.id)}
                    className="accent-peach-500"
                  />
                  <span className="text-sm text-slate-800">{i.name}</span>
                  {i.intern_role && <span className="text-xs text-slate-400">{i.intern_role}</span>}
                </label>
              ))}
            </div>
          </div>

          {(assignedRoles.length > 0 || assignedInterns.length > 0) && (
            <p className="text-xs text-slate-500">
              This task will be visible to
              {assignedRoles.length > 0 && <span> all <strong>{assignedRoles.join(', ')}</strong> interns</span>}
              {assignedRoles.length > 0 && assignedInterns.length > 0 && ' and '}
              {assignedInterns.length > 0 && (
                <strong>{interns.filter(i => assignedInterns.includes(i.id)).map(i => i.name).join(', ')}</strong>
              )}.
            </p>
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
