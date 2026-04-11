import { useEffect, useState, FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  target_role?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

function AddEventModal({ date, onClose, onSave }: { date: Date; onClose: () => void; onSave: (event: CalendarEvent) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/calendar'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          event_date: date.toISOString().slice(0, 10),
          event_time: eventTime || null,
          target_role: targetRole,
        }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const { id } = await res.json();
      onSave({
        id,
        title: title.trim(),
        description: description.trim() || undefined,
        event_date: date.toISOString().slice(0, 10),
        event_time: eventTime || undefined,
        target_role: targetRole,
      });
      toast.success('Event added to calendar');
      onClose();
    } catch {
      toast.error('Could not create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Add Event: {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
              placeholder="e.g. Team standup, Deadline, Workshop..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent resize-none"
              placeholder="Optional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
              <input
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Audience</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
              >
                <option value="all">Everyone</option>
                <option value="student">Students only</option>
                <option value="admin">Admins only</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-peach-500 text-white text-sm font-bold hover:bg-peach-600 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEvents = () => {
    fetch(apiUrl('/api/admin/calendar'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetch(apiUrl('/api/admin/tasks?limit=200'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setTasks(data.data || []))
      .catch(() => {});
    fetchEvents();
  }, []);

  const deleteEvent = async (id: string) => {
    try {
      await fetch(apiUrl(`/api/admin/calendar/${id}`), { method: 'DELETE', credentials: 'include' });
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event removed');
    } catch {
      toast.error('Could not delete event');
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: Array<{ date: Date; current: boolean }> = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), current: false });
  }

  const tasksByDate = (date: Date) => {
    const key = date.toISOString().slice(0, 10);
    return tasks.filter(t => t.due_date && t.due_date.slice(0, 10) === key);
  };

  const eventsByDate = (date: Date) => {
    const key = date.toISOString().slice(0, 10);
    return events.filter(e => e.event_date && e.event_date.slice(0, 10) === key);
  };

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const isSelected = (date: Date) =>
    selected &&
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate();

  const selectedTasks = selected ? tasksByDate(selected) : [];
  const selectedEvents = selected ? eventsByDate(selected) : [];

  const formatTime = (time?: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="space-y-6">
      {showAddModal && selected && (
        <AddEventModal
          date={selected}
          onClose={() => setShowAddModal(false)}
          onSave={(event) => setEvents(prev => [...prev, event])}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage tasks, deadlines, and events</p>
        </div>
        {selected && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-peach-500 hover:bg-peach-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} />
            Add Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const dayTasks = tasksByDate(cell.date);
              const dayEvents = eventsByDate(cell.date);
              const highlight = isToday(cell.date);
              const sel = isSelected(cell.date);
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(cell.date)}
                  className={cn(
                    'relative min-h-[72px] p-2 text-left border-b border-r border-slate-50 transition-colors',
                    !cell.current && 'bg-slate-50/40',
                    sel && 'bg-peach-50',
                    cell.current && !sel && 'hover:bg-slate-50',
                  )}
                >
                  <span className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                    highlight && 'bg-peach-500 text-white font-bold',
                    !highlight && cell.current && 'text-slate-900',
                    !highlight && !cell.current && 'text-slate-300',
                    sel && !highlight && 'ring-2 ring-peach-400',
                  )}>
                    {cell.date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 1).map(t => (
                      <div key={t.id} className={cn('h-1.5 rounded-full', PRIORITY_COLOR[t.priority] || 'bg-slate-300')} />
                    ))}
                    {dayEvents.slice(0, 1).map(e => (
                      <div key={e.id} className="h-1.5 rounded-full bg-violet-400" />
                    ))}
                    {(dayTasks.length + dayEvents.length) > 2 && (
                      <p className="text-[10px] text-slate-400 font-medium">+{dayTasks.length + dayEvents.length - 2}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-6 py-3 border-t border-slate-100">
            {[['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([p, label]) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className={cn('h-2.5 w-2.5 rounded-full', PRIORITY_COLOR[p])} />
                <span className="text-xs text-slate-500">{label} priority</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              <span className="text-xs text-slate-500">Event</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-slate-900">
                  {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="ml-2 flex items-center gap-1 text-xs font-bold text-peach-600 hover:text-peach-700 transition-colors shrink-0"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
                {selectedEvents.length > 0 && `, ${selectedEvents.length} event${selectedEvents.length !== 1 ? 's' : ''}`}
              </p>

              {selectedEvents.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Events</p>
                  <div className="space-y-2">
                    {selectedEvents.map(event => (
                      <div key={event.id} className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{event.title}</p>
                            {event.event_time && (
                              <p className="text-xs text-violet-600 mt-0.5">{formatTime(event.event_time)}</p>
                            )}
                            {event.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTasks.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks due</p>
                  <div className="space-y-2">
                    {selectedTasks.map(t => (
                      <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-start gap-2">
                          <div className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', PRIORITY_COLOR[t.priority] || 'bg-slate-300')} />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{t.title}</p>
                            <p className="text-xs text-slate-400 capitalize mt-0.5">{t.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTasks.length === 0 && selectedEvents.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">Nothing scheduled for this day</p>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium">Select a date</p>
              <p className="text-sm mt-1">Click any day to see tasks and events, or add a new event</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
