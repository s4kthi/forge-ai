import React from 'react';
import { Bot, Activity, ArrowUpRight } from 'lucide-react';
import { AIEmployee } from '../../types';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusDot } from '../ui/StatusDot';
import { formatCompactTokens } from '../../lib/utils';

interface WorkforceOverviewGridProps {
  employees: AIEmployee[];
  onSelectEmployee: (employeeName: string) => void;
}

export const WorkforceOverviewGrid: React.FC<WorkforceOverviewGridProps> = ({
  employees,
  onSelectEmployee,
}) => {
  return (
    <Card>
      <CardHeader className="bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-400" />
          <CardTitle>AUTONOMOUS WORKFORCE EMPLOYEES</CardTitle>
          <Badge variant="emerald" size="xs">
            5/5 ACTIVE
          </Badge>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          Click an employee to view model dossier & autonomy controls
        </span>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        {employees.map((emp) => {
          const isBusy = emp.status === 'Active' || emp.status === 'Compiling' || emp.status === 'Reviewing' || emp.status === 'Testing';

          return (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.name)}
              className="p-3.5 flex flex-col justify-between hover:bg-surface-elevated/60 cursor-pointer transition-all duration-150 group"
            >
              <div className="space-y-3">
                {/* Employee Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/40 flex items-center justify-center font-mono font-bold text-xs text-violet-300 shadow-sm group-hover:border-violet-400 transition-colors">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 font-mono group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        <StatusDot
                          status={emp.status === 'Active' ? 'active' : isBusy ? 'busy' : 'idle'}
                          size="sm"
                        />
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-sans truncate max-w-[120px]">
                        {emp.role}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-300 transition-colors" />
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">STATUS:</span>
                  <Badge
                    variant={
                      emp.status === 'Active'
                        ? 'emerald'
                        : emp.status === 'Compiling'
                        ? 'violet'
                        : emp.status === 'Reviewing'
                        ? 'amber'
                        : emp.status === 'Awaiting Gate'
                        ? 'rose'
                        : 'blue'
                    }
                    size="xs"
                  >
                    {emp.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Current Assignment */}
                <div className="p-2 rounded bg-surface-muted border border-border/80 space-y-1">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-violet-400" /> ASSIGNED TASK
                  </div>
                  {emp.currentAssignment ? (
                    <p className="text-[11px] font-medium text-zinc-200 line-clamp-2 leading-snug">
                      {emp.currentAssignment.taskTitle}
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 italic">Standby awaiting dispatch</p>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span className="text-zinc-300 truncate max-w-[100px]">{emp.model.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="text-emerald-400 font-semibold">{emp.efficiencyScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Tokens:</span>
                    <span className="text-zinc-300">{formatCompactTokens(emp.tokensConsumed24h)}</span>
                  </div>
                </div>
              </div>

              {/* Autonomy Footer */}
              <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                <span className="truncate">{emp.autonomyLevel}</span>
                <span className="text-emerald-400">${emp.monthlyCost.toFixed(1)}/mo</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
