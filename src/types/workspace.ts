export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatusType = 
  | 'backlog' 
  | 'todo' 
  | 'in_progress' 
  | 'in_review' 
  | 'completed';

export interface ProjectModel {
  id: string;
  name: string;
  key: string;
  client: string;
  description: string;
  repository: string;
  repositoryBranch: string;
  health: 'Healthy' | 'Optimal' | 'Needs Attention';
  progress: number;
  openTasks: number;
  completedTasks: number;
  updatedAt: string;
  techStack: string[];
}

export interface TaskModel {
  id: string;
  key: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  client: string;
  repository: string;
  status: TaskStatusType;
  priority: PriorityLevel;
  assignedAgent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'Unassigned';
  assignedRole: string;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  acceptanceCriteria: string[];
  estimatedHours?: number;
  diffStats?: {
    additions: number;
    deletions: number;
    files: number;
  };
}

export interface CalendarEventModel {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "10:00 AM"
  type: 'task' | 'meeting' | 'milestone' | 'approval' | 'agent';
  projectId?: string;
  projectName?: string;
  referenceId?: string; // links to taskId, meetingId, etc.
  assignedTo?: string;
  status?: string;
  priority?: PriorityLevel;
}

export interface AgentModel {
  id: string;
  name: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  role: string;
  specialty: string;
  avatar: string;
  status: 'Working' | 'Reviewing' | 'Planning' | 'Testing' | 'Idle';
  currentTaskTitle: string;
  currentTaskId: string;
  lastActive: string;
  tasksCompleted: number;
  successRate: number;
  avgDuration: string;
  capabilities: string[];
}

export interface AgentMessageModel {
  id: string;
  fromAgent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'User';
  toAgent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'Team';
  timestamp: string;
  content: string;
  taskId?: string;
  taskTitle?: string;
  type: 'assignment' | 'proposal' | 'review' | 'bug_report' | 'approval' | 'info';
  statusBadge?: string;
}

export interface AgentCollaborationThread {
  id: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  stage: 'Planning' | 'Development' | 'Testing' | 'Review' | 'Approved';
  participatingAgents: ('Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena')[];
  startedAt: string;
  updatedAt: string;
  messages: AgentMessageModel[];
  summary: string;
}

export interface ActionItemModel {
  id: string;
  text: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
  convertedTaskId?: string;
}

export interface MeetingModel {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // "2:00 PM"
  duration: string; // "45m"
  projectId: string;
  projectName: string;
  participants: string[];
  summary: string;
  discussionPoints: string[];
  decisions: string[];
  actionItems: ActionItemModel[];
  transcript?: {
    speaker: string;
    text: string;
    time: string;
  }[];
  recordingStatus: 'not_connected' | 'processing' | 'ready';
}

export interface NoteModel {
  id: string;
  title: string;
  category: 'General' | 'Client Meeting' | 'Architecture Decision' | 'Technical Spec' | 'Team Sync';
  content: string;
  projectId?: string;
  projectName?: string;
  linkedTaskId?: string;
  tags: string[];
  isPinned: boolean;
  author: string;
  updatedAt: string;
  createdAt: string;
}

export interface ChatMessageModel {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  dataPayload?: {
    type: 'task_list' | 'project_summary' | 'agent_status' | 'approval_card';
    items?: any[];
  };
}

export interface ConversationModel {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  projectContextId?: string; // 'all' or specific projectId
  messages: ChatMessageModel[];
}
