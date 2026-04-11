import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';
import PriorityBadge from '../../components/admin/PriorityBadge';

export default function InternDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [intern, setIntern] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(apiUrl(`/api/admin/interns/${id}`), { credentials: 'include' })
      .then(r => r.json()).then(setIntern).finally(() => setLoading(false));
  }, [id]);

  const toggleActive = async () => {
    await fetch(apiUrl(`/api/admin/interns/${id}`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: intern.is_active ? 0 : 1 }),
    });
    setIntern((prev: any) => ({ ...prev, is_active: prev.is_active ? 0 : 1 }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/interns/${id}`), {
        method: 'DELETE', credentials: 'include',
      });
      if (res.ok) {
        navigate('/admin/interns');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!intern) return <div className="text-center py-16 text-slate-400">Intern not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Delete Account?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will <span className="font-bold text-red-600">permanently delete</span> {intern.name}'s account and all associated data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link to="/admin/interns" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{intern.name}</h1>
          <p className="text-slate-500 text-sm">{intern.email}</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap justify-end">
          <StatusBadge status={intern.is_active ? 'active' : 'inactive'} />
          <button onClick={toggleActive} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${intern.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
            {intern.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Academic Info</h3>
          <dl className="space-y-3 text-sm">
            {[['University', intern.university], ['Major', intern.major], ['Minor', intern.minor], ['Year', intern.year]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v || 'N/A'}</dd></div>
            ))}
          </dl>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Skills</h3>
          {intern.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">{intern.skills.map((s: string) => <span key={s} className="px-2.5 py-1 bg-peach-50 text-peach-700 rounded-lg text-xs font-medium">{s}</span>)}</div>
          ) : <p className="text-slate-400 text-sm">No skills listed</p>}
          {intern.bio && <p className="mt-4 text-sm text-slate-600">{intern.bio}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Assigned Tasks ({intern.tasks?.length ?? 0})</h3>
        {intern.tasks?.length === 0 ? <p className="text-slate-400 text-sm">No tasks assigned</p> : (
          <div className="space-y-3">
            {intern.tasks?.map((task: any) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{task.title}</p><p className="text-xs text-slate-400">{task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}</p></div>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
