import React, { useState } from 'react';
import { 
  ArrowRight, 
  FileText, 
  MessageSquare
} from 'lucide-react';
import { AgentHandoff } from '../../types/observability';
import { Badge } from '../ui/Badge';

interface AgentHandoffTimelineProps {
  handoffs: AgentHandoff[];
  onSelectHandoff?: (handoff: AgentHandoff) => void;
}

export const AgentHandoffTimeline: React.FC<AgentHandoffTimelineProps> = ({ handoffs }) => {
  const [selectedHandoff, setSelectedHandoff] = useState<AgentHandoff | null>(handoffs[0] || null);

  const getAgentColor = (name: string) => {
    switch (name) {
      case 'Alex': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Marcus': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Devon': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Tessa': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Elena': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-charcoal-900">
              Agent-to-Agent Communication Traces
            </h3>
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Chronological handoff stream demonstrating asynchronous autonomous inter-agent delegation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="subtle" size="sm">
            {handoffs.length} Recorded Exchanges
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Chronological Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {handoffs.map((h) => {
              const isSelected = selectedHandoff?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHandoff(h)}
                  className={`relative cursor-pointer transition-all rounded-xl p-3.5 border ${
                    isSelected
                      ? 'bg-purple-50/70 border-primary shadow-xs ring-1 ring-primary/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                  }`}
                >
                  {/* Step index badge on rail */}
                  <div className={`absolute -left-6 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-charcoal-600 border-slate-300'
                  }`}>
                    {h.stepNumber}
                  </div>

                  <div className="space-y-2">
                    {/* Handoff Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getAgentColor(h.fromAgent)}`}>
                          {h.fromAgent}
                        </span>

                        <ArrowRight className="w-3.5 h-3.5 text-primary" />

                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getAgentColor(h.toAgent)}`}>
                          {h.toAgent}
                        </span>

                        <span className="text-[10px] font-mono text-charcoal-400">
                          {h.timestamp}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        h.status === 'Completed' || h.status === 'Actioned'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : h.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {h.status}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-charcoal-800 font-medium leading-relaxed">
                      {h.message}
                    </p>

                    {/* Footer reference */}
                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-slate-100">
                      <span className="font-mono text-primary text-[10px] font-medium truncate">
                        Ref: {h.handoffReference}
                      </span>
                      <span>{h.artifactsTransferred.length} artifact(s) transferred</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Handoff Details Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedHandoff ? (
            <div className="sticky top-6 bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-primary flex items-center justify-center font-bold text-xs">
                    #{selectedHandoff.stepNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal-900">Exchange Inspection</h4>
                    <span className="text-[11px] text-charcoal-500">Trace: {selectedHandoff.traceId}</span>
                  </div>
                </div>

                <Badge variant="violet" size="sm">{selectedHandoff.status}</Badge>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Transmission Content
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-charcoal-800 leading-relaxed font-sans">
                  {selectedHandoff.message}
                </div>
              </div>

              {/* Payload Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Payload Summary & Context
                </span>
                <p className="text-charcoal-700 leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedHandoff.payloadSummary}
                </p>
              </div>

              {/* Artifacts Transferred */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Transferred Artifacts ({selectedHandoff.artifactsTransferred.length})
                </span>
                <div className="space-y-1">
                  {selectedHandoff.artifactsTransferred.map((art, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50/60 border border-purple-200/60 rounded-lg text-primary font-mono text-[11px]">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{art}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task reference */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-charcoal-500 flex items-center justify-between">
                <span>Task: <strong>{selectedHandoff.taskTitle}</strong></span>
                <span className="text-charcoal-400 font-mono">{selectedHandoff.timestamp}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-charcoal-400 bg-white border border-slate-200 rounded-xl">
              Select an exchange from the timeline to inspect transmission metadata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
