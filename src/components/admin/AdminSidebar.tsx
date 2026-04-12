import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ListTodo, CalendarDays, Mail, BarChart3, Settings, ExternalLink, LogOut, X, MessageSquare, Calendar, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiUrl } from '../../lib/api';
import { useState, useEffect } from 'react';

const BASE_NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/interns', icon: Users, label: 'Interns' },
  { to: '/admin/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/admin/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/admin/cohorts', icon: CalendarDays, label: 'Cohorts' },
  { to: '/admin/communications', icon: Mail, label: 'Communications' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface Props { onClose?: () => void; }

export default function AdminSidebar({ onClose }: Props) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadContacts, setUnreadContacts] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch(apiUrl('/api/messages/unread/count'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(data => setUnreadCount(data.count || 0))
        .catch(() => {});
    };
    const fetchUnreadContacts = () => {
      fetch(apiUrl('/api/admin/contacts'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then((data: any[]) => setUnreadContacts(Array.isArray(data) ? data.filter((c: any) => c.status === 'unread').length : 0))
        .catch(() => {});
    };
    fetchUnread();
    fetchUnreadContacts();
    const interval = setInterval(() => { fetchUnread(); fetchUnreadContacts(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch(apiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors — redirect regardless
    }
    window.location.href = '/admin/login';
  };
  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div>
          <span className="font-display text-lg font-bold text-white">Peach Stack</span>
          <span className="ml-1.5 text-xs font-bold text-peach-400 uppercase tracking-widest">Admin</span>
        </div>
        {onClose && <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden"><X size={20} /></button>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {BASE_NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', location.pathname.startsWith(to) ? 'bg-peach-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
            <Icon size={18} />{label}
          </Link>
        ))}
        <Link to="/admin/messages" className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', location.pathname.startsWith('/admin/messages') ? 'bg-peach-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
          <MessageSquare size={18} />
          <span className="flex-1">Messages</span>
          {unreadCount > 0 && (
            <span className="h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
          )}
        </Link>
        <Link to="/admin/contacts" className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', location.pathname.startsWith('/admin/contacts') ? 'bg-peach-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
          <Inbox size={18} />
          <span className="flex-1">Inquiries</span>
          {unreadContacts > 0 && (
            <span className="h-5 min-w-[20px] px-1 rounded-full bg-peach-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadContacts}</span>
          )}
        </Link>
      </nav>
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <ExternalLink size={18} />Back to Site
        </Link>
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
          <LogOut size={18} />Sign Out
        </button>
      </div>
    </aside>
  );
}
