import React, { useState } from 'react';
import { X, Plus, Building2, Layers, GitBranch, Bot, CheckSquare } from 'lucide-react';
import { TaskItem, IssueTaskStatus } from '../../types';
import { mockProjectEntities, mockClients, mockEmployees } from '../../data/mockData';
import { Button } from '../ui/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskItem) => void;
  defaultClient?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  defaultClient,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientName, setSelectedClientName] = useState(defaultClient || mockClients[0].name);
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjectEntities[0].id);
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [status, setStatus] = useState<IssueTaskStatus>('Backlog');
  const [assignedEmployee, setAssignedEmployee] = useState<'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'Unassigned'>('Devon');
  const [acceptanceCriteriaInput, setAcceptanceCriteriaInput] = useState(
    '- Verify sub-100ms response time under load\n- 100% test pass on CI pipeline\n- No regressions in backwards compatibility'
  );

  if (!isOpen) return null;

  // Filter projects by selected client
  const clientProjects = mockProjectEntities.filter(
    (p) => p.clientName.toLowerCase() === selectedClientName.toLowerCase()
  );
  const currentProject = clientProjects.find((p) => p.id === selectedProjectId) || clientProjects[0] || mockProjectEntities[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const criteriaList = acceptanceCriteriaInput
      .split('\n')
      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
      .filter((line) => line.length > 0);

    const clientObj = mockClients.find((c) => c.name === selectedClientName) || mockClients[0];
    const employeeObj = mockEmployees.find((e) => e.name === assignedEmployee);

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      key: `${clientObj.code}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description,
      client: selectedClientName,
      clientId: clientObj.id,
      projectName: currentProject.name,
      projectId: currentProject.id,
      repository: currentProject.repository.name,
      repositoryBranch: `forge/${assignedEmployee.toLowerCase()}/${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
      priority,
      status,
      acceptanceCriteria: criteriaList.length > 0 ? criteriaList : ['All unit tests pass', 'Static AST checks green'],
      assignedEmployee,
      assignedRole: employeeObj ? employeeObj.role : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tokensUsed: 12_000,
      cost: '$0.15',
    };

    onCreateTask(newTask);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-100">
            <Plus className="w-4 h-4 text-violet-400" />
            <span>CREATE AUTONOMOUS ENGINEERING TASK</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-highlight transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold block">TASK TITLE *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement resilient circuit breaker for Redis cache fallback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-zinc-400 block">DESCRIPTION & ENGINEERING CONTEXT</label>
            <textarea
              rows={3}
              placeholder="Detail required invariants, edge cases, error handling, and performance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Client & Project Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" /> CLIENT
              </label>
              <select
                value={selectedClientName}
                onChange={(e) => setSelectedClientName(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {mockClients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-400" /> PROJECT
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Repository Display */}
          <div className="p-2.5 rounded bg-surface-muted border border-border/80 text-[11px] flex items-center justify-between text-zinc-300">
            <span className="text-zinc-500 flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-violet-400" /> REPOSITORY:
            </span>
            <span className="text-violet-300 font-semibold">{currentProject.repository.name}</span>
          </div>

          {/* Priority, Initial Status & Assigned AI Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block">PRIORITY</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'Critical' | 'High' | 'Medium' | 'Low')}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">INITIAL STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueTaskStatus)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Backlog">Backlog</option>
                <option value="Ready">Ready</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Review">Review</option>
                <option value="Awaiting Approval">Awaiting Approval</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-violet-400" /> ASSIGNED EMPLOYEE
              </label>
              <select
                value={assignedEmployee}
                onChange={(e) =>
                  setAssignedEmployee(e.target.value as 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'Unassigned')
                }
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Alex">Alex (Product Mgr)</option>
                <option value="Marcus">Marcus (Architect)</option>
                <option value="Devon">Devon (Full-Stack)</option>
                <option value="Tessa">Tessa (QA Eng)</option>
                <option value="Elena">Elena (Code Reviewer)</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="space-y-1">
            <label className="text-zinc-400 block flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> ACCEPTANCE CRITERIA (ONE PER LINE)
            </label>
            <textarea
              rows={3}
              value={acceptanceCriteriaInput}
              onChange={(e) => setAcceptanceCriteriaInput(e.target.value)}
              placeholder="- Criteria 1&#10;- Criteria 2"
              className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>DISPATCH TASK TO WORKFORCE</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
