import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check, Building2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { cn } from '../../lib/utils';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ collapsed = false }) => {
  const { projects, activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const workspaces = [
    {
      id: 'all',
      name: 'Acme Digital Agency',
      tag: 'Primary Agency',
      client: 'Acme Digital Agency'
    },
    ...projects.map(p => ({
      id: p.id,
      name: p.name,
      tag: p.key,
      client: p.client
    }))
  ];

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="relative p-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between rounded-lg p-2 transition-colors',
          'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          collapsed ? 'justify-center p-2' : 'gap-2'
        )}
        title={collapsed ? currentWorkspace.name : undefined}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-purple-100 text-primary shrink-0 font-bold text-xs">
            <Building2 className="w-3.5 h-3.5" />
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-none truncate">
              <span className="text-xs font-semibold text-charcoal-900 truncate">
                {currentWorkspace.name}
              </span>
              <span className="text-[10px] text-charcoal-500 truncate mt-0.5">
                {currentWorkspace.tag}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <ChevronsUpDown className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-2 right-2 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-dropdown z-50 py-1 text-xs">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">
            Workspaces & Projects
          </div>
          {workspaces.map(w => {
            const isSelected = w.id === activeWorkspaceId;
            return (
              <button
                key={w.id}
                onClick={() => {
                  setActiveWorkspaceId(w.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors',
                  isSelected && 'bg-purple-50/60 text-primary font-medium'
                )}
              >
                <div className="truncate">
                  <div className="text-charcoal-900 font-medium truncate">{w.name}</div>
                  <div className="text-[10px] text-charcoal-500 truncate">{w.client}</div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
