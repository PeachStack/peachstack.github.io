import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Layout, List, Trash2 } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';
import PriorityBadge from '../../components/admin/PriorityBadge';

const STATUSES = ['open', 'in_progress', 'in_review', 'completed', 'blocked'] as const;

interface Task { id: string; title: string; description: string; status: string; priority: string; assignee_name?: string; due_date?: string; tags: string[]; }

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchTasks = () => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter) params.set('status', statusFilter);
    fetch(apiUrl(`/api/admin/tasks?${params}`), { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load tasks');
        return r.json();
      })
      .then(data => setTasks(data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [statusFilter]);

  const filtered = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee_name?.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (taskId: string, newStatus: string) => {
    await fetch(apiUrl(`/api/admin/tasks/${taskId}`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(apiUrl(`/api/admin/tasks/${deleteTarget.id}`), {
        method: 'DELETE', credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError((data as any).message || 'Failed to delete task. Please try again.');
        return;
      }
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Delete Task?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will <span className="font-bold text-red-600">permanently delete</span> "{deleteTarget.title}". This cannot be undone.
            </p>
            {deleteError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setDeleteTarget(null); setDeleteError(''); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/tasks/create" className="flex items-center gap-2 bg-peach-500 hover:bg-peach-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={16} />New Task
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${view === 'list' ? 'bg-peach-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><List size={16} />List</button>
          <button onClick={() => setView('board')} className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${view === 'board' ? 'bg-peach-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Layout size={16} />Board</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="font-medium text-slate-500 mb-2">Could not load tasks</p>
          <p className="text-sm text-slate-400 mb-4">Check your connection and try again.</p>
          <button onClick={fetchTasks} className="px-4 py-2 rounded-xl bg-peach-500 text-white text-sm font-bold hover:bg-peach-600 transition-colors">Retry</button>
        </div>
      ) : view === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400"><p className="font-medium">No tasks found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-500">Task</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">Assignee</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden md:table-cell">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Due Date</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody>
                {filtered.map(task => (
                  <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/tasks/${task.id}`} className="font-medium text-slate-900 hover:text-peach-600">{task.title}</Link>
                      {task.tags.length > 0 && <div className="flex gap-1 mt-1">{task.tags.slice(0, 3).map(tag => <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>)}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{task.assignee_name || <span className="text-slate-300">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)} className="text-xs border-0 bg-transparent focus:outline-none cursor-pointer">
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteTarget(task)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete task">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Kanban Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(col => {
            const colTasks = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={col} />
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                      <Link to={`/admin/tasks/${task.id}`} className="block font-medium text-slate-900 hover:text-peach-600 text-sm mb-2">{task.title}</Link>
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={task.priority} />
                        <div className="flex items-center gap-2">
                          {task.assignee_name && <span className="text-xs text-slate-400">{task.assignee_name}</span>}
                          <button onClick={() => setDeleteTarget(task)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete task">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
