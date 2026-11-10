import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckSquare, 
  Users, 
  Flag, 
  ShieldCheck, 
  X,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CalendarEventModel } from '../types/workspace';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarPage: React.FC = () => {
  const { 
    calendarEvents, 
    projects, 
    addCalendarEvent, 
    deleteCalendarEvent,
    addTask 
  } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 7)); // Nov 7, 2026
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filters
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventModel | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState('2026-11-07');
  const [createTitle, setCreateTitle] = useState('');
  const [createType, setCreateType] = useState<CalendarEventModel['type']>('task');
  const [createTime, setCreateTime] = useState('2:00 PM');
  const [createProject, setCreateProject] = useState(projects[0]?.id || 'proj-acme');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 7));
  };

  // Filter events
  const filteredEvents = calendarEvents.filter(event => {
    if (selectedProjectFilter !== 'all' && event.projectId !== selectedProjectFilter) {
      return false;
    }
    if (selectedTypeFilter !== 'all' && event.type !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  // Calculate days for Month view
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthGridDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    monthGridDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    monthGridDays.push(d);
  }

  const getDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    const proj = projects.find(p => p.id === createProject) || projects[0];

    // If task, also add to tasks list
    if (createType === 'task') {
      addTask({
        key: `${proj.key}-${Math.floor(280 + Math.random() * 20)}`,
        title: createTitle.trim(),
        description: 'Created directly from Calendar view.',
        projectId: proj.id,
        projectName: proj.name,
        client: proj.client,
        repository: proj.repository,
        status: 'todo',
        priority: 'medium',
        assignedAgent: 'Devon',
        assignedRole: 'Software Developer',
        dueDate: createDate,
        acceptanceCriteria: ['Fulfill calendar milestone']
      });
    } else {
      addCalendarEvent({
        title: createTitle.trim(),
        date: createDate,
        time: createTime,
        type: createType,
        projectId: proj.id,
        projectName: proj.name
      });
    }

    setCreateTitle('');
    setIsCreateOpen(false);
  };

  const getEventBadgeClass = (type: CalendarEventModel['type']) => {
    switch (type) {
      case 'task':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'meeting':
        return 'bg-purple-50 text-primary border-purple-200';
      case 'milestone':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approval':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEventIcon = (type: CalendarEventModel['type']) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-3 h-3 text-emerald-600 shrink-0" />;
      case 'meeting':
        return <Users className="w-3 h-3 text-primary shrink-0" />;
      case 'milestone':
        return <Flag className="w-3 h-3 text-blue-600 shrink-0" />;
      case 'approval':
        return <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />;
      default:
        return <CalendarIcon className="w-3 h-3 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Schedule & Deliverables Calendar
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-primary border border-purple-200">
              {filteredEvents.length} Events Synced
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Track AI workforce execution deadlines, team meetings, project milestones, and approval dates in one unified view.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateDate('2026-11-07');
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event / Task</span>
        </button>
      </div>

      {/* Navigation & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-card">
        {/* Date Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-charcoal-800 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-charcoal-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-charcoal-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm font-bold text-charcoal-900 pl-1">
            {monthName} {year}
          </h2>
        </div>

        {/* View Mode & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Project Filter */}
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-charcoal-800 text-xs font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-charcoal-800 text-xs font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Event Types</option>
            <option value="task">Tasks & Deadlines</option>
            <option value="meeting">Meetings</option>
            <option value="milestone">Milestones</option>
            <option value="approval">Approvals</option>
          </select>

          {/* View Mode Tabs */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
            {(['month', 'week', 'agenda'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MONTH VIEW (Default)
         ========================================================================= */}
      {viewMode === 'month' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
          {/* Day of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-semibold text-charcoal-600 py-2.5">
            <span>Sunday</span>
            <span>Monday</span>
            <span>Tuesday</span>
            <span>Wednesday</span>
            <span>Thursday</span>
            <span>Friday</span>
            <span>Saturday</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[580px]">
            {monthGridDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="bg-slate-50/30 p-2 min-h-[96px]" />;
              }

              const dateStr = getDateString(day);
              const isToday = dateStr === '2026-11-07';
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => {
                    setCreateDate(dateStr);
                    setIsCreateOpen(true);
                  }}
                  className={`p-2 min-h-[105px] hover:bg-slate-50/80 transition-colors flex flex-col justify-between group cursor-pointer ${
                    isToday ? 'bg-purple-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-primary text-white font-bold'
                          : 'text-charcoal-800 group-hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateDate(dateStr);
                        setIsCreateOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-charcoal-400 hover:text-primary transition-opacity text-xs"
                      title="Add event"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Events list for this day */}
                  <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium border truncate flex items-center gap-1 shadow-xs hover:opacity-90 ${getEventBadgeClass(evt.type)}`}
                        title={evt.title}
                      >
                        {getEventIcon(evt.type)}
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: AGENDA VIEW
         ========================================================================= */}
      {viewMode === 'agenda' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-6">
          <h2 className="text-sm font-bold text-charcoal-900 border-b border-slate-100 pb-3">
            Chronological Agenda & Deliverables
          </h2>

          <div className="space-y-4">
            {filteredEvents.map(evt => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 transition-all cursor-pointer gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${getEventBadgeClass(evt.type)} shrink-0`}>
                    {getEventIcon(evt.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-charcoal-900">
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-charcoal-500 mt-0.5">
                      <span>Project: <strong>{evt.projectName || 'All Projects'}</strong></span>
                      {evt.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned: <strong>{evt.assignedTo}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0 font-medium">
                  <div className="text-charcoal-700 font-mono">
                    {evt.date} {evt.time && `• ${evt.time}`}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${getEventBadgeClass(evt.type)}`}>
                    {evt.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: WEEK VIEW
         ========================================================================= */}
      {viewMode === 'week' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
          <div className="text-xs font-semibold text-charcoal-500 pb-2 border-b border-slate-100">
            Week of November 7 – November 13, 2026
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 min-h-[400px]">
            {[7, 8, 9, 10, 11, 12, 13].map((d) => {
              const dateStr = `2026-11-${String(d).padStart(2, '0')}`;
              const isToday = dateStr === '2026-11-07';
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);

              return (
                <div
                  key={d}
                  className={`p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 ${
                    isToday ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="text-xs font-bold text-charcoal-900">Nov {d}</span>
                    {isToday && <span className="text-[10px] text-primary font-bold">Today</span>}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2 rounded-lg border text-xs font-medium cursor-pointer ${getEventBadgeClass(evt.type)}`}
                      >
                        <div className="flex items-center gap-1">
                          {getEventIcon(evt.type)}
                          <span className="truncate">{evt.title}</span>
                        </div>
                        {evt.time && <div className="text-[10px] text-charcoal-500 mt-1">{evt.time}</div>}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setCreateDate(dateStr);
                      setIsCreateOpen(true);
                    }}
                    className="w-full text-center py-1 text-[11px] text-primary hover:bg-purple-100/50 rounded font-medium transition-colors"
                  >
                    + Add item
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Event Details */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${getEventBadgeClass(selectedEvent.type)}`}>
                  {getEventIcon(selectedEvent.type)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-400">
                    {selectedEvent.type} Details
                  </span>
                  <h3 className="font-bold text-sm text-charcoal-900">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-charcoal-700">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Date & Time:</span>
                <span className="font-semibold text-charcoal-900">{selectedEvent.date} {selectedEvent.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Project:</span>
                <span className="font-semibold text-charcoal-900">{selectedEvent.projectName || 'All Projects'}</span>
              </div>
              {selectedEvent.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Assignee:</span>
                  <span className="font-semibold text-primary">{selectedEvent.assignedTo}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  deleteCalendarEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete event</span>
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-charcoal-900 hover:bg-charcoal-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Event on Date */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-charcoal-900">
                Schedule Event or Task for {createDate}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passkey deployment milestone"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-charcoal-700 font-medium mb-1">Type</label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="task">Task Deadline</option>
                    <option value="meeting">Meeting</option>
                    <option value="milestone">Project Milestone</option>
                    <option value="approval">Approval Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-charcoal-700 font-medium mb-1">Time</label>
                  <input
                    type="text"
                    value={createTime}
                    onChange={(e) => setCreateTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Project</label>
                <select
                  value={createProject}
                  onChange={(e) => setCreateProject(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs text-charcoal-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
