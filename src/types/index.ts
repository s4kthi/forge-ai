export type IssueTaskStatus =
  | 'Backlog'
  | 'Ready'
  | 'Planning'
  | 'Development'
  | 'Testing'
  | 'Review'
  | 'Awaiting Approval'
  | 'Completed'
  | 'Failed';

export type ProjectHealth = 'Optimal' | 'Healthy' | 'Needs Attention' | 'At Risk';

export interface ProjectEntity {
  id: string;
  name: string;
  key: string;
  clientName: 'Acme Digital Agency' | 'Northstar Commerce' | 'Vertex Technologies' | string;
  clientId: string;
  description: string;
  repository: {
    name: string;
    url: string;
    defaultBranch: string;
    provider: 'github' | 'gitlab' | 'bitbucket';
    lastSynced: string;
  };
  techStack: string[];
  health: ProjectHealth;
  openTasksCount: number;
  completedTasksCount: number;
  lastActivity: string;
  leadEmployee: string;
  activeBranch: string;
  targetRelease: string;
}

export interface TaskItem {
  id: string;
  key: string;
  title: string;
  description: string;
  client: 'Acme Digital Agency' | 'Northstar Commerce' | 'Vertex Technologies' | string;
  clientId: string;
  projectName: string;
  projectId: string;
  repository: string;
  repositoryBranch: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: IssueTaskStatus;
  acceptanceCriteria: string[];
  assignedEmployee: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'Unassigned';
  assignedRole?: string;
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
  cost?: string;
  diffStats?: {
    additions: number;
    deletions: number;
    files: number;
  };
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus =
  | 'backlog'
  | 'in_analysis'
  | 'in_execution'
  | 'awaiting_approval'
  | 'verifying'
  | 'done'
  | 'rejected';

export type TaskType =
  | 'feature'
  | 'bugfix'
  | 'refactor'
  | 'security_patch'
  | 'infrastructure'
  | 'migration';

export type AgentRole =
  | 'System Architect'
  | 'Lead Engineer'
  | 'SecOps Auditor'
  | 'QA Test Engineer'
  | 'DevOps SRE'
  | 'Code Reviewer';

export type AgentStatus = 'busy' | 'idle' | 'evaluating' | 'paused' | 'failed';

export type AutonomyLevel =
  | 'L1 Supervised'
  | 'L2 Semi-Autonomous'
  | 'L3 High Autonomy'
  | 'L4 Full Autonomous';

export type ExecutionStatus =
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'interrupted'
  | 'pending_review';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalType =
  | 'merge_pr'
  | 'deploy_production'
  | 'modify_iac'
  | 'secops_override'
  | 'cost_threshold';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  tier: 'Enterprise' | 'Scale' | 'GovCloud';
  region: string;
  activeTenants: number;
  billingStatus: 'healthy' | 'trial' | 'over_quota';
  monthlyTokenQuota: number;
  monthlyTokensUsed: number;
  createdAt: string;
}

export interface Client {
  id: string;
  agencyId: string;
  name: string;
  code: string;
  domain: string;
  contactEmail: string;
  securityTier: 'FedRAMP Moderate' | 'SOC2 Type II' | 'ISO 27001' | 'Standard';
  status: 'active' | 'suspended' | 'onboarding';
  reposCount: number;
  projectsCount: number;
  activeAgentsCount: number;
}

export interface Repository {
  id: string;
  projectId: string;
  name: string;
  url: string;
  defaultBranch: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  primaryLanguage: string;
  securityScanningEnabled: boolean;
  lastSyncedAt: string;
  openPRsCount: number;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  key: string;
  description: string;
  status: 'active' | 'planning' | 'blocked' | 'completed';
  priority: Priority;
  repositoryIds: string[];
  repositories: Repository[];
  activeAgentIds: string[];
  progressPercent: number;
  openTasksCount: number;
  targetReleaseDate: string;
  tags: string[];
}

