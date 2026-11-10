import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  FolderKanban,
  CheckSquare,
  Clock,
  ShieldCheck,
  Bot,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';
import { TaskDetailsModal } from '../components/tasks/TaskDetailsModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, tasks, agents, meetings, addTask } = useWorkspace();

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Calendar State for the compact monthly calendar in the right column
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 7)); // Nov 7, 2026
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-11-07');
  const [isDayCreateOpen, setIsDayCreateOpen] = useState(false);
  const [dayTaskTitle, setDayTaskTitle] = useState('');

  // Compute metrics
  const activeProjectsCount = projects.length;
  const todayStr = '2026-11-07';
  const tasksDueToday = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed');
  const tasksAwaitingApproval = tasks.filter(t => t.status === 'in_review');
  const agentsWorking = agents.filter(a => a.status === 'Working' || a.status === 'Reviewing' || a.status === 'Testing');

  // Days in month calculation for interactive calendar
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Format date key YYYY-MM-DD
  const getDateKey = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Filter tasks for selected day
  const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDayDate);
  const selectedDayMeetings = meetings.filter(m => m.date === selectedDayDate);

  const handleQuickAddForDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayTaskTitle.trim()) return;

    addTask({
      key: `ACME-${Math.floor(270 + Math.random() * 30)}`,
      title: dayTaskTitle.trim(),
      description: 'Scheduled from Home interactive calendar.',
      projectId: 'proj-acme',
      projectName: 'Acme Portal Hub',
      client: 'Acme Digital Agency',
      repository: 'acme-org/portal-hub',
      status: 'todo',
      priority: 'medium',
      assignedAgent: 'Devon',
      assignedRole: 'Software Developer',
      dueDate: selectedDayDate,
      acceptanceCriteria: ['Implement requirements']
    });

    setDayTaskTitle('');
    setIsDayCreateOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* =========================================================================
          TOP: GREETING & PRIMARY ACTIONS
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
            Good morning, Sarah
          </h1>
          <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Saturday, November 7, 2026 • 5 AI engineering agents operational
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => navigate('/assistant')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-charcoal-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-subtle group"
          >
            <Sparkles className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
            <span>Ask FORGE AI</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUMMARY METRIC CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Active Projects */}
        <Link
          to="/projects"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-card hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Active Projects</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal-900 tracking-tight">
            {activeProjectsCount}
          </div>
          <span className="text-[11px] text-charcoal-500 mt-1 block">
            Across 3 client organizations
          </span>
        </Link>

        {/* 2. Tasks Due Today */}
        <Link
          to="/tasks"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-card hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Tasks Due Today</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal-900 tracking-tight">
            {tasksDueToday.length > 0 ? `0${tasksDueToday.length}` : '0'}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            {tasksDueToday.length > 0 ? 'ACME-248 auth fix due 5:00 PM' : 'No overdue tasks'}
          </span>
        </Link>

        {/* 3. Tasks Awaiting Approval */}
        <Link
          to="/approvals"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-card hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Awaiting Approval</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary tracking-tight">
            {tasksAwaitingApproval.length > 0 ? `0${tasksAwaitingApproval.length}` : '0'}
          </div>
          <span className="text-[11px] text-primary font-medium mt-1 block flex items-center gap-1">
            <span>Pull Request #248 ready</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* 4. AI Agents Working */}
        <Link
          to="/agent-activity"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-card hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Agents Active</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {agentsWorking.length} of {agents.length}
          </div>
          <span className="text-[11px] text-charcoal-500 mt-1 block">
            Collaborating in real time
          </span>
        </Link>
      </div>

      {/* =========================================================================
          MAIN TWO-COLUMN WORKSPACE
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =======================================================================
            LEFT COLUMN (7 cols): Today's Schedule, Upcoming Tasks, Deadlines, Projects
           ======================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Today's Schedule & Meetings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-charcoal-900">Today&apos;s Schedule</h2>
              </div>
              <Link to="/notes" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <span>View Notes & Meetings</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate('/notes')}
                  className="flex items-start justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                        {m.time}
                      </span>
                      <span className="text-xs font-semibold text-charcoal-900">
                        {m.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-600 line-clamp-1">
                      {m.summary}
                    </p>
                    <div className="text-[10px] text-charcoal-500 flex items-center gap-1.5">
                      <span>{m.participants.length} attendees</span>
                      <span>•</span>
                      <span>{m.actionItems.length} action items</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-primary font-medium shrink-0 pt-0.5">
                    Open Note →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Upcoming Tasks & Deadlines */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-charcoal-900">Upcoming Tasks & Deliverables</h2>
              </div>
              <Link to="/tasks" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <span>All Tasks ({tasks.length})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-charcoal-500">
                        {task.key}
                      </span>
                      <span className="text-xs font-semibold text-charcoal-900 truncate">
                        {task.title}
                      </span>
                      {task.priority === 'urgent' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-600 line-clamp-1">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-charcoal-500">
                      <span>Project: <strong>{task.projectName}</strong></span>
                      <span>•</span>
                      <span>Assigned to: <strong className="text-charcoal-800">{task.assignedAgent}</strong></span>
                      <span>•</span>
                      <span>Due: <strong className={task.dueDate === todayStr ? 'text-amber-700' : ''}>{task.dueDate}</strong></span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                    task.status === 'in_review' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recently Updated Projects */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-charcoal-900">Recently Updated Projects</h2>
              </div>
              <Link to="/projects" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <span>View Projects</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/projects')}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 hover:bg-slate-50 cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-charcoal-900 truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.health}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-charcoal-500">
                      <span>Progress</span>
                      <span className="font-semibold text-charcoal-700">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-charcoal-500 pt-1 border-t border-slate-200/60 flex justify-between">
                    <span>{p.openTasks} open</span>
                    <span>Updated {p.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN (5 cols): Compact Monthly Calendar, AI Team, Approvals
           ======================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Component: Compact Monthly Interactive Calendar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-charcoal-900">
                  {monthName} {year}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded text-charcoal-500 hover:text-charcoal-900 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded text-charcoal-500 hover:text-charcoal-900 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day grid */}
            <div>
              <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-charcoal-400 mb-1">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs">
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-8" />;
                  }

                  const dayKey = getDateKey(day);
                  const isToday = dayKey === todayStr;
                  const isSelected = dayKey === selectedDayDate;

                  // Check if any task or meeting is scheduled on this day
                  const hasTasks = tasks.some(t => t.dueDate === dayKey);
                  const hasMeetings = meetings.some(m => m.date === dayKey);

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => setSelectedDayDate(dayKey)}
                      className={`h-8 rounded-lg flex flex-col items-center justify-center relative transition-colors text-xs ${
                        isSelected
                          ? 'bg-primary text-white font-bold shadow-xs'
                          : isToday
                          ? 'bg-purple-50 text-primary font-bold border border-primary/30'
                          : 'hover:bg-slate-100 text-charcoal-800'
                      }`}
                    >
                      <span>{day}</span>
                      {/* Indicator dot */}
                      {(hasTasks || hasMeetings) && (
                        <span
                          className={`w-1 h-1 rounded-full mt-0.5 ${
                            isSelected ? 'bg-white' : 'bg-primary'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Agenda & Tasks */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal-900">
                  {selectedDayDate === todayStr ? 'Today, Nov 7' : selectedDayDate}
                </span>

                <button
                  onClick={() => setIsDayCreateOpen(true)}
                  className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Inline task creator if clicked */}
              {isDayCreateOpen && (
                <form onSubmit={handleQuickAddForDay} className="pt-2 border-t border-slate-200/60 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="New task title..."
                    value={dayTaskTitle}
                    onChange={(e) => setDayTaskTitle(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-hover"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDayCreateOpen(false)}
                    className="px-2 py-1 text-charcoal-500 hover:text-charcoal-800 text-xs"
                  >
                    ✕
                  </button>
                </form>
              )}

              {/* Day items */}
              {selectedDayTasks.length === 0 && selectedDayMeetings.length === 0 ? (
                <div className="text-[11px] text-charcoal-500 py-1">
                  No tasks or meetings scheduled on this day.
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {selectedDayMeetings.map(m => (
                    <div
                      key={m.id}
                      onClick={() => navigate('/notes')}
                      className="p-1.5 rounded bg-white border border-slate-200 text-xs flex items-center justify-between cursor-pointer hover:border-slate-300"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1 rounded font-medium">Meeting</span>
                        <span className="font-medium text-charcoal-800 truncate">{m.title}</span>
                      </div>
                      <span className="text-[10px] text-charcoal-500 shrink-0">{m.time}</span>
                    </div>
                  ))}

                  {selectedDayTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="p-1.5 rounded bg-white border border-slate-200 text-xs flex items-center justify-between cursor-pointer hover:border-slate-300"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-medium">Task</span>
                        <span className="font-medium text-charcoal-800 truncate">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-charcoal-500 shrink-0 font-medium">{t.assignedAgent}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right">
              <Link to="/calendar" className="text-xs text-primary font-medium hover:underline">
                Open Full Calendar (Month/Week/Agenda) →
              </Link>
            </div>
          </div>

          {/* Component: AI Team Activity Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-charcoal-900">AI Team Activity</h2>
              </div>
              <Link to="/agent-activity" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <span>Live Collaboration</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => navigate('/agent-activity')}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-charcoal-900">{agent.name}</span>
                        <span className="text-[11px] text-charcoal-500 font-normal">({agent.role})</span>
                      </div>
                      <p className="text-[11px] text-charcoal-600 truncate mt-0.5">
                        {agent.currentTaskTitle}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${
                    agent.status === 'Working' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    agent.status === 'Reviewing' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    agent.status === 'Planning' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Component: Pending Approvals Quick Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-charcoal-900">Pending Approvals</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                1 Pending Sign-off
              </span>
            </div>

            <div
              onClick={() => navigate('/approvals')}
              className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200/80 hover:bg-amber-50 transition-colors cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-charcoal-900">Pull Request #248</span>
                <span className="text-[10px] text-charcoal-500 font-mono">acme-org/portal-hub</span>
              </div>
              <p className="text-xs text-charcoal-700 font-medium">
                Fix email validation in authentication flow
              </p>
              <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-amber-200/60">
                <span>Devon • Elena • Tessa</span>
                <span className="text-primary font-semibold hover:underline">
                  Review & Authorize →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />

      {/* Task Details Drawer/Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={(_updated) => {
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};
