import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Search, 
  ShieldCheck, 
  Terminal, 
  Sliders, 
  Layers, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { PromptRecord } from '../../types/observability';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PromptInspectorViewerProps {
  record: PromptRecord;
  recordsList?: PromptRecord[];
  onSelectRecord?: (recordId: string) => void;
}

type TabType = 'full' | 'context' | 'response' | 'tools' | 'metadata';

export const PromptInspectorViewer: React.FC<PromptInspectorViewerProps> = ({
  record,
  recordsList = [],
  onSelectRecord
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('full');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    system: true,
    task: true,
    handoff: true,
    context: true,
    tools: false
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleCopyPrompt = () => {
    const fullText = `=== SYSTEM INSTRUCTIONS ===\n${record.systemInstructions}\n\n=== TASK INSTRUCTIONS ===\n${record.taskInstructions}\n\n=== PROJECT CONTEXT ===\n${record.projectContext}\n\n=== HANDOFF CONTEXT ===\nFrom ${record.previousHandoffContext.sourceAgent}: ${record.previousHandoffContext.payload}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-charcoal-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden space-y-0 text-charcoal-900">
      {/* Top Banner: Ethical & Safe Observability Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-2.5 bg-purple-50/70 border-b border-purple-100 text-xs">
        <div className="flex items-center gap-2 text-purple-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Deterministic Transparency Engine:</strong> Exact submitted prompt tokens and model responses are captured with automated secret redaction.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-primary shrink-0">
          <Lock className="w-3.5 h-3.5" />
          <span>API Secrets Redacted</span>
        </div>
      </div>

      {/* Header bar: Record title, agent, model selector */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">{record.taskKey}</span>
            <span className="text-xs text-charcoal-400">•</span>
            <h2 className="text-base font-bold text-charcoal-900">{record.taskTitle}</h2>
            <Badge variant="violet" size="sm">Retry #{record.retryVersion}</Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-2">
            <span>Agent: <strong>{record.agentName}</strong></span>
            <span>•</span>
            <span className="font-mono text-charcoal-600">{record.provider} / {record.modelName}</span>
            <span>•</span>
            <span>Latency: {record.latencyMs}ms</span>
            <span>•</span>
            <span className="font-mono text-emerald-700 font-semibold">${record.cost.toFixed(4)} USD</span>
          </p>
        </div>

        {/* Record / Retry Selector */}
        {recordsList.length > 1 && onSelectRecord && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-charcoal-500 text-[11px] font-medium">Recorded Run:</span>
            <select
              value={record.id}
              onChange={(e) => onSelectRecord(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-800 font-medium focus:outline-none focus:border-primary shadow-xs"
            >
              {recordsList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.agentName} — {r.taskKey} ({r.timestamp})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Control Bar: Tabs, Search & Copy */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-medium">
          {[
            { id: 'full', label: 'Full Prompt', icon: Terminal },
            { id: 'context', label: 'Context Items', icon: Layers },
            { id: 'response', label: 'Model Response', icon: Sparkles },
            { id: 'tools', label: `Tool Calls (${record.toolCalls.length})`, icon: Sliders },
            { id: 'metadata', label: 'Model Parameters', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-charcoal-900 font-semibold shadow-xs border border-slate-200'
                    : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Copy Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-primary shadow-xs w-40 sm:w-48"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPrompt}
            className="gap-1.5 text-xs text-charcoal-700 hover:text-charcoal-900"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="p-6">
        {/* TAB 1: FULL PROMPT */}
        {activeTab === 'full' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Section 1: Original User Request */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('user')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left font-bold text-charcoal-800 border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>1. Original User Request</span>
                </div>
                {expandedSections.user !== false ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
              </button>
              {expandedSections.user !== false && (
                <div className="p-4 bg-white text-charcoal-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {highlightMatches(record.originalUserRequest)}
                </div>
              )}
            </div>

            {/* Section 2: Agent System Instructions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('system')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left font-bold text-charcoal-800 border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>2. Agent System Instructions ({record.agentName})</span>
                  {record.hasRedactedSecrets && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Redactions Applied
                    </span>
                  )}
                </div>
                {expandedSections.system ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
              </button>
              {expandedSections.system && (
                <div className="p-4 bg-slate-50/50 text-charcoal-800 whitespace-pre-wrap leading-relaxed">
                  {highlightMatches(record.systemInstructions)}
                </div>
              )}
            </div>

            {/* Section 3: Previous Agent Handoff Context */}
            {record.previousHandoffContext && (
              <div className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  onClick={() => toggleSection('handoff')}
                  className="w-full px-4 py-2.5 bg-purple-50/60 flex items-center justify-between text-left font-bold text-primary border-b border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    <span>3. Inbound Handoff Context (From {record.previousHandoffContext.sourceAgent})</span>
                  </div>
                  {expandedSections.handoff ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
                </button>
                {expandedSections.handoff && (
                  <div className="p-4 space-y-2 bg-white text-charcoal-800 font-sans">
                    <p className="font-semibold text-charcoal-900">{record.previousHandoffContext.summary}</p>
                    <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-charcoal-700 overflow-x-auto">
                      {highlightMatches(record.previousHandoffContext.payload)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Task Instructions & Acceptance Criteria */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('task')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left font-bold text-charcoal-800 border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>4. Task Instructions</span>
                </div>
                {expandedSections.task ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
              </button>
              {expandedSections.task && (
                <div className="p-4 bg-white text-charcoal-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {highlightMatches(record.taskInstructions)}
                </div>
              )}
            </div>

            {/* Section 5: Tool Instructions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('tools')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left font-bold text-charcoal-800 border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>5. Permitted Tool Declarations</span>
                </div>
                {expandedSections.tools ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
              </button>
              {expandedSections.tools && (
                <div className="p-4 bg-slate-50/50 text-charcoal-700 whitespace-pre-wrap leading-relaxed">
                  {highlightMatches(record.toolInstructions)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTEXT ITEMS */}
        {activeTab === 'context' && (
          <div className="space-y-4">
            <div className="text-xs text-charcoal-500">
              Listing all contextual documents, specifications, and handoff payloads bundled into the model context window.
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
              {record.contextItems.map(item => (
                <div key={item.key} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-900">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-charcoal-600 font-mono">
                        {item.sourceType}
                      </span>
                      {item.sourceAgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-primary font-semibold">
                          Attributed to {item.sourceAgent}
                        </span>
                      )}
                      {item.isRedacted && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                          Redacted
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-charcoal-400 text-[11px]">{item.tokenCount} tokens</span>
                  </div>

                  <pre className="p-3 bg-slate-50 rounded-lg text-charcoal-800 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {highlightMatches(item.content)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MODEL RESPONSE */}
        {activeTab === 'response' && (
          <div className="space-y-4 text-xs">
            {/* Concise Reasoning Summary */}
            <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                Ethical Transparent Reasoning Summary (User-Facing)
              </span>
              <p className="text-charcoal-800 leading-relaxed font-sans font-medium">
                {record.conciseReasoningSummary}
              </p>
            </div>

            {/* Generated Model Completion */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-charcoal-500 font-mono text-[11px]">
                <span>Generated Output Payload</span>
                <span>Tokens: {record.tokens.output} • Cost: ${((record.tokens.output / 1000000) * 15).toFixed(4)}</span>
              </div>
              <pre className="text-charcoal-900 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {highlightMatches(record.finalModelResponse)}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: TOOL CALLS */}
        {activeTab === 'tools' && (
          <div className="space-y-4 text-xs">
            {record.toolCalls.length === 0 ? (
              <div className="p-8 text-center text-charcoal-400 bg-slate-50 rounded-xl border border-slate-200">
                No tool calls invoked in this specific reasoning step.
              </div>
            ) : (
              <div className="space-y-3">
                {record.toolCalls.map(tc => (
                  <div key={tc.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-primary" />
                        <span className="font-bold font-mono text-charcoal-900">{tc.toolName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tc.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-charcoal-400">{tc.startedAt} ({tc.durationMs}ms)</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Input Arguments:</span>
                      <pre className="p-2.5 bg-slate-50 rounded-lg text-charcoal-800 font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(tc.inputArguments, null, 2)}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Tool Response Payload:</span>
                      <pre className="p-2.5 bg-slate-50 rounded-lg text-charcoal-800 font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(tc.responsePayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: METADATA & MODEL PARAMETERS */}
        {activeTab === 'metadata' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <span className="font-bold text-charcoal-900 block">Model Hyperparameters</span>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Temperature</span>
                  <span className="font-bold text-charcoal-800">{record.modelParameters.temperature}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Top P</span>
                  <span className="font-bold text-charcoal-800">{record.modelParameters.topP}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Max Output Tokens</span>
                  <span className="font-bold text-charcoal-800">{record.modelParameters.maxTokens}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Seed</span>
                  <span className="font-bold text-charcoal-800">{record.modelParameters.seed ?? 'Deterministic'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <span className="font-bold text-charcoal-900 block">Token Accounting</span>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Input Tokens</span>
                  <span className="font-bold text-charcoal-800">{record.tokens.input.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Cached Tokens (Discounted)</span>
                  <span className="font-bold text-purple-700">{record.tokens.cached.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Output Tokens</span>
                  <span className="font-bold text-charcoal-800">{record.tokens.output.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-charcoal-500">Total Calculated Cost</span>
                  <span className="font-bold text-emerald-700">${record.cost.toFixed(4)} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
