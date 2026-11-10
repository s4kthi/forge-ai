import React, { useState } from 'react';
import { X, Plus, GitBranch, Building2, Code2, ShieldCheck } from 'lucide-react';
import { ProjectEntity, ProjectHealth } from '../../types';
import { mockClients, mockEmployees } from '../../data/mockData';
import { Button } from '../ui/Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: ProjectEntity) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [selectedClientName, setSelectedClientName] = useState(mockClients[0].name);
  const [repoName, setRepoName] = useState('');
  const [repoBranch, setRepoBranch] = useState('main');
  const [techStackInput, setTechStackInput] = useState('Next.js 15, TypeScript, Tailwind CSS');
  const [health, setHealth] = useState<ProjectHealth>('Optimal');
  const [leadEmployee, setLeadEmployee] = useState('Devon');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedClient = mockClients.find((c) => c.name === selectedClientName) || mockClients[0];
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const generatedKey = key.trim()
      ? key.trim().toUpperCase()
      : name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();

    const newProject: ProjectEntity = {
      id: `proj-${Date.now()}`,
      name,
      key: generatedKey,
      clientName: selectedClient.name,
      clientId: selectedClient.id,
      description: description || 'Autonomous engineering project enclave.',
      repository: {
        name: repoName || `${selectedClient.code.toLowerCase()}/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        url: `https://github.com/${repoName || 'acme-org/' + name.toLowerCase()}`,
        defaultBranch: repoBranch,
        provider: 'github',
        lastSynced: 'Just now',
      },
      techStack: techStack.length > 0 ? techStack : ['TypeScript', 'React'],
      health,
      openTasksCount: 0,
      completedTasksCount: 0,
      lastActivity: 'Just now',
      leadEmployee,
      activeBranch: `forge/${leadEmployee.toLowerCase()}/init`,
      targetRelease: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150 select-none"
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
            <span>CREATE MULTI-CLIENT PROJECT ENCLAVE</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-zinc-300 font-semibold block">PROJECT NAME *</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Consensus Mesh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">PROJECT KEY</label>
              <input
                type="text"
                placeholder="e.g. MESH"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 uppercase"
              />
            </div>
          </div>

          {/* Client Selection */}
          <div className="space-y-1">
            <label className="text-zinc-400 block flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" /> AGENCY CLIENT
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

          {/* Repository & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" /> REPOSITORY PATH
              </label>
              <input
                type="text"
                placeholder="org-name/repo-name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">DEFAULT BRANCH</label>
              <input
                type="text"
                value={repoBranch}
                onChange={(e) => setRepoBranch(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Tech Stack Input */}
          <div className="space-y-1">
            <label className="text-zinc-400 block flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" /> TECH STACK (COMMA-SEPARATED)
            </label>
            <input
              type="text"
              placeholder="Rust, Tokio, PostgreSQL, gRPC"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Health & Lead Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> INITIAL PROJECT HEALTH
              </label>
              <select
                value={health}
                onChange={(e) => setHealth(e.target.value as ProjectHealth)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Optimal">Optimal (No blockers)</option>
                <option value="Healthy">Healthy (Normal cadence)</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">LEAD AI EMPLOYEE</label>
              <select
                value={leadEmployee}
                onChange={(e) => setLeadEmployee(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role.split(' ')[1] || emp.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-zinc-400 block">PROJECT DESCRIPTION</label>
            <textarea
              rows={2}
              placeholder="Engineering scope, architectural objectives, and deliverable milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>INITIALIZE PROJECT</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
