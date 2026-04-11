import { Link } from 'react-router-dom';
import { Users, ShieldCheck, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';

export default function AdminSettings() {
  const [internMessaging, setInternMessaging] = useState(false);
  const [savingMessaging, setSavingMessaging] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/admin/settings/platform'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (data.allow_intern_to_intern_messaging !== undefined) {
          setInternMessaging(data.allow_intern_to_intern_messaging === 'true');
        }
      })
      .catch(() => {});
  }, []);

  const toggleInternMessaging = async () => {
    setSavingMessaging(true);
    const newValue = !internMessaging;
    await fetch(apiUrl('/api/admin/settings/platform'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'allow_intern_to_intern_messaging', value: String(newValue) }),
    });
    setInternMessaging(newValue);
    setSavingMessaging(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your admin configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link to="/admin/team" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-peach-200 hover:shadow-md transition-all group">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-peach-50 text-peach-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-peach-600 transition-colors">Team Management</h3>
              <p className="text-sm text-slate-500 mt-1">Add, edit, or deactivate admin accounts</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Intern-to-Intern Messaging</h3>
                <button
                  onClick={toggleInternMessaging}
                  disabled={savingMessaging}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${internMessaging ? 'bg-peach-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${internMessaging ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Allow interns to message each other directly. When off, interns can only message admins.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Security</h3>
              <p className="text-sm text-slate-500 mt-1">Admin sessions expire after 24 hours. All actions are logged in the audit trail.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
