import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MessageSquareReply, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Send,
  UserCheck
} from 'lucide-react';
import type { PullRequestDossier } from '../../data/approvalData';

// -------------------------------------------------------------
// 1. APPROVE CONFIRMATION MODAL
// -------------------------------------------------------------
interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (reviewerNotes: string) => void;
  dossier: PullRequestDossier;
}

export const ApproveConfirmationModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  onConfirmApprove,
  dossier
}) => {
  const [reviewerName, setReviewerName] = useState('Dr. Sarah Chen (Chief Architect)');
  const [notes, setNotes] = useState('Empirical test evidence and ReDoS immunity verified. Safe for staging integration.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>AUTHORIZE PULL REQUEST #{dossier.number}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Prototype notice */}
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">PROTOTYPE SIMULATION NOTICE</span>
              Confirming this gate updates local mock state only. As this is a frontend prototype, no external GitHub/GitLab PR is actually merged.
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-mono uppercase text-[11px] block">Target Branch Route</span>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200">
              <span className="text-violet-400">{dossier.headBranch}</span> → <span className="text-slate-400">{dossier.baseBranch}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono uppercase text-[11px] block">
              Approving Authority / Sign-off Identity
            </label>
            <div className="relative">
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-violet-500"
              />
              <UserCheck className="w-4 h-4 text-emerald-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono uppercase text-[11px] block">
              Reviewer Audit Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-sans focus:outline-none focus:border-violet-500 resize-none text-xs"
            />
          </div>

          {/* Cryptographic Dispatch Summary */}
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Attestation Fingerprint:</span>
              <span className="text-violet-400">ed25519:sha256:7f3a8b...41c</span>
            </div>
            <div className="flex justify-between">
              <span>Governance Level:</span>
              <span className="text-emerald-400 font-semibold">Dual-Custody Passed</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmApprove(notes)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-950/50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign & Authorize PR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. REQUEST CHANGES INLINE FEEDBACK MODAL
// -------------------------------------------------------------
interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (agent: string, category: string, instructions: string) => void;
  dossier: PullRequestDossier;
}

export const RequestChangesModal: React.FC<RequestChangesModalProps> = ({
  isOpen,
  onClose,
  onSubmitFeedback,
  dossier
}) => {
  const [targetAgent, setTargetAgent] = useState('Devon');
  const [category, setCategory] = useState('Edge Case Coverage');
  const [instructions, setInstructions] = useState(
    'Please enforce a maximum domain label length of 63 octets per RFC 1035 and include an additional test fixture.'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold">
            <MessageSquareReply className="w-4 h-4" />
            <span>REQUEST CHANGES ON PR #{dossier.number}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300">
            Submit structured instructions to the autonomous workforce. The task will transition to re-execution and generate revised patches.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase text-[11px] block mb-1">
                Target AI Employee
              </label>
              <select
                value={targetAgent}
                onChange={(e) => setTargetAgent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="Devon">Devon (Full-Stack Dev)</option>
                <option value="Elena">Elena (Code Reviewer)</option>
                <option value="Tessa">Tessa (QA Engineer)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase text-[11px] block mb-1">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="Edge Case Coverage">Edge Case Coverage</option>
                <option value="Refactoring Request">Refactoring Request</option>
                <option value="Performance Optimization">Performance Optimization</option>
                <option value="Architectural Violation">Architectural Violation</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono uppercase text-[11px] block">
              Instructions & Acceptance Criteria Revision
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Detail specific behavioral adjustments or missing test criteria..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-sans focus:outline-none focus:border-amber-500 resize-none text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmitFeedback(targetAgent, category, instructions)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-950/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch to {targetAgent}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. REJECT IMPLEMENTATION MODAL
// -------------------------------------------------------------
interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (reason: string) => void;
  dossier: PullRequestDossier;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirmReject,
  dossier
}) => {
  const [reason, setReason] = useState(
    'Architecture approach rejected in favor of an external dedicated identity service integration.'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            <span>REJECT PULL REQUEST #{dossier.number}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300">
            Rejecting this PR closes the autonomous execution session and archives the feature branch.
          </p>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono uppercase text-[11px] block">
              Rejection Rationale
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-sans focus:outline-none focus:border-rose-500 resize-none text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmReject(reason)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all shadow-md shadow-rose-950/40"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Confirm Rejection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
