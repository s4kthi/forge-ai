import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Terminal,
  CheckCheck,
} from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import { SystemNotification } from '../../types';
import { cn } from '../../lib/utils';

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: string, severity: string) => {
    if (severity === 'critical') return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
    if (category === 'security') return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    if (category === 'execution') return <Terminal className="w-3.5 h-3.5 text-primary" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 transition-colors',
          isOpen && 'bg-slate-100 text-charcoal-900'
        )}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-dropdown z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  'p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start',
                  !notif.read && 'bg-purple-50/30'
                )}
              >
                <div className="mt-0.5 p-1 rounded-md bg-white border border-slate-200 shrink-0">
                  {getCategoryIcon(notif.category, notif.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-charcoal-900 truncate text-xs">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-charcoal-400 shrink-0 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-charcoal-600 mt-0.5 line-clamp-2">
                    {notif.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-100 text-center bg-slate-50/40">
            <button
              onClick={() => {
                navigate('/approvals');
                setIsOpen(false);
              }}
              className="text-xs text-primary font-medium hover:underline"
            >
              View pending approval queue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
