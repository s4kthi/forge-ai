import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Info
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// 7-day spending breakdown mock
const dailyCostBreakdown = [
  { day: 'Mon', anthropic: 32.4, openai: 14.2, gemini: 0.8, total: 47.4 },
  { day: 'Tue', anthropic: 41.2, openai: 18.5, gemini: 1.1, total: 60.8 },
  { day: 'Wed', anthropic: 54.8, openai: 21.0, gemini: 1.4, total: 77.2 },
  { day: 'Thu', anthropic: 38.6, openai: 16.8, gemini: 0.9, total: 56.3 },
  { day: 'Fri', anthropic: 62.4, openai: 24.5, gemini: 1.6, total: 88.5 },
  { day: 'Sat', anthropic: 34.1, openai: 12.8, gemini: 0.6, total: 47.5 },
  { day: 'Sun', anthropic: 36.1, openai: 14.0, gemini: 0.8, total: 50.9 }
];

export const LLMUsageCostsPage: React.FC = () => {
  const { providerStats, budgetConfig, updateBudgetLimit } = useWorkspace();
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'custom'>('30d');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(String(budgetConfig.monthlyBudget));
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Aggregate total tokens
  const totalInputTokens = 1842500;
  const totalOutputTokens = 384100;
  const totalCachedTokens = 520000;
  const totalReasoningTokens = 48200;
  const totalGrossTokens = totalInputTokens + totalOutputTokens + totalCachedTokens + totalReasoningTokens;

  const totalCost = budgetConfig.currentMonthlySpent; // $428.60
  const budgetUtilization = Math.round((budgetConfig.currentMonthlySpent / budgetConfig.monthlyBudget) * 100);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newBudgetVal);
    if (!isNaN(parsed) && parsed > 0) {
      updateBudgetLimit(parsed);
      setIsEditingBudget(false);
      setSavedNotice(`Monthly budget updated to $${parsed.toFixed(2)} USD.`);
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20 text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              LLM Usage & Cost Intelligence
            </h1>
            <Badge variant="emerald" size="sm">
              Live Token Accounting
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Fine-grained token consumption metrics, provider-specific pricing, cached token discounts, and monthly budget governance.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium border border-slate-200">
          {(['today', '7d', '30d', 'custom'] as const).map(df => (
            <button
              key={df}
              onClick={() => setDateFilter(df)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                dateFilter === df
                  ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              {df === 'today' ? 'Today' : df === '7d' ? 'Last 7 Days' : df === '30d' ? 'Last 30 Days' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: 5 CORE TOKEN METRICS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Input Tokens */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-card space-y-1">
          <span className="text-[11px] font-medium text-charcoal-500 block">Input Tokens</span>
          <div className="text-xl font-bold text-charcoal-900 font-mono">
            {totalInputTokens.toLocaleString()}
          </div>
          <span className="text-[10px] text-charcoal-400 block font-mono">Standard prompt context</span>
        </div>

        {/* 2. Output Tokens */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-card space-y-1">
          <span className="text-[11px] font-medium text-charcoal-500 block">Output Tokens</span>
          <div className="text-xl font-bold text-primary font-mono">
            {totalOutputTokens.toLocaleString()}
          </div>
          <span className="text-[10px] text-charcoal-400 block font-mono">Generated code & reviews</span>
        </div>

        {/* 3. Cached Input Tokens */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-card space-y-1">
          <span className="text-[11px] font-medium text-charcoal-500 block">Cached Tokens</span>
          <div className="text-xl font-bold text-purple-700 font-mono">
            {totalCachedTokens.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block font-mono">~50-90% cost savings</span>
        </div>

        {/* 4. Reasoning Tokens */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-card space-y-1">
          <span className="text-[11px] font-medium text-charcoal-500 block">Reasoning Tokens</span>
          <div className="text-xl font-bold text-cyan-700 font-mono">
            {totalReasoningTokens.toLocaleString()}
          </div>
          <span className="text-[10px] text-charcoal-400 block font-mono">o1-preview deep passes</span>
        </div>

        {/* 5. Total Gross Tokens */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-card space-y-1">
          <span className="text-[11px] font-medium text-charcoal-500 block">Total Tokens Billed</span>
          <div className="text-xl font-bold text-charcoal-900 font-mono">
            {totalGrossTokens.toLocaleString()}
          </div>
          <span className="text-[10px] text-charcoal-500 block font-mono">2.79M total volume</span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: BUDGET & SPENDING INTELLIGENCE
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Spending Overview & Budget (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">
                  Monthly Billing Cycle
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-charcoal-900 font-mono">
                    ${totalCost.toFixed(2)}
                  </span>
                  <span className="text-xs text-charcoal-500">
                    of ${budgetConfig.monthlyBudget.toFixed(2)} monthly budget limit
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  budgetUtilization >= budgetConfig.warningThresholdPercent
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {budgetUtilization}% Utilized
                </span>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="text-[11px] text-primary hover:underline block mt-1"
                >
                  Adjust Limit
                </button>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetUtilization >= budgetConfig.warningThresholdPercent
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-charcoal-400 font-mono">
                <span>$0.00</span>
                <span>Warning at {budgetConfig.warningThresholdPercent}% (${(budgetConfig.monthlyBudget * 0.8).toFixed(2)})</span>
                <span>${budgetConfig.monthlyBudget.toFixed(2)} Limit</span>
              </div>
            </div>

            {/* Edit Budget Inline Modal */}
            {isEditingBudget && (
              <form onSubmit={handleSaveBudget} className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs">
                <span className="font-semibold text-charcoal-900 block">Configure Workspace Monthly Budget Limit:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-charcoal-600">$</span>
                  <input
                    type="number"
                    step="10"
                    value={newBudgetVal}
                    onChange={(e) => setNewBudgetVal(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-charcoal-900 w-32 focus:outline-none focus:border-primary"
                  />
                  <Button variant="primary" size="xs" type="submit">Save Limit</Button>
                  <Button variant="ghost" size="xs" type="button" onClick={() => setIsEditingBudget(false)}>Cancel</Button>
                </div>
              </form>
            )}

            {/* Daily Spending Trend Chart */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">
                Daily Spending by Provider (USD)
              </span>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyCostBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="anthropic" name="Anthropic" fill="#7c3aed" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="openai" name="OpenAI" fill="#2563eb" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="gemini" name="Google Gemini" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Project & Agent Cost Allocations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Project Budgets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-3 text-xs">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">
              Spending by Project Portfolio
            </span>

            <div className="space-y-3">
              {budgetConfig.projectBudgets.map(pb => {
                const pct = Math.round((pb.spent / pb.budget) * 100);
                return (
                  <div key={pb.projectId} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-charcoal-900">{pb.projectName}</span>
                      <span className="font-mono text-charcoal-700">
                        ${pb.spent.toFixed(2)} / ${pb.budget.toFixed(2)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Cost Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-3 text-xs">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">
              Cost Allocation by AI Employee
            </span>

            <div className="space-y-2">
              {budgetConfig.agentBudgets.map(ab => (
                <div key={ab.agentName} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">{ab.agentName}</span>
                    <span className="text-[10px] text-charcoal-400">Budget: ${ab.budget.toFixed(2)}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    ${ab.spent.toFixed(2)} USD
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: PROVIDER BREAKDOWN & CREDITS TRANSPARENCY
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900">
              Provider Pricing, Requests & Balance Status
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Provider-reported usage and verified pricing matrix. Balances shown only when exposed by provider APIs.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-charcoal-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Zero Fabricated Balances</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providerStats.map(prov => (
            <div key={prov.provider} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-charcoal-900">{prov.provider}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  {prov.billingType}
                </span>
              </div>

              {/* Balance status */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Balance / Quota State:</span>
                <span className="font-mono text-xs font-semibold text-charcoal-800 block">
                  {prov.creditsRemainingFormatted || prov.balanceStatus}
                </span>
              </div>

              {/* Models list */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Active Model Invocations:</span>
                {prov.models.map(m => (
                  <div key={m.modelName} className="p-2 rounded bg-white border border-slate-100 flex items-center justify-between font-mono text-[11px]">
                    <div className="truncate max-w-[140px]">
                      <span className="text-charcoal-800 block truncate">{m.modelName}</span>
                      <span className="text-[10px] text-charcoal-400">{m.requestCount} requests</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-bold block">${m.totalCost.toFixed(2)}</span>
                      <span className="text-[10px] text-charcoal-400">{m.avgLatencyMs}ms avg</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Provider total */}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-mono font-bold text-xs">
                <span>Subtotal:</span>
                <span className="text-emerald-700">${prov.totalCost.toFixed(2)} USD</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
