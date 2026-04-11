import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, UserPlus, X } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';

interface Intern { id: string; name: string; email: string; university: string; major: string; year: string; is_active: number; created_at: string; }

function CreateInternModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [internRole, setInternRole] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/interns/create'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, internRole, tempPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to create intern'); return; }
      onCreated();
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-slate-900">Create Intern Account</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="jane@university.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role / Track</label>
            <select value={internRole} onChange={e => setInternRole(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent bg-white">
              <option value="">Select a role...</option>
              <option value="Technology">Technology</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="Strategy">Strategy</option>
              <option value="Data & Analytics">Data & Analytics</option>
              <option value="Content & Copywriting">Content & Copywriting</option>
              <option value="Social Media">Social Media</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary Password</label>
            <input type="text" value={tempPassword} onChange={e => setTempPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="Share with intern to log in" />
            <p className="text-xs text-slate-400 mt-1">The intern will be prompted to change this after first login.</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Interns() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchInterns = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    fetch(apiUrl(`/api/admin/interns?${params}`), { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setInterns(data.data || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterns(); }, [search, status]);

  return (
    <div className="space-y-6">
      {showCreate && (
        <CreateInternModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchInterns}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Interns</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total intern{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-peach-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-peach-600 transition-colors active:scale-95"
        >
          <UserPlus size={16} />
          Create Intern
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="font-medium">No interns found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden md:table-cell">University</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Major</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody>
                {interns.map(intern => (
                  <tr key={intern.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center font-bold text-sm shrink-0">{intern.name?.[0] || '?'}</div>
                        <div>
                          <p className="font-medium text-slate-900">{intern.name}</p>
                          <p className="text-xs text-slate-400">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{intern.university || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{intern.major || 'N/A'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={intern.is_active ? 'active' : 'inactive'} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{new Date(intern.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/interns/${intern.id}`} className="p-1 text-slate-400 hover:text-peach-600 transition-colors"><ChevronRight size={18} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
