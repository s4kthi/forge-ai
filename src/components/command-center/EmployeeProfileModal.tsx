import React from 'react';
import {
  X,
  Cpu,
  ShieldCheck,
  Clock,
  Activity,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { AIEmployee } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusDot } from '../ui/StatusDot';
import { formatCompactTokens } from '../../lib/utils';

interface EmployeeProfileModalProps {
  employee: AIEmployee | null;
  onClose: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  onClose,
  onSelectTask,
}) => {
  if (!employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">AUTONOMOUS WORKFORCE DOSSIER //</span>
            <span className="text-violet-300 font-bold">{employee.callsign}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-highlight transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Hero Card */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-700 to-zinc-900 border border-violet-400/40 flex items-center justify-center text-xl font-bold font-mono text-white shadow-lg flex-shrink-0">
              {employee.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">
                  {employee.name}
                </h2>
                <Badge variant="violet" size="xs">
                  {employee.callsign}
                </Badge>
                <div className="flex items-center gap-1.5 ml-auto text-xs font-mono">
                  <StatusDot
                    status={
                      employee.status === 'Active'
                        ? 'active'
                        : employee.status === 'Compiling' || employee.status === 'Reviewing'
                        ? 'busy'
                        : 'idle'
                    }
                    size="sm"
                  />
                  <span className="text-zinc-200 font-semibold uppercase">{employee.status}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 font-medium mt-0.5">{employee.role}</p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{employee.bio}</p>
            </div>
          </div>

          {/* Key Engineering Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block">EFFICIENCY SCORE</span>
              <span className="text-emerald-400 text-sm font-bold block mt-0.5">
                {employee.efficiencyScore}%
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block">TASKS COMPLETED</span>
              <span className="text-zinc-100 text-sm font-bold block mt-0.5">
                {employee.tasksCompleted}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block">24H TOKEN VOLUME</span>
              <span className="text-zinc-100 text-xs font-bold block mt-1">
                {formatCompactTokens(employee.tokensConsumed24h)}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block">RUNNER COST (MTD)</span>
              <span className="text-emerald-400 text-sm font-bold block mt-0.5">
                ${employee.monthlyCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Current Assignment */}
          {employee.currentAssignment && (
            <div className="p-3.5 rounded-lg bg-surface-elevated border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-violet-400" /> ACTIVE WORKLOAD ASSIGNMENT
                </span>
                <Badge variant="violet" size="xs">
                  {employee.currentAssignment.stage}
                </Badge>
              </div>

              <h4 className="text-xs font-semibold text-zinc-100">
                {employee.currentAssignment.taskTitle}
              </h4>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1 border-t border-border/60">
                <span>Client: {employee.currentAssignment.client}</span>
                {onSelectTask && (
                  <button
                    onClick={() => onSelectTask(employee.currentAssignment!.taskId)}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <span>Inspect Task</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Model & Architecture Config */}
          <div className="p-3.5 rounded-lg bg-surface-muted border border-border space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                FOUNDATIONAL MODEL:
              </span>
              <span className="text-zinc-200 font-semibold">{employee.model}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AUTONOMY GOVERNANCE TIER:
              </span>
              <Badge variant="emerald" size="xs">
                {employee.autonomyLevel}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                UPTIME WITHOUT FAILURE:
              </span>
              <span className="text-zinc-200">{employee.uptimeHours} continuous hours</span>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
              DOMAIN CAPABILITY MATRIX
            </span>
            <div className="flex flex-wrap gap-1.5">
              {employee.specialties.map((spec) => (
                <Badge key={spec} variant="subtle" size="xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/60 flex items-center justify-between text-xs font-mono">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>ADJUST AUTONOMY TIER</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </div>
  );
};
