import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PromptInspectorViewer } from '../../components/observability/PromptInspectorViewer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const PromptInspectorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { promptRecords } = useWorkspace();

  const queryId = searchParams.get('id');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    queryId && promptRecords.some(p => p.id === queryId)
      ? queryId
      : promptRecords[0]?.id || ''
  );

  useEffect(() => {
    if (queryId && promptRecords.some(p => p.id === queryId)) {
      setSelectedRecordId(queryId);
    }
  }, [queryId, promptRecords]);

  const activeRecord = promptRecords.find(p => p.id === selectedRecordId) || promptRecords[0];

  const handleSelectRecord = (id: string) => {
    setSelectedRecordId(id);
    setSearchParams({ id });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20 text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Prompt & Context Inspector
            </h1>
            <Badge variant="violet" size="sm">
              Deterministic Prompt Auditor
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Audit actual submitted system instructions, assembled context documents, tool declarations, and generated outputs with automated secret redaction.
          </p>
        </div>

        {/* Quick Nav back to Live Monitor */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/observability/live-monitor')}
            className="text-xs text-charcoal-700"
          >
            ← Live Monitor
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/observability/agent-runs')}
            className="text-xs text-charcoal-700"
          >
            Agent Runs
          </Button>
        </div>
      </div>

      {/* Record Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider shrink-0 mr-1">
          Select Run:
        </span>
        {promptRecords.map((rec) => {
          const isSelected = rec.id === activeRecord?.id;
          return (
            <button
              key={rec.id}
              onClick={() => handleSelectRecord(rec.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                  : 'bg-white text-charcoal-700 hover:text-charcoal-900 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{rec.agentName}</span>
              <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-purple-800 text-purple-100' : 'bg-slate-100 text-charcoal-500'}`}>
                {rec.taskKey}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Inspector Viewer */}
      {activeRecord ? (
        <PromptInspectorViewer
          record={activeRecord}
          recordsList={promptRecords}
          onSelectRecord={handleSelectRecord}
        />
      ) : (
        <div className="p-12 text-center text-xs text-charcoal-400 bg-white border border-slate-200 rounded-2xl">
          No prompt records found.
        </div>
      )}
    </div>
  );
};
