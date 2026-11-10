import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  Coins, 
  Cpu, 
  Users, 
  GitPullRequest, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  SlidersHorizontal,
  Calendar
} from 'lucide-react';

// Time-series dataset: Tasks completed over 8 weeks
const tasksOverTimeData = [
  { week: 'W1', completed: 8, benchmark: 5, automated: 7 },
  { week: 'W2', completed: 14, benchmark: 9, automated: 12 },
  { week: 'W3', completed: 21, benchmark: 14, automated: 19 },
  { week: 'W4', completed: 29, benchmark: 18, automated: 27 },
  { week: 'W5', completed: 42, benchmark: 24, automated: 39 },
  { week: 'W6', completed: 68, benchmark: 35, automated: 64 },
  { week: 'W7', completed: 98, benchmark: 50, automated: 93 },
  { week: 'W8', completed: 142, benchmark: 70, automated: 137 }
];

// Execution cost breakdown over time
const executionCostsData = [
  { day: 'Mon', tokensCost: 18.4, computeCost: 4.2, totalCost: 22.6 },
  { day: 'Tue', tokensCost: 24.1, computeCost: 5.8, totalCost: 29.9 },
  { day: 'Wed', tokensCost: 38.5, computeCost: 8.1, totalCost: 46.6 },
  { day: 'Thu', tokensCost: 31.2, computeCost: 6.9, totalCost: 38.1 },
  { day: 'Fri', tokensCost: 44.8, computeCost: 9.5, totalCost: 54.3 },
  { day: 'Sat', tokensCost: 14.2, computeCost: 3.1, totalCost: 17.3 },
  { day: 'Sun', tokensCost: 12.0, computeCost: 2.8, totalCost: 14.8 }
];

// Agent performance comparison
const agentPerformanceData = [
  { agent: 'Alex (PM)', tasks: 38, successRate: 98.2, avgDurationMin: 2.1 },
  { agent: 'Marcus (Architect)', tasks: 31, successRate: 96.5, avgDurationMin: 3.4 },
  { agent: 'Devon (Full-Stack)', tasks: 54, successRate: 93.8, avgDurationMin: 5.8 },
  { agent: 'Tessa (QA)', tasks: 46, successRate: 97.4, avgDurationMin: 3.2 },
  { agent: 'Elena (Reviewer)', tasks: 42, successRate: 99.1, avgDurationMin: 2.8 }
];

// Task distribution by workflow pipeline stage
const taskStageData = [
  { stage: 'Ingested', count: 12, percent: '8%' },
  { stage: 'Planning', count: 18, percent: '12%' },
  { stage: 'Development', count: 44, percent: '30%' },
  { stage: 'Testing', count: 28, percent: '19%' },
  { stage: 'Review', count: 22, percent: '15%' },
  { stage: 'Approval', count: 23, percent: '16%' }
];

// Human intervention rate trend (declining as autonomous precision improves)
const interventionTrendData = [
  { week: 'W1', interventionRate: 22.4, targetRate: 15.0 },
  { week: 'W2', interventionRate: 18.2, targetRate: 12.5 },
  { week: 'W3', interventionRate: 14.6, targetRate: 10.0 },
  { week: 'W4', interventionRate: 11.2, targetRate: 8.0 },
  { week: 'W5', interventionRate: 8.9, targetRate: 7.0 },
  { week: 'W6', interventionRate: 7.1, targetRate: 6.0 },
  { week: 'W7', interventionRate: 6.0, targetRate: 5.5 },
  { week: 'W8', interventionRate: 5.4, targetRate: 5.0 }
];

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'quarter' | 'year'>('30d');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Engineering Workforce Analytics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-violet-950/80 text-violet-300 border border-violet-800/40">
              OPERATIONAL TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical velocity, cost linearity, token burn efficiency, and workforce throughput.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {(['7d', '30d', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded transition-colors ${
                  timeRange === range
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === 'quarter' ? 'Quarter' : 'YTD'}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Oct 08 – Nov 06</span>
          </div>
        </div>
      </div>

      {/* 8 Core Engineering Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Metric 1: Tasks Completed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">142</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.2%</span>
          </div>
        </div>

        {/* Metric 2: Task Success Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Success Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">94.6%</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+1.8%</span>
          </div>
        </div>

        {/* Metric 3: Avg Duration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Duration</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">4m 12s</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <ArrowDownRight className="w-3 h-3" />
            <span>-38s faster</span>
          </div>
        </div>

        {/* Metric 4: Human Intervention Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Intervention</span>
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-xl font-bold font-mono text-violet-300">5.4%</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <ArrowDownRight className="w-3 h-3" />
            <span>-2.8%</span>
          </div>
        </div>

        {/* Metric 5: Cost per Task */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Cost / Task</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">$0.428</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <ArrowDownRight className="w-3 h-3" />
            <span>-14.5%</span>
          </div>
        </div>

        {/* Metric 6: Total Tokens */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Token Burn</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">42.8M</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span>Quota 65%</span>
          </div>
        </div>

        {/* Metric 7: Workforce Utilization */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Utilization</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">88.5%</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>4.4/5 active</span>
          </div>
        </div>

        {/* Metric 8: PR Acceptance Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">PR Acceptance</span>
            <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">96.2%</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span>137 of 142</span>
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Completed Tasks Over Time & Execution Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Completed Tasks Over Time */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              <h2 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Completed Tasks Over Time (Cumulative Delivery)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              +102% MoM Velocity
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tasksOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090b10', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="completed" name="Autonomous Delivered" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="benchmark" name="Human Baseline Target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBenchmark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Execution Costs Over Time */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Daily Execution Costs ($ USD Breakdown)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Avg: $32.48 / day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={executionCostsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#090b10', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="tokensCost" name="LLM Token Spend" fill="#8b5cf6" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="computeCost" name="Enclave Compute" fill="#06b6d4" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Agent Comparison, Task Distribution, Human Intervention Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Agent Performance Comparison */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Agent Performance Matrix
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Success %</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={agentPerformanceData} margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[85, 100]} stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="agent" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Success Rate']}
                  contentStyle={{ backgroundColor: '#090b10', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="successRate" name="Success Rate" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Task Distribution by Stage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Task Distribution by Stage
              </h2>
            </div>
            <span className="text-[10px] font-mono text-violet-400">147 Total Active</span>
          </div>

          <div className="space-y-3 pt-2">
            {taskStageData.map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{item.stage}</span>
                  <span className="text-slate-400">{item.count} tasks ({item.percent})</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.stage === 'Development'
                        ? 'bg-violet-500'
                        : item.stage === 'Testing'
                        ? 'bg-blue-500'
                        : item.stage === 'Approval'
                        ? 'bg-emerald-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: item.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 5: Human Intervention Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Human Intervention Rate Trend
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              5.4% Current
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={interventionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, '']}
                  contentStyle={{ backgroundColor: '#090b10', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="interventionRate" name="Actual Intervention %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="targetRate" name="SLA Target Ceiling" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
