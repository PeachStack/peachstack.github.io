import { motion } from 'motion/react';
import { CheckCircle2, Clock, Calendar, ListTodo, MessageSquare, Save, X, Tag, User, Briefcase } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

interface ApiProject {
  id: string;
  title: string;
  description: string;
  status: string;
  skills_required: string[];
  compensation?: string;
  deadline?: string;
  target_role?: string;
  my_status?: string | null;
  assignment_id?: string | null;
}

interface ApiTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
  creator_name?: string;
  estimated_hours?: number;
  tags: string[];
  points?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
}

function ProfileSetupModal({ onComplete }: { onComplete: (name: string) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !university.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      const profileRes = await fetch(apiUrl('/api/workspace/profile'), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, university: university.trim(), bio: bio.trim() || null }),
      });
      if (!profileRes.ok) throw new Error('Failed to save profile');
      if (newPassword) {
        if (!currentPassword) {
          setError('Please enter your current password to set a new one.');
          setLoading(false);
          return;
        }
        const pwRes = await fetch(apiUrl('/api/workspace/password'), {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!pwRes.ok) {
          const pwData = await pwRes.json().catch(() => ({}));
          setError(pwData.message || 'Failed to set password. You can change it later in Settings.');
          setLoading(false);
          return;
        }
      }
      localStorage.setItem('peachstack_user_name', fullName);
      localStorage.setItem('peachstack_user_university', university.trim());
      onComplete(firstName.trim());
    } catch {
      setError('Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-peach-100 text-peach-600 mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Welcome to Peach Stack!</h2>
          <p className="text-slate-500 text-sm mt-2">Let's set up your profile before you get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                placeholder="Smith"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">University / College <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
              placeholder="e.g. University of Michigan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Bio <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent resize-none"
              placeholder="A short intro about yourself, your major, or what you're excited to work on..."
            />
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>🔒</span> Set Your Password
              <span className="text-slate-400 font-normal text-xs">(recommended)</span>
            </p>
            <p className="text-xs text-slate-500 mb-3">Your account was created with a temporary password. We recommend setting a new one now.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                  placeholder="Your current login password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors disabled:opacity-50 mt-2"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function TaskDetailModal({ task, onClose, onStatusChange }: { task: ApiTask; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  const getPriorityStyle = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') return 'bg-red-50 text-red-600';
    if (priority === 'medium') return 'bg-amber-50 text-amber-600';
    return 'bg-blue-50 text-blue-600';
  };

  const isSubmitted = task.status === 'in_review' || task.status === 'completed';
  const isCompleted = task.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex-1 pr-4">
            <h2 className="font-display text-xl font-bold text-slate-900">{task.title}</h2>
            {task.creator_name && (
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <User size={12} />
                Assigned by {task.creator_name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cn('rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider', getPriorityStyle(task.priority))}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className={cn(
              'rounded-md px-2.5 py-1 text-xs font-bold capitalize',
              task.status === 'completed' ? 'bg-green-50 text-green-700' :
              task.status === 'in_review' ? 'bg-blue-50 text-blue-700' :
              task.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
              task.status === 'blocked' ? 'bg-red-50 text-red-700' :
              'bg-slate-100 text-slate-600'
            )}>
              {task.status.replace('_', ' ')}
            </span>
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={12} />
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.estimated_hours && (
              <span className="text-xs text-slate-500">{task.estimated_hours}h estimated</span>
            )}
          </div>

          {task.description && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Tag size={12} />Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {!isCompleted && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 mb-3">
                {isSubmitted
                  ? 'You\'ve submitted this task for review. Waiting for admin approval.'
                  : 'Mark this task as done when you\'re finished.'}
              </p>
              <button
                onClick={() => {
                  const newStatus = isSubmitted ? 'in_progress' : 'in_review';
                  onStatusChange(task.id, newStatus);
                  onClose();
                }}
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-bold transition-colors',
                  isSubmitted
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-peach-500 hover:bg-peach-600 text-white'
                )}
              >
                {isSubmitted ? 'Take Back (Mark In Progress)' : 'Mark as Done'}
              </button>
            </div>
          )}
          {isCompleted && (
            <div className="border-t border-slate-100 pt-4 flex items-center gap-2 text-green-600">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold">Task completed — great work!</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Workspace() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [userName, setUserName] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem('peachstack_user_name');
    if (savedName) setUserName(savedName.split(' ')[0]);

    let active = true;

    const loadWorkspaceData = () => {
      // Check if profile setup is needed (no university set)
      fetch(apiUrl('/api/workspace/profile'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!active || !data) return;
          // Sync the display name from server
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('peachstack_user_name', data.name);
          }
          // Show setup modal if university not set
          if (!data.university) {
            setShowProfileSetup(true);
          }
        })
        .catch(() => {});

      fetch(apiUrl('/api/workspace/tasks'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (active) setTasks(Array.isArray(data) ? data : []); })
        .catch(() => { if (active) setTasks([]); })
        .finally(() => { if (active) setLoadingTasks(false); });

      fetch(apiUrl('/api/workspace/projects'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (active) setProjects(Array.isArray(data) ? data : []); })
        .catch(() => { if (active) setProjects([]); })
        .finally(() => { if (active) setLoadingProjects(false); });

      fetch(apiUrl('/api/workspace/calendar'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (active) setCalendarEvents(Array.isArray(data) ? data : []); })
        .catch(() => { if (active) setCalendarEvents([]); })
        .finally(() => { if (active) setLoadingCalendar(false); });
    };

    // Check admin status first — only load workspace data if the user is NOT an admin.
    // This prevents the profile-setup modal from appearing for admins before the redirect fires.
    fetch(apiUrl('/api/me'), { credentials: 'include' })
      .then(r => {
        if (r.status === 401 || r.status === 403) {
          if (active) navigate('/login', { replace: true });
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then(data => {
        if (!active || data === null) return;
        if (data?.user && (data.user.role === 'admin' || data.user.role === 'superadmin' || data.user.isAdmin)) {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
        loadWorkspaceData();
      })
      .catch(() => {
        if (active) loadWorkspaceData();
      });

    const fetchUnread = () => {
      fetch(apiUrl('/api/messages/unread/count'), { credentials: 'include' })
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(data => { if (active) setUnreadMessages(data.count || 0); })
        .catch(() => {});
    };
    fetchUnread();
    const msgInterval = setInterval(fetchUnread, 30000);
    return () => {
      active = false;
      clearInterval(msgInterval);
    };
  }, [navigate]);

  const updateTaskStatus = async (id: string, status: string) => {
    await fetch(apiUrl(`/api/workspace/tasks/${id}/submit`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const joinProject = async (id: string) => {
    await fetch(apiUrl(`/api/workspace/projects/${id}/join`), {
      method: 'POST', credentials: 'include',
    });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, my_status: 'in_progress' } : p));
  };

  const submitProject = async (id: string) => {
    await fetch(apiUrl(`/api/workspace/projects/${id}/status`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_review' }),
    });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, my_status: 'in_review' } : p));
  };

  const unsubmitProject = async (id: string) => {
    await fetch(apiUrl(`/api/workspace/projects/${id}/status`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, my_status: 'in_progress' } : p));
  };

  const getPriorityLabel = (priority: string) => priority.charAt(0).toUpperCase() + priority.slice(1);
  const getPriorityStyle = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') return 'bg-red-50 text-red-600';
    if (priority === 'medium') return 'bg-amber-50 text-amber-600';
    return 'bg-blue-50 text-blue-600';
  };

  const formatEventTime = (time?: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  const upcomingEvents = calendarEvents
    .filter(e => new Date(e.event_date) >= new Date(new Date().toDateString()))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      {showProfileSetup && (
        <ProfileSetupModal
          onComplete={(firstName) => {
            setUserName(firstName);
            setShowProfileSetup(false);
          }}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={updateTaskStatus}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              Welcome back{userName ? `, ${userName}` : ''}!
            </h1>
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
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content: Tasks */}
          <div className="lg:col-span-2 space-y-8">
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
                    const isSubmitted = task.status === 'in_review' || task.status === 'completed';
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
                          disabled={isCompleted}
                          onClick={() => updateTaskStatus(task.id, isSubmitted ? 'in_progress' : 'in_review')}
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white cursor-not-allowed"
                              : isSubmitted
                              ? "bg-peach-500 border-peach-500 text-white hover:bg-peach-600"
                              : "border-slate-200 hover:border-peach-500"
                          )}
                          title={isCompleted ? 'Completed by admin' : isSubmitted ? 'Click to take back' : 'Mark as done'}
                        >
                          {isSubmitted && <CheckCircle2 size={14} />}
                        </button>
                        <button
                          className="flex-grow text-left"
                          onClick={() => setSelectedTask(task)}
                        >
                          <h4 className={cn("text-sm font-bold text-slate-900 hover:text-peach-600 transition-colors", isCompleted && "line-through")}>
                            {task.title}
                          </h4>
                          {task.creator_name && <p className="text-xs text-slate-500">From: {task.creator_name}</p>}
                        </button>
                        <div className="flex items-center gap-4 shrink-0">
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

            {/* Projects Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="text-peach-500" size={20} />
                  Your Projects
                </h2>
              </div>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-7 w-7 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
                  <Briefcase size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No projects available yet</p>
                  <p className="text-xs mt-1">Projects assigned to your role will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => {
                    const isSubmitted = project.my_status === 'in_review' || project.my_status === 'completed';
                    const isCompleted = project.my_status === 'completed';
                    const isJoined = !!project.my_status;
                    return (
                      <motion.div
                        key={project.id}
                        layout
                        className={cn(
                          "flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all",
                          isCompleted ? "opacity-60 grayscale" : "hover:shadow-sm"
                        )}
                      >
                        <button
                          disabled={isCompleted || !isJoined}
                          onClick={() => {
                            if (isSubmitted) unsubmitProject(project.id);
                            else if (isJoined) submitProject(project.id);
                          }}
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white cursor-not-allowed"
                              : isSubmitted
                              ? "bg-peach-500 border-peach-500 text-white hover:bg-peach-600"
                              : isJoined
                              ? "border-slate-200 hover:border-peach-500"
                              : "border-slate-100 cursor-default opacity-40"
                          )}
                          title={isCompleted ? 'Completed' : isSubmitted ? 'Click to take back' : isJoined ? 'Mark as done' : 'Join project first'}
                        >
                          {(isSubmitted || isCompleted) && <CheckCircle2 size={14} />}
                        </button>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-peach-50 text-peach-500">
                              <Briefcase size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={cn("text-sm font-bold text-slate-900", isCompleted && "line-through")}>{project.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1">{project.description}</p>
                              {project.skills_required?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.skills_required.slice(0, 3).map(skill => (
                                    <span key={skill} className="px-1.5 py-0.5 bg-peach-50 text-peach-700 rounded text-[10px] font-medium">{skill}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {project.deadline && (
                            <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-400">
                              <Clock size={12} />
                              {new Date(project.deadline).toLocaleDateString()}
                            </div>
                          )}
                          {!isJoined ? (
                            <button
                              onClick={() => joinProject(project.id)}
                              className="px-3 py-1 rounded-lg bg-peach-500 text-white text-xs font-bold hover:bg-peach-600 transition-colors"
                            >
                              Join
                            </button>
                          ) : (
                            <span className={cn(
                              "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                              isCompleted ? 'bg-green-50 text-green-600' :
                              isSubmitted ? 'bg-blue-50 text-blue-600' :
                              'bg-amber-50 text-amber-600'
                            )}>
                              {isCompleted ? 'Done' : isSubmitted ? 'In Review' : 'In Progress'}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: Schedule */}
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-peach-500" size={18} />
                  Schedule
                </h2>
              </div>
              {loadingCalendar ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-5 w-5 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <Calendar size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-16 pt-1 shrink-0">
                        {event.event_time ? formatEventTime(event.event_time) : new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-grow pb-4 border-l-2 border-slate-50 pl-4 relative">
                        <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-peach-500" />
                        <p className="text-sm font-bold text-slate-900">{event.title}</p>
                        {event.description && <p className="text-xs text-slate-500">{event.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
