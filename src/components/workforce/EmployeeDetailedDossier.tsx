import React, { useState } from 'react';
import {
  X,
  Bot,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  ExternalLink,
  Power,
  BarChart3,
  CheckCheck,
} from 'lucide-react';
import { AIEmployee } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusDot } from '../ui/StatusDot';

interface EmployeeDetailedDossierProps {
  employee: AIEmployee | null;
  onClose: () => void;
  onToggleEnabled: (id: string) => void;
  onInspectTask?: (taskId: string) => void;
}

type TabType = 'Overview' | 'Assignments' | 'Activity' | 'Capabilities';

export const EmployeeDetailedDossier: React.FC<EmployeeDetailedDossierProps> = ({
  employee,
  onClose,
  onToggleEnabled,
  onInspectTask,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  if (!employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dossier Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-mono text-xs text-zinc-400 font-semibold">
              EMPLOYEE DOSSIER //
            </span>
            <span className="font-mono text-xs font-bold text-violet-300">
              {employee.callsign}
            </span>
            <span className="text-zinc-600">•</span>
            <Badge
              variant={
                !employee.isEnabled
                  ? 'subtle'
                  : employee.status === 'Active'
                  ? 'emerald'
                  : employee.status === 'Compiling'
                  ? 'violet'
                  : employee.status === 'Reviewing'
                  ? 'amber'
                  : 'blue'
              }
              size="xs"
            >
              {!employee.isEnabled ? 'DISABLED / OFFLINE' : employee.status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Enable/Disable toggle */}
            <button
              onClick={() => onToggleEnabled(employee.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                employee.isEnabled
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
              }`}
              title={employee.isEnabled ? 'Simulate employee suspension' : 'Simulate employee reactivation'}
            >
              <Power className="w-3 h-3" />
              <span>{employee.isEnabled ? 'DISABLE EMPLOYEE' : 'ACTIVATE EMPLOYEE'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-highlight transition-colors"
              title="Close dossier (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Identity Banner */}
        <div className="p-5 border-b border-border/80 bg-surface-elevated/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-800 to-zinc-950 border border-violet-400/40 flex items-center justify-center text-xl font-bold font-mono text-white shadow-lg flex-shrink-0">
              {employee.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white font-mono tracking-tight">
                  {employee.name}
                </h2>
                <Badge variant="violet" size="xs">
                  {employee.callsign}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <StatusDot
                    status={
                      !employee.isEnabled
                        ? 'offline'
                        : employee.status === 'Active'
                        ? 'active'
                        : 'busy'
                    }
                    size="sm"
                  />
                  <span className="text-zinc-300">{employee.isEnabled ? employee.status : 'Disabled'}</span>
                </div>
              </div>

              <p className="text-xs font-semibold text-violet-300 font-sans">{employee.role}</p>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-2xl">{employee.bio}</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60 text-xs font-mono">
            <span className="text-zinc-400 text-[10px]">SUCCESS RATE</span>
            <span className="text-lg font-bold text-emerald-400">{employee.successRate}%</span>
            <span className="text-zinc-500 text-[10px]">Avg Duration: {employee.avgDuration}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-border bg-surface-muted/60">
          {(['Overview', 'Assignments', 'Activity', 'Capabilities'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 relative ${
                activeTab === tab
                  ? 'border-violet-500 text-violet-300 font-bold bg-violet-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* =========================================================================
              TAB 1: OVERVIEW
              ========================================================================= */}
          {activeTab === 'Overview' && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              {/* Responsibilities Card */}
              <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-200 font-semibold">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span>PRIMARY MANDATE & RESPONSIBILITIES</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans text-zinc-300">
                  {employee.responsibilities.map((resp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded bg-surface-muted/60 border border-border/60"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Statistics Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  ENGINEERING PERFORMANCE TELEMETRY
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-surface-muted border border-border/80">
                    <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-emerald-400" /> SUCCESS RATE
                    </span>
                    <span className="text-emerald-400 text-base font-bold block mt-1">
                      {employee.successRate}%
                    </span>
                    <span className="text-[10px] text-zinc-500">p99 lint & test clean</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-muted border border-border/80">
                    <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" /> COMPLETED TASKS
                    </span>
                    <span className="text-zinc-100 text-base font-bold block mt-1">
                      {employee.tasksCompleted}
                    </span>
                    <span className="text-[10px] text-zinc-500">Zero regressions</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-muted border border-border/80">
                    <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-violet-400" /> AVG DURATION
                    </span>
                    <span className="text-zinc-100 text-base font-bold block mt-1">
                      {employee.avgDuration}
                    </span>
                    <span className="text-[10px] text-zinc-500">Fast AST iteration</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-muted border border-border/80">
                    <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-cyan-400" /> COMPUTE COST (MTD)
                    </span>
                    <span className="text-cyan-300 text-base font-bold block mt-1">
                      ${employee.monthlyCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-500">Token budget optimal</span>
                  </div>
                </div>
              </div>

              {/* Model & Enclave Parameters */}
              <div className="p-4 rounded-lg bg-surface-muted border border-border space-y-3 text-xs font-mono">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  ENCLAVE INFERENCE CONFIGURATION
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded bg-surface border border-border/60">
                    <span className="text-[10px] text-zinc-500 block">FOUNDATIONAL MODEL</span>
                    <span className="text-zinc-200 font-semibold block mt-0.5">{employee.model}</span>
                  </div>

                  <div className="p-2.5 rounded bg-surface border border-border/60">
                    <span className="text-[10px] text-zinc-500 block">AUTONOMY LEVEL</span>
                    <span className="text-emerald-400 font-semibold block mt-0.5">{employee.autonomyLevel}</span>
                  </div>

                  <div className="p-2.5 rounded bg-surface border border-border/60">
                    <span className="text-[10px] text-zinc-500 block">CONTINUOUS UPTIME</span>
                    <span className="text-zinc-200 font-semibold block mt-0.5">{employee.uptimeHours} hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: ASSIGNMENTS
              ========================================================================= */}
          {activeTab === 'Assignments' && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              {/* Current Assignment Detailed Card */}
              <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-200 font-semibold uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-violet-400" /> ACTIVE WORKLOAD ASSIGNMENT
                  </span>
                  {employee.currentAssignment && (
                    <Badge variant="violet" size="xs">
                      {employee.currentAssignment.stage}
                    </Badge>
                  )}
                </div>

                {employee.currentAssignment ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {employee.currentAssignment.taskTitle}
                      </h3>
                      {onInspectTask && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => onInspectTask(employee.currentAssignment!.taskId)}
                          className="font-mono text-violet-300 gap-1 flex-shrink-0"
                        >
                          <span>Inspect Live Runner</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-zinc-300">
                      <div className="p-2 rounded bg-surface-muted border border-border/60">
                        <span className="text-[10px] text-zinc-500 block">CLIENT</span>
                        <span className="truncate block font-semibold">{employee.currentAssignment.client}</span>
                      </div>
                      <div className="p-2 rounded bg-surface-muted border border-border/60">
                        <span className="text-[10px] text-zinc-500 block">REPOSITORY</span>
                        <span className="text-violet-300 truncate block font-semibold">{employee.currentAssignment.repository}</span>
                      </div>
                      <div className="p-2 rounded bg-surface-muted border border-border/60">
                        <span className="text-[10px] text-zinc-500 block">BRANCH</span>
                        <span className="truncate block">{employee.currentAssignment.branch}</span>
                      </div>
                      <div className="p-2 rounded bg-surface-muted border border-border/60">
                        <span className="text-[10px] text-zinc-500 block">RUNNING DURATION</span>
                        <span className="text-emerald-400 font-semibold block">{employee.currentAssignment.duration}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">Milestone Phase Completion</span>
                        <span className="text-violet-300 font-bold">{employee.currentAssignment.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                          style={{ width: `${employee.currentAssignment.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 font-mono italic">
                    Currently in standby enclave. No active execution tasks assigned.
                  </p>
                )}
              </div>

              {/* Execution History Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  HISTORICAL EXECUTION ARCHIVE
                </span>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-elevated/40 text-zinc-400 border-b border-border text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">TASK TITLE</th>
                        <th className="py-2.5 px-3 font-semibold">CLIENT</th>
                        <th className="py-2.5 px-3 font-semibold">COMPLETED</th>
                        <th className="py-2.5 px-3 font-semibold">DURATION</th>
                        <th className="py-2.5 px-3 font-semibold">CHANGES / METRICS</th>
                        <th className="py-2.5 px-3 font-semibold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {employee.executionHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-surface-elevated/30 transition-colors">
                          <td className="py-2.5 px-3 text-zinc-100 font-medium max-w-xs truncate">
                            {rec.taskTitle}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                            {rec.client}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                            {rec.completedAt}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300 whitespace-nowrap">
                            {rec.duration}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 whitespace-nowrap">
                            {rec.linesChanged}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <Badge variant="emerald" size="xs">
                              {rec.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: ACTIVITY
              ========================================================================= */}
          {activeTab === 'Activity' && (
            <div className="space-y-3 animate-in fade-in-50 duration-150">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                IMMUTABLE AGENT AUDIT LOGS & ACTIONS
              </span>

              <div className="border border-border rounded-lg divide-y divide-border/60">
                {employee.recentActivity.map((act) => (
                  <div key={act.id} className="p-3.5 hover:bg-surface-elevated/40 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            act.type === 'commit'
                              ? 'violet'
                              : act.type === 'review'
                              ? 'amber'
                              : act.type === 'test'
                              ? 'emerald'
                              : 'blue'
                          }
                          size="xs"
                        >
                          {act.action}
                        </Badge>
                        <span className="text-zinc-200 font-semibold">{act.target}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{act.timestamp}</span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {act.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: CAPABILITIES
              ========================================================================= */}
          {activeTab === 'Capabilities' && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              {/* Specializations Tags */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  TECHNICAL SPECIALIZATION MATRIX
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {employee.specialties.map((spec) => (
                    <Badge key={spec} variant="violet" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tools Available Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  AVAILABLE TOOLS & ENCLAVE INTERFACES
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {employee.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-100 font-mono">
                          {tool.name}
                        </span>
                        <Badge variant="subtle" size="xs">
                          {tool.accessLevel}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-violet-300 font-mono block">
                        Category: {tool.category}
                      </span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions & Security Gates */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  ROLE PERMISSIONS & AUTONOMY GUARDRAILS
                </span>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-elevated/40 text-zinc-400 border-b border-border text-[11px]">
                      <tr>
                        <th className="py-2 px-3 font-semibold">SECURITY SCOPE</th>
                        <th className="py-2 px-3 font-semibold">ACCESS LEVEL</th>
                        <th className="py-2 px-3 font-semibold">POLICY ENFORCEMENT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {employee.permissions.map((perm, idx) => (
                        <tr key={idx} className="hover:bg-surface-elevated/30 transition-colors">
                          <td className="py-2.5 px-3 text-zinc-200 font-semibold">{perm.scope}</td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant={
                                perm.level === 'Admin'
                                  ? 'rose'
                                  : perm.level === 'Write'
                                  ? 'violet'
                                  : perm.level === 'Enforced Gate'
                                  ? 'amber'
                                  : 'subtle'
                              }
                              size="xs"
                            >
                              {perm.level}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300 font-sans text-xs">
                            {perm.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span>FORGE AI Governance: Strict Dual-Custody Enforced</span>
          </div>

          <Button variant="primary" size="sm" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </div>
  );
};
