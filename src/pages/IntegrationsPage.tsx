import React, { useState } from 'react';
import { 
  GitBranch, 
  MessageSquare, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  AlertCircle, 
  Key, 
  ShieldCheck,
  X,
  Check
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  iconType: 'github' | 'linear' | 'jira' | 'slack' | 'anthropic' | 'openai';
  status: 'connected' | 'disconnected' | 'action_required';
  connectedResource: string;
  authType: string;
  syncFrequency: string;
  lastSynced: string;
  apiEndpoint: string;
  scopes: string[];
}

const initialIntegrations: IntegrationItem[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control & PR Automation',
    description: 'Repository AST indexing, automated branch management, pull request dispatch, and review webhook listeners.',
    iconType: 'github',
    status: 'connected',
    connectedResource: 'github.com/acme-org (14 repos)',
    authType: 'GitHub App (Installation ID: 41829)',
    syncFrequency: 'Real-time Webhook',
    lastSynced: '2 minutes ago',
    apiEndpoint: 'https://api.github.com',
    scopes: ['repo:write', 'pull_request:write', 'issues:read', 'workflow:trigger']
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'Issue Tracking & Sprint Orchestration',
    description: 'Bi-directional issue state synchronization, backlog parsing, subtask decomposition, and sprint cycle mapping.',
    iconType: 'linear',
    status: 'connected',
    connectedResource: 'linear.app/acme-digital (Team: ENG)',
    authType: 'OAuth2 Client Credentials',
    syncFrequency: 'Every 5 minutes',
    lastSynced: '14 minutes ago',
    apiEndpoint: 'https://api.linear.app/graphql',
    scopes: ['issues:read', 'issues:write', 'comments:create', 'cycles:read']
  },
  {
    id: 'jira',
    name: 'Jira Software',
    category: 'Enterprise Project Management',
    description: 'Atlassian Cloud issue ingestion, acceptance criteria extraction, sprint workflow status transitions, and audit linking.',
    iconType: 'jira',
    status: 'connected',
    connectedResource: 'acme-digital.atlassian.net (Project: FORGE)',
    authType: 'Atlassian Connect JWT',
    syncFrequency: 'Webhook + Polling (10m)',
    lastSynced: '6 minutes ago',
    apiEndpoint: 'https://api.atlassian.com/ex/jira/acme',
    scopes: ['read:jira-work', 'write:jira-work', 'manage:jira-configuration']
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Engineering Communication & HITL Alerts',
    description: 'Real-time engineering alerts, human-in-the-loop interactive approval cards, and conversational status queries.',
    iconType: 'slack',
    status: 'connected',
    connectedResource: '#eng-workforce-ops (28 engineers)',
    authType: 'Slack Bot User OAuth Token',
    syncFrequency: 'Instant Streaming (Socket Mode)',
    lastSynced: 'Live (Socket active)',
    apiEndpoint: 'https://slack.com/api',
    scopes: ['chat:write', 'commands', 'incoming-webhook', 'channels:read']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'LLM Inference Enclave',
    description: 'Direct high-throughput API enclave for Claude 3.5 Sonnet and Haiku. Handles architectural analysis and implementation patches.',
    iconType: 'anthropic',
    status: 'connected',
    connectedResource: 'Direct Enterprise Enclave (Zero Retention)',
    authType: 'API Token (Encrypted KMS)',
    syncFrequency: 'Sub-second Streaming',
    lastSynced: 'Active Session',
    apiEndpoint: 'https://api.anthropic.com/v1',
    scopes: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'LLM Inference Enclave',
    description: 'GPT-4o and o1-preview reasoning engines utilized for multi-step task decomposition and formal invariant verification.',
    iconType: 'openai',
    status: 'connected',
    connectedResource: 'Organization: org-acme-corp-prod',
    authType: 'API Token (Encrypted KMS)',
    syncFrequency: 'Sub-second Streaming',
    lastSynced: 'Active Session',
    apiEndpoint: 'https://api.openai.com/v1',
    scopes: ['gpt-4o', 'o1-preview', 'o1-mini']
  }
];

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(initialIntegrations);
  const [configuringItem, setConfiguringItem] = useState<IntegrationItem | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Toggle connection state (connect / disconnect)
  const handleToggleConnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'connected' ? 'disconnected' : 'connected';
          return {
            ...item,
            status: nextStatus,
            lastSynced: nextStatus === 'connected' ? 'Just now' : 'Disconnected'
          };
        }
        return item;
      })
    );

    const target = integrations.find(i => i.id === id);
    const action = target?.status === 'connected' ? 'disconnected' : 'connected';
    setSavedNotice(`${target?.name} successfully ${action} (Simulated).`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  // Save configuration modal changes
  const handleSaveConfiguration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringItem) return;

    setSavedNotice(`Configuration for ${configuringItem.name} updated successfully.`);
    setConfiguringItem(null);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const getIntegrationLogo = (type: IntegrationItem['iconType']) => {
    switch (type) {
      case 'github':
        return (
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 font-bold">
            <GitBranch className="w-5 h-5 text-violet-400" />
          </div>
        );
      case 'linear':
        return (
          <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-300 font-bold font-mono">
            <span>LIN</span>
          </div>
        );
      case 'jira':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-300 font-bold font-mono">
            <span>JRA</span>
          </div>
        );
      case 'slack':
        return (
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-bold">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
        );
      case 'anthropic':
        return (
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-300 font-bold">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        );
      case 'openai':
        return (
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-300 font-bold">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Simulation Prototype Banner */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 font-mono">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SIMULATED PLATFORM INTEGRATIONS:</strong> All connectors operate with deterministic mock state. No production Git credentials, webhooks, or billing tokens are transmitted.
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 shrink-0">
          Frontend Prototype
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Ecosystem Integrations & Model Enclaves
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {integrations.filter(i => i.status === 'connected').length} OF {integrations.length} CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure VCS webhooks, issue tracking backends, human notification bridges, and zero-retention LLM inference enclaves.
          </p>
        </div>

        {/* Status notice toast */}
        {savedNotice && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      {/* Integrations Grid (6 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const isConnected = item.status === 'connected';

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                isConnected
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700/90 shadow-sm'
                  : 'bg-slate-950/40 border-slate-900 opacity-75'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Logo, Name, Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getIntegrationLogo(item.iconType)}
                    <div>
                      <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {item.name}
                      </h2>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                      isConnected
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.description}
                </p>

                {/* Configuration Meta Details */}
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/60 font-mono text-[11px] text-slate-400">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Resource:</span>
                    <span className="text-slate-200 truncate max-w-[180px] font-medium">
                      {item.connectedResource}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Auth Method:</span>
                    <span className="text-slate-300">{item.authType.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sync Frequency:</span>
                    <span className="text-slate-300">{item.syncFrequency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Last Synced:</span>
                    <span className={isConnected ? 'text-emerald-400' : 'text-slate-500'}>
                      {item.lastSynced}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs font-mono">
                <button
                  onClick={() => setConfiguringItem(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-violet-400" />
                  <span>Configure</span>
                </button>

                <button
                  onClick={() => handleToggleConnect(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    isConnected
                      ? 'text-rose-400 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/40'
                      : 'text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/40'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {configuringItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                {getIntegrationLogo(configuringItem.iconType)}
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    Configure {configuringItem.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {configuringItem.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConfiguringItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveConfiguration} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono uppercase text-[11px] block">
                  API Endpoint / Host URL
                </label>
                <input
                  type="text"
                  defaultValue={configuringItem.apiEndpoint}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono uppercase text-[11px] block">
                  Encrypted Secret Token / Key (Simulated Mask)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••••••••••••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono uppercase text-[11px] block">
                  Target Resource / Workspace
                </label>
                <input
                  type="text"
                  defaultValue={configuringItem.connectedResource}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono uppercase text-[11px] block">
                  Authorized Scopes & Permissions
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {configuringItem.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2 py-0.5 rounded bg-violet-950/60 border border-violet-800/40 text-violet-300 font-mono text-[10px]"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  KMS Envelope Encrypted
                </span>
                <span>Zero Data Retention</span>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setConfiguringItem(null)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-md shadow-violet-950/50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
