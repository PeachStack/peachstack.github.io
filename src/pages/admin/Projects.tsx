import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';
import { Plus, X, Edit2, Trash2, ChevronDown } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  skills_required: string[];
  compensation?: string;
  deadline?: string;
  target_role?: string;
}

const STATUS_OPTIONS = ['open', 'in-progress', 'closed'];
const ROLE_OPTIONS = ['all', 'Technology', 'Marketing', 'Sales', 'Operations', 'Finance', 'Design'];

function ProjectModal({
  project,
  onClose,
  onSaved,
  onDeleted,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const isNew = !project;
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'open',
    compensation: project?.compensation || '',
    deadline: project?.deadline ? project.deadline.split('T')[0] : '',
    skills_raw: (project?.skills_required || []).join(', '),
    target_role: project?.target_role || 'all',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const skills_required = form.skills_raw.split(',').map(s => s.trim()).filter(Boolean);
    const body = {
      title: form.title,
      description: form.description,
      status: form.status,
      compensation: form.compensation || null,
      deadline: form.deadline || null,
      skills_required,
      target_role: form.target_role,
    };
    try {
      const url = isNew ? apiUrl('/api/admin/projects') : apiUrl(`/api/admin/projects/${project!.id}`);
      const method = isNew ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save'); return; }
      onSaved();
      onClose();
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(apiUrl(`/api/admin/projects/${project!.id}`), { method: 'DELETE', credentials: 'include' });
      onDeleted?.();
      onClose();
    } catch { setError('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-slate-900">{isNew ? 'Create Project' : 'Edit Project'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Project title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" placeholder="Describe the project..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
              <div className="relative">
                <select value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))} className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white">
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r === 'all' ? 'All Interns' : r}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget / Compensation</label>
              <input value={form.compensation} onChange={e => setForm(p => ({ ...p, compensation: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Optional (e.g. $500)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills Required</label>
            <input value={form.skills_raw} onChange={e => setForm(p => ({ ...p, skills_raw: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="e.g. Excel, Python, Market Research (comma separated)" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            {!isNew && !confirmDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                <Trash2 size={15} />Delete
              </button>
            )}
            {!isNew && confirmDelete && (
              <button type="button" onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null | undefined>(undefined);

  const fetchProjects = () => {
    setLoading(true);
    fetch(apiUrl('/api/admin/projects'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <div className="space-y-6">
      {selected !== undefined && (
        <ProjectModal
          project={selected}
          onClose={() => setSelected(undefined)}
          onSaved={fetchProjects}
          onDeleted={fetchProjects}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 rounded-xl bg-peach-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-peach-600 transition-colors active:scale-95"
        >
          <Plus size={16} />
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center text-slate-400">
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">Click "Create Project" to add the first one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-peach-200 transition-all group"
              onClick={() => setSelected(project)}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900 leading-tight group-hover:text-peach-600 transition-colors">{project.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={project.status} />
                  <Edit2 size={14} className="text-slate-300 group-hover:text-peach-400 transition-colors" />
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-3">{project.description}</p>
              {project.target_role && project.target_role !== 'all' && (
                <span className="self-start px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">📌 {project.target_role}</span>
              )}
              {project.skills_required?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.skills_required.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-peach-50 text-peach-700 rounded text-xs font-medium">{skill}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-slate-50">
                {project.compensation ? <span>💰 {project.compensation}</span> : <span className="italic">No compensation set</span>}
                {project.deadline && <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
