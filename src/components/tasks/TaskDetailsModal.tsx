import React, { useState } from 'react';
import {
  X,
  GitBranch,
  CheckSquare,
  Save,
} from 'lucide-react';
import { TaskItem, IssueTaskStatus } from '../../types';
import { mockEmployees } from '../../data/mockData';
import { Button } from '../ui/Button';

interface TaskDetailsModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onUpdateTask: (updatedTask: TaskItem) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onUpdateTask,
}) => {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<IssueTaskStatus>(task.status);
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>(task.priority);
  const [assignedEmployee, setAssignedEmployee] = useState(task.assignedEmployee);
  const criteria = task.acceptanceCriteria;
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});

  const handleSave = () => {
    const employeeObj = mockEmployees.find((e) => e.name === assignedEmployee);
    onUpdateTask({
      ...task,
      title,
      description,
      status,
      priority,
      assignedEmployee,
      assignedRole: employeeObj ? employeeObj.role : undefined,
      acceptanceCriteria: criteria,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const toggleCheck = (index: number) => {
    setCheckedCriteria((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const statuses: IssueTaskStatus[] = [
    'Backlog',
    'Ready',
    'Planning',
    'Development',
    'Testing',
    'Review',
    'Awaiting Approval',
    'Completed',
    'Failed',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-elevated/70">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="text-violet-300 font-bold">{task.key}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">{task.client}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{task.projectName}</span>
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
          {/* Title Editor */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              TASK TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2.5 text-sm font-bold text-white focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          {/* Quick Controls Bar: Status, Priority, Assigned Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-surface-elevated border border-border text-xs font-mono">
            {/* Status Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 block uppercase">LIFECYCLE STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueTaskStatus)}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 font-semibold focus:outline-none focus:border-violet-500"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 block uppercase">PRIORITY TIER</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'Critical' | 'High' | 'Medium' | 'Low')}
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 font-semibold focus:outline-none focus:border-violet-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Assigned Employee */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 block uppercase">ASSIGNED EMPLOYEE</label>
              <select
                value={assignedEmployee}
                onChange={(e) =>
                  setAssignedEmployee(e.target.value as 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'Unassigned')
                }
                className="w-full bg-surface-muted border border-border rounded p-2 text-zinc-100 font-semibold focus:outline-none focus:border-violet-500"
              >
                <option value="Alex">Alex (AI Product Mgr)</option>
                <option value="Marcus">Marcus (AI Architect)</option>
                <option value="Devon">Devon (AI Full-Stack)</option>
                <option value="Tessa">Tessa (AI QA Eng)</option>
                <option value="Elena">Elena (AI Code Reviewer)</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              ENGINEERING DESCRIPTION & SPECIFICATIONS
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded p-2.5 text-xs text-zinc-200 leading-relaxed font-sans focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Acceptance Criteria Checklist */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ACCEPTANCE CRITERIA VERIFICATION CHECKLIST
            </span>

            <div className="p-3 rounded-lg bg-surface-muted border border-border space-y-2">
              {criteria.map((item, idx) => {
                const isChecked = checkedCriteria[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="flex items-start gap-2.5 text-xs font-mono text-zinc-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => toggleCheck(idx)}
                      className="accent-violet-500 w-3.5 h-3.5 mt-0.5 rounded cursor-pointer"
                    />
                    <span className={isChecked ? 'line-through text-zinc-500' : ''}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Git Branch & Repository Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-violet-400" /> REPOSITORY
              </span>
              <span className="text-zinc-200 font-semibold truncate block mt-0.5">
                {task.repository}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-muted border border-border/80">
              <span className="text-[10px] text-zinc-400 block">WORKING BRANCH</span>
              <span className="text-violet-300 font-semibold truncate block mt-0.5">
                {task.repositoryBranch}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/60 flex items-center justify-between text-xs font-mono">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>SAVE TASK CHANGES</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
