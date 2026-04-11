import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
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

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/admin/tasks?limit=200'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setTasks(data.data || []))
      .catch(() => {});
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-slate-500 text-sm mt-1">View tasks and deadlines by date</p>
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
                    {dayTasks.slice(0, 2).map(t => (
                      <div key={t.id} className={cn('h-1.5 rounded-full', PRIORITY_COLOR[t.priority] || 'bg-slate-300')} />
                    ))}
                    {dayTasks.length > 2 && (
                      <p className="text-[10px] text-slate-400 font-medium">+{dayTasks.length - 2}</p>
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
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {selected ? (
            <>
              <h3 className="font-semibold text-slate-900 mb-1">
                {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-slate-400 mb-4">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} due</p>
              {selectedTasks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No tasks due on this day</p>
              ) : (
                <div className="space-y-3">
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
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium">Select a date</p>
              <p className="text-sm mt-1">Click any day to see tasks due</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
