import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Sparkles,
  Check
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'meeting' | 'note';
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'task' 
}) => {
  const { projects, addTask, addMeeting, addNote } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'task' | 'meeting' | 'note'>(defaultTab);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskProject, setTaskProject] = useState(projects[0]?.id || 'proj-acme');
  const [taskAgent, setTaskAgent] = useState<'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena'>('Devon');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState('2:00 PM');
  const [meetingSummary, setMeetingSummary] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'General' | 'Client Meeting' | 'Architecture Decision' | 'Technical Spec' | 'Team Sync'>('General');
  const [noteContent, setNoteContent] = useState('');

  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const proj = projects.find(p => p.id === taskProject) || projects[0];

    addTask({
      key: `${proj.key}-${Math.floor(260 + Math.random() * 40)}`,
      title: taskTitle.trim(),
      description: taskDescription || 'Task created via Quick Create in workspace.',
      projectId: proj.id,
      projectName: proj.name,
      client: proj.client,
      repository: proj.repository,
      status: 'todo',
      priority: taskPriority,
      assignedAgent: taskAgent,
      assignedRole: taskAgent === 'Devon' ? 'Software Developer' : taskAgent === 'Marcus' ? 'Software Architect' : 'Engineer',
      dueDate: taskDueDate,
      acceptanceCriteria: ['Deliver implementation', 'Verify with test runner']
    });

    setSubmittedNotice(`Task "${taskTitle}" assigned to ${taskAgent}!`);
    setTimeout(() => {
      setSubmittedNotice(null);
      setTaskTitle('');
      setTaskDescription('');
      onClose();
    }, 1200);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    const proj = projects[0];

    addMeeting({
      title: meetingTitle.trim(),
      date: meetingDate,
      time: meetingTime,
      duration: '45m',
      projectId: proj.id,
      projectName: proj.name,
      participants: ['Dr. Sarah Chen', 'Alex (AI PM)', 'Marcus (AI Architect)'],
      summary: meetingSummary || 'Scheduled alignment meeting.',
      discussionPoints: ['Architecture review', 'Sprint deliverables'],
      decisions: ['Agreed to next milestone timeline'],
      actionItems: [],
      recordingStatus: 'not_connected'
    });

    setSubmittedNotice(`Meeting "${meetingTitle}" scheduled & synced to calendar!`);
    setTimeout(() => {
      setSubmittedNotice(null);
      setMeetingTitle('');
      setMeetingSummary('');
      onClose();
    }, 1200);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const proj = projects[0];

    addNote({
      title: noteTitle.trim(),
      category: noteCategory,
      content: noteContent || 'No additional content recorded.',
      projectId: proj.id,
      projectName: proj.name,
      tags: ['Workspace', noteCategory.toLowerCase()],
      isPinned: false,
      author: 'Dr. Sarah Chen'
    });

    setSubmittedNotice(`Note "${noteTitle}" saved!`);
    setTimeout(() => {
      setSubmittedNotice(null);
      setNoteTitle('');
      setNoteContent('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-charcoal-900 text-sm">Quick Create</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-charcoal-500 hover:text-charcoal-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-5 pt-2 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'task'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meeting')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'meeting'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Meeting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'note'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Success toast */}
        {submittedNotice && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{submittedNotice}</span>
          </div>
        )}

        {/* Tab 1: Task Form */}
        {activeTab === 'task' && !submittedNotice && (
          <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Implement webhook retry backoff"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Project</label>
                <select
                  value={taskProject}
                  onChange={(e) => setTaskProject(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Assign to Agent</label>
                <select
                  value={taskAgent}
                  onChange={(e) => setTaskAgent(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Devon">Devon (Developer)</option>
                  <option value="Marcus">Marcus (Architect)</option>
                  <option value="Tessa">Tessa (QA)</option>
                  <option value="Elena">Elena (Reviewer)</option>
                  <option value="Alex">Alex (Project Manager)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Key requirements or context..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
              >
                Create Task
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Meeting Form */}
        {activeTab === 'meeting' && !submittedNotice && (
          <form onSubmit={handleCreateMeeting} className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Meeting Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Q4 Sprint Sync"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 font-medium mb-1">Time</label>
                <input
                  type="text"
                  placeholder="2:00 PM"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Objective / Summary</label>
              <textarea
                rows={2}
                placeholder="What will this meeting cover?"
                value={meetingSummary}
                onChange={(e) => setMeetingSummary(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
              >
                Schedule Meeting
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Note Form */}
        {activeTab === 'note' && !submittedNotice && (
          <form onSubmit={handleCreateNote} className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Note Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Architecture decision for passkeys"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Category</label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary"
              >
                <option value="General">General Note</option>
                <option value="Client Meeting">Client Meeting Note</option>
                <option value="Architecture Decision">Architecture Decision</option>
                <option value="Technical Spec">Technical Spec</option>
                <option value="Team Sync">Team Sync</option>
              </select>
            </div>

            <div>
              <label className="block text-charcoal-700 font-medium mb-1">Content (Markdown supported)</label>
              <textarea
                rows={4}
                placeholder="Type or paste markdown content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-charcoal-900 text-xs focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
              >
                Save Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
