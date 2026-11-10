import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Plus,
  Building2,
  Radio,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  commandCenterMetrics,
  mockEmployees,
  mockActiveExecutions,
  mockPipelineStages,
  mockLiveActivityEvents,
} from '../data/mockData';
import { ActiveExecutionItem, AIEmployee, PipelineStage } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { WorkforcePipeline } from '../components/command-center/WorkforcePipeline';
import { ActiveExecutionsTable } from '../components/command-center/ActiveExecutionsTable';
import { WorkforceOverviewGrid } from '../components/command-center/WorkforceOverviewGrid';
import { RecentActivityFeed } from '../components/command-center/RecentActivityFeed';
import { TaskExecutionModal } from '../components/command-center/TaskExecutionModal';
import { EmployeeProfileModal } from '../components/command-center/EmployeeProfileModal';
import { AddTaskModal } from '../components/command-center/AddTaskModal';

export const CommandCenterPage: React.FC = () => {
  // State for active tasks (can add new ones via modal)
  const [tasks, setTasks] = useState<ActiveExecutionItem[]>(mockActiveExecutions);
  const [employees] = useState<AIEmployee[]>(mockEmployees);
  const [activityEvents, setActivityEvents] = useState(mockLiveActivityEvents);

  // Filter state
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<ActiveExecutionItem | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Calculate dynamic stage counts based on tasks
  const dynamicStages = mockPipelineStages.map((stage) => {
    const stageTasks = tasks.filter((t) => t.stage === stage.id);
    return {
      ...stage,
      count: stageTasks.length,
    };
  });

  const handleAddTask = (newTask: ActiveExecutionItem) => {
    setTasks((prev) => [newTask, ...prev]);

    // Prepend a live activity event
    setActivityEvents((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'agent_started',
        title: 'Agent Started Execution',
        description: `${newTask.employee.name} initiated ${newTask.taskTitle} on ${newTask.repository}.`,
        timestamp: 'Just now',
        employeeName: newTask.employee.name,
        clientName: newTask.client,
        repoName: newTask.repository,
        severity: 'info',
        taskId: newTask.id,
      },
      ...prev,
    ]);
  };

  const handleOpenEmployeeProfileByName = (employeeName: string) => {
    const found = employees.find(
      (e) => e.name.toLowerCase() === employeeName.toLowerCase()
    );
    if (found) {
      setSelectedEmployee(found);
    }
  };

  const handleSelectTaskIdFromModal = (taskId: string) => {
    const foundTask = tasks.find((t) => t.id === taskId);
    if (foundTask) {
      setSelectedTask(foundTask);
      setSelectedEmployee(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1680px] mx-auto select-none">
      {/* =========================================================================
          HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Engineering Operations
            </h1>
            <Badge variant="violet" size="sm" className="gap-1 font-mono">
              <Sparkles className="w-2.5 h-2.5 text-violet-400" />
              FORGE ENGINE v0.9.4
            </Badge>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-muted border border-border text-xs font-mono text-zinc-300">
              <Building2 className="w-3 h-3 text-violet-400" />
              <span className="text-zinc-400">Workspace:</span>
              <span className="font-semibold text-zinc-100">Acme Digital Agency</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Monitor your autonomous engineering workforce. Real-time telemetry, execution pipelines, and delivery verification.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-muted border border-border text-xs font-mono text-zinc-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline text-zinc-400">TELEMETRY:</span>
            <span className="text-emerald-400 font-semibold">LIVE CONNECTED</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="gap-1.5 font-mono shadow-glow-violet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>DISPATCH NEW TASK</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          TOP METRICS (Exact values specified by user)
          ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-3.5">
        {/* Metric 1: Active Executions: 08 */}
        <Card className="p-3.5 bg-surface/90 hover:border-zinc-700 transition-colors border-l-2 border-l-violet-500">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>ACTIVE EXECUTIONS</span>
            <Terminal className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {commandCenterMetrics.activeExecutions}
            </span>
            <span className="text-xs font-mono text-violet-400">runners</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Across 5 employees</span>
            <span className="text-emerald-400">Optimal</span>
          </div>
        </Card>

        {/* Metric 2: Completed Tasks: 142 */}
        <Card className="p-3.5 bg-surface/90 hover:border-zinc-700 transition-colors border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>COMPLETED TASKS</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {commandCenterMetrics.completedTasks}
            </span>
            <span className="text-xs font-mono text-blue-400">+18 this cycle</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Zero regressions</span>
            <span className="text-zinc-300">100% verified</span>
          </div>
        </Card>

        {/* Metric 3: Awaiting Approval: 06 */}
        <Card className="p-3.5 bg-surface/90 hover:border-zinc-700 transition-colors border-l-2 border-l-amber-500">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>AWAITING APPROVAL</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {commandCenterMetrics.awaitingApproval}
            </span>
            <span className="text-xs font-mono text-amber-400">gates</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Human sign-off</span>
            <span className="text-rose-400 font-semibold">2 Critical</span>
          </div>
        </Card>

        {/* Metric 4: Workforce Success Rate: 94.6% */}
        <Card className="p-3.5 bg-surface/90 hover:border-zinc-700 transition-colors border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>WORKFORCE SUCCESS RATE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {commandCenterMetrics.workforceSuccessRate}%
            </span>
            <span className="text-xs font-mono text-emerald-500">p99</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Lint & AST Checks</span>
            <span className="text-zinc-300">99.8% pass</span>
          </div>
        </Card>

        {/* Metric 5: Monthly Execution Cost: $428.60 */}
        <Card className="p-3.5 bg-surface/90 hover:border-zinc-700 transition-colors border-l-2 border-l-cyan-500 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>MONTHLY EXECUTION COST</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {commandCenterMetrics.monthlyExecutionCost}
            </span>
            <span className="text-xs font-mono text-zinc-400">MTD</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Est. Savings:</span>
            <span className="text-emerald-400 font-semibold">$18,450 vs manual</span>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          MAIN SECTION: WORKFORCE PIPELINE (Interactive horizontal workflow)
          ========================================================================= */}
      <WorkforcePipeline
        stages={dynamicStages}
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
      />

      {/* =========================================================================
          ACTIVE EXECUTIONS TABLE (Columns specified by user)
          ========================================================================= */}
      <ActiveExecutionsTable
        tasks={tasks}
        selectedStageFilter={selectedStage}
        onSelectTask={setSelectedTask}
        onSelectEmployee={handleOpenEmployeeProfileByName}
        onClearStageFilter={() => setSelectedStage(null)}
      />

      {/* =========================================================================
          BOTTOM DUAL SECTION: WORKFORCE OVERVIEW (5 EMPLOYEES) + RECENT ACTIVITY
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Workforce Overview (Alex, Marcus, Devon, Tessa, Elena) */}
        <div className="lg:col-span-2 space-y-6">
          <WorkforceOverviewGrid
            employees={employees}
            onSelectEmployee={handleOpenEmployeeProfileByName}
          />
        </div>

        {/* Right Column (1 Col): Live-style Recent Activity Feed */}
        <div className="space-y-6">
          <RecentActivityFeed
            events={activityEvents}
            onSelectTaskId={handleSelectTaskIdFromModal}
          />
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE MODALS
          ========================================================================= */}
      {/* 1. Task Execution Details Modal */}
      <TaskExecutionModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onOpenEmployeeProfile={handleOpenEmployeeProfileByName}
      />

      {/* 2. Employee Profile Modal */}
      <EmployeeProfileModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onSelectTask={handleSelectTaskIdFromModal}
      />

      {/* 3. Add New Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
};
