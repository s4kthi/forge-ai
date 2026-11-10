import React from 'react';
import { ArrowRight, Bot, ShieldCheck, FileCode } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface HandoffRecord {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  reason: string;
  artifact: string;
  signature: string;
  status: 'Verified' | 'Pending' | 'In Progress';
}

interface AgentHandoffsViewProps {
  handoffs: HandoffRecord[];
}

export const AgentHandoffsView: React.FC<AgentHandoffsViewProps> = ({ handoffs }) => {
  return (
    <div className="p-4 space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-border">
        <span className="font-semibold text-zinc-200">INTER-AGENT DELEGATION & CONTEXT HANDOFFS</span>
        <span className="text-[10px]">Zero-loss context window compaction</span>
      </div>

      {handoffs.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs">
          Initial agent execution underway. No handoffs triggered yet.
        </div>
      ) : (
        <div className="space-y-3">
          {handoffs.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-lg bg-surface-elevated border border-border/80 hover:border-zinc-700 transition-colors space-y-3"
            >
              {/* Header: Agent A -> Agent B */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-violet-950/70 border border-violet-500/40 text-violet-200 font-bold">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                    <span>{h.from}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-500" />

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/70 border border-blue-500/40 text-blue-200 font-bold">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    <span>{h.to}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span>{h.timestamp}</span>
                  <Badge variant="emerald" size="xs">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    {h.status}
                  </Badge>
                </div>
              </div>

              {/* Handoff Reason */}
              <div className="p-2.5 rounded bg-surface-muted border border-border/60 text-zinc-300 font-sans leading-relaxed">
                <span className="text-[10px] font-mono text-zinc-400 block mb-0.5 uppercase">
                  DELEGATION REASON:
                </span>
                {h.reason}
              </div>

              {/* Artifact & Signature */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-violet-400" />
                  <span>Transferred Artifact:</span>
                  <span className="text-zinc-200 font-bold">{h.artifact}</span>
                </div>

                <span className="text-[9px] text-zinc-400 font-mono">
                  SHA-256: {h.signature.slice(0, 16)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
