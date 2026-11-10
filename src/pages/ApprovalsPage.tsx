import React, { useState } from 'react';
import { 
  GitPullRequest, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquareReply, 
  XCircle, 
  Sparkles,
  Layers,
  History
} from 'lucide-react';
import { primaryApprovalDossier, type PullRequestDossier } from '../data/approvalData';
import { ApprovalHeader } from '../components/approvals/ApprovalHeader';
import { ReviewSummary } from '../components/approvals/ReviewSummary';
import { CodeReviewDiff } from '../components/approvals/CodeReviewDiff';
import { VerificationPanel } from '../components/approvals/VerificationPanel';
import { 
  ApproveConfirmationModal, 
  RequestChangesModal, 
  RejectModal 
} from '../components/approvals/ApprovalModals';

export const ApprovalsPage: React.FC = () => {
  const [dossier, setDossier] = useState<PullRequestDossier>(primaryApprovalDossier);
  const [activeTab, setActiveTab] = useState<'review' | 'diff' | 'verification'>('diff');

  // Modal dialog states
  const [isApproveOpen, setIsApproveOpen] = useState<boolean>(false);
  const [isRequestChangesOpen, setIsRequestChangesOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);

  // Resolution metadata
  const [resolutionDetails, setResolutionDetails] = useState<{
    reviewer?: string;
    notes?: string;
    timestamp?: string;
    targetAgent?: string;
    feedbackCategory?: string;
  } | null>(null);

  // Approve action handler
  const handleConfirmApprove = (reviewerNotes: string) => {
    setDossier(prev => ({
      ...prev,
      status: 'Approved'
    }));
    setResolutionDetails({
      reviewer: 'Dr. Sarah Chen (Chief Architect)',
      notes: reviewerNotes,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
    });
    setIsApproveOpen(false);
  };

  // Request changes action handler
  const handleConfirmRequestChanges = (agent: string, category: string, instructions: string) => {
    setDossier(prev => ({
      ...prev,
      status: 'Changes Requested'
    }));
    setResolutionDetails({
      targetAgent: agent,
      feedbackCategory: category,
      notes: instructions,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
    });
    setIsRequestChangesOpen(false);
  };

  // Reject action handler
  const handleConfirmReject = (reason: string) => {
    setDossier(prev => ({
      ...prev,
      status: 'Rejected'
    }));
    setResolutionDetails({
      notes: reason,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
    });
    setIsRejectOpen(false);
  };

  // Reset to pending state (for testing/demo interaction)
  const handleResetState = () => {
    setDossier(prev => ({
      ...prev,
      status: 'Awaiting Approval'
    }));
    setResolutionDetails(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Breadcrumb / Queue Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            GOVERNANCE QUALITY GATE
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold">PULL REQUEST APPROVAL DOSSIER</span>
        </div>

        {/* Demo status reset button if changed */}
        {dossier.status !== 'Awaiting Approval' && (
          <button
            onClick={handleResetState}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors font-mono"
          >
            <History className="w-3.5 h-3.5 text-violet-400" />
            <span>Reset Demo to Pending</span>
          </button>
        )}
      </div>

      {/* Resolution State Notice Banner */}
      {dossier.status === 'Approved' && resolutionDetails && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg space-y-2 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-emerald-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>APPROVAL CONFIRMED — SIMULATED QUALITY GATE SIGNED</span>
            </div>
            <span className="text-[11px] text-emerald-400/80 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
              {resolutionDetails.timestamp}
            </span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            Signed by <strong>{resolutionDetails.reviewer}</strong>: &ldquo;{resolutionDetails.notes}&rdquo;
          </p>
          <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cryptographic Dispatch Token: <code className="text-violet-400">ed25519:sha256:7f3a8b...41c</code></span>
            <span className="text-emerald-400">Prototype Safe — No Remote Git Repository Mutated</span>
          </div>
        </div>
      )}

      {dossier.status === 'Changes Requested' && resolutionDetails && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-lg space-y-2 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <MessageSquareReply className="w-5 h-5 text-amber-400" />
              <span>CHANGES REQUESTED — TASK RE-DISPATCHED TO WORKFORCE</span>
            </div>
            <span className="text-[11px] text-amber-400/80 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/40">
              {resolutionDetails.timestamp}
            </span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            Dispatched to <strong>{resolutionDetails.targetAgent}</strong> [{resolutionDetails.feedbackCategory}]: &ldquo;{resolutionDetails.notes}&rdquo;
          </p>
          <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Autonomous Thread: <code className="text-violet-400">task-rev-248-b</code></span>
            <span className="text-amber-400">Re-evaluating acceptance criteria...</span>
          </div>
        </div>
      )}

      {dossier.status === 'Rejected' && resolutionDetails && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 shadow-lg space-y-2 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-rose-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>IMPLEMENTATION REJECTED — SESSION ARCHIVED</span>
            </div>
            <span className="text-[11px] text-rose-400/80 bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800/40">
              {resolutionDetails.timestamp}
            </span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            Reason: &ldquo;{resolutionDetails.notes}&rdquo;
          </p>
          <div className="pt-2 border-t border-rose-900/40 text-[11px] text-slate-400">
            Feature branch marked for rollback. No production disruption occurred.
          </div>
        </div>
      )}

      {/* Main Dossier Header */}
      <ApprovalHeader
        dossier={dossier}
        onApprove={() => setIsApproveOpen(true)}
        onRequestChanges={() => setIsRequestChangesOpen(true)}
        onReject={() => setIsRejectOpen(true)}
      />

      {/* Section Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'diff'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Code Review Diff ({dossier.files.length} files)</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Review Summary & Highlights</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'verification'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Panel ({dossier.verifications.length} checks)</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Full Context Window Preservation</span>
        </div>
      </div>

      {/* Primary Tab Viewport */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          <CodeReviewDiff files={dossier.files} />
          <VerificationPanel verifications={dossier.verifications} />
          <ReviewSummary dossier={dossier} />
        </div>
      )}

      {activeTab === 'review' && (
        <div className="space-y-6">
          <ReviewSummary dossier={dossier} />
          <VerificationPanel verifications={dossier.verifications} />
          <CodeReviewDiff files={dossier.files} />
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <VerificationPanel verifications={dossier.verifications} />
          <ReviewSummary dossier={dossier} />
          <CodeReviewDiff files={dossier.files} />
        </div>
      )}

      {/* Floating Bottom Action Bar for Easy Access */}
      <div className="sticky bottom-4 z-40 flex items-center justify-between p-3.5 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-950/80 border border-violet-800/40 text-violet-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Dual-Custody Gate: Pull Request #{dossier.number}</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                100% Passed
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Devon (Implementation) • Elena (Auditing) • Tessa (QA)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestChangesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 transition-colors"
          >
            <MessageSquareReply className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Request Changes</span>
          </button>

          <button
            onClick={() => setIsRejectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-300 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reject</span>
          </button>

          <button
            onClick={() => setIsApproveOpen(true)}
            disabled={dossier.status === 'Approved'}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              dossier.status === 'Approved'
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{dossier.status === 'Approved' ? 'PR Approved' : 'Approve PR'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Modal Dialogs */}
      <ApproveConfirmationModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirmApprove={handleConfirmApprove}
        dossier={dossier}
      />

      <RequestChangesModal
        isOpen={isRequestChangesOpen}
        onClose={() => setIsRequestChangesOpen(false)}
        onSubmitFeedback={handleConfirmRequestChanges}
        dossier={dossier}
      />

      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirmReject={handleConfirmReject}
        dossier={dossier}
      />
    </div>
  );
};
