import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Building2,
  RotateCw,
} from 'lucide-react';
import { mockTaskItems } from '../data/mockData';
import { TaskItem, IssueTaskStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskDetailsModal } from '../components/tasks/TaskDetailsModal';

export const TasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialClient = searchParams.get('client') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [tasks, setTasks] = useState<TaskItem[]>(mockTaskItems);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedClient, setSelectedClient] = useState<string>(initialClient);
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // All 9 Task Statuses
  const allStatuses: IssueTaskStatus[] = [
    'Backlog',
    'Ready',
    'Planning',
    'Development',
    'Testing',
    'Review',
    'Awaiting Approval',
    'Completed',
    'Failed',
  ];

  const handleCreateTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleMoveTaskStatus = (taskId: string, newStatus: IssueTaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );
  };

  // Filtered task items
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Client filter
      if (selectedClient !== 'ALL' && task.client !== selectedClient) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && task.status !== selectedStatus) {
        return false;
      }

      // Employee filter
      if (selectedEmployee !== 'ALL' && task.assignedEmployee !== selectedEmployee) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchKey = task.key.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchClient = task.client.toLowerCase().includes(q);
        const matchProject = task.projectName.toLowerCase().includes(q);
        const matchRepo = task.repository.toLowerCase().includes(q);
        const matchEmp = task.assignedEmployee.toLowerCase().includes(q);
        return matchTitle || matchKey || matchDesc || matchClient || matchProject || matchRepo || matchEmp;
      }

      return true;
    });
  }, [tasks, selectedClient, selectedPriority, selectedStatus, selectedEmployee, searchQuery]);

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="rose" size="xs">CRITICAL</Badge>;
      case 'High':
        return <Badge variant="amber" size="xs">HIGH</Badge>;
      case 'Medium':
        return <Badge variant="blue" size="xs">MEDIUM</Badge>;
      case 'Low':
        return <Badge variant="subtle" size="xs">LOW</Badge>;
    }
  };

  const getStatusBadgeVariant = (status: IssueTaskStatus) => {
    switch (status) {
      case 'Development':
        return 'violet';
      case 'Testing':
        return 'blue';
      case 'Review':
        return 'amber';
      case 'Awaiting Approval':
        return 'rose';
      case 'Completed':
        return 'emerald';
      case 'Failed':
        return 'rose';
      case 'Planning':
        return 'subtle';
      case 'Ready':
        return 'blue';
      default:
        return 'subtle';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1720px] mx-auto select-none">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900">
              Task Orchestration
            </h1>
            <Badge variant="violet" size="sm">
              {tasks.length} WORK ITEMS
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Complete autonomous issue management, Kanban boards, and multi-client engineering backlogs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          {/* View switcher: Kanban vs List */}
          <div className="flex items-center rounded-lg bg-slate-100 border border-slate-200 p-0.5 text-charcoal-500">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                  : 'hover:text-charcoal-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                  : 'hover:text-charcoal-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-600" />
              <span>List View</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 font-sans shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          FILTERS CONTROL BAR
          ========================================================================= */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3 shadow-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by task title, key, repo, client, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary shadow-xs font-sans"
            />
          </div>

          {/* Quick reset */}
          {(selectedClient !== 'ALL' ||
            selectedPriority !== 'ALL' ||
            selectedStatus !== 'ALL' ||
            selectedEmployee !== 'ALL' ||
            searchQuery.trim().length > 0) && (
            <button
              onClick={() => {
                setSelectedClient('ALL');
                setSelectedPriority('ALL');
                setSelectedStatus('ALL');
                setSelectedEmployee('ALL');
                setSearchQuery('');
              }}
              className="flex items-center gap-1 text-[11px] font-mono text-primary hover:text-primary-hover self-end sm:self-center"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Filter selectors row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Client Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-charcoal-500 font-semibold uppercase">CLIENT</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="ALL">All Clients</option>
              <option value="Acme Digital Agency">Acme Digital Agency</option>
              <option value="Northstar Commerce">Northstar Commerce</option>
              <option value="Vertex Technologies">Vertex Technologies</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-charcoal-500 font-semibold uppercase">PRIORITY</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-charcoal-500 font-semibold uppercase">STATUS</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              {allStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* AI Employee Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-charcoal-500 font-semibold uppercase">ASSIGNED EMPLOYEE</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="ALL">All Employees</option>
              <option value="Alex">Alex (AI Product Mgr)</option>
              <option value="Marcus">Marcus (AI Architect)</option>
              <option value="Devon">Devon (AI Full-Stack)</option>
              <option value="Tessa">Tessa (AI QA Eng)</option>
              <option value="Elena">Elena (AI Code Reviewer)</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: KANBAN BOARD VIEW
          ========================================================================= */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 items-start min-h-[640px]">
          {allStatuses.map((columnStatus) => {
            const columnTasks = filteredTasks.filter((t) => t.status === columnStatus);

            return (
              <div
                key={columnStatus}
                className="w-80 flex-shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex flex-col max-h-[780px]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 bg-white rounded-t-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-900">
                      {columnStatus.toUpperCase()}
                    </span>
                    <Badge variant={getStatusBadgeVariant(columnStatus)} size="xs">
                      {columnTasks.length}
                    </Badge>
                  </div>

                  <button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                    }}
                    className="p-1 rounded text-charcoal-400 hover:text-charcoal-800 hover:bg-slate-100 transition-colors"
                    title={`Add task to ${columnStatus}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards Container */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                  {columnTasks.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-charcoal-400">
                      No tasks in {columnStatus}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-card cursor-pointer transition-all duration-150 group space-y-2.5 shadow-xs"
                      >
                        {/* Task Top Meta */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary font-mono">
                            {task.key}
                          </span>
                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* Task Title */}
                        <h4 className="text-xs font-semibold text-charcoal-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {/* Client & Repo */}
                        <div className="text-[10px] text-charcoal-500 truncate flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-charcoal-400 flex-shrink-0" />
                          <span className="truncate">{task.client}</span>
                        </div>

                        {/* Card Bottom: Assigned Employee + Quick Move Control */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-violet-950/80 border border-violet-500/40 flex items-center justify-center font-bold text-[9px] text-violet-300">
                              {task.assignedEmployee.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[11px] text-zinc-300">
                              {task.assignedEmployee}
                            </span>
                          </div>

                          {/* Move to next stage button */}
                          <select
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleMoveTaskStatus(task.id, e.target.value as IssueTaskStatus)
                            }
                            className="bg-surface-muted border border-border text-[10px] rounded px-1.5 py-0.5 text-zinc-300 focus:outline-none"
                          >
                            {allStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE 2: LIST / TABLE VIEW
            ========================================================================= */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-elevated/40 text-zinc-400 border-b border-border text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">KEY</th>
                  <th className="py-2.5 px-3.5 font-semibold">TASK TITLE</th>
                  <th className="py-2.5 px-3.5 font-semibold">PRIORITY</th>
                  <th className="py-2.5 px-3.5 font-semibold">STATUS</th>
                  <th className="py-2.5 px-3.5 font-semibold">CLIENT</th>
                  <th className="py-2.5 px-3.5 font-semibold">REPOSITORY</th>
                  <th className="py-2.5 px-3.5 font-semibold">ASSIGNED AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-surface-elevated/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap text-violet-300 font-bold">
                        {task.key}
                      </td>

                      <td className="py-3 px-3.5 max-w-sm">
                        <div className="font-sans font-medium text-zinc-100 group-hover:text-violet-200 transition-colors line-clamp-1">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                          {task.description}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {getPriorityBadge(task.priority)}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleMoveTaskStatus(task.id, e.target.value as IssueTaskStatus)
                          }
                          className="bg-surface-muted border border-border text-xs rounded px-2 py-0.5 text-zinc-200 focus:outline-none"
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-zinc-300">
                        {task.client}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-zinc-400">
                        {task.repository}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-violet-950/80 border border-violet-500/40 flex items-center justify-center font-bold text-[9px] text-violet-300">
                            {task.assignedEmployee.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-zinc-200">{task.assignedEmployee}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        defaultClient={selectedClient !== 'ALL' ? selectedClient : undefined}
      />

      {/* Task Details & Edit Modal */}
      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
};
