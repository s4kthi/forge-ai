import React from 'react';
import {
  X,
  GitBranch,
  Calendar,
  CheckCircle2,
  Activity,
  Code2,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { ProjectEntity, ProjectHealth } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProjectDetailsModalProps {
  project: ProjectEntity | null;
  onClose: () => void;
  onNavigateToTasks?: (projectName: string) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
  onNavigateToTasks,
}) => {
  if (!project) return null;

  const totalTasks = project.openTasksCount + project.completedTasksCount;
  const progressPercent = totalTasks > 0 ? Math.round((project.completedTasksCount / totalTasks) * 100) : 0;

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case 'Optimal':
        return <Badge variant="emerald" size="xs">OPTIMAL HEALTH</Badge>;
      case 'Healthy':
        return <Badge variant="blue" size="xs">HEALTHY</Badge>;
      case 'Needs Attention':
        return <Badge variant="amber" size="xs">NEEDS ATTENTION</Badge>;
      case 'At Risk':
        return <Badge variant="rose" size="xs">AT RISK</Badge>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="text-zinc-400 font-semibold">{project.key}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-200">{project.clientName}</span>
            <span className="text-zinc-600">•</span>
            {getHealthBadge(project.health)}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-highlight transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Title & Description */}
          <div>
            <h2 className="text-lg font-bold text-white font-mono tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-sans">
              {project.description}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <Activity className="w-3 h-3 text-violet-400" /> OPEN TASKS
              </span>
              <span className="text-violet-300 text-sm font-bold block mt-0.5">
                {project.openTasksCount} active
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COMPLETED TASKS
              </span>
              <span className="text-emerald-400 text-sm font-bold block mt-0.5">
                {project.completedTasksCount} shipped
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" /> TARGET RELEASE
              </span>
              <span className="text-zinc-200 font-semibold block mt-0.5">
                {project.targetRelease}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <Bot className="w-3 h-3 text-amber-400" /> LEAD ENGINEER
              </span>
              <span className="text-zinc-200 font-semibold block mt-0.5">
                {project.leadEmployee}
              </span>
            </div>
          </div>

          {/* Progress Completion Bar */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-border space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-semibold">MILESTONE SHIP CADENCE</span>
              <span className="text-violet-300 font-bold">{progressPercent}% complete</span>
            </div>

            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
              <span>{project.completedTasksCount} completed</span>
              <span>Last active: {project.lastActivity}</span>
              <span>{project.openTasksCount} remaining</span>
            </div>
          </div>

          {/* Repository & Active Branch */}
          <div className="p-3.5 rounded-lg bg-surface-muted border border-border space-y-2 text-xs font-mono">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              GIT REPOSITORY & AUTOMATION HOOKS
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-surface border border-border/60">
              <div className="flex items-center gap-2 overflow-hidden">
                <GitBranch className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="font-semibold text-zinc-100 truncate">{project.repository.name}</span>
                <Badge variant="subtle" size="xs">
                  {project.repository.defaultBranch}
                </Badge>
              </div>

              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <span>Synced: {project.repository.lastSynced}</span>
              </span>
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Active Agent Working Branch:</span>
              <span className="text-violet-300 font-semibold">{project.activeBranch}</span>
            </div>
          </div>

          {/* Technology Stack Matrix */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" /> TECHNOLOGY STACK & PACKAGES
            </span>

            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="violet" size="sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/60 flex items-center justify-between text-xs font-mono">
          {onNavigateToTasks ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateToTasks(project.name)}
              className="gap-1.5 text-violet-300"
            >
              <span>VIEW {project.openTasksCount} OPEN TASKS IN TASK BOARD</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <span className="text-zinc-500">Autonomous enclave ready</span>
          )}

          <Button variant="primary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
