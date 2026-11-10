import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  Menu,
  Plus,
  Sparkles
} from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { UserProfileMenu } from './UserProfileMenu';
import { QuickCreateModal } from './QuickCreateModal';

interface TopNavProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  sidebarCollapsed: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleSidebar,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Generate breadcrumb info
  const pathnames = location.pathname.split('/').filter((x) => x);
  const currentSection = pathnames[0] || 'home';

  const formatBreadcrumb = (name: string) => {
    if (name === 'command-center' || name === 'home') return 'Home';
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 select-none">
        {/* Left: Mobile Toggle & Clean Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-slate-100 transition-colors lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-1.5 text-xs">
            <Link
              to="/home"
              className="text-charcoal-500 hover:text-charcoal-800 transition-colors font-medium flex items-center gap-1"
            >
              <span>Workspace</span>
            </Link>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            <span className="text-charcoal-900 font-semibold">
              {formatBreadcrumb(currentSection)}
            </span>

            {pathnames.length > 1 && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-primary font-medium">
                  {formatBreadcrumb(pathnames[1])}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Center: Clean Global Search Input Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-primary transition-colors" />
              <span className="truncate">Search tasks, projects, notes, or ask assistant...</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] font-mono text-charcoal-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Quick Create, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Button */}
          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Ask AI Assistant Shortcut */}
          <Link
            to="/assistant"
            className="p-1.5 rounded-lg text-charcoal-600 hover:text-primary hover:bg-purple-50 transition-colors"
            title="Open AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          {/* Notification Bell */}
          <NotificationPanel />

          {/* User Profile Menu */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />
    </>
  );
};
