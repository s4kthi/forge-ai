import React from 'react';
import { 
  GitPullRequest, 
  GitBranch, 
  FolderGit2, 
  Clock, 
  Coins, 
  ExternalLink, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquareReply
} from 'lucide-react';
import type { PullRequestDossier } from '../../data/approvalData';

interface ApprovalHeaderProps {
  dossier: PullRequestDossier;
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
}

export const ApprovalHeader: React.FC<ApprovalHeaderProps> = ({
  dossier,
  onApprove,
  onRequestChanges,
  onReject
}) => {
  const getStatusBadge = () => {
    switch (dossier.status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            APPROVED (PROTOTYPE SIMULATED)
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-950/80 border border-amber-500/50 text-amber-300">
            <MessageSquareReply className="w-3.5 h-3.5 text-amber-400" />
            CHANGES REQUESTED
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-950/80 border border-rose-500/50 text-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-violet-950/80 border border-violet-500/50 text-violet-300 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            AWAITING HUMAN APPROVAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Prototype Disclaimer */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300/90 font-mono">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>ENGINEERING QUALITY GATE PROTOTYPE:</strong> Actions simulate platform governance logic. No real GitHub/GitLab pull requests are merged.
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 shrink-0">
          Simulated Sandbox
        </span>
      </div>

      {/* Main Header Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-violet-400 bg-violet-950/60 border border-violet-800/40 px-2.5 py-1 rounded-md">
                <GitPullRequest className="w-3.5 h-3.5" />
                Pull Request #{dossier.number}
              </span>
              {getStatusBadge()}
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">{dossier.client}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {dossier.title}
            </h1>

            {/* Linked Issue */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Linked Issue:</span>
              <span className="font-mono text-slate-300 hover:text-violet-400 transition-colors flex items-center gap-1 cursor-pointer">
                {dossier.linkedIssue}
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              onClick={onRequestChanges}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium font-mono text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 hover:border-amber-700 transition-colors"
            >
              <MessageSquareReply className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={onReject}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium font-mono text-rose-300 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 hover:border-rose-700 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              onClick={onApprove}
              disabled={dossier.status === 'Approved'}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all shadow-sm ${
                dossier.status === 'Approved'
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{dossier.status === 'Approved' ? 'PR Approved' : 'Approve PR'}</span>
            </button>
          </div>
        </div>

        {/* Operational Context Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          {/* Repository & Branch */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              <FolderGit2 className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Repository</span>
              <span className="font-mono text-slate-200 font-medium">{dossier.repository}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              <GitBranch className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Branch Routing</span>
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                <span className="text-violet-400 truncate max-w-[120px]">{dossier.headBranch}</span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-400">{dossier.baseBranch}</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Execution Duration</span>
              <span className="font-mono text-slate-200 font-medium">{dossier.duration}</span>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Execution Cost</span>
              <span className="font-mono text-emerald-400 font-semibold">{dossier.cost} USD</span>
            </div>
          </div>
        </div>

        {/* Assigned AI Employees Row */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Autonomous Contributors:</span>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            {dossier.assignedWorkers.map((worker) => (
              <div 
                key={worker.name} 
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800"
                title={`${worker.name} (${worker.role}): ${worker.contribution}`}
              >
                <img 
                  src={worker.avatar} 
                  alt={worker.name} 
                  className="w-5 h-5 rounded-full border border-slate-700 object-cover" 
                />
                <span className="font-medium text-slate-200">{worker.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({worker.role.split(' ')[1] || worker.role})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
