import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ProjectModel, 
  TaskModel, 
  AgentModel, 
  AgentCollaborationThread, 
  MeetingModel, 
  NoteModel, 
  CalendarEventModel,
  ConversationModel,
  ChatMessageModel,
  ActionItemModel
} from '../types/workspace';
import {
  AgentRun,
  PromptRecord,
  AgentHandoff,
  ProviderUsageStats,
  BudgetConfig,
  ExecutionTrace,
  AgentExecutionStatus
} from '../types/observability';
import { 
  seedProjects, 
  seedAgents, 
  seedTasks, 
  seedCollaborations, 
  seedMeetings, 
  seedNotes, 
  seedCalendarEvents, 
  seedConversations 
} from '../data/workspaceSeedData';
import {
  seedAgentRuns,
  seedPromptRecords,
  seedAgentHandoffs,
  seedProviderStats,
  seedBudgetConfig,
  seedExecutionTraces
} from '../data/observabilitySeedData';
import { AssistantService } from '../services/assistantService';

interface WorkspaceContextType {
  // State
  projects: ProjectModel[];
  tasks: TaskModel[];
  agents: AgentModel[];
  collaborations: AgentCollaborationThread[];
  meetings: MeetingModel[];
  notes: NoteModel[];
  calendarEvents: CalendarEventModel[];
  conversations: ConversationModel[];
  activeWorkspaceId: string;

  // Observability State
  agentRuns: AgentRun[];
  promptRecords: PromptRecord[];
  agentHandoffs: AgentHandoff[];
  providerStats: ProviderUsageStats[];
  budgetConfig: BudgetConfig;
  traces: ExecutionTrace[];
  selectedRunId: string | null;

  // Actions
  setActiveWorkspaceId: (id: string) => void;
  setSelectedRunId: (id: string | null) => void;
  updateBudgetLimit: (newLimit: number) => void;
  updateAgentRunStatus: (runId: string, status: AgentExecutionStatus) => void;
  addTask: (taskData: Omit<TaskModel, 'id' | 'createdAt' | 'updatedAt'>) => TaskModel;
  updateTask: (taskId: string, updates: Partial<TaskModel>) => void;
  deleteTask: (taskId: string) => void;

  addMeeting: (meetingData: Omit<MeetingModel, 'id'>) => MeetingModel;
  updateMeeting: (meetingId: string, updates: Partial<MeetingModel>) => void;
  convertActionItemToTask: (meetingId: string, actionItem: ActionItemModel) => TaskModel;

  addNote: (noteData: Omit<NoteModel, 'id' | 'createdAt' | 'updatedAt'>) => NoteModel;
  updateNote: (noteId: string, updates: Partial<NoteModel>) => void;
  deleteNote: (noteId: string) => void;
  togglePinNote: (noteId: string) => void;

  addCalendarEvent: (eventData: Omit<CalendarEventModel, 'id'>) => CalendarEventModel;
  deleteCalendarEvent: (eventId: string) => void;

  sendAssistantMessage: (conversationId: string, text: string) => Promise<void>;
  createConversation: (title?: string) => string;

