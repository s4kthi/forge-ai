import React from 'react';
import { CheckCircle2, ChevronRight, CircleDot } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ExecutionWorkflowStage =
  | 'INGESTION'
  | 'INDEXING'
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'VERIFICATION'
  | 'AUDITING'
  | 'DELIVERY';

interface WorkflowVisualizationProps {
  currentStage: ExecutionWorkflowStage;
  className?: string;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
  currentStage,
  className,
}) => {
  const stages: ExecutionWorkflowStage[] = [
    'INGESTION',
    'INDEXING',
    'PLANNING',
    'DEVELOPMENT',
    'VERIFICATION',
    'AUDITING',
    'DELIVERY',
  ];

  const currentStageIndex = stages.indexOf(currentStage);

  return (
    <div
      className={cn(
        'w-full bg-surface border border-border rounded-lg p-2.5 overflow-x-auto select-none',
        className
      )}
    >
      <div className="flex items-center justify-between min-w-[760px] gap-1">
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;
          const isLast = idx === stages.length - 1;

          return (
            <React.Fragment key={stage}>
              {/* Stage Step Item */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all flex-1 justify-center',
                  isCurrent &&
                    'bg-violet-950/70 border border-violet-500/60 shadow-[0_0_12px_rgba(139,92,246,0.3)]',
                  isCompleted && 'bg-emerald-950/30 border border-emerald-500/30',
                  isPending && 'bg-surface-muted/40 border border-transparent opacity-60'
                )}
              >
                {/* Status Indicator Icon */}
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <CircleDot className="w-3.5 h-3.5 text-violet-400 animate-pulse flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] font-mono text-zinc-600 flex-shrink-0">
                    {idx + 1}
                  </span>
                )}

                {/* Stage Label */}
                <div className="flex flex-col text-left leading-none overflow-hidden">
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold tracking-wider truncate',
                      isCurrent && 'text-violet-200',
                      isCompleted && 'text-emerald-300',
                      isPending && 'text-zinc-500'
                    )}
                  >
                    {stage}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                    {isCompleted ? 'VERIFIED' : isCurrent ? 'EXECUTING' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Connecting Chevron Arrow */}
              {!isLast && (
                <ChevronRight
                  className={cn(
                    'w-3.5 h-3.5 flex-shrink-0 mx-0.5',
                    isCompleted ? 'text-emerald-500/60' : isCurrent ? 'text-violet-400' : 'text-zinc-700'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
