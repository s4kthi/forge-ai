import React, { useState } from 'react';
import { 
  Save, 
  Cpu, 
  Bell, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Terminal
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'model' | 'concurrency' | 'notifications' | 'developer'>('model');
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [architectModel, setArchitectModel] = useState('Claude 3.5 Sonnet (Direct Enclave)');
  const [reviewerModel, setReviewerModel] = useState('GPT-4o (Azure GovCloud Enclave)');
  const [compactionStrategy, setCompactionStrategy] = useState('ast_syntax_preservation');
  const [maxConcurrentAgents, setMaxConcurrentAgents] = useState(8);
  const [perTaskCostCap, setPerTaskCostCap] = useState(10.0);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* Simulation Prototype Banner */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 font-mono">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SETTINGS SANDBOX:</strong> Preferences are stored in client-side state for this demonstration session.
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 shrink-0">
          Local Storage State
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Platform & System Settings
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-violet-950/80 text-violet-300 border border-violet-800/40">
              GLOBAL CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure default LLM orchestration backends, agent concurrency limits, and operational alerts.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings updated successfully
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold transition-all shadow-md shadow-violet-950/40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        {[
          { id: 'model', label: 'Model Orchestration', icon: Cpu },
          { id: 'concurrency', label: 'Concurrency & Cost Limits', icon: Sliders },
          { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell },
          { id: 'developer', label: 'Developer Enclave', icon: Terminal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Model Orchestration */}
      {activeTab === 'model' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white font-mono uppercase">
                Model Routing & Enclave Assignments
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Zero Data Retention Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase text-[11px] block">
                Primary Architect & Planning Model
              </label>
              <select
                value={architectModel}
                onChange={(e) => setArchitectModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              >
                <option value="Claude 3.5 Sonnet (Direct Enclave)">Claude 3.5 Sonnet (Direct Enclave)</option>
                <option value="GPT-4o (Azure GovCloud Enclave)">GPT-4o (Azure GovCloud Enclave)</option>
                <option value="Claude 3.5 Haiku (High-Throughput)">Claude 3.5 Haiku (High-Throughput)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase text-[11px] block">
                Code Review & Auditing Model
              </label>
              <select
                value={reviewerModel}
                onChange={(e) => setReviewerModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              >
                <option value="GPT-4o (Azure GovCloud Enclave)">GPT-4o (Azure GovCloud Enclave)</option>
                <option value="Claude 3.5 Sonnet (Direct Enclave)">Claude 3.5 Sonnet (Direct Enclave)</option>
                <option value="o1-preview (Formal Invariant Engine)">o1-preview (Formal Invariant Engine)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <label className="text-slate-400 uppercase text-[11px] block">
              Context Window Compaction Strategy
            </label>
            <select
              value={compactionStrategy}
              onChange={(e) => setCompactionStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="ast_syntax_preservation">Tree-of-thought AST syntax preservation (Recommended)</option>
              <option value="sliding_window">Linear sliding window with semantic vector summarization</option>
              <option value="raw_truncation">Raw token truncation (Low memory mode)</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 2: Concurrency & Cost Limits */}
      {activeTab === 'concurrency' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white font-mono uppercase">
                Workforce Concurrency & Spend Ceilings
              </h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              Budget Guard Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase text-[11px] block">
                Max Concurrent Autonomous Tasks ({maxConcurrentAgents} Parallel Pods)
              </label>
              <input
                type="range"
                min={1}
                max={16}
                value={maxConcurrentAgents}
                onChange={(e) => setMaxConcurrentAgents(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block">Allocated: {maxConcurrentAgents * 4} vCPUs / {maxConcurrentAgents * 8} GB RAM</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase text-[11px] block">
                Per-Task Automatic Spend Cap ($ USD)
              </label>
              <input
                type="number"
                step="0.5"
                value={perTaskCostCap}
                onChange={(e) => setPerTaskCostCap(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              />
              <span className="text-[11px] text-slate-500 block">Tasks exceeding ${perTaskCostCap.toFixed(2)} require human sign-off</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alerts & Webhooks */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white font-mono uppercase">
                Engineering Incident & HITL Notifications
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Webhooks Configured
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Broadcast Real-time Approval Cards to Slack</div>
                <div className="text-slate-400 text-[11px]">Send interactive 1-click review and merge buttons to #eng-workforce-ops</div>
              </div>
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={(e) => setSlackAlerts(e.target.checked)}
                className="accent-violet-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Daily Executive Delivery Digest via Email</div>
                <div className="text-slate-400 text-[11px]">Summary of merged PRs, token consumption, and regression statistics</div>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="accent-violet-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Developer Enclave */}
      {activeTab === 'developer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white font-mono uppercase">
                Developer Enclave & Debug Hooks
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Platform API Version:</span>
              <span className="text-slate-200 font-bold">FORGE Core v4.12.0-rc [Nitro Enclave Protocol]</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Client SDK Endpoint:</span>
              <span className="text-violet-400">https://api.forge-ai.internal/v1/workforce</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
