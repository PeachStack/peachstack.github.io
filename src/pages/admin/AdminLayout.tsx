import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { apiUrl } from '../../lib/api';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const navigate = useNavigate();

  const checkAuth = useCallback(async (attempt = 0) => {
    setLoading(true);
    if (attempt === 0) setNetworkError(false);
    let isRetrying = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      let res: Response;
      try {
        res = await fetch(apiUrl('/api/me'), { credentials: 'include', signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
      // If response is not JSON (e.g. HTML page served instead of API), treat as network error
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response from API');
      }
      const data = await res.json();
      if (!res.ok || !data.user || (!data.user.isAdmin && data.user.role !== 'admin' && data.user.role !== 'superadmin')) {
        // Actual auth failure — redirect to login
        navigate('/admin/login');
        return;
      }
      setAdmin({ name: data.user.name });
    } catch {
      // Retry up to 3 times with increasing delays before showing the error screen
      if (attempt < 3) {
        isRetrying = true;
        const delay = attempt === 0 ? 2000 : attempt === 1 ? 4000 : 6000;
        setTimeout(() => checkAuth(attempt + 1), delay);
        return;
      }
      // Network error — show retry screen, do NOT redirect to login
      setNetworkError(true);
    } finally {
      if (!isRetrying) setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (networkError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <WifiOff size={28} className="text-slate-400" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Connection issue</h2>
        <p className="text-slate-500 text-sm mb-6">Could not reach the server. Check your connection and try again.</p>
        <button
          onClick={checkAuth}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-peach-500 text-white font-bold text-sm hover:bg-peach-600 transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar />
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex h-full">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} adminName={admin?.name} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
