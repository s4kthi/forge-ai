import React from 'react';
import {
  Activity,
  Play,
  Database,
  CheckCircle2,
  TestTube2,
  AlertTriangle,
  GitPullRequest,
  ExternalLink,
} from 'lucide-react';
import { LiveActivityEvent } from '../../types';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RecentActivityFeedProps {
  events: LiveActivityEvent[];
  onSelectTaskId?: (taskId: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  events,
  onSelectTaskId,
}) => {
  const getEventIcon = (type: LiveActivityEvent['type']) => {
    switch (type) {
      case 'agent_started':
        return <Play className="w-3.5 h-3.5 text-blue-400" />;
      case 'repo_indexed':
        return <Database className="w-3.5 h-3.5 text-violet-400" />;
      case 'impl_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'tests_passed':
        return <TestTube2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'reviewer_issue':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'pr_awaiting_approval':
        return <GitPullRequest className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getEventBadge = (type: LiveActivityEvent['type']) => {
    switch (type) {
      case 'agent_started':
        return <Badge variant="blue" size="xs">AGENT DISPATCH</Badge>;
      case 'repo_indexed':
        return <Badge variant="violet" size="xs">AST INDEXED</Badge>;
      case 'impl_completed':
        return <Badge variant="emerald" size="xs">IMPLEMENTATION</Badge>;
      case 'tests_passed':
        return <Badge variant="emerald" size="xs">TESTS PASSED</Badge>;
      case 'reviewer_issue':
        return <Badge variant="amber" size="xs">ISSUE DETECTED</Badge>;
      case 'pr_awaiting_approval':
        return <Badge variant="rose" size="xs">APPROVAL GATE</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <CardTitle>LIVE FLEET ACTIVITY STREAM</CardTitle>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          Real-time event pipeline (WebSocket)
        </span>
      </CardHeader>

      <div className="divide-y divide-border/60 max-h-[380px] overflow-y-auto">
        {events.map((ev) => (
          <div
            key={ev.id}
            onClick={() => ev.taskId && onSelectTaskId && onSelectTaskId(ev.taskId)}
            className={`p-3.5 hover:bg-surface-elevated/50 transition-colors ${
              ev.taskId ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-surface-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                {getEventIcon(ev.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">
                      {ev.title}
                    </span>
                    {getEventBadge(ev.type)}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {ev.timestamp}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-sans">
                  {ev.description}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-400">
                  {ev.employeeName && (
                    <span className="text-violet-300">@{ev.employeeName}</span>
                  )}
                  {ev.repoName && (
                    <span>• {ev.repoName.split('/')[1] || ev.repoName}</span>
                  )}
                  {ev.taskId && (
                    <span className="text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5 ml-auto">
                      <span>inspect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
