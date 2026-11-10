import React from 'react';
import { ChevronRight, Filter, X } from 'lucide-react';
import { PipelineStageConfig } from '../../data/mockData';
import { PipelineStage } from '../../types';
import { cn } from '../../lib/utils';

interface WorkforcePipelineProps {
  stages: PipelineStageConfig[];
  selectedStage: PipelineStage | null;
  onSelectStage: (stage: PipelineStage | null) => void;
}

export const WorkforcePipeline: React.FC<WorkforcePipelineProps> = ({
  stages,
  selectedStage,
  onSelectStage,
}) => {
  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-200 font-semibold uppercase tracking-wider">
            WORKFORCE PIPELINE LIFECYCLE
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">Click any stage to filter active execution tasks</span>
        </div>

        {selectedStage && (
          <button
            onClick={() => onSelectStage(null)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-500/40 hover:bg-violet-900/60 transition-colors text-[11px]"
          >
            <Filter className="w-3 h-3" />
            <span>Filtering by {selectedStage}</span>
            <X className="w-3 h-3 ml-0.5 hover:text-white" />
          </button>
        )}
      </div>

      {/* Horizontal Workflow Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stages.map((stage, index) => {
          const isSelected = selectedStage === stage.id;
          const isLast = index === stages.length - 1;

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage(isSelected ? null : stage.id)}
              className={cn(
                'group relative rounded-lg p-3 cursor-pointer transition-all duration-150 select-none flex flex-col justify-between border',
                isSelected
                  ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500/50 shadow-glow-violet'
                  : 'bg-surface hover:bg-surface-elevated border-border hover:border-zinc-700'
              )}
            >
              {/* Top row: Stage Name & Count Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span
                  className={cn(
                    'text-[11px] font-mono font-bold tracking-wider truncate',
                    isSelected ? 'text-violet-200' : 'text-zinc-300 group-hover:text-white'
                  )}
                >
                  {stage.label}
                </span>

                <span
                  className={cn(
                    'font-mono text-xs px-1.5 py-0.2 rounded border font-bold flex-shrink-0',
                    isSelected
                      ? 'bg-violet-500 text-white border-violet-400'
                      : 'bg-surface-muted text-zinc-300 border-border group-hover:border-zinc-600'
                  )}
                >
                  {String(stage.count).padStart(2, '0')}
                </span>
              </div>

              {/* Status Subtext */}
              <div className="text-[10px] font-mono text-zinc-400 truncate mb-2">
                {stage.status}
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border/80">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      stage.indicatorColor,
                      isSelected && 'shadow-[0_0_8px_rgba(139,92,246,0.9)]'
                    )}
                    style={{ width: `${stage.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                  <span>Progress</span>
                  <span>{stage.progressPercent}%</span>
                </div>
              </div>

              {/* Connecting Chevron arrow for large screens */}
              {!isLast && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-zinc-500">
                    <ChevronRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
