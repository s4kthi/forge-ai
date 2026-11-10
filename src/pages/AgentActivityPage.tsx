import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const AgentActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { agents, collaborations, tasks } = useWorkspace();

  const [selectedCollabId, setSelectedCollabId] = useState<string>(collaborations[0]?.id || '');
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState<number>(collaborations[0]?.messages.length || 8);

  const activeCollab = collaborations.find(c => c.id === selectedCollabId) || collaborations[0];
  const relatedTask = tasks.find(t => t.id === activeCollab?.taskId) || tasks[0];

  // Simulation playback handler
  const handlePlaySimulation = () => {
    setVisibleMessageCount(1);
    setIsPlayingSimulation(true);

    let count = 1;
    const interval = setInterval(() => {
      count++;
      setVisibleMessageCount(count);
      if (count >= activeCollab.messages.length) {
        clearInterval(interval);
        setIsPlayingSimulation(false);
      }
    }, 1200);
  };

  const handleResetSimulation = () => {
    setVisibleMessageCount(activeCollab.messages.length);
    setIsPlayingSimulation(false);
  };

  const getAgentAvatar = (name: string) => {
    const found = agents.find(a => a.name === name);
    return found?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  };

  const getAgentRole = (name: string) => {
    const found = agents.find(a => a.name === name);
    return found?.role || 'AI Employee';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Agent Activity & Collaboration
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              5 Agents Collaborating
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time chronological timeline of autonomous AI agents communicating, debating architecture, writing code, and validating test suites.
          </p>
        </div>

        {/* Prototype notice */}
        <div className="text-[11px] font-mono text-charcoal-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Deterministic Simulation Mode
        </div>
      </div>

      {/* =========================================================================
          SECTION A: AGENT OVERVIEW CARDS
         ========================================================================= */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
          Active Engineering Workforce
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-card hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-charcoal-900 leading-none">
                        {agent.name}
                      </h3>
                      <span className="text-[11px] text-charcoal-500 mt-0.5 block">
                        {agent.role}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    agent.status === 'Working' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    agent.status === 'Reviewing' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    agent.status === 'Planning' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-charcoal-700">
                  <span className="text-[10px] text-charcoal-400 font-semibold block uppercase">Current Assignment</span>
                  <p className="line-clamp-2 mt-0.5 font-medium">
                    {agent.currentTaskTitle}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-500">
                <span>{agent.tasksCompleted} completed</span>
                <span className="text-emerald-700 font-semibold">{agent.successRate}% success</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION B & C: COLLABORATION TIMELINE & TASK EXECUTION VIEW
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =======================================================================
            SECTION B: COLLABORATION TIMELINE (7 cols)
           ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            {/* Timeline Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-charcoal-900">
                    Inter-Agent Collaboration Timeline
                  </h2>
                </div>
                <span className="text-xs text-charcoal-500">
                  Task: <strong>{activeCollab.taskTitle}</strong>
                </span>
              </div>

              {/* Simulation Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlaySimulation}
                  disabled={isPlayingSimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-primary hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingSimulation ? 'Playing...' : 'Replay Discussion'}</span>
                </button>

                <button
                  onClick={handleResetSimulation}
                  className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                  title="Show all messages"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Thread selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {collaborations.map(collab => (
                <button
                  key={collab.id}
                  onClick={() => {
                    setSelectedCollabId(collab.id);
                    setVisibleMessageCount(collab.messages.length);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCollab.id === collab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-slate-100 text-charcoal-600 hover:bg-slate-200'
                  }`}
                >
                  {collab.taskTitle}
                </button>
              ))}
            </div>

            {/* Chronological Message Flow */}
            <div className="space-y-4 pt-2">
              {activeCollab.messages.slice(0, visibleMessageCount).map((msg) => {
                const fromAvatar = getAgentAvatar(msg.fromAgent);
                const toAvatar = getAgentAvatar(msg.toAgent);
                const fromRole = getAgentRole(msg.fromAgent);
                const toRole = getAgentRole(msg.toAgent);

                return (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5 shadow-xs animate-in fade-in duration-300"
                  >
                    {/* Handoff Header: Agent A -> Agent B */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Sender */}
                        <div className="flex items-center gap-1.5">
                          <img
                            src={fromAvatar}
                            alt={msg.fromAgent}
                            className="w-5 h-5 rounded-full border border-slate-200 object-cover"
                          />
                          <span className="font-bold text-xs text-charcoal-900">{msg.fromAgent}</span>
                          <span className="text-[10px] text-charcoal-500">({fromRole})</span>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-primary" />

                        {/* Recipient */}
                        <div className="flex items-center gap-1.5">
                          <img
                            src={toAvatar}
                            alt={msg.toAgent}
                            className="w-5 h-5 rounded-full border border-slate-200 object-cover"
                          />
                          <span className="font-bold text-xs text-charcoal-900">{msg.toAgent}</span>
                          <span className="text-[10px] text-charcoal-500">({toRole})</span>
                        </div>
                      </div>

                      <span className="text-[10px] text-charcoal-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Bubble Text */}
                    <p className="text-xs text-charcoal-800 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200/80">
                      &ldquo;{msg.content}&rdquo;
                    </p>

                    {/* Status Badge if present */}
                    {msg.statusBadge && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {msg.statusBadge}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =======================================================================
            SECTION C: TASK EXECUTION & CONTEXT INSPECTION (5 cols)
           ======================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Related Task Context Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                Task Execution Scope
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-primary border border-purple-200">
                Stage: {activeCollab.stage}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {relatedTask.key}
                </span>
                <h3 className="font-bold text-sm text-charcoal-900">
                  {relatedTask.title}
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                {relatedTask.description}
              </p>
            </div>

            {/* Git Branch & Files Changed */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Repository:</span>
                <span className="text-charcoal-900 font-semibold">{relatedTask.repository}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Feature Branch:</span>
                <span className="text-primary font-semibold">forge/devon/fix-email-validation</span>
              </div>
              {relatedTask.diffStats && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-charcoal-500">Patch Stats:</span>
                  <span className="text-charcoal-800">
                    <strong className="text-emerald-600">+{relatedTask.diffStats.additions}</strong> / <strong className="text-rose-600">-{relatedTask.diffStats.deletions}</strong> in {relatedTask.diffStats.files} files
                  </span>
                </div>
              )}
            </div>

            {/* Participating Agents in Thread */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-charcoal-500 block uppercase">
                Participating Workforce:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCollab.participatingAgents.map(agentName => (
                  <div
                    key={agentName}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-charcoal-800 text-xs font-medium"
                  >
                    <img
                      src={getAgentAvatar(agentName)}
                      alt={agentName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{agentName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance Criteria Status */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-charcoal-500 block uppercase">
                Acceptance Criteria Verification:
              </span>
              <div className="space-y-1.5">
                {relatedTask.acceptanceCriteria.map((ac, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-charcoal-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ac}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Link to Approval Dossier */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate('/approvals')}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Review Completed Code in Approvals Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
