import React, { useState } from 'react';
import { Folder, FileCode } from 'lucide-react';
import { ChangedFileItem } from '../../data/simulationScenarios';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface DiffViewerProps {
  files: ChangedFileItem[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ files }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(files[0]?.path || '');

  const activeFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const totalAdditions = files.reduce((acc, f) => acc + f.additions, 0);
  const totalDeletions = files.reduce((acc, f) => acc + f.deletions, 0);

  const getChangeTypeBadge = (type: ChangedFileItem['changeType']) => {
    switch (type) {
      case 'M':
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/40">
            MOD
          </span>
        );
      case 'A':
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
            ADD
          </span>
        );
      case 'D':
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/40">
            DEL
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[460px] border border-border rounded-lg overflow-hidden bg-[#090b10] text-xs font-mono select-none">
      {/* Left Column: Navigable File Tree */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <Folder className="w-3.5 h-3.5 text-violet-400" />
            <span>FILES CHANGED ({files.length})</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-emerald-400 font-bold">+{totalAdditions}</span>
            <span className="text-rose-400 font-bold">-{totalDeletions}</span>
          </div>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {files.map((file) => {
            const isSelected = file.path === selectedFilePath;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFilePath(file.path)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded text-left transition-colors',
                  isSelected
                    ? 'bg-violet-600/15 text-violet-200 border border-violet-500/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated/60 border border-transparent'
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCode
                    className={cn(
                      'w-3.5 h-3.5 flex-shrink-0',
                      isSelected ? 'text-violet-400' : 'text-zinc-500'
                    )}
                  />
                  <span className="truncate text-xs font-mono">{file.path}</span>
                </div>

                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {getChangeTypeBadge(file.changeType)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Code Diff Inspector */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0c12]">
        {/* Diff File Header */}
        <div className="px-4 py-2.5 border-b border-border bg-surface-elevated/50 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-zinc-200 font-bold font-mono">{activeFile?.path}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-emerald-400 font-bold">+{activeFile?.additions}</span>
            <span className="text-rose-400 font-bold">-{activeFile?.deletions}</span>
          </div>

          <Badge variant="subtle" size="xs">
            UTF-8 AST Unified Diff
          </Badge>
        </div>

        {/* Diff Content Lines */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-0.5 bg-[#090b10] text-zinc-300">
          {activeFile?.newContent.split('\n').map((line, index) => {
            const isAddition = line.trim().startsWith('+') || line.includes('import') || line.includes('export');
            const lineNumber = index + 1;

            return (
              <div
                key={index}
                className={cn(
                  'flex items-start px-2 py-0.5 rounded leading-relaxed hover:bg-white/[0.03]',
                  isAddition && 'bg-emerald-500/5 text-emerald-200 border-l border-emerald-500/40'
                )}
              >
                <span className="w-8 text-right pr-4 text-zinc-600 select-none text-[10px]">
                  {lineNumber}
                </span>
                <span className="w-4 text-zinc-600 select-none">{isAddition ? '+' : ' '}</span>
                <pre className="flex-1 overflow-x-auto whitespace-pre font-mono text-[11px]">
                  {line}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
