import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString();
}

export function formatCompactTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M tokens`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}k tokens`;
  }
  return `${tokens} tokens`;
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string; border: string } {
  switch (status.toLowerCase()) {
    case 'running':
    case 'in_execution':
    case 'busy':
    case 'active':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        border: 'border-emerald-500/20',
      };
    case 'evaluating':
    case 'in_analysis':
    case 'planning':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
        border: 'border-blue-500/20',
      };
    case 'awaiting_approval':
    case 'pending':
    case 'warn':
    case 'paused':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        border: 'border-amber-500/20',
      };
    case 'failed':
    case 'rejected':
    case 'critical':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
        border: 'border-rose-500/20',
      };
    case 'succeeded':
    case 'done':
    case 'approved':
      return {
        bg: 'bg-violet-500/10',
        text: 'text-violet-300',
        dot: 'bg-violet-400',
        border: 'border-violet-500/20',
      };
    case 'idle':
    case 'backlog':
    default:
      return {
        bg: 'bg-zinc-800/40',
        text: 'text-zinc-400',
        dot: 'bg-zinc-500',
        border: 'border-zinc-700/30',
      };
  }
}
