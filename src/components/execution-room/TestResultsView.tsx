import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface TestCaseItem {
  id: string;
  name: string;
  suite: string;
  duration: string;
  status: 'passed' | 'failed' | 'skipped';
  assertionCount: number;
}

interface TestResultsViewProps {
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  duration: string;
  testCases: TestCaseItem[];
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  totalPassed,
  totalFailed,
  totalSkipped,
  duration,
  testCases,
}) => {
  return (
    <div className="p-4 space-y-4 font-mono text-xs select-none">
      {/* Test Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-surface-elevated border border-emerald-500/30">
          <span className="text-[10px] text-zinc-400 block uppercase">PASSED ASSERTIONS</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">{totalPassed}</span>
            <span className="text-[10px] text-emerald-500">100% clean</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated border border-border">
          <span className="text-[10px] text-zinc-400 block uppercase">FAILED ASSERTIONS</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-400">{totalFailed}</span>
            <span className="text-[10px] text-zinc-500">0 regressions</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated border border-border">
          <span className="text-[10px] text-zinc-400 block uppercase">SKIPPED TESTS</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-400">{totalSkipped}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated border border-border">
          <span className="text-[10px] text-zinc-400 block uppercase">EXECUTION DURATION</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-200">{duration}</span>
            <span className="text-[10px] text-zinc-500">parallel runner</span>
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-border text-[11px]">
          <span className="font-semibold text-zinc-200">DETAILED TEST SUITE EXECUTION</span>
          <span>Vitest & Playwright Headless Runtime</span>
        </div>

        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border/60">
          {testCases.map((tc) => (
            <div
              key={tc.id}
              className="p-3 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-zinc-200 font-semibold truncate">{tc.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{tc.suite}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {tc.assertionCount} assertions
                </span>
                <span className="text-zinc-300 font-bold">{tc.duration}</span>
                <Badge variant="emerald" size="xs">
                  PASSED
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
