import React, { useState } from 'react';
import {
  Search,
  Terminal,
  GitBranch,
} from 'lucide-react';
import { ActiveExecutionItem, PipelineStage } from '../../types';
import { Badge } from '../ui/Badge';
import { StatusDot } from '../ui/StatusDot';
import { Card, CardHeader, CardTitle } from '../ui/Card';

interface ActiveExecutionsTableProps {
  tasks: ActiveExecutionItem[];
  selectedStageFilter: PipelineStage | null;
  onSelectTask: (task: ActiveExecutionItem) => void;
  onSelectEmployee: (employeeName: string) => void;
  onClearStageFilter: () => void;
}

export const ActiveExecutionsTable: React.FC<ActiveExecutionsTableProps> = ({
  tasks,
  selectedStageFilter,
  onSelectTask,
  onSelectEmployee,
  onClearStageFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    // Stage filter
    if (selectedStageFilter && t.stage !== selectedStageFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.taskTitle.toLowerCase().includes(q);
      const matchClient = t.client.toLowerCase().includes(q);
      const matchRepo = t.repository.toLowerCase().includes(q);
      const matchEmployee = t.employee.name.toLowerCase().includes(q);
      return matchTitle || matchClient || matchRepo || matchEmployee;
    }
    return true;
  });

  const getStageBadgeVariant = (stage: PipelineStage) => {
    switch (stage) {
      case 'DEVELOPMENT':
        return 'violet';
      case 'TESTING':
        return 'blue';
      case 'REVIEW':
        return 'amber';
      case 'APPROVAL':
        return 'rose';
      default:
        return 'subtle';
    }
  };

  const getStatusDotType = (status: string) => {
    switch (status) {
      case 'Running':
      case 'Compiling':
      case 'Testing':
        return 'busy';
      case 'Reviewing':
        return 'warning';
      case 'Awaiting Sign-off':
        return 'error';
      case 'Optimal':
      case 'Passed':
        return 'active';
      default:
        return 'idle';
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Table Header & Controls Bar */}
      <CardHeader className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-violet-400" />
          <CardTitle>ACTIVE WORKFORCE EXECUTIONS</CardTitle>
          <Badge variant="subtle" size="xs">
            {filteredTasks.length} OF {tasks.length}
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Search box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter tasks, repo, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans"
            />
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-muted border border-border rounded px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Running">RUNNING</option>
            <option value="Compiling">COMPILING</option>
            <option value="Testing">TESTING</option>
            <option value="Reviewing">REVIEWING</option>
            <option value="Awaiting Sign-off">AWAITING SIGN-OFF</option>
          </select>

          {selectedStageFilter && (
            <button
              onClick={onClearStageFilter}
              className="px-2 py-1 rounded bg-violet-950/60 text-violet-300 border border-violet-500/40 hover:bg-violet-900/60 transition-colors text-[11px]"
            >
              Clear stage filter: {selectedStageFilter} ×
            </button>
          )}
        </div>
      </CardHeader>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-surface-elevated/20 text-zinc-400 border-b border-border/80 text-[11px]">
            <tr>
              <th className="py-2.5 px-3.5 font-semibold">TASK TITLE</th>
              <th className="py-2.5 px-3.5 font-semibold">CLIENT</th>
              <th className="py-2.5 px-3.5 font-semibold">REPOSITORY</th>
              <th className="py-2.5 px-3.5 font-semibold">AI EMPLOYEE</th>
              <th className="py-2.5 px-3.5 font-semibold">EXECUTION STAGE</th>
              <th className="py-2.5 px-3.5 font-semibold">DURATION</th>
              <th className="py-2.5 px-3.5 font-semibold">COST</th>
              <th className="py-2.5 px-3.5 font-semibold">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-zinc-500">
                  No active executions matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-surface-elevated/50 cursor-pointer transition-colors group"
                >
                  {/* Task title */}
                  <td className="py-3 px-3.5 max-w-xs sm:max-w-sm">
                    <div className="flex items-center gap-1.5 font-sans font-medium text-zinc-100 group-hover:text-violet-200 transition-colors line-clamp-1">
                      <span>{task.taskTitle}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>{task.id}</span>
                      <span>•</span>
                      <span className="text-emerald-400">+{task.diffStats.additions}</span>
                      <span className="text-rose-400">-{task.diffStats.deletions}</span>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="text-zinc-200 font-sans font-medium truncate max-w-[120px]">
                      {task.client}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{task.clientCode}</span>
                  </td>

                  {/* Repository */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-zinc-300 truncate max-w-[150px]">
                      <GitBranch className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{task.repository.split('/')[1] || task.repository}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                      {task.repositoryBranch.replace('forge/', '')}
                    </div>
                  </td>

                  {/* AI Employee */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(task.employee.name);
                      }}
                      className="flex items-center gap-2 p-1 rounded hover:bg-violet-950/40 text-left transition-colors"
                      title="Inspect AI employee profile"
                    >
                      <div className="w-6 h-6 rounded bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-300 font-bold text-[10px]">
                        {task.employee.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="leading-none">
                        <span className="font-bold text-zinc-100 hover:text-violet-300 block">
                          {task.employee.name}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-sans block mt-0.5">
                          {task.employee.role.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  </td>

                  {/* Execution Stage */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <Badge variant={getStageBadgeVariant(task.stage)} size="xs">
                      {task.stage}
                    </Badge>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-zinc-300">
                    {task.duration}
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-bold text-emerald-400">
                    {task.cost}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={getStatusDotType(task.status)} size="sm" />
                      <span className="text-zinc-200">{task.status}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
