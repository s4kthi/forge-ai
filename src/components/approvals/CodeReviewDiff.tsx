import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  Plus, 
  Minus, 
  MessageSquare, 
  Check, 
  Copy, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import type { DiffFile, InlineComment } from '../../data/approvalData';

interface CodeReviewDiffProps {
  files: DiffFile[];
}

export const CodeReviewDiff: React.FC<CodeReviewDiffProps> = ({ files }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = files.find(f => f.id === selectedFileId) || files[0];

  const handleCopyPath = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.filename);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalAdditions = files.reduce((acc, f) => acc + f.additions, 0);
  const totalDeletions = files.reduce((acc, f) => acc + f.deletions, 0);
  const totalComments = files.reduce(
    (acc, f) => acc + f.lines.reduce((lAcc, l) => lAcc + (l.comments?.length || 0), 0),
    0
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Module Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Unified Code Review Diff
          </h2>
          <span className="text-xs font-mono text-slate-500">
            ({files.length} files changed)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-emerald-400 font-semibold flex items-center">
              <Plus className="w-3 h-3" />{totalAdditions}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-semibold flex items-center">
              <Minus className="w-3 h-3" />{totalDeletions}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>{totalComments} AI Review Notes</span>
          </div>
        </div>
      </div>

      {/* 2-Column Diff Workspace: File Navigation + Code Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        {/* =========================================================================
            LEFT COLUMN: File Navigation Tree (4 Cols)
           ========================================================================= */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2 py-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-violet-400" />
              Changed Files
            </span>
            <span className="text-[10px] text-slate-500">{files.length} paths</span>
          </div>

          <div className="space-y-1.5">
            {files.map((file) => {
              const isSelected = file.id === activeFile.id;
              const fileCommentCount = file.lines.reduce(
                (acc, l) => acc + (l.comments?.length || 0),
                0
              );

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-950/40 border-violet-700/60 text-slate-100 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] gap-2">
                    <span className="truncate font-medium text-slate-200">
                      {file.filename}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800/40 shrink-0">
                      {file.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {file.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-1.5 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">+{file.additions}</span>
                      <span className="text-rose-400 font-semibold">-{file.deletions}</span>
                    </div>

                    {fileCommentCount > 0 && (
                      <span className="flex items-center gap-1 text-violet-400 font-semibold bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/30">
                        <MessageSquare className="w-2.5 h-2.5" />
                        {fileCommentCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Syntax-Styled Unified Diff Viewer (8 Cols)
           ========================================================================= */}
        <div className="lg:col-span-8 flex flex-col bg-[#090b10] overflow-hidden">
          {/* Active File Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-500 font-normal">File:</span>
              <span className="text-slate-200 font-semibold truncate">
                {activeFile.filename}
              </span>
              <button
                onClick={handleCopyPath}
                title="Copy file path"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] shrink-0">
              <span className="text-emerald-400 font-semibold">+{activeFile.additions}</span>
              <span className="text-rose-400 font-semibold">-{activeFile.deletions}</span>
            </div>
          </div>

          {/* Unified Diff Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[600px] text-xs font-mono select-text">
            <table className="w-full border-collapse">
              <tbody>
                {activeFile.lines.map((line, idx) => {
                  const isAdd = line.type === 'add';
                  const isDel = line.type === 'del';

                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className={`group transition-colors ${
                          isAdd
                            ? 'bg-emerald-950/20 text-emerald-200 hover:bg-emerald-950/30'
                            : isDel
                            ? 'bg-rose-950/25 text-rose-200 hover:bg-rose-950/35'
                            : 'text-slate-300 hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Old Line Number */}
                        <td className="w-10 px-2 py-0.5 text-right text-[10px] text-slate-600 border-r border-slate-800/60 select-none font-mono">
                          {line.oldLineNumber || ''}
                        </td>

                        {/* New Line Number */}
                        <td className="w-10 px-2 py-0.5 text-right text-[10px] text-slate-600 border-r border-slate-800/60 select-none font-mono">
                          {line.newLineNumber || ''}
                        </td>

                        {/* Indicator Sign */}
                        <td className="w-6 px-1.5 py-0.5 text-center select-none font-mono font-bold">
                          {isAdd ? (
                            <span className="text-emerald-400">+</span>
                          ) : isDel ? (
                            <span className="text-rose-400">-</span>
                          ) : (
                            <span className="text-slate-600"> </span>
                          )}
                        </td>

                        {/* Code Content */}
                        <td className="px-3 py-0.5 whitespace-pre font-mono leading-relaxed overflow-x-auto">
                          {line.content.replace(/^[-+]/, '')}
                        </td>
                      </tr>

                      {/* Render Inline AI Reviewer Comments */}
                      {line.comments && line.comments.length > 0 && (
                        <tr>
                          <td colSpan={4} className="p-0 border-y border-slate-800/80 bg-slate-950/90">
                            <div className="p-3 pl-12 space-y-2.5">
                              {line.comments.map((comment: InlineComment) => (
                                <div
                                  key={comment.id}
                                  className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 shadow-sm space-y-2"
                                >
                                  {/* Comment Header */}
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={comment.avatar}
                                        alt={comment.author}
                                        className="w-5 h-5 rounded-full border border-violet-500/40 object-cover"
                                      />
                                      <span className="font-semibold text-slate-200">
                                        {comment.author}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ({comment.role})
                                      </span>
                                      {comment.badge && (
                                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                                          comment.badgeColor === 'emerald'
                                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40'
                                            : comment.badgeColor === 'blue'
                                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/40'
                                            : 'bg-violet-950/80 text-violet-300 border-violet-800/40'
                                        }`}>
                                          {comment.badge}
                                        </span>
                                      )}
                                    </div>

                                    <span className="text-[10px] font-mono text-slate-500">
                                      {comment.timestamp}
                                    </span>
                                  </div>

                                  {/* Comment Body */}
                                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                    {comment.message}
                                  </p>

                                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>Audited by FORGE Automated Code Review Engine</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 font-mono text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
              <span>Syntactically validated via RFC 5322 grammar test suite</span>
            </div>
            <span>End of File</span>
          </div>
        </div>
      </div>
    </div>
  );
};
