import React, { useState } from 'react';
import {
  X,
  Terminal,
  Bot,
  Pause,
  Play,
  RotateCw,
  GitBranch,
  Building2,
  Clock,
  DollarSign,
} from 'lucide-react';
import { ActiveExecutionItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusDot } from '../ui/StatusDot';

interface TaskExecutionModalProps {
  task: ActiveExecutionItem | null;
  onClose: () => void;
  onOpenEmployeeProfile?: (employeeName: string) => void;
}

export const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({
  task,
  onClose,
  onOpenEmployeeProfile,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="font-mono text-xs text-zinc-400 font-semibold">{task.id}</span>
            <span className="text-zinc-600">•</span>
            <Badge
              variant={
                task.stage === 'DEVELOPMENT'
                  ? 'violet'
                  : task.stage === 'TESTING'
                  ? 'blue'
                  : task.stage === 'REVIEW'
                  ? 'amber'
                  : task.stage === 'APPROVAL'
                  ? 'rose'
                  : 'subtle'
              }
              size="xs"
            >
              {task.stage}
            </Badge>
            <Badge
              variant={task.priority === 'critical' ? 'rose' : task.priority === 'high' ? 'amber' : 'default'}
              size="xs"
            >
              {task.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-highlight transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Title & Description */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {task.taskTitle}
            </h2>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-sans">
              {task.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-zinc-400" /> CLIENT
              </span>
              <span className="text-zinc-100 font-semibold truncate block mt-0.5">
                {task.client}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-zinc-400" /> REPOSITORY
              </span>
              <span className="text-violet-300 font-semibold truncate block mt-0.5">
                {task.repository}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" /> DURATION
              </span>
              <span className="text-zinc-100 font-semibold block mt-0.5">
                {task.duration}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> COMPUTE COST
              </span>
              <span className="text-emerald-400 font-semibold block mt-0.5">
                {task.cost} USD
              </span>
            </div>
          </div>

          {/* Assigned AI Employee Card */}
          <div className="p-3 rounded-lg bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-300 font-mono font-bold text-sm">
                {task.employee.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">
                    {task.employee.name}
                  </span>
                  <StatusDot status={isPaused ? 'warning' : 'busy'} size="sm" />
                  <span className="text-[11px] text-zinc-400">{task.employee.role}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Autonomous sandbox container: isolated nitro-runner-04
                </span>
              </div>
            </div>

            {onOpenEmployeeProfile && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onOpenEmployeeProfile(task.employee.name)}
                className="font-mono text-zinc-300"
              >
                <Bot className="w-3 h-3" />
                <span>View {task.employee.name}&apos;s Profile</span>
              </Button>
            )}
          </div>

          {/* AST Diff Stats Bar */}
          <div className="p-3 rounded-lg bg-surface-muted border border-border/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">DIFF METRICS:</span>
              <span className="text-emerald-400 font-bold">+{task.diffStats.additions} lines</span>
              <span className="text-rose-400 font-bold">-{task.diffStats.deletions} lines</span>
              <span className="text-zinc-400">• {task.diffStats.filesChanged} files changed</span>
            </div>
            <span className="text-zinc-400">Branch: {task.repositoryBranch}</span>
          </div>

          {/* Live Runner Terminal Console */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                <span>EXECUTION RUNNER LOGSTREAM</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TENSOR CORE ACCELERATED
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-black/70 border border-border font-mono text-xs space-y-1.5 h-48 overflow-y-auto text-zinc-300 select-text">
              {task.recentLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-zinc-400 select-none">[{log.timestamp}]</span>
                  <span
                    className={
                      log.level === 'command'
                        ? 'text-violet-400 font-semibold'
                        : log.level === 'warn'
                        ? 'text-amber-400 font-medium'
                        : log.level === 'error'
                        ? 'text-rose-400 font-medium'
                        : 'text-zinc-300'
                    }
                  >
                    {log.level === 'command' && '$ '}
                    {log.message}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-violet-400 pt-1 animate-pulse">
                <span>&gt;</span>
                <span>Active worker process ID 1842 running {task.stage}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Button
              variant={isPaused ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="gap-1.5"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'RESUME EXECUTION' : 'PAUSE EXECUTION'}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RotateCw className="w-3.5 h-3.5" />
              <span>RE-RUN TEST SUITE</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
