import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Pin, 
  CheckSquare, 
  Trash2, 
  FolderKanban, 
  MicOff, 
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { NoteModel, MeetingModel, ActionItemModel } from '../types/workspace';

export const NotesMeetingsPage: React.FC = () => {
  const { 
    notes, 
    meetings, 
    tasks, 
    addNote, 
    deleteNote, 
    togglePinNote,
    convertActionItemToTask 
  } = useWorkspace();

  const [selectedType, setSelectedType] = useState<'meeting' | 'note'>('meeting');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [actionItemSuccessNotice, setActionItemSuccessNotice] = useState<string | null>(null);

  // New Note Modal
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<NoteModel['category']>('Architecture Decision');
  const [newNoteContent, setNewNoteContent] = useState('');

  const activeMeeting: MeetingModel | undefined = meetings.find(m => m.id === selectedMeetingId) || meetings[0];
  const activeNote: NoteModel | undefined = notes.find(n => n.id === selectedNoteId) || notes[0];

  const handleConvertActionItem = (item: ActionItemModel) => {
    if (!activeMeeting) return;
    const newTask = convertActionItemToTask(activeMeeting.id, item);
    setActionItemSuccessNotice(`Created task "${newTask.key}: ${newTask.title}" and synced to Tasks & Calendar!`);
    setTimeout(() => setActionItemSuccessNotice(null), 3500);
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const created = addNote({
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      content: newNoteContent || 'No additional content.',
      projectId: 'proj-acme',
      projectName: 'Acme Portal Hub',
      tags: ['Workspace', newNoteCategory.toLowerCase().replace(' ', '-')],
      isPinned: false,
      author: 'Dr. Sarah Chen'
    });

    setSelectedType('note');
    setSelectedNoteId(created.id);
    setIsCreatingNote(false);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  // Filtered lists
  const filteredNotes = notes.filter(n => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredMeetings = meetings.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background overflow-hidden">
      {/* Action Item Conversion Success Banner */}
      {actionItemSuccessNotice && (
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionItemSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActionItemSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3-Panel Main Workspace Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* =======================================================================
            LEFT PANEL: Notes & Meetings List & Filters (320px)
           ======================================================================= */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
          {/* Header & Quick Add */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-sm text-charcoal-900">
              <FileText className="w-4 h-4 text-primary" />
              <span>Notes & Meetings</span>
            </div>

            <button
              onClick={() => setIsCreatingNote(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 text-xs">
              <Search className="w-3.5 h-3.5 text-charcoal-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search notes, decisions, transcripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
              />
            </div>

            {/* Toggle Meetings vs Notes */}
            <div className="flex mt-2 p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedType('meeting')}
                className={`flex-1 py-1 rounded-md text-center transition-colors ${
                  selectedType === 'meeting'
                    ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Meetings ({meetings.length})
              </button>
              <button
                onClick={() => setSelectedType('note')}
                className={`flex-1 py-1 rounded-md text-center transition-colors ${
                  selectedType === 'note'
                    ? 'bg-white text-charcoal-900 font-semibold shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Docs & Notes ({notes.length})
              </button>
            </div>

            {/* Note category filter pills if note tab is active */}
            {selectedType === 'note' && (
              <div className="flex items-center gap-1 overflow-x-auto pt-2 no-scrollbar">
                {['ALL', 'Architecture Decision', 'Technical Spec', 'Client Meeting'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-white text-charcoal-500 hover:text-charcoal-800 border border-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {selectedType === 'meeting' ? (
              filteredMeetings.map((meet) => {
                const isSelected = meet.id === activeMeeting?.id;
                return (
                  <div
                    key={meet.id}
                    onClick={() => setSelectedMeetingId(meet.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/60 border-purple-200 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-charcoal-900 truncate">
                        {meet.title}
                      </span>
                      <span className="text-[10px] text-charcoal-500 font-mono shrink-0">
                        {meet.date}
                      </span>
                    </div>

                    <p className="text-[11px] text-charcoal-600 line-clamp-2 mt-1">
                      {meet.summary}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-charcoal-400">
                      <span>{meet.participants.length} participants</span>
                      <span className="text-primary font-medium">{meet.actionItems.length} action items</span>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === activeNote?.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/60 border-purple-200 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                        <span className="font-semibold text-charcoal-900 truncate">
                          {note.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-charcoal-400 font-mono shrink-0">
                        {note.updatedAt}
                      </span>
                    </div>

                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-charcoal-600">
                      {note.category}
                    </span>

                    <p className="text-[11px] text-charcoal-600 line-clamp-2 mt-1">
                      {note.content.replace(/[#*`]/g, '')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =======================================================================
            MAIN PANEL: Selected Note or Meeting Detail View
           ======================================================================= */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {selectedType === 'meeting' && activeMeeting ? (
            <div className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
              {/* Meeting Header */}
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                    Client Meeting & Architecture Review
                  </span>
                  <span className="text-xs text-charcoal-400">•</span>
                  <span className="text-xs font-mono text-charcoal-500">
                    {activeMeeting.date} at {activeMeeting.time} ({activeMeeting.duration})
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-sans">
                  {activeMeeting.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-charcoal-600">
                  <span className="font-medium text-charcoal-500">Participants:</span>
                  {activeMeeting.participants.map((p, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-charcoal-800">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recording Status Placeholder Banner (per prompt: not connected placeholder) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-charcoal-600">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-charcoal-400">
                    <MicOff className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal-800 block">
                      Recording Integration Not Connected
                    </span>
                    <span className="text-[11px] text-charcoal-500">
                      Audio recording is simulated. Mock meeting transcript and extracted summaries are active below.
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-white border border-slate-200 text-charcoal-500 shrink-0">
                  Simulated Transcript
                </span>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                  Executive Summary
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  {activeMeeting.summary}
                </p>
              </div>

              {/* Discussion Points & Decisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
                  <h4 className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                    <span>Key Discussion Points</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-charcoal-700">
                    {activeMeeting.discussionPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30 space-y-2 shadow-xs">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Decisions Made</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-800">
                    {activeMeeting.decisions.map((dec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="font-medium">{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Transcript Section */}
              {activeMeeting.transcript && activeMeeting.transcript.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                      Meeting Transcript Excerpts
                    </h3>
                    <span className="text-[10px] text-charcoal-400 font-mono">
                      Timestamped Audio Log
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 divide-y divide-slate-100 text-xs">
                    {activeMeeting.transcript.map((item, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-charcoal-900">{item.speaker}</span>
                          <span className="text-[10px] text-charcoal-400 font-mono">{item.time}</span>
                        </div>
                        <p className="text-charcoal-700 text-xs leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Document / Note Detail View */
            <div className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
              {activeNote ? (
                <>
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {activeNote.category}
                        </span>
                        <span className="text-xs text-charcoal-400">•</span>
                        <span className="text-xs text-charcoal-500">
                          Author: {activeNote.author} • Updated {activeNote.updatedAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePinNote(activeNote.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            activeNote.isPinned
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'text-charcoal-400 hover:bg-slate-100 border-slate-200'
                          }`}
                          title="Pin note"
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteNote(activeNote.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-sans">
                      {activeNote.title}
                    </h1>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeNote.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-charcoal-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content viewer */}
                  <div className="prose prose-sm max-w-none text-charcoal-800 leading-relaxed font-sans whitespace-pre-line">
                    {activeNote.content}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-charcoal-400 text-xs">
                  No note selected. Choose a note from the left or create one.
                </div>
              )}
            </div>
          )}
        </div>

        {/* =======================================================================
            RIGHT PANEL: Related Project, Linked Tasks, Action Items (320px)
           ======================================================================= */}
        <div className="w-80 border-l border-slate-200 bg-slate-50/50 p-4 space-y-5 overflow-y-auto shrink-0 hidden lg:block">
          {/* Section: Action Items & 1-Click Task Converter */}
          {selectedType === 'meeting' && activeMeeting && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Action Items ({activeMeeting.actionItems.length})</span>
                </span>
                <span className="text-[10px] text-charcoal-400">1-Click Convert</span>
              </div>

              <div className="space-y-2">
                {activeMeeting.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-medium text-charcoal-900 leading-snug">
                        {item.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                      <span>Assignee: <strong>{item.assignee}</strong></span>
                      <span>Due: {item.dueDate}</span>
                    </div>

                    {item.convertedTaskId ? (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Converted to Task</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConvertActionItem(item)}
                        className="w-full mt-1 py-1 text-center text-[11px] font-semibold text-primary bg-purple-50 hover:bg-purple-100/70 border border-purple-200 rounded transition-colors"
                      >
                        + Convert to Task in Workspace
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Related Project Context */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <span>Related Project</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-charcoal-900 block">
                {activeMeeting?.projectName || activeNote?.projectName || 'Acme Portal Hub'}
              </span>
              <p className="text-[11px] text-charcoal-500">
                Enterprise partner portal with SSO, multi-tenant RBAC, and analytics dashboard.
              </p>
              <div className="text-[10px] font-mono text-charcoal-400 pt-1">
                Repo: acme-org/portal-hub
              </div>
            </div>
          </div>

          {/* Section: Linked Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-charcoal-900">
                Sprint Tasks ({tasks.slice(0, 3).length})
              </span>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="font-semibold text-charcoal-900 truncate">{task.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-charcoal-500 mt-1">
                    <span>{task.assignedAgent}</span>
                    <span className="font-medium text-primary">{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Note */}
      {isCreatingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden p-5 space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900 border-b border-slate-100 pb-3">
              Create New Documentation Note
            </h3>

            <form onSubmit={handleCreateNoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database schema migration decision"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Architecture Decision">Architecture Decision</option>
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="Technical Spec">Technical Spec</option>
                  <option value="Team Sync">Team Sync</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Content (Markdown)</label>
                <textarea
                  rows={5}
                  placeholder="# Summary..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="px-3.5 py-1.5 text-xs text-charcoal-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
