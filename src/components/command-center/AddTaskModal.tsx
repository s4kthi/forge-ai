import React, { useState } from 'react';
import { X, Plus, Bot, GitBranch, Building2, Sparkles } from 'lucide-react';
import { mockClients, mockRepositories, mockEmployees } from '../../data/mockData';
import { ActiveExecutionItem, PipelineStage, Priority } from '../../types';
import { Button } from '../ui/Button';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: ActiveExecutionItem) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState(mockClients[0].name);
  const [selectedRepo, setSelectedRepo] = useState(mockRepositories[0].name);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('Alex');
  const [priority, setPriority] = useState<Priority>('high');
  const [stage, setStage] = useState<PipelineStage>('INGESTED');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedEmployee = mockEmployees.find((emp) => emp.name === selectedEmployeeName) || mockEmployees[0];

    const newTask: ActiveExecutionItem = {
      id: `exec-${Math.floor(10 + Math.random() * 90)}`,
      taskTitle: title,
      client: selectedClient,
      clientCode: selectedClient.split(' ')[0].slice(0, 4).toUpperCase(),
      repository: selectedRepo,
      repositoryBranch: `forge/${assignedEmployee.name.toLowerCase()}/${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24)}`,
      employee: {
        id: assignedEmployee.id,
        name: assignedEmployee.name,
        role: assignedEmployee.role,
      },
      stage: stage,
      duration: '00m 10s',
      durationSeconds: 10,
      cost: '$0.12',
      status: 'Running',
      progress: stage === 'INGESTED' ? 15 : stage === 'PLANNING' ? 30 : 50,
      priority: priority,
      diffStats: {
        filesChanged: 1,
        additions: 12,
        deletions: 0,
      },
      description: description || 'Autonomous implementation initiated by operator via Command Center.',
      recentLogs: [
        { timestamp: 'Just now', level: 'info', message: `Task dispatched to ${assignedEmployee.name} (${assignedEmployee.role})` },
        { timestamp: 'Just now', level: 'command', message: `git checkout -b forge/${assignedEmployee.name.toLowerCase()}/auto-task` },
      ],
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-100">
            <Plus className="w-4 h-4 text-violet-400" />
            <span>DISPATCH AUTONOMOUS ENGINEERING TASK</span>
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
            <label className="text-zinc-300 font-semibold block">TASK TITLE / OBJECTIVE *</label>
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
            <label className="text-zinc-400 block">ENGINEERING SPECIFICATION & CONSTRAINTS</label>
            <textarea
              rows={3}
              placeholder="Detail required invariants, packages, tests, or performance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Client & Repo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-zinc-400" /> TARGET CLIENT
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
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
                <GitBranch className="w-3 h-3 text-zinc-400" /> REPOSITORY
              </label>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {mockRepositories.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.primaryLanguage})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <Bot className="w-3 h-3 text-violet-400" /> AI EMPLOYEE
              </label>
              <select
                value={selectedEmployeeName}
                onChange={(e) => setSelectedEmployeeName(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">INITIAL STAGE</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PipelineStage)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="INGESTED">INGESTED</option>
                <option value="PLANNING">PLANNING</option>
                <option value="DEVELOPMENT">DEVELOPMENT</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">PRIORITY TIER</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>
          </div>

          {/* Enclave Notice */}
          <div className="p-2.5 rounded bg-violet-950/20 border border-violet-500/20 text-zinc-400 flex items-start gap-2 text-[11px] font-sans">
            <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <span>
              Autonomous delivery agents operate in ephemeral sandboxes with AST static security checks and mandatory human approval gates for critical diffs.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>DISPATCH TO WORKFORCE</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
