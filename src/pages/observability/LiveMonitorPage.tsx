import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Clock, 
  Terminal, 
  Coins, 
  Sparkles, 
  Play,
  Filter
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AgentRun, AgentExecutionStatus } from '../../types/observability';
import { AgentExecutionInspectorModal } from '../../components/observability/AgentExecutionInspectorModal';
import { Button } from '../../components/ui/Button';

export const LiveMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const { agentRuns, selectedRunId, setSelectedRunId } = useWorkspace();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const selectedRun = agentRuns.find(r => r.id === selectedRunId) || agentRuns[0] || null;

  const handleOpenInspector = (run: AgentRun) => {
    setSelectedRunId(run.id);
    setIsInspectorOpen(true);
  };

  const filteredRuns = agentRuns.filter(run => {
    if (statusFilter !== 'ALL' && run.status !== statusFilter) return false;
    if (providerFilter !== 'ALL' && run.provider !== providerFilter) return false;
    return true;
  });

  const getStatusDot = (status: AgentExecutionStatus) => {
    switch (status) {
      case 'Executing':
      case 'Tool execution':
        return <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />;
      case 'Testing':
        return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
      case 'Reviewing':
        return <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
      case 'Completed':
        return <span className="w-2 h-2 rounded-full bg-emerald-500" />;
      case 'Waiting for another agent':
        return <span className="w-2 h-2 rounded-full bg-slate-400" />;
      case 'Failed':
        return <span className="w-2 h-2 rounded-full bg-rose-500" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-400" />;
    }
  };

  const getStatusTextClass = (status: AgentExecutionStatus) => {
    switch (status) {
      case 'Executing':
      case 'Tool execution':
        return 'text-primary font-semibold';
      case 'Testing':
        return 'text-blue-700 font-semibold';
      case 'Reviewing':
        return 'text-amber-700 font-semibold';
      case 'Completed':
        return 'text-emerald-700 font-semibold';
      case 'Waiting for another agent':
        return 'text-charcoal-600 font-medium';
      case 'Failed':
        return 'text-rose-700 font-semibold';
      default:
        return 'text-charcoal-600 font-medium';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20 text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Live Workforce Monitor
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>Real-Time Stream</span>
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time telemetry, model routing, active execution duration, and token cost attribution for autonomous engineering employees.
          </p>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/observability/agent-runs')}
            className="gap-1.5 text-xs text-charcoal-700"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Agent Runs</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/observability/prompt-inspector')}
            className="gap-1.5 text-xs text-primary border-purple-200 hover:bg-purple-50"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Prompt Inspector</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/observability/llm-costs')}
            className="gap-1.5 text-xs"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>LLM Costs</span>
          </Button>
        </div>
      </div>

      {/* Observability Mode Notice */}
      <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs text-purple-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Deterministic Simulation Engine:</strong> Demonstrating telemetry capture from Anthropic, OpenAI, and Google Gemini. Real-time traces and costs stay synchronized across all views.
          </span>
        </div>
        <span className="text-[11px] font-mono text-primary font-semibold shrink-0 hidden sm:inline">
          OpenTelemetry Compatible
        </span>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-charcoal-400 font-semibold uppercase text-[10px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Status:</span>
          </span>
          {['ALL', 'Executing', 'Waiting for another agent', 'Testing', 'Reviewing', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-400 font-semibold uppercase text-[10px]">Provider:</span>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 font-medium focus:outline-none focus:border-primary shadow-xs"
          >
            <option value="ALL">All Providers</option>
            <option value="Anthropic">Anthropic</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Google Gemini">Google Gemini</option>
          </select>
        </div>
      </div>

      {/* Live Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRuns.map((run) => (
          <div
            key={run.id}
            onClick={() => handleOpenInspector(run)}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card hover:border-slate-300 hover:shadow-dropdown transition-all cursor-pointer flex flex-col justify-between group space-y-4"
          >
            {/* Top row: Avatar, Name, Status indicator */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={run.avatar}
                    alt={run.agentName}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-charcoal-900 leading-tight">
                      {run.agentName}
                    </h3>
                    <span className="text-xs text-charcoal-500 block">{run.agentRole}</span>
                  </div>
                </div>

                {/* Subtle status indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
                  {getStatusDot(run.status)}
                  <span className={`text-[11px] ${getStatusTextClass(run.status)}`}>
                    {run.status}
                  </span>
                </div>
              </div>

              {/* Task & Project */}
              <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-primary">{run.taskKey}</span>
                  <span className="text-charcoal-500 truncate max-w-[140px]">{run.projectName}</span>
                </div>
                <p className="text-xs font-semibold text-charcoal-800 line-clamp-1">
                  {run.taskTitle}
                </p>
              </div>

              {/* Plain-Language Current Activity */}
              <div className="mt-3 text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                {run.currentActivity}
              </div>
            </div>

            {/* Bottom Telemetry: Model, Latency, Tokens, Cost */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-charcoal-700">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">{run.provider}</span>
                  <span className="text-charcoal-400">/</span>
                  <span className="text-[11px] text-charcoal-500 truncate max-w-[90px]">{run.modelName}</span>
                </div>

                <div className="text-[11px] text-charcoal-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-charcoal-400" />
                  <span>{Math.floor(run.durationSeconds / 60)}m {run.durationSeconds % 60}s</span>
                </div>
              </div>

              {/* Token & Cost Bar */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div className="text-[11px] font-mono text-charcoal-500">
                  <span className="text-charcoal-800 font-semibold">{(run.inputTokens + run.outputTokens).toLocaleString()}</span> tokens
                  {run.cachedTokens > 0 && <span className="text-purple-600 ml-1">({run.cachedTokens.toLocaleString()} cached)</span>}
                </div>

                <span className="font-mono text-xs font-bold text-emerald-700">
                  ${run.estimatedCost.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Inspector Modal */}
      <AgentExecutionInspectorModal
        run={isInspectorOpen ? selectedRun : null}
        onClose={() => setIsInspectorOpen(false)}
        onOpenPromptInspector={(promptId) => {
          setIsInspectorOpen(false);
          navigate(`/observability/prompt-inspector${promptId ? `?id=${promptId}` : ''}`);
        }}
      />
    </div>
  );
};
