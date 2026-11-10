import React from 'react';
import { 
  FileCode2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Check, 
  Terminal
} from 'lucide-react';
import type { PullRequestDossier } from '../../data/approvalData';

interface ReviewSummaryProps {
  dossier: PullRequestDossier;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ dossier }) => {
  return (
    <div className="space-y-4">
      {/* Implementation Summary Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Engineering Implementation Summary
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Root Cause & Verification Audit
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {dossier.implementationSummary}
        </p>

        {/* Technical Highlights */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Technical Highlights & Architectural Adjustments:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dossier.technicalHighlights.map((highlight, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Gate Metrics & Evidence Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Files Modified */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Files Touched</span>
            <FileCode2 className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {dossier.stats.filesModified}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-emerald-400 flex items-center">
              <Plus className="w-2.5 h-2.5" />{dossier.stats.linesAdded}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 flex items-center">
              <Minus className="w-2.5 h-2.5" />{dossier.stats.linesRemoved}
            </span>
          </div>
        </div>

        {/* Test Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Test Suite</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold font-mono text-emerald-400 truncate">
            100% Passed
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            37 / 37 assertions
          </div>
        </div>

        {/* Build Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Build Status</span>
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-200">
            Passed
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            0 compile errors
          </div>
        </div>

        {/* Security Findings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Security SAST</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold font-mono text-emerald-400 truncate">
            0 Vulnerabilities
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            ReDoS immune
          </div>
        </div>

        {/* Code Quality Findings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Quality Score</span>
            <span className="text-[10px] font-bold text-violet-400 font-mono">A+</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-200">
            Complexity: 3
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Maintainability: 98/100
          </div>
        </div>

        {/* Architecture Compliance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Compliance</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold font-mono text-cyan-400 truncate">
            100% Verified
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            Domain isolated
          </div>
        </div>
      </div>
    </div>
  );
};
