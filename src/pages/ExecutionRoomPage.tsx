import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Terminal as TerminalIcon, 
  Activity, 
  GitFork, 
  FileCode, 
  CheckCircle2, 
  Cpu, 
  Coins, 
  GitBranch, 
  ChevronRight, 
  AlertTriangle,
  FolderGit2,
  SlidersHorizontal,
  FastForward,
  ShieldCheck
} from 'lucide-react';
import { 
  mockExecutionScenarios, 
  type ExecutionTaskScenario, 
  type SimulationStep 
} from '../data/simulationScenarios';
import { WorkflowVisualization } from '../components/execution-room/WorkflowVisualization';
import { DiffViewer } from '../components/execution-room/DiffViewer';
import { AgentHandoffsView, type HandoffRecord } from '../components/execution-room/AgentHandoffsView';
import { TestResultsView, type TestCaseItem } from '../components/execution-room/TestResultsView';
import { mockExecutions } from '../data/mockData';

type TabType = 'terminal' | 'activity' | 'files' | 'handoffs' | 'tests';

export const ExecutionRoomPage: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(mockExecutionScenarios[0].id);
  const scenario: ExecutionTaskScenario = 
    mockExecutionScenarios.find((s: ExecutionTaskScenario) => s.id === selectedScenarioId) || mockExecutionScenarios[0];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>('terminal');

  // Terminal & activity autoscroll refs
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);

  // Current step state
  const currentStep: SimulationStep = scenario.steps[currentStepIndex] || scenario.steps[0];
  const isFinished = currentStepIndex >= scenario.steps.length - 1;

  // Timer loop for simulation
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    const baseDelay = 1400;
    const delay = Math.max(500, baseDelay / speedMultiplier);
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev: number) => {
        if (prev < scenario.steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, isFinished, speedMultiplier, scenario.steps]);

  // Autoscroll terminal & activity
  useEffect(() => {
    if (activeTab === 'terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStepIndex, activeTab]);

  useEffect(() => {
    if (activeTab === 'activity' && activityEndRef.current) {
      activityEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStepIndex, activeTab]);

  // Aggregated data up to current step
  const accumulatedSteps = scenario.steps.slice(0, currentStepIndex + 1);
  const terminalHistory = accumulatedSteps.flatMap((s: SimulationStep) => s.terminalOutput);

  // Cumulative tokens & costs
  const totalInputTokens = accumulatedSteps.reduce((acc: number, s: SimulationStep) => acc + s.tokensInputIncrement, 14200);
  const totalOutputTokens = accumulatedSteps.reduce((acc: number, s: SimulationStep) => acc + s.tokensOutputIncrement, 3850);
  const totalCost = scenario.baseCost + accumulatedSteps.reduce((acc: number, s: SimulationStep) => acc + s.costIncrement, 0);

  // Accumulated handoff records
  const accumulatedHandoffs: HandoffRecord[] = accumulatedSteps
    .filter((s: SimulationStep) => Boolean(s.handoff))
    .map((s: SimulationStep, idx: number) => {
      const h = s.handoff!;
      return {
        id: `hoff-${idx}-${s.stepIndex}`,
        from: h.from,
        to: h.to,
        timestamp: `10:${42 + s.stepIndex}:18 UTC`,
        reason: h.reason,
        artifact: h.artifact,
        signature: `ed25519:sha256:${(s.tokensInputIncrement * 7919).toString(16).slice(0, 12)}`,
        status: idx === 0 ? 'Verified' : 'In Progress'
      };
    });

  // Test cases synthesis
  const sampleTestCases: TestCaseItem[] = [
    {
      id: 'tc-01',
      name: 'verify_passkey_attestation_signature_validation',
      suite: 'FIDO2 Enclave Protocol',
      duration: '42ms',
      status: 'passed',
      assertionCount: 4
    },
    {
      id: 'tc-02',
      name: 'enforce_relying_party_origin_isolation',
      suite: 'WebAuthn Spec Compliance',
      duration: '18ms',
      status: 'passed',
      assertionCount: 3
    },
    {
      id: 'tc-03',
      name: 'hardware_counter_anti_cloning_verification',
      suite: 'Authenticator Security Profile',
      duration: '65ms',
      status: 'passed',
      assertionCount: 6
    },
    {
      id: 'tc-04',
      name: 'graceful_rejection_of_untrusted_intermediate_ca',
      suite: 'Root CA Hierarchy',
      duration: '29ms',
      status: 'passed',
      assertionCount: 2
    }
  ];

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex((prev: number) => prev + 1);
    }
  };

  const agentAvatars: Record<string, string> = {
    'Devon': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'Marcus': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'Tessa': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'Elena': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'Alex': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  };

  return (
    <div className="space-y-4">
      {/* Top Controller Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-violet-400 bg-violet-950/50 px-2 py-0.5 rounded border border-violet-800/30">
                LIVE RUNTIME INSPECTION
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">SESSION: {scenario.id}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
              {scenario.title}
            </h1>
          </div>
        </div>

        {/* Runtime Simulation Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Scenario Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {mockExecutionScenarios.map((s: ExecutionTaskScenario) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.client} / {s.repository}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Speed selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-1 rounded transition-colors ${speedMultiplier === s ? 'bg-violet-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFinished && !isPlaying}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : isFinished
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-900/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isFinished ? 'Execution Complete' : 'Run Agent'}</span>
              </>
            )}
          </button>

          {/* Step forward */}
          <button
            onClick={handleStepForward}
            disabled={isFinished}
            title="Step forward one action"
            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset simulation to beginning"
            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Workflow Stepper */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
            <span>AUTONOMOUS WORKFLOW PIPELINE</span>
          </div>
          <div className="font-mono text-slate-400">
            Phase <span className="text-violet-400 font-semibold">{currentStep.stage}</span> (Step {currentStepIndex + 1}/{scenario.steps.length})
          </div>
        </div>
        <WorkflowVisualization currentStage={currentStep.stage} />
      </div>

      {/* 3-Panel Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* =========================================================================
            LEFT PANEL: Execution Context & Live Timeline (3 Cols)
           ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Metadata Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Task Context</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                Active Session
              </span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Client Organization</span>
                <span className="text-slate-200 font-medium">{scenario.client}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Repository & Branch</span>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-slate-300">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scenario.repository}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-violet-400 bg-violet-950/40 border border-violet-900/30 px-2 py-0.5 rounded w-fit">
                  <GitBranch className="w-3 h-3" />
                  <span>{scenario.branch}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Active AI Employee</span>
                <div className="flex items-center gap-2.5 mt-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <img
                    src={agentAvatars[currentStep.agent] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentStep.agent}
                    className="w-8 h-8 rounded-full border border-violet-500/30 object-cover"
                  />
                  <div>
                    <div className="text-slate-200 font-medium leading-none">{currentStep.agent}</div>
                    <div className="text-[10px] text-violet-400 font-mono mt-0.5">
                      {currentStep.agentRole}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-slate-500 text-[11px] block mb-1">Target Acceptance Criteria</span>
                <ul className="space-y-1">
                  <li className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                    <span>Passes FIDO2 hardware attestation validation suite</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                    <span>Enforces zero-regressions on token verification routines</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Execution Timeline Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Step Execution Trace</span>
              <span className="font-mono text-[10px] text-slate-500">
                {currentStepIndex + 1} of {scenario.steps.length}
              </span>
            </h2>

            <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
              {scenario.steps.map((st: SimulationStep, idx: number) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={st.stepIndex}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`group relative text-xs cursor-pointer transition-all rounded p-1.5 ${
                      isCurrent
                        ? 'bg-violet-950/40 border border-violet-800/40 text-slate-100'
                        : isPassed
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 opacity-60'
                    }`}
                  >
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[19px] top-2.5 w-2.5 h-2.5 rounded-full border transition-all ${
                        isCurrent
                          ? 'bg-violet-500 border-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.8)]'
                          : isPassed
                          ? 'bg-emerald-500 border-emerald-400'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    />

                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className={isCurrent ? 'text-violet-300 font-semibold' : 'text-slate-400'}>
                        {st.stage}
                      </span>
                      <span className="text-slate-500">{st.agent}</span>
                    </div>
                    <div className="text-[11px] font-sans truncate mt-0.5 text-slate-300 group-hover:text-white">
                      {st.activityMessage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTER PANEL: Multi-Tab Engineering Workspace (6 Cols)
           ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden min-h-[580px]">
          {/* Tabs Header */}
          <div className="flex items-center justify-between bg-slate-950/90 border-b border-slate-800 px-3 pt-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all shrink-0 ${
                  activeTab === 'terminal'
                    ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>Terminal</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-normal">
                  {terminalHistory.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all shrink-0 ${
                  activeTab === 'activity'
                    ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Activity Stream</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-normal">
                  {accumulatedSteps.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all shrink-0 ${
                  activeTab === 'files'
                    ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Files Changed</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-normal">
                  {scenario.files.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('handoffs')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all shrink-0 ${
                  activeTab === 'handoffs'
                    ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Agent Handoffs</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-normal">
                  {accumulatedHandoffs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all shrink-0 ${
                  activeTab === 'tests'
                    ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Results</span>
                {currentStep.testSummary && (
                  <span className={`text-[10px] px-1 rounded font-normal ${
                    currentStep.testSummary.failed > 0
                      ? 'bg-red-950 text-red-400'
                      : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {currentStep.testSummary.passed}/{currentStep.testSummary.total}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 bg-slate-950/60 p-4 overflow-y-auto max-h-[640px]">
            {/* 1. TERMINAL VIEW */}
            {activeTab === 'terminal' && (
              <div className="font-mono text-xs space-y-1.5 leading-relaxed">
                <div className="text-slate-600 pb-2 border-b border-slate-900 select-none">
                  FORGE Autonomous Runner v4.12.0-rc [node: v20.11.0, container: sandboxed-isolated-ns]
                </div>
                {terminalHistory.map((line: string, idx: number) => {
                  const isCmd = line.startsWith('$');
                  const isErr = line.includes('FAIL') || line.includes('ERR') || line.includes('error');
                  const isOk = line.includes('PASS') || line.includes('success') || line.includes('Ready');
                  return (
                    <div
                      key={idx}
                      className={`${
                        isCmd
                          ? 'text-cyan-400 font-semibold pt-1'
                          : isErr
                          ? 'text-red-400 bg-red-950/20 px-1 rounded'
                          : isOk
                          ? 'text-emerald-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
                {isPlaying && (
                  <div className="flex items-center gap-2 text-violet-400 animate-pulse pt-1">
                    <span className="inline-block w-2 h-3.5 bg-violet-400" />
                    <span className="text-[11px] text-slate-500">Autonomous execution thread active...</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            )}

            {/* 2. ACTIVITY STREAM VIEW */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {accumulatedSteps.map((st: SimulationStep, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="font-mono text-[11px] text-slate-500 shrink-0 mt-0.5">
                      10:{42 + idx}:05
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {st.agent}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border text-violet-400 bg-violet-950/30 border-violet-800/40">
                          {st.stage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal">
                        {st.activityMessage}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={activityEndRef} />
              </div>
            )}

            {/* 3. FILES CHANGED VIEW */}
            {activeTab === 'files' && (
              <DiffViewer files={scenario.files} />
            )}

            {/* 4. AGENT HANDOFFS VIEW */}
            {activeTab === 'handoffs' && (
              <AgentHandoffsView handoffs={accumulatedHandoffs} />
            )}

            {/* 5. TEST RESULTS VIEW */}
            {activeTab === 'tests' && (
              <TestResultsView 
                totalPassed={currentStep.testSummary?.passed ?? 15}
                totalFailed={currentStep.testSummary?.failed ?? 0}
                totalSkipped={0}
                duration="154ms"
                testCases={sampleTestCases}
              />
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: Live Telemetry & Model Metrics (3 Cols)
           ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Progress & Model Spec */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Runtime Telemetry</span>
              <span className="font-mono text-[10px] text-violet-400">
                {currentStep.progressPercent}% COMPLETE
              </span>
            </h2>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${currentStep.progressPercent}%` }}
              />
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Duration</span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {currentStepIndex * 7 + 12}s
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimated Cost</span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-500" />
                  ${totalCost.toFixed(4)}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Input Tokens</span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {totalInputTokens.toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Output Tokens</span>
                <span className="text-sm font-mono font-bold text-violet-300">
                  {totalOutputTokens.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Engine Specs */}
            <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Autonomous Model</span>
                <span className="font-mono text-slate-200 font-semibold">{scenario.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Retry Counter</span>
                <span className="font-mono text-slate-300">0 / 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Memory Footprint</span>
                <span className="font-mono text-slate-300">312 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Safety Guardrails</span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Enforced
                </span>
              </div>
            </div>
          </div>

          {/* Quick Active Task Jump */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Concurrent Task Queue
            </h3>
            <div className="space-y-2">
              {mockExecutions.slice(0, 3).map((exec) => (
                <div
                  key={exec.id}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs hover:border-violet-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                    <span>{exec.projectName}</span>
                    <span className="text-emerald-400">{exec.status}</span>
                  </div>
                  <div className="text-slate-200 font-medium truncate">
                    {exec.taskTitle}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>Agent: {exec.agentCallsign}</span>
                    <span>{exec.durationSeconds ?? 45}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Intervention Notice */}
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <span className="font-semibold text-amber-300 block mb-0.5">Human In The Loop (HITL)</span>
              Auditing gates require human authorization before merging production pull requests.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
