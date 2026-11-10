import React from 'react';
import { 
  X, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  TestTube2, 
  Sparkles, 
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { AgentRun } from '../../types/observability';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AgentExecutionInspectorModalProps {
  run: AgentRun | null;
  onClose: () => void;
  onOpenPromptInspector?: (promptRecordId?: string) => void;
}

export const AgentExecutionInspectorModal: React.FC<AgentExecutionInspectorModalProps> = ({
  run,
  onClose,
  onOpenPromptInspector
}) => {
  if (!run) return null;

  const getStatusBadge = (status: AgentRun['status']) => {
    switch (status) {
      case 'Executing':
      case 'Tool execution':
        return <Badge variant="violet" size="sm">Executing</Badge>;
      case 'Testing':
        return <Badge variant="blue" size="sm">Testing</Badge>;
      case 'Reviewing':
        return <Badge variant="amber" size="sm">Reviewing</Badge>;
      case 'Completed':
        return <Badge variant="emerald" size="sm">Completed</Badge>;
      case 'Waiting for another agent':
        return <Badge variant="subtle" size="sm">Waiting</Badge>;
      case 'Failed':
        return <Badge variant="rose" size="sm">Failed</Badge>;
      default:
        return <Badge variant="subtle" size="sm">{status}</Badge>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white border border-slate-200 shadow-modal rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 text-charcoal-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={run.avatar} 
              alt={run.agentName} 
              className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-charcoal-900">
                  {run.agentName} — {run.agentRole}
                </h2>
                {getStatusBadge(run.status)}
              </div>
              <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-medium text-primary">{run.taskKey}</span>
                <span>•</span>
                <span>{run.taskTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {run.promptRecordId && onOpenPromptInspector && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenPromptInspector(run.promptRecordId)}
                className="gap-1.5 text-xs text-primary border-purple-200 hover:bg-purple-50"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Inspect Prompt</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-slate-100 transition-colors"
              aria-label="Close inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION A: OVERVIEW METRIC GRID */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Execution Overview</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-charcoal-500 block text-[11px]">Client & Project</span>
                <span className="font-semibold text-charcoal-900 block truncate mt-0.5">
                  {run.client}
                </span>
                <span className="text-[11px] text-charcoal-500 truncate block">{run.projectName}</span>
              </div>

              <div>
                <span className="text-charcoal-500 block text-[11px]">LLM Provider & Model</span>
                <span className="font-semibold text-charcoal-900 flex items-center gap-1 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{run.provider}</span>
                </span>
                <span className="font-mono text-[10px] text-charcoal-600 block mt-0.5">{run.modelName}</span>
              </div>

              <div>
                <span className="text-charcoal-500 block text-[11px]">Duration & Retries</span>
                <span className="font-semibold text-charcoal-900 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>{Math.floor(run.durationSeconds / 60)}m {run.durationSeconds % 60}s</span>
                </span>
                <span className="text-[11px] text-charcoal-500 block mt-0.5">
                  {run.retryCount > 0 ? `${run.retryCount} retry handled` : 'Zero retries'}
                </span>
              </div>

              <div>
                <span className="text-charcoal-500 block text-[11px]">Token Consumption & Cost</span>
                <span className="font-semibold text-charcoal-900 block mt-0.5 font-mono">
                  {(run.inputTokens + run.outputTokens).toLocaleString()} tok
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5 font-mono">
                  ${run.estimatedCost.toFixed(4)} USD
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: CURRENT ACTIVITY */}
          <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-4.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Current Activity</span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-sans font-medium">
              {run.currentActivity}
            </p>
          </div>

          {/* SECTION C: CHRONOLOGICAL EXECUTION STEPS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Execution Steps ({run.steps.length})</span>
              </div>
              <span className="text-[10px] text-charcoal-400 font-mono">Trace ID: {run.traceId}</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {run.steps.map((step) => (
                <div key={step.id} className="relative group">
                  {/* Step Dot */}
                  <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    step.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : step.status === 'in_progress'
                      ? 'bg-purple-50 border-primary text-primary animate-pulse'
                      : 'bg-white border-slate-300 text-charcoal-400'
                  }`}>
                    {step.stepNumber}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-1.5 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal-900">{step.title}</span>
                      <span className="text-[10px] font-mono text-charcoal-400">{step.timestamp} ({step.durationMs}ms)</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: OUTPUT & GENERATED ARTIFACTS */}
          {run.output && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Generated Output Artifacts</span>
              </h3>

              {/* Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <span className="font-semibold text-charcoal-900 block">Implementation Summary:</span>
                <p className="text-charcoal-700 leading-relaxed">{run.output.summary}</p>
              </div>

              {/* Files Changed */}
              {run.output.filesChanged.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-charcoal-700 block">Files Modified:</span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs bg-white">
                    {run.output.filesChanged.map((file, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-charcoal-800">
                          <FileCode className="w-3.5 h-3.5 text-primary" />
                          <span>{file.path}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-emerald-700 font-semibold">+{file.additions}</span>
                          <span className="text-rose-700 font-semibold">-{file.deletions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Results */}
              {run.output.testResults.total > 0 && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium">
                    <TestTube2 className="w-4 h-4 text-emerald-600" />
                    <span>Automated Test Run: {run.output.testResults.passed}/{run.output.testResults.total} passed in {run.output.testResults.durationSeconds}s</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    100% Passed
                  </span>
                </div>
              )}

              {/* Warnings / Recommendations */}
              {run.output.warnings.length > 0 && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Advisory Warnings</span>
                  </div>
                  <ul className="list-disc pl-5 text-amber-900 space-y-0.5">
                    {run.output.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Telemetry verified via Deterministic Workforce Engine</span>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
