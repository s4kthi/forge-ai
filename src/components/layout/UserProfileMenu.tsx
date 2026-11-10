import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const UserProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left',
          isOpen && 'bg-slate-100'
        )}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
          SC
        </div>
        <div className="hidden xl:flex flex-col leading-none">
          <span className="text-xs font-semibold text-charcoal-900">Dr. Sarah Chen</span>
          <span className="text-[10px] text-charcoal-500 mt-0.5">Principal Architect</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 hidden xl:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-dropdown z-50 p-1.5 text-xs">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="font-semibold text-charcoal-900">Dr. Sarah Chen</div>
            <div className="text-[11px] text-charcoal-500">schen@apex-global.internal</div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Workspace Admin</span>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-charcoal-700 hover:text-charcoal-900 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-charcoal-400" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => {
                navigate('/security');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-charcoal-700 hover:text-charcoal-900 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-charcoal-400" />
              <span>Security & Access Tokens</span>
            </button>
          </div>

          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