export interface AIAgent {
  id: string;
  callsign: string;
  avatarSeed: string;
  role: AgentRole;
  model: string;
  status: AgentStatus;
  currentTaskId?: string;
  currentTaskTitle?: string;
  efficiencyScore: number; // 0 - 100
  tokensConsumed24h: number;
  tasksCompleted: number;
  specialty: string[];
  autonomyLevel: AutonomyLevel;
  lastHeartbeat: string;
  uptimeHours: number;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentRole?: AgentRole;
  branchName?: string;
  pullRequestUrl?: string;
  tokensUsed: number;
  createdAt: string;
  updatedAt: string;
  estimatedComplexity: 'S' | 'M' | 'L' | 'XL';
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'command';
  message: string;
}

export interface Execution {
  id: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  agentId: string;
  agentCallsign: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  logs: ExecutionLog[];
  diffStats: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  contextTokens: number;
}

export interface Approval {
  id: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  executionId: string;
  type: ApprovalType;
  requesterAgentId: string;
  requesterAgentName: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  summary: string;
  impactAnalysis: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  changesSummary: {
    files: number;
    additions: number;
    deletions: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: 'agent' | 'user' | 'system';
  };
  action: string;
  category: 'security' | 'execution' | 'policy' | 'auth' | 'agent_lifecycle';
  target: string;
  status: 'success' | 'denied' | 'flagged';
  ipAddress?: string;
  details: string;
}

export type PipelineStage =
  | 'INGESTED'
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'REVIEW'
  | 'APPROVAL';

export interface ToolAccess {
  name: string;
  category: string;
  description: string;
  accessLevel: 'Full AST' | 'Read Only' | 'Sandboxed Runner' | 'Privileged Enclave';
}

export interface PermissionItem {
  scope: string;
  level: 'Read' | 'Write' | 'Admin' | 'Enforced Gate';
  description: string;
}

export interface ExecutionHistoryRecord {
  id: string;
  taskTitle: string;
  client: string;
  repository: string;
  completedAt: string;
  duration: string;
  status: 'Completed' | 'Blocked' | 'Rejected';
  linesChanged: string;
  cost: string;
}

export interface EmployeeActivityLog {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  type: 'commit' | 'test' | 'spec' | 'review' | 'analysis';
  details: string;
}

export interface AIEmployee {
  id: string;
  name: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | string;
  callsign: string;
  role:
    | 'AI Product Manager'
    | 'AI Software Architect'
    | 'AI Full-Stack Developer'
    | 'AI QA Engineer'
    | 'AI Code Reviewer'
    | string;
  avatarSeed: string;
  model: string;
  status: 'Active' | 'Reviewing' | 'Compiling' | 'Testing' | 'Idle' | 'Awaiting Gate' | 'Disabled';
  isEnabled: boolean;
  responsibilities: string[];
  successRate: number; // e.g. 98.4
  avgDuration: string; // e.g. "14m 30s"
  currentAssignment?: {
    taskId: string;
    taskTitle: string;
    stage: PipelineStage;
    client: string;
    duration: string;
    progressPercent: number;
    repository: string;
    branch: string;
  };
  efficiencyScore: number;
  tasksCompleted: number;
  tokensConsumed24h: number;
  monthlyCost: number;
  specialties: string[];
  tools: ToolAccess[];
  permissions: PermissionItem[];
  executionHistory: ExecutionHistoryRecord[];
  recentActivity: EmployeeActivityLog[];
  autonomyLevel: AutonomyLevel;
  uptimeHours: number;
  bio: string;
}

export interface ActiveExecutionItem {
  id: string;
  taskTitle: string;
  client: string;
  clientCode: string;
  repository: string;
  repositoryBranch: string;
  employee: {
    id: string;
    name: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | string;
    role: string;
  };
  stage: PipelineStage;
  duration: string;
  durationSeconds: number;
  cost: string;
  status: 'Running' | 'Verifying' | 'Compiling' | 'Reviewing' | 'Testing' | 'Awaiting Sign-off' | 'Optimal';
  progress: number;
  priority: Priority;
  diffStats: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  recentLogs: {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'command';
    message: string;
  }[];
  description: string;
}

export interface LiveActivityEvent {
  id: string;
  type:
    | 'agent_started'
    | 'repo_indexed'
    | 'impl_completed'
    | 'tests_passed'
    | 'reviewer_issue'
    | 'pr_awaiting_approval';
  title: string;
  description: string;
  timestamp: string;
  employeeName?: string;
  clientName?: string;
  repoName?: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  taskId?: string;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'approval' | 'security' | 'execution' | 'system';
  severity: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  link?: string;
}