  updateAgentStatus: (agentName: string, status: AgentModel['status'], taskTitle?: string) => void;
  resetAllToDefaults: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'forge_workspace_state_v2';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or seeds
  const [projects, setProjects] = useState<ProjectModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : seedProjects;
  });

  const [tasks, setTasks] = useState<TaskModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : seedTasks;
  });

  const [agents, setAgents] = useState<AgentModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_agents`);
    return saved ? JSON.parse(saved) : seedAgents;
  });

  const [collaborations, setCollaborations] = useState<AgentCollaborationThread[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_collabs`);
    return saved ? JSON.parse(saved) : seedCollaborations;
  });

  const [meetings, setMeetings] = useState<MeetingModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_meetings`);
    return saved ? JSON.parse(saved) : seedMeetings;
  });

  const [notes, setNotes] = useState<NoteModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notes`);
    return saved ? JSON.parse(saved) : seedNotes;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
    return saved ? JSON.parse(saved) : seedCalendarEvents;
  });

  const [conversations, setConversations] = useState<ConversationModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_conversations`);
    return saved ? JSON.parse(saved) : seedConversations;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('all');

  // Observability State
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_agent_runs`);
    return saved ? JSON.parse(saved) : seedAgentRuns;
  });

  const [promptRecords] = useState<PromptRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prompt_records`);
    return saved ? JSON.parse(saved) : seedPromptRecords;
  });

  const [agentHandoffs] = useState<AgentHandoff[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_handoffs`);
    return saved ? JSON.parse(saved) : seedAgentHandoffs;
  });

  const [providerStats] = useState<ProviderUsageStats[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_provider_stats`);
    return saved ? JSON.parse(saved) : seedProviderStats;
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budget`);
    return saved ? JSON.parse(saved) : seedBudgetConfig;
  });

  const [traces] = useState<ExecutionTrace[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_traces`);
    return saved ? JSON.parse(saved) : seedExecutionTraces;
  });

  const [selectedRunId, setSelectedRunId] = useState<string | null>('run-devon-248');

  // Observability Actions
  const updateBudgetLimit = (newLimit: number) => {
    setBudgetConfig(prev => ({
      ...prev,
      monthlyBudget: newLimit
    }));
  };

  const updateAgentRunStatus = (runId: string, status: AgentExecutionStatus) => {
    setAgentRuns(prev => prev.map(r => r.id === runId ? { ...r, status } : r));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_agents`, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_collabs`, JSON.stringify(collaborations));
  }, [collaborations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_meetings`, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notes`, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_conversations`, JSON.stringify(conversations));
  }, [conversations]);

  // 1. Task Operations
  const addTask = (taskData: Omit<TaskModel, 'id' | 'createdAt' | 'updatedAt'>): TaskModel => {
    const now = new Date().toISOString();
    const newTask: TaskModel = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    setTasks(prev => [newTask, ...prev]);

    // Automatically sync to Calendar Events
    const newEvent: CalendarEventModel = {
      id: `evt-task-${newTask.id}`,
      title: `Due: ${newTask.title}`,
      date: newTask.dueDate || new Date().toISOString().split('T')[0],
      type: 'task',
      projectId: newTask.projectId,
      projectName: newTask.projectName,
      referenceId: newTask.id,
      assignedTo: newTask.assignedAgent,
      status: newTask.status,
      priority: newTask.priority
    };
    setCalendarEvents(prev => [...prev, newEvent]);

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<TaskModel>) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );

    // Sync updates to corresponding calendar event if date/title changed
    setCalendarEvents(prev =>
      prev.map(e => {
        if (e.referenceId === taskId && e.type === 'task') {
          return {
            ...e,
            title: updates.title ? `Due: ${updates.title}` : e.title,
            date: updates.dueDate || e.date,
            assignedTo: updates.assignedAgent || e.assignedTo,
            status: updates.status || e.status,
            priority: updates.priority || e.priority
          };
        }
        return e;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setCalendarEvents(prev => prev.filter(e => e.referenceId !== taskId));
  };

  // 2. Meeting Operations
  const addMeeting = (meetingData: Omit<MeetingModel, 'id'>): MeetingModel => {
    const newMeeting: MeetingModel = {
      ...meetingData,
      id: `meet-${Date.now()}`
    };

    setMeetings(prev => [newMeeting, ...prev]);

    // Automatically sync to Calendar Events
    const newEvent: CalendarEventModel = {
      id: `evt-meet-${newMeeting.id}`,
      title: newMeeting.title,
      date: newMeeting.date,
      time: newMeeting.time,
      type: 'meeting',
      projectId: newMeeting.projectId,
      projectName: newMeeting.projectName,
      referenceId: newMeeting.id
    };
    setCalendarEvents(prev => [...prev, newEvent]);

    return newMeeting;
  };

  const updateMeeting = (meetingId: string, updates: Partial<MeetingModel>) => {
    setMeetings(prev =>
      prev.map(m => (m.id === meetingId ? { ...m, ...updates } : m))
    );
  };

  // 3. Convert Action Item from Meeting to a Task
  const convertActionItemToTask = (meetingId: string, actionItem: ActionItemModel): TaskModel => {
    const parentMeeting = meetings.find(m => m.id === meetingId);
    const assignedAgentName = (
      ['Alex', 'Marcus', 'Devon', 'Tessa', 'Elena'].includes(actionItem.assignee)
        ? actionItem.assignee
        : 'Devon'
    ) as TaskModel['assignedAgent'];

    const targetProject = parentMeeting
      ? projects.find(p => p.id === parentMeeting.projectId) || projects[0]
      : projects[0];

    const newTask = addTask({
      key: `${targetProject.key}-${Math.floor(250 + Math.random() * 50)}`,
      title: actionItem.text,
      description: `Action item originated from meeting "${parentMeeting?.title || 'Team Meeting'}" on ${parentMeeting?.date || 'today'}.`,
      projectId: targetProject.id,
      projectName: targetProject.name,
      client: targetProject.client,
      repository: targetProject.repository,
      status: 'todo',
      priority: 'high',
      assignedAgent: assignedAgentName,
      assignedRole: 'Software Developer',
      dueDate: actionItem.dueDate || new Date().toISOString().split('T')[0],
      acceptanceCriteria: [
        'Fulfill requirement specified in meeting action item',
        'Verify with team lead before marking complete'
      ]
    });

    // Mark action item as converted in meeting
    setMeetings(prev =>
      prev.map(m => {
        if (m.id === meetingId) {
          return {
            ...m,
            actionItems: m.actionItems.map(item =>
              item.id === actionItem.id
                ? { ...item, completed: true, convertedTaskId: newTask.id }
                : item
            )
          };
        }
        return m;
      })
    );

    return newTask;
  };

  // 4. Note Operations
  const addNote = (noteData: Omit<NoteModel, 'id' | 'createdAt' | 'updatedAt'>): NoteModel => {
    const now = new Date().toISOString();
    const newNote: NoteModel = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (noteId: string, updates: Partial<NoteModel>) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, ...updates, updatedAt: 'Just now' } : n))
    );
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const togglePinNote = (noteId: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // 5. Calendar Operations
  const addCalendarEvent = (eventData: Omit<CalendarEventModel, 'id'>): CalendarEventModel => {
    const newEvent: CalendarEventModel = {
      ...eventData,
      id: `evt-${Date.now()}`
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const deleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // 6. Assistant Operations
  const sendAssistantMessage = async (conversationId: string, text: string) => {
    const userMsg: ChatMessageModel = {
      id: `cmsg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation with user message immediately
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              updatedAt: 'Just now',
              messages: [...c.messages, userMsg]
            }
          : c
      )
    );

    // Run Assistant Service using live workspace context
    const response = await AssistantService.queryAssistant(text, {
      projects,
      tasks,
      agents,
      meetings,
      notes,
      selectedProjectId: conversations.find(c => c.id === conversationId)?.projectContextId
    });

    // Append Assistant Response
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: response.text.slice(0, 80) + '...',
              updatedAt: 'Just now',
              messages: [...c.messages, response]
            }
          : c
      )
    );
  };

  const createConversation = (title = 'New Inquiry'): string => {
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationModel = {
      id: newId,
      title,
      lastMessage: 'Ready to assist with your projects, code, and workforce.',
      updatedAt: 'Just now',
      projectContextId: 'all',
      messages: [
        {
          id: `cmsg-intro-${Date.now()}`,
          sender: 'assistant',
          text: `Hello! I am your **FORGE AI Assistant**. I have live context on all **${projects.length} projects**, **${tasks.length} active tasks**, your meeting transcripts, and your 5 AI teammates (Alex, Marcus, Devon, Tessa, and Elena).

What would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: [
            'What is the current status of the Acme project?',
            'What tasks are blocked?',
            'What did Marcus decide about the architecture?',
            'Summarise yesterday\'s meeting',
            'What has Devon completed?'
          ]
        }
      ]
    };
    setConversations(prev => [newConv, ...prev]);
    return newId;
  };

  const updateAgentStatus = (agentName: string, status: AgentModel['status'], taskTitle?: string) => {
    setAgents(prev =>
      prev.map(a =>
        a.name === agentName
          ? {
              ...a,
              status,
              currentTaskTitle: taskTitle || a.currentTaskTitle,
              lastActive: 'Just now'
            }
          : a
      )
    );
  };

  const resetAllToDefaults = () => {
    setProjects(seedProjects);
    setTasks(seedTasks);
    setAgents(seedAgents);
    setCollaborations(seedCollaborations);
    setMeetings(seedMeetings);
    setNotes(seedNotes);
    setCalendarEvents(seedCalendarEvents);
    setConversations(seedConversations);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        tasks,
        agents,
        collaborations,
        meetings,
        notes,
        calendarEvents,
        conversations,
        activeWorkspaceId,
        setActiveWorkspaceId,
        addTask,
        updateTask,
        deleteTask,
        addMeeting,
        updateMeeting,
        convertActionItemToTask,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addCalendarEvent,
        deleteCalendarEvent,
        sendAssistantMessage,
        createConversation,
        updateAgentStatus,
        resetAllToDefaults,
        agentRuns,
        promptRecords,
        agentHandoffs,
        providerStats,
        budgetConfig,
        traces,
        selectedRunId,
        setSelectedRunId,
        updateBudgetLimit,
        updateAgentRunStatus
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
