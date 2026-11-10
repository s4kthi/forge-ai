import React, { useState, useMemo } from 'react';
import {
  Search,
  Bot,
  Activity,
  Power,
  RotateCw,
  ArrowUpRight,
} from 'lucide-react';
import { mockEmployees, mockActiveExecutions } from '../data/mockData';
import { AIEmployee, ActiveExecutionItem } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusDot } from '../components/ui/StatusDot';
import { EmployeeDetailedDossier } from '../components/workforce/EmployeeDetailedDossier';
import { TaskExecutionModal } from '../components/command-center/TaskExecutionModal';

export const WorkforcePage: React.FC = () => {
  const [employees, setEmployees] = useState<AIEmployee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected employee for detailed dossier modal
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);

  // Selected task for task execution modal
  const [selectedTask, setSelectedTask] = useState<ActiveExecutionItem | null>(null);

  // Toggle employee enabled status
  const handleToggleEnabled = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const nextEnabled = !emp.isEnabled;
          return {
            ...emp,
            isEnabled: nextEnabled,
            status: nextEnabled ? 'Active' : 'Disabled',
          };
        }
        return emp;
      })
    );

    // If currently viewing this employee in the dossier, update it as well
    setSelectedEmployee((prev) => {
      if (prev && prev.id === id) {
        const nextEnabled = !prev.isEnabled;
        return {
          ...prev,
          isEnabled: nextEnabled,
          status: nextEnabled ? 'Active' : 'Disabled',
        };
      }
      return prev;
    });
  };

  const handleInspectTask = (taskId: string) => {
    const found = mockActiveExecutions.find((t) => t.id === taskId);
    if (found) {
      setSelectedTask(found);
    }
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Role filter
      if (roleFilter !== 'ALL' && emp.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Disabled' && emp.isEnabled) return false;
        if (statusFilter === 'Active' && (!emp.isEnabled || emp.status !== 'Active')) return false;
        if (statusFilter !== 'Disabled' && statusFilter !== 'Active' && emp.status !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = emp.name.toLowerCase().includes(q);
        const matchRole = emp.role.toLowerCase().includes(q);
        const matchCallsign = emp.callsign.toLowerCase().includes(q);
        const matchBio = emp.bio.toLowerCase().includes(q);
        const matchSpec = emp.specialties.some((s) => s.toLowerCase().includes(q));
        const matchTask = emp.currentAssignment?.taskTitle.toLowerCase().includes(q);
        return matchName || matchRole || matchCallsign || matchBio || matchSpec || !!matchTask;
      }

      return true;
    });
  }, [employees, roleFilter, statusFilter, searchQuery]);

  // Aggregate fleet stats
  const activeCount = employees.filter((e) => e.isEnabled && e.status !== 'Idle').length;
  const avgFleetSuccess = (
    employees.reduce((acc, e) => acc + e.successRate, 0) / employees.length
  ).toFixed(1);
  const totalTasksFleet = employees.reduce((acc, e) => acc + e.tasksCompleted, 0);
  const totalCostFleet = employees.reduce((acc, e) => acc + e.monthlyCost, 0).toFixed(2);

  const roles = [
    'ALL',
    'AI Product Manager',
    'AI Software Architect',
    'AI Full-Stack Developer',
    'AI QA Engineer',
    'AI Code Reviewer',
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1680px] mx-auto select-none">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900">
              AI Workforce Management
            </h1>
            <Badge variant="violet" size="sm">
              5 DEDICATED EMPLOYEES
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Specialized autonomous engineering workforce. Governed, sandboxed, and optimized for high-velocity software delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-charcoal-700">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <StatusDot status="active" size="sm" />
            <span className="text-charcoal-500">FLEET HEALTH:</span>
            <span className="text-emerald-700 font-bold">{activeCount}/5 ONLINE</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="gap-1 font-mono"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>RESET FILTERS</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          WORKFORCE SUMMARY STATS BAR
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-surface/90 border-l-2 border-l-violet-500">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            ACTIVE FLEET CAPACITY
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-zinc-100">{activeCount} / 5</span>
            <span className="text-xs font-mono text-emerald-400">100% available</span>
          </div>
        </Card>

        <Card className="p-3 bg-surface/90 border-l-2 border-l-emerald-500">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            AVERAGE SUCCESS RATE
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">{avgFleetSuccess}%</span>
            <span className="text-xs font-mono text-zinc-400">p99 lint/test</span>
          </div>
        </Card>

        <Card className="p-3 bg-surface/90 border-l-2 border-l-blue-500">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            TOTAL DELIVERED TASKS
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-zinc-100">{totalTasksFleet}</span>
            <span className="text-xs font-mono text-blue-400">clean PRs</span>
          </div>
        </Card>

        <Card className="p-3 bg-surface/90 border-l-2 border-l-cyan-500">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            WORKFORCE COMPUTE (MTD)
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-cyan-300">${totalCostFleet}</span>
            <span className="text-xs font-mono text-zinc-400">USD</span>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          SEARCH & FILTER CONTROLS
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-border">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, task, or specialization (e.g. 'Marcus', 'AST', 'Rust')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-muted border border-border rounded pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px]">ROLE:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface-muted border border-border rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">ALL ROLES</option>
              <option value="AI Product Manager">AI Product Manager</option>
              <option value="AI Software Architect">AI Software Architect</option>
              <option value="AI Full-Stack Developer">AI Full-Stack Developer</option>
              <option value="AI QA Engineer">AI QA Engineer</option>
              <option value="AI Code Reviewer">AI Code Reviewer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px]">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-muted border border-border rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="Active">ACTIVE</option>
              <option value="Compiling">COMPILING</option>
              <option value="Testing">TESTING</option>
              <option value="Reviewing">REVIEWING</option>
              <option value="Disabled">DISABLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap border ${
              roleFilter === r
                ? 'bg-violet-600/20 text-violet-200 border-violet-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-elevated border-transparent'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* =========================================================================
          EMPLOYEE DIRECTORY GRID
          ========================================================================= */}
      {filteredEmployees.length === 0 ? (
        <Card className="p-12 text-center text-xs font-mono text-zinc-500 space-y-2">
          <Bot className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">No AI employees match your search criteria &quot;{searchQuery}&quot;</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            return (
              <Card
                key={emp.id}
                className={`hover:border-zinc-700 transition-all flex flex-col justify-between overflow-hidden group ${
                  !emp.isEnabled ? 'opacity-60 bg-surface/40' : 'bg-surface'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <CardHeader className="bg-surface-elevated/40 pb-3">
                    <div className="flex items-center gap-3">
                      {/* Professional Monogram Avatar */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-900 border border-violet-400/40 flex items-center justify-center font-mono font-bold text-sm text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="leading-tight overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-100 font-mono group-hover:text-violet-300 transition-colors">
                            {emp.name}
                          </h3>
                          <Badge variant="subtle" size="xs">
                            {emp.callsign}
                          </Badge>
                        </div>
                        <p className="text-xs text-violet-300 font-medium truncate mt-0.5">
                          {emp.role}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusDot
                        status={
                          !emp.isEnabled
                            ? 'offline'
                            : emp.status === 'Active'
                            ? 'active'
                            : 'busy'
                        }
                        size="sm"
                      />
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          !emp.isEnabled
                            ? 'text-zinc-500'
                            : emp.status === 'Active'
                            ? 'text-emerald-400'
                            : 'text-violet-300'
                        }`}
                      >
                        {emp.isEnabled ? emp.status.toUpperCase() : 'OFFLINE'}
                      </span>
                    </div>
                  </CardHeader>

                  {/* Card Content Body */}
                  <CardContent className="space-y-4 pt-4">
                    {/* Current Task Assignment */}
                    <div className="p-2.5 rounded bg-surface-muted border border-border/80 space-y-1">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-violet-400" /> CURRENT TASK
                        </span>
                        {emp.currentAssignment && (
                          <Badge variant="violet" size="xs">
                            {emp.currentAssignment.stage}
                          </Badge>
                        )}
                      </div>

                      {emp.currentAssignment ? (
                        <div>
                          <p className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-snug">
                            {emp.currentAssignment.taskTitle}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1.5">
                            <span>Client: {emp.currentAssignment.client.split(' ')[0]}</span>
                            <span className="text-emerald-400 font-bold">{emp.currentAssignment.duration}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic font-mono py-1">
                          Standby awaiting work ticket dispatch
                        </p>
                      )}
                    </div>

                    {/* Telemetry Metrics Row: Completed Tasks, Success Rate, Avg Duration */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded bg-black/40 border border-border/60">
                        <span className="text-[9px] text-zinc-500 block">COMPLETED</span>
                        <span className="text-zinc-200 font-bold text-xs block mt-0.5">
                          {emp.tasksCompleted}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-black/40 border border-border/60">
                        <span className="text-[9px] text-zinc-500 block">SUCCESS RATE</span>
                        <span className="text-emerald-400 font-bold text-xs block mt-0.5">
                          {emp.successRate}%
                        </span>
                      </div>

                      <div className="p-2 rounded bg-black/40 border border-border/60">
                        <span className="text-[9px] text-zinc-500 block">AVG DURATION</span>
                        <span className="text-zinc-200 font-bold text-xs block mt-0.5 truncate">
                          {emp.avgDuration}
                        </span>
                      </div>
                    </div>

                    {/* Specializations Tags */}
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block mb-1.5 uppercase">
                        SPECIALIZATIONS
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {emp.specialties.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="subtle" size="xs">
                            {spec}
                          </Badge>
                        ))}
                        {emp.specialties.length > 3 && (
                          <span className="text-[10px] text-zinc-500 font-mono self-center">
                            +{emp.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-2.5 border-t border-border bg-surface-muted/40 flex items-center justify-between text-xs font-mono">
                  {/* Enable / Disable simulated toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleEnabled(emp.id);
                    }}
                    className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                      emp.isEnabled
                        ? 'text-zinc-400 hover:text-rose-300 hover:bg-rose-950/20'
                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 font-semibold'
                    }`}
                    title={emp.isEnabled ? 'Disable employee' : 'Enable employee'}
                  >
                    <Power className="w-3 h-3" />
                    <span>{emp.isEnabled ? 'Active' : 'Offline'}</span>
                  </button>

                  {/* Open Profile Button */}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedEmployee(emp)}
                    className="gap-1 text-violet-400 hover:text-violet-300 hover:bg-violet-950/30"
                  >
                    <span>Inspect Profile</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE DETAILED EMPLOYEE PROFILE DOSSIER MODAL
          ========================================================================= */}
      <EmployeeDetailedDossier
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onToggleEnabled={handleToggleEnabled}
        onInspectTask={handleInspectTask}
      />

      {/* Task Execution Modal */}
      <TaskExecutionModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onOpenEmployeeProfile={(name) => {
          const emp = employees.find((e) => e.name.toLowerCase() === name.toLowerCase());
          if (emp) {
            setSelectedEmployee(emp);
            setSelectedTask(null);
          }
        }}
      />
    </div>
  );
};
