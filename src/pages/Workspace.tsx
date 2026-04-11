import { motion } from 'motion/react';
import { CheckCircle2, Clock, Briefcase, Calendar, ChevronRight, Layout, ListTodo, Zap, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

interface ApiTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  creator_name?: string;
  tags: string[];
}

interface ActiveProject {
  id: string;
  title: string;
  company: string;
  progress: number;
  nextDeadline: string;
  tasksRemaining: number;
}

const MOCK_ACTIVE_PROJECTS: ActiveProject[] = [
  { id: 'p1', title: 'Market Competitor Audit', company: 'Goldman Sachs', progress: 65, nextDeadline: 'Mar 26', tasksRemaining: 4 },
  { id: 'p2', title: 'Gen Z Brand Strategy', company: 'Nike', progress: 30, nextDeadline: 'Apr 02', tasksRemaining: 8 },
];

export default function Workspace() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [userName, setUserName] = useState('Student');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem('peachstack_user_name');
    if (savedName) setUserName(savedName.split(' ')[0]);

    // Redirect admins to their own dashboard
    fetch(apiUrl('/api/me'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user && (data.user.role === 'admin' || data.user.role === 'superadmin' || data.user.isAdmin)) {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      })
      .catch(() => {});

    fetch(apiUrl('/api/tasks/mine'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));

    const fetchUnread = () => {
      fetch(apiUrl('/api/messages/unread/count'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(data => setUnreadMessages(data.count || 0))
        .catch(() => {});
    };
    fetchUnread();
    const msgInterval = setInterval(fetchUnread, 30000);
    return () => clearInterval(msgInterval);
  }, [navigate]);

  const updateTaskStatus = async (id: string, status: string) => {
    await fetch(apiUrl(`/api/tasks/${id}`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const getPriorityLabel = (priority: string) => priority.charAt(0).toUpperCase() + priority.slice(1);
  const getPriorityStyle = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') return 'bg-red-50 text-red-600';
    if (priority === 'medium') return 'bg-amber-50 text-amber-600';
    return 'bg-blue-50 text-blue-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back, {userName}!</h1>
            <p className="text-slate-500">Here's what's on your stack for today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/workspace/messages"
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-peach-500 transition-colors"
            >
              <MessageSquare size={22} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-peach-500">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Streak</p>
              <p className="text-lg font-bold text-slate-900">12 Days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content: Tasks & Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layout className="text-peach-500" size={20} />
                  Active Projects
                </h2>
                <button className="text-sm font-bold text-peach-600 hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {MOCK_ACTIVE_PROJECTS.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ y: -4 }}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Briefcase size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Due {project.nextDeadline}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{project.company}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-peach-600">{project.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div 
                          className="h-full rounded-full bg-peach-500 transition-all duration-500" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                      <span className="text-xs font-medium text-slate-500">{project.tasksRemaining} tasks left</span>
                      <button className="text-xs font-bold text-slate-900 flex items-center gap-1 hover:text-peach-500">
                        Open Workspace <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Tasks Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="text-peach-500" size={20} />
                  Your Tasks
                </h2>
              </div>
              {loadingTasks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-7 w-7 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
                  <ListTodo size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No tasks assigned yet</p>
                  <p className="text-xs mt-1">Check back when your admin assigns tasks to you</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        className={cn(
                          "flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all",
                          isCompleted ? "opacity-60 grayscale" : "hover:shadow-sm"
                        )}
                      >
                        <button 
                          onClick={() => updateTaskStatus(task.id, isCompleted ? 'open' : 'in_review')}
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                            isCompleted 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "border-slate-200 hover:border-peach-500"
                          )}
                        >
                          {isCompleted && <CheckCircle2 size={14} />}
                        </button>
                        <div className="flex-grow">
                          <h4 className={cn("text-sm font-bold text-slate-900", isCompleted && "line-through")}>
                            {task.title}
                          </h4>
                          {task.creator_name && <p className="text-xs text-slate-500">From: {task.creator_name}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                          {task.due_date && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
                              <Clock size={14} />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                          <span className={cn("rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider", getPriorityStyle(task.priority))}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: Schedule & Updates */}
          <div className="space-y-8">
            {/* Calendar Widget */}
            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-peach-500" size={18} />
                  Schedule
                </h2>
                <span className="text-xs font-bold text-slate-400">Mar 24</span>
              </div>
              <div className="space-y-6">
                {[
                  { time: '10:00 AM', event: 'Team Sync: Nike Strategy', type: 'Meeting' },
                  { time: '02:00 PM', event: 'Excel Workshop', type: 'Training' },
                  { time: '04:30 PM', event: 'Project Review', type: 'Review' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-16 pt-1">
                      {item.time}
                    </div>
                    <div className="flex-grow pb-4 border-l-2 border-slate-50 pl-4 relative">
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-peach-500" />
                      <p className="text-sm font-bold text-slate-900">{item.event}</p>
                      <p className="text-xs text-slate-500">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100">
                Open Calendar
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
