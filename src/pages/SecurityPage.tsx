import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Globe, 
  UserCheck, 
  FileText, 
  AlertTriangle, 
  Download, 
  FolderGit2, 
  Search
} from 'lucide-react';
import { mockAuditLogs } from '../data/mockData';

export const SecurityPage: React.FC = () => {
  // Navigation / active sub-section tab
  const [activeSection, setActiveSection] = useState<
    | 'tenant'
    | 'repo'
    | 'sandbox'
    | 'egress'
    | 'agents'
    | 'approvals'
    | 'audit'
  >('tenant');

  // Working interactive security policy toggles
  const [policies, setPolicies] = useState({
    strictTenantIsolation: true,
    isolatedKmsEnvelopes: true,
    defaultBranchProtection: true,
    disallowDirectMainPush: true,
    secretScanningOnCommit: true,
    ephemeralSandboxWipe: true,
    strictMemoryBoundLimits: true,
    defaultDenyEgress: true,
    allowlistRegistriesOnly: true,
    roleBasedAgentCaps: true,
    dualCustodyProdMerge: true,
    dualCustodyDbMigrations: true,
    spendCapEnforcement: true
  });

  const [searchAuditQuery, setSearchAuditQuery] = useState('');
  const [exportNotice, setExportNotice] = useState(false);

  const togglePolicy = (key: keyof typeof policies) => {
    setPolicies(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportAuditBundle = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  // Filter audit logs
  const filteredAuditLogs = mockAuditLogs.filter(log =>
    log.action.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
    log.actor.name.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchAuditQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Simulation Prototype Disclaimer */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 font-mono">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>ENTERPRISE SECURITY SANDBOX:</strong> Policy controls, egress rules, and audit logs are interactive frontend prototype simulations. No production cloud infrastructure or IAM roles are mutated.
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 shrink-0">
          Governance Prototype
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Enterprise Security & Dual-Custody Governance
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-violet-950/80 text-violet-300 border border-violet-800/40">
              SOC 2 / FEDRAMP SPEC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-trust container isolation, network egress firewalls, client multi-tenant encryption, and tamper-evident audit trails.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          {exportNotice && (
            <span className="text-xs font-mono text-emerald-400 animate-in fade-in">
              Audit bundle exported (SHA-256 verified)
            </span>
          )}
          <button
            onClick={handleExportAuditBundle}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-mono text-slate-200 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Export Audit Bundle</span>
          </button>
        </div>
      </div>

      {/* 7 Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800 text-xs font-mono">
        {[
          { id: 'tenant', label: '1. Tenant Isolation', icon: Lock },
          { id: 'repo', label: '2. Repository Permissions', icon: FolderGit2 },
          { id: 'sandbox', label: '3. Sandbox Policies', icon: Server },
          { id: 'egress', label: '4. Network Egress', icon: Globe },
          { id: 'agents', label: '5. Agent Permissions', icon: UserCheck },
          { id: 'approvals', label: '6. Human Approval Rules', icon: ShieldCheck },
          { id: 'audit', label: '7. Immutable Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SECTION 1: TENANT ISOLATION
         ========================================================================= */}
      {activeSection === 'tenant' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Multi-Client Tenant Boundary & Cryptographic Isolation
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                ENFORCED (LEVEL 4)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Ensures complete memory, filesystem, and context isolation between enterprise client accounts. Code from Acme Digital Agency is guaranteed never to leak or co-mingle with Northstar Commerce or Vertex Technologies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Client-Level Repository Isolation
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Restricts autonomous employee executions to strictly namespaced Git repositories belonging to the verified tenant ID.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('strictTenantIsolation')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.strictTenantIsolation ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.strictTenantIsolation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Dedicated KMS Envelope Encryption Keys
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Every tenant uses a separate AWS KMS / GCP Cloud KMS customer-managed key (CMK) for secret token masking.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('isolatedKmsEnvelopes')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.isolatedKmsEnvelopes ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.isolatedKmsEnvelopes ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tenant Mapping Status */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-2">
              <span className="text-slate-400 font-semibold block text-[11px]">
                Active Client Tenant Enclaves (3 / 3 Verified):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-200 font-semibold block">Acme Digital Agency</span>
                  <span className="text-slate-500 text-[10px]">KMS: arn:aws:kms:us-east-1:acme-9921</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-200 font-semibold block">Northstar Commerce</span>
                  <span className="text-slate-500 text-[10px]">KMS: arn:aws:kms:us-east-1:north-4819</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-200 font-semibold block">Vertex Technologies</span>
                  <span className="text-slate-500 text-[10px]">KMS: arn:aws:kms:us-east-1:vtx-1102</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: REPOSITORY PERMISSIONS
         ========================================================================= */}
      {activeSection === 'repo' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Repository Permissions & Branch Guardrails
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                BRANCH PROTECTION ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Default Branch Protection
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Prohibits autonomous agents from writing directly to <code>main</code> or <code>production</code>.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('defaultBranchProtection')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.defaultBranchProtection ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.defaultBranchProtection ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Restricted Production Access
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Agent branches restricted strictly to <code>forge/*</code> naming patterns.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('disallowDirectMainPush')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.disallowDirectMainPush ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.disallowDirectMainPush ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Pre-Commit Secret Scanning
                  </span>
                  <p className="text-[11px] text-slate-400">
                    TruffleHog & high-entropy secret scanner blocks commit if API keys or tokens are detected.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('secretScanningOnCommit')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.secretScanningOnCommit ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.secretScanningOnCommit ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: SANDBOX POLICIES
         ========================================================================= */}
      {activeSection === 'sandbox' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Execution Sandbox Lifecycle & Resource Bounds
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                GVisor Container Runtime
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Ephemeral Container Lifecycle
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Containers are provisioned on demand with 15-minute maximum timeout and non-persistent tmpfs storage.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('ephemeralSandboxWipe')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.ephemeralSandboxWipe ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.ephemeralSandboxWipe ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Resource Capping (CPU & Memory Bounds)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Caps runner processes at 4 vCPUs and 8 GB RAM to eliminate denial-of-service loops and runaway builds.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('strictMemoryBoundLimits')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.strictMemoryBoundLimits ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.strictMemoryBoundLimits ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Sandbox telemetry */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
              <span className="text-slate-400">Active Runner Sandboxes:</span>
              <span className="text-emerald-400 font-semibold">2 Running / 6 Spun Down in Last Hour</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: NETWORK EGRESS POLICIES
         ========================================================================= */}
      {activeSection === 'egress' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Zero-Trust Network Egress & Allowlisted Registries
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                DEFAULT-DENY ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Default-Deny Egress Firewall
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Blocks all outbound raw TCP/UDP socket connections. Agents cannot exfiltrate code to unauthorized hosts.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('defaultDenyEgress')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.defaultDenyEgress ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.defaultDenyEgress ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Allowlisted Package Registries Only
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Dependency downloads restricted strictly to verified public registries and internal Artifactory.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('allowlistRegistriesOnly')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.allowlistRegistriesOnly ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.allowlistRegistriesOnly ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Allowed Domains List */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <span className="text-slate-400 font-semibold block text-[11px]">
                Authorized Outbound Egress Gateways:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  registry.npmjs.org:443
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  npm.pkg.github.com:443
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  pypi.org:443
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  api.anthropic.com:443
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  api.openai.com:443
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: AGENT PERMISSIONS
         ========================================================================= */}
      {activeSection === 'agents' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Role-Based Agent Capabilities & Secret Restrictions
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Principle of Least Privilege (PoLP)
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Alex', role: 'AI Product Manager', read: 'Backlog, PRs, Docs', write: 'Task Specs, Issue Comments', forbidden: 'Source Code Files' },
                { name: 'Marcus', role: 'AI Software Architect', read: 'Full AST, Dependencies, Specs', write: 'Architecture Blueprints, RFCs', forbidden: 'Direct Commit, Deploy' },
                { name: 'Devon', role: 'AI Full-Stack Developer', read: 'Codebase, Tests, Config', write: 'forge/* Feature Branches', forbidden: 'main, Production Config' },
                { name: 'Tessa', role: 'AI QA Engineer', read: 'Source Code, Test Fixtures', write: 'Test Files, Coverage Reports', forbidden: 'Core Production Code' },
                { name: 'Elena', role: 'AI Code Reviewer', read: 'AST, Diff Patches, Lint Rules', write: 'PR Comments, Review Approvals', forbidden: 'Direct Branch Pushes' }
              ].map((agent) => (
                <div
                  key={agent.name}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-200">{agent.name}</span>
                    <span className="text-slate-500">({agent.role})</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <div>
                      <span className="text-slate-500">Read: </span>
                      <span className="text-emerald-400">{agent.read}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Write: </span>
                      <span className="text-violet-400">{agent.write}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Blocked: </span>
                      <span className="text-rose-400">{agent.forbidden}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 6: HUMAN APPROVAL RULES
         ========================================================================= */}
      {activeSection === 'approvals' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Dual-Custody Human-in-the-Loop Sign-off Rules
                </h2>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                MANDATORY GATES
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Production PR Merge Gate
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Mandates human engineering lead sign-off before any PR merges to main.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('dualCustodyProdMerge')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.dualCustodyProdMerge ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.dualCustodyProdMerge ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Database Schema Migration Gate
                  </span>
                  <p className="text-[11px] text-slate-400">
                    DDL schema changes and Prisma/TypeORM migrations require dual-custody verification.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('dualCustodyDbMigrations')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.dualCustodyDbMigrations ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.dualCustodyDbMigrations ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 block">
                    Task Cost Ceiling ($10.00 Limit)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Tasks projected to consume &gt;$10 in inference tokens require pre-authorization.
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy('spendCapEnforcement')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    policies.spendCapEnforcement ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      policies.spendCapEnforcement ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 7: IMMUTABLE AUDIT LOGS
         ========================================================================= */}
      {activeSection === 'audit' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white font-mono uppercase">
                  Cryptographically Attested Audit Trail
                </h2>
              </div>

              {/* Search Audit Logs */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by actor, action, or SHA..."
                  value={searchAuditQuery}
                  onChange={(e) => setSearchAuditQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500 w-64"
                />
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor / Agent</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target Resource</th>
                    <th className="py-2.5 px-3">SHA-256 Attestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {log.actor.name}
                      </td>
                      <td className="py-2.5 px-3 text-violet-300">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                        {log.target}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-500">
                        <code>{log.id.slice(0, 8)}:sha256:verified</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
