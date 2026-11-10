import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Search, 
  MessageSquare
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AgentRun } from '../../types/observability';
import { AgentExecutionInspectorModal } from '../../components/observability/AgentExecutionInspectorModal';
import { AgentHandoffTimeline } from '../../components/observability/AgentHandoffTimeline';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AgentRunsPage: React.FC = () => {
  const navigate = useNavigate();
  const { agentRuns, agentHandoffs, selectedRunId, setSelectedRunId } = useWorkspace();
  const [activeView, setActiveView] = useState<'runs' | 'handoffs'>('runs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const selectedRun = agentRuns.find(r => r.id === selectedRunId) || agentRuns[0] || null;

  const handleInspectRun = (run: AgentRun) => {
    setSelectedRunId(run.id);
    setIsInspectorOpen(true);
  };

  const filteredRuns = agentRuns.filter(r => {
    if (selectedAgent !== 'ALL' && r.agentName !== selectedAgent) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKey = r.taskKey.toLowerCase().includes(q);
      const matchTitle = r.taskTitle.toLowerCase().includes(q);
      const matchAgent = r.agentName.toLowerCase().includes(q);
      const matchModel = r.modelName.toLowerCase().includes(q);
      return matchKey || matchTitle || matchAgent || matchModel;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20 text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Agent Execution Runs & Handoffs
            </h1>
            <Badge variant="blue" size="sm">
              {agentRuns.length} Active Runs
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Historical and active runtime executions, chronological steps, tool invocations, and agent-to-agent delegation traces.
          </p>
        </div>

        {/* View Switcher: Runs vs Communication Timeline */}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium border border-slate-200">
          <button
            onClick={() => setActiveView('runs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'runs'
                ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-primary" />
            <span>Agent Runs</span>
          </button>

          <button
            onClick={() => setActiveView('handoffs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'handoffs'
                ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Communication Traces</span>
          </button>
        </div>
      </div>

      {activeView === 'runs' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by task, key, model, or agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Agent Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-charcoal-400 font-semibold uppercase text-[10px]">Agent:</span>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 font-medium focus:outline-none focus:border-primary shadow-xs"
                >
                  <option value="ALL">All Agents</option>
                  <option value="Alex">Alex (PM)</option>
                  <option value="Marcus">Marcus (Architect)</option>
                  <option value="Devon">Devon (Developer)</option>
                  <option value="Tessa">Tessa (QA)</option>
                  <option value="Elena">Elena (Reviewer)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-charcoal-400 font-semibold uppercase text-[10px]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 font-medium focus:outline-none focus:border-primary shadow-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Executing">Executing</option>
                  <option value="Waiting for another agent">Waiting for another agent</option>
                  <option value="Testing">Testing</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Runs Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Agent & Role</th>
                    <th className="py-3 px-4">Task & Project</th>
                    <th className="py-3 px-4">Model & Provider</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Tokens</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredRuns.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => handleInspectRun(run)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Agent */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={run.avatar}
                            alt={run.agentName}
                            className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                          />
                          <div>
                            <span className="font-bold text-charcoal-900 block group-hover:text-primary transition-colors">
                              {run.agentName}
                            </span>
                            <span className="text-[10px] text-charcoal-500">{run.agentRole}</span>
                          </div>
                        </div>
                      </td>

                      {/* Task */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          <span className="font-mono text-[10px] font-bold text-primary block">
                            {run.taskKey}
                          </span>
                          <span className="font-medium text-charcoal-800 truncate block">
                            {run.taskTitle}
                          </span>
                        </div>
                      </td>

                      {/* Model */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className="font-semibold text-charcoal-800 block">{run.provider}</span>
                          <span className="text-[10px] text-charcoal-500 block truncate max-w-[120px]">
                            {run.modelName}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                          run.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          run.status === 'Executing' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          run.status === 'Testing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          run.status === 'Reviewing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {run.status}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal-600">
                        {Math.floor(run.durationSeconds / 60)}m {run.durationSeconds % 60}s
                      </td>

                      {/* Tokens */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-medium text-charcoal-800">
                          {(run.inputTokens + run.outputTokens).toLocaleString()}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-700">
                        ${run.estimatedCost.toFixed(4)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectRun(run);
                          }}
                          className="text-primary hover:bg-purple-50"
                        >
                          Inspect →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Agent-to-Agent Communication Timeline */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
          <AgentHandoffTimeline handoffs={agentHandoffs} />
        </div>
      )}

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
