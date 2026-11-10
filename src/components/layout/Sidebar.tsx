import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  Activity,
  Sparkles,
  FileText,
  ShieldCheck,
  BarChart2,
  Blocks,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coins,
  GitFork,
  PlayCircle,
  Terminal
} from 'lucide-react';
import { ForgeLogo } from '../branding/ForgeLogo';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useWorkspace } from '../../context/WorkspaceContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: 'primary' | 'emerald' | 'amber' | 'slate';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { tasks } = useWorkspace();
  const openTasksCount = tasks.filter(t => t.status !== 'completed').length;

  const sections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        {
          name: 'Home',
          path: '/home',
          icon: Home,
        },
        {
          name: 'Projects',
          path: '/projects',
          icon: FolderKanban,
        },
        {
          name: 'Tasks',
          path: '/tasks',
          icon: CheckSquare,
          badge: openTasksCount > 0 ? openTasksCount : undefined,
          badgeColor: 'primary'
        },
        {
          name: 'Calendar',
          path: '/calendar',
          icon: Calendar,
        },
        {
          name: 'AI Workforce',
          path: '/workforce',
          icon: Users,
          badge: '5 active',
          badgeColor: 'emerald'
        },
        {
          name: 'Agent Activity',
          path: '/agent-activity',
          icon: Activity,
        },
      ],
    },
    {
      title: 'KNOWLEDGE',
      items: [
        {
          name: 'AI Assistant',
          path: '/assistant',
          icon: Sparkles,
          badge: 'Live',
          badgeColor: 'primary'
        },
        {
          name: 'Notes & Meetings',
          path: '/notes',
          icon: FileText,
        },
      ],
    },
    {
      title: 'OBSERVABILITY',
      items: [
        {
          name: 'Live Monitor',
          path: '/observability/live-monitor',
          icon: Activity,
          badge: 'Live',
          badgeColor: 'emerald'
        },
        {
          name: 'Agent Runs',
          path: '/observability/agent-runs',
          icon: PlayCircle,
        },
        {
          name: 'Prompt Inspector',
          path: '/observability/prompt-inspector',
          icon: Terminal,
        },
        {
          name: 'LLM Usage & Costs',
          path: '/observability/llm-costs',
          icon: Coins,
        },
        {
          name: 'Execution Traces',
          path: '/observability/execution-traces',
          icon: GitFork,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          name: 'Approvals',
          path: '/approvals',
          icon: ShieldCheck,
          badge: '1 pending',
          badgeColor: 'amber'
        },
        {
          name: 'Analytics',
          path: '/analytics',
          icon: BarChart2,
        },
        {
          name: 'Integrations',
          path: '/integrations',
          icon: Blocks,
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col',
          'bg-white border-r border-slate-200 transition-all duration-200 select-none ease-in-out',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-100">
          <NavLink to="/home" className="flex items-center overflow-hidden">
            <ForgeLogo collapsed={collapsed} />
          </NavLink>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-slate-100 transition-colors"
              title="Collapse sidebar (⌘B)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="border-b border-slate-100">
          <WorkspaceSwitcher collapsed={collapsed} />
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 py-1 text-[11px] font-semibold text-charcoal-400 tracking-wider">
                  {section.title}
                </div>
              )}

              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-purple-50 text-primary font-semibold'
                            : 'text-charcoal-600 hover:bg-slate-50 hover:text-charcoal-900',
                          collapsed && 'justify-center px-0'
                        )
                      }
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', collapsed ? '' : '')} />

                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                'text-[10px] px-1.5 py-0.2 rounded-full font-medium',
                                item.badgeColor === 'primary' && 'bg-purple-100 text-purple-700',
                                item.badgeColor === 'emerald' && 'bg-emerald-100 text-emerald-700',
                                item.badgeColor === 'amber' && 'bg-amber-100 text-amber-800',
                                item.badgeColor === 'slate' && 'bg-slate-100 text-slate-600',
                                !item.badgeColor && 'bg-slate-100 text-slate-600'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Collapse Toggle when collapsed */}
        {collapsed && (
          <div className="p-2 border-t border-slate-100 flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-slate-100 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
