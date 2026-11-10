import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Terminal, 
  ShieldCheck
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ExecutionEvent } from '../../types/observability';
import { Badge } from '../../components/ui/Badge';

export const ExecutionTracesPage: React.FC = () => {
  const { traces } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [activeTraceId, setActiveTraceId] = useState<string>(traces[0]?.traceId || '');

  const activeTrace = traces.find(t => t.traceId === activeTraceId) || traces[0];

  const filteredTraces = traces.filter(tr => {
    if (selectedStatus !== 'ALL' && tr.status !== selectedStatus) return false;
    if (selectedAgent !== 'ALL' && !tr.participatingAgents.includes(selectedAgent as any)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = tr.traceId.toLowerCase().includes(q);
      const matchTask = tr.taskTitle.toLowerCase().includes(q);
      const matchKey = tr.taskKey.toLowerCase().includes(q);
      const matchClient = tr.client.toLowerCase().includes(q);
      return matchId || matchTask || matchKey || matchClient;
    }
    return true;
  });

  const getEventIcon = (type: ExecutionEvent['type']) => {
    switch (type) {
      case 'user_request': return <Layers className="w-3.5 h-3.5 text-blue-600" />;
      case 'agent_start': return <Terminal className="w-3.5 h-3.5 text-primary" />;
      case 'llm_call': return <Cpu className="w-3.5 h-3.5 text-purple-600" />;
      case 'tool_execution': return <Terminal className="w-3.5 h-3.5 text-emerald-600" />;
      case 'test_run': return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />;
      case 'review_audit': return <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'approval_gate': return <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Layers className="w-3.5 h-3.5 text-charcoal-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20 text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Execution Traces & Waterfall Explorer
            </h1>
            <Badge variant="blue" size="sm">
              Distributed OpenTelemetry Architecture
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            End-to-end execution waterfall connecting inbound user requests, multi-agent workflows, LLM calls, tool executions, tests, and human governance gates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-charcoal-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Span Standard: W3C TraceContext</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by trace ID (e.g. 'tr-forge-8921-auth'), task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-primary shadow-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-charcoal-400 font-semibold uppercase text-[10px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 font-medium focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Awaiting Sign-off">Awaiting Sign-off</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-charcoal-400 font-semibold uppercase text-[10px]">Agent:</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 font-medium focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="ALL">All Agents</option>
              <option value="Alex">Alex</option>
              <option value="Marcus">Marcus</option>
              <option value="Devon">Devon</option>
              <option value="Tessa">Tessa</option>
              <option value="Elena">Elena</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Traces List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">
            Traces ({filteredTraces.length})
          </span>

          <div className="space-y-2.5">
            {filteredTraces.map((trace) => {
              const isSelected = activeTrace?.traceId === trace.traceId;
              return (
                <div
                  key={trace.traceId}
                  onClick={() => {
                    setActiveTraceId(trace.traceId);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-purple-50/70 border-primary shadow-xs ring-1 ring-primary/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">
                      {trace.traceId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      trace.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      trace.status === 'Awaiting Sign-off' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {trace.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-charcoal-900 line-clamp-1">
                      {trace.taskKey}: {trace.taskTitle}
                    </h4>
                    <span className="text-[11px] text-charcoal-500 block mt-0.5 truncate">
                      {trace.client} • {trace.projectName}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-charcoal-500">
                    <span>{Math.floor(trace.totalDurationMs / 60000)}m {(trace.totalDurationMs % 60000) / 1000}s</span>
                    <span className="text-emerald-700 font-bold">${trace.totalCost.toFixed(4)} USD</span>
                    <span>{trace.events.length} Spans</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Waterfall Timeline of Selected Trace (7 cols) */}
        <div className="lg:col-span-7">
          {activeTrace ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5 text-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{activeTrace.traceId}</span>
                    <span className="text-charcoal-400">•</span>
                    <h3 className="font-bold text-sm text-charcoal-900">{activeTrace.taskTitle}</h3>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-1 font-sans">
                    Request: &ldquo;{activeTrace.initialUserRequest}&rdquo;
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-emerald-700 font-bold font-mono text-sm block">
                    ${activeTrace.totalCost.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-mono">
                    {activeTrace.totalTokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>

              {/* Waterfall Execution Sequence */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Span Execution Sequence ({activeTrace.events.length} Spans)
                </span>

                <div className="space-y-2">
                  {activeTrace.events.map((ev) => {
                    // Calculate visual bar width percentage based on duration
                    const maxSpan = 400000;
                    const barWidth = Math.max(8, Math.min(100, Math.round((ev.durationMs / maxSpan) * 100)));

                    return (
                      <div key={ev.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium">
                            {getEventIcon(ev.type)}
                            <span className="font-bold text-charcoal-900">{ev.title}</span>
                            {ev.agentName && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 font-semibold font-mono">
                                {ev.agentName}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-charcoal-500">
                            +{Math.round(ev.elapsedMs / 1000)}s ({ev.durationMs}ms)
                          </span>
                        </div>

                        <p className="text-[11px] text-charcoal-600 font-sans pl-5 leading-relaxed">
                          {ev.detail}
                        </p>

                        {/* Visual timeline bar */}
                        <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-charcoal-400 bg-white border border-slate-200 rounded-2xl">
              Select a trace from the left panel to inspect the execution waterfall.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
