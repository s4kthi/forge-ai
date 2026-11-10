import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bot,
  CheckSquare,
  Home,
  Calendar,
  Sparkles,
  FileText,
  ShieldCheck,
  BarChart2,
  Blocks,
  Settings,
  FolderKanban,
  Activity,
  ArrowRight,
  Radio,
  Zap,
  Terminal,
  Coins,
  Network
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { cn } from '../../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Workspace' | 'Knowledge' | 'Observability' | 'Management' | 'Active Tasks' | 'Agents';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { tasks, agents } = useWorkspace();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: PaletteItem[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Home',
      subtitle: 'Daily schedule, project updates & summary',
      category: 'Workspace',
      icon: <Home className="w-4 h-4 text-primary" />,
      action: () => { navigate('/home'); onClose(); },
    },
    {
      id: 'nav-projects',
      title: 'Projects',
      subtitle: 'Repositories, health, and deliverables',
      category: 'Workspace',
      icon: <FolderKanban className="w-4 h-4 text-blue-600" />,
      action: () => { navigate('/projects'); onClose(); },
    },
    {
      id: 'nav-tasks',
      title: 'Tasks',
      subtitle: 'Kanban board & list view of AI deliverables',
      category: 'Workspace',
      icon: <CheckSquare className="w-4 h-4 text-emerald-600" />,
      action: () => { navigate('/tasks'); onClose(); },
    },
    {
      id: 'nav-calendar',
      title: 'Calendar',
      subtitle: 'Deadlines, meetings, and agent schedules',
      category: 'Workspace',
      icon: <Calendar className="w-4 h-4 text-purple-600" />,
      action: () => { navigate('/calendar'); onClose(); },
    },
    {
      id: 'nav-workforce',
      title: 'AI Workforce',
      subtitle: 'Alex, Marcus, Devon, Tessa, Elena',
      category: 'Workspace',
      icon: <Bot className="w-4 h-4 text-indigo-600" />,
      action: () => { navigate('/workforce'); onClose(); },
    },
    {
      id: 'nav-activity',
      title: 'Agent Activity & Collaboration',
      subtitle: 'Watch AI agents communicate and hand off tasks',
      category: 'Workspace',
      icon: <Activity className="w-4 h-4 text-amber-600" />,
      action: () => { navigate('/agent-activity'); onClose(); },
    },
    {
      id: 'nav-assistant',
      title: 'AI Assistant',
      subtitle: 'Chat with project-aware FORGE intelligence',
      category: 'Knowledge',
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      action: () => { navigate('/assistant'); onClose(); },
    },
    {
      id: 'nav-notes',
      title: 'Notes & Meetings',
      subtitle: 'Meeting notes, decisions, and action items',
      category: 'Knowledge',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      action: () => { navigate('/notes'); onClose(); },
    },
    // Observability
    {
      id: 'nav-obs-live',
      title: 'Live Monitor',
      subtitle: 'Real-time agent heartbeat, LLM providers & status',
      category: 'Observability',
      icon: <Radio className="w-4 h-4 text-emerald-600" />,
      action: () => { navigate('/observability/live-monitor'); onClose(); },
    },
    {
      id: 'nav-obs-runs',
      title: 'Agent Runs',
      subtitle: 'Historical runs, durations, tokens, and handoff flows',
      category: 'Observability',
      icon: <Zap className="w-4 h-4 text-purple-600" />,
      action: () => { navigate('/observability/agent-runs'); onClose(); },
    },
    {
      id: 'nav-obs-prompts',
      title: 'Prompt Inspector',
      subtitle: 'Inspect system instructions, tool calls & redact secrets',
      category: 'Observability',
      icon: <Terminal className="w-4 h-4 text-blue-600" />,
      action: () => { navigate('/observability/prompt-inspector'); onClose(); },
    },
    {
      id: 'nav-obs-costs',
      title: 'LLM Usage & Costs',
      subtitle: 'Token metrics, cost intelligence & budget limits',
      category: 'Observability',
      icon: <Coins className="w-4 h-4 text-amber-600" />,
      action: () => { navigate('/observability/llm-costs'); onClose(); },
    },
    {
      id: 'nav-obs-traces',
      title: 'Execution Traces',
      subtitle: 'Distributed span waterfall, latency & tool execution',
      category: 'Observability',
      icon: <Network className="w-4 h-4 text-indigo-600" />,
      action: () => { navigate('/observability/execution-traces'); onClose(); },
    },
    {
      id: 'nav-approvals',
      title: 'Approvals',
      subtitle: 'Review and authorize Pull Request #248',
      category: 'Management',
      icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
      action: () => { navigate('/approvals'); onClose(); },
    },
    {
      id: 'nav-analytics',
      title: 'Analytics',
      subtitle: 'Task throughput, velocity & cost metrics',
      category: 'Management',
      icon: <BarChart2 className="w-4 h-4 text-emerald-600" />,
      action: () => { navigate('/analytics'); onClose(); },
    },
    {
      id: 'nav-integrations',
      title: 'Integrations',
      subtitle: 'GitHub, Linear, Jira, Slack, Anthropic, OpenAI',
      category: 'Management',
      icon: <Blocks className="w-4 h-4 text-cyan-600" />,
      action: () => { navigate('/integrations'); onClose(); },
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      subtitle: 'Workspace preferences and model orchestration',
      category: 'Management',
      icon: <Settings className="w-4 h-4 text-slate-600" />,
      action: () => { navigate('/settings'); onClose(); },
    },
    // Dynamic Active Tasks
    ...tasks.slice(0, 4).map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: `${task.projectName} • ${task.assignedAgent} • Due ${task.dueDate}`,
      category: 'Active Tasks' as const,
      icon: <CheckSquare className="w-4 h-4 text-emerald-600" />,
      action: () => { navigate('/tasks'); onClose(); },
    })),
    // Dynamic Agents
    ...agents.map((agent) => ({
      id: `agent-${agent.id}`,
      title: `${agent.name} — ${agent.role}`,
      subtitle: `${agent.status} • ${agent.currentTaskTitle}`,
      category: 'Agents' as const,
      icon: <Bot className="w-4 h-4 text-purple-600" />,
      action: () => { navigate('/workforce'); onClose(); },
    }))
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 shadow-modal rounded-xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-4 h-4 text-charcoal-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, jump to a page, or search deliverables..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[11px] font-mono text-charcoal-400 hover:text-charcoal-700 px-1.5 py-0.5 rounded border border-slate-200 bg-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-charcoal-500">
              No matching pages, tasks, or agents found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors text-xs',
                    isSelected ? 'bg-purple-50/80 text-charcoal-900' : 'text-charcoal-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-xs shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-charcoal-900 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-normal text-charcoal-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-charcoal-500 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <ArrowRight className={cn('w-3.5 h-3.5 text-charcoal-400 shrink-0 ml-2', isSelected ? 'text-primary' : 'opacity-0')} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-charcoal-500">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-xs">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-xs">Enter</kbd> Select</span>
          </div>
          <span>FORGE AI Workspace</span>
        </div>
      </div>
    </div>
  );
};
