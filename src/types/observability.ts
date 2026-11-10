export type AgentExecutionStatus =
  | 'Idle'
  | 'Queued'
  | 'Planning'
  | 'Thinking'
  | 'Executing'
  | 'Waiting for another agent'
  | 'Tool execution'
  | 'Testing'
  | 'Reviewing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export type LLMProviderName = 'Anthropic' | 'OpenAI' | 'Google Gemini';

export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion?: number;
  reasoningPerMillion?: number;
}

export interface LLMModelInfo {
  id: string;
  provider: LLMProviderName;
  modelName: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsReasoningTokens: boolean;
  pricing: ModelPricing;
}

export interface ToolCall {
  id: string;
  toolName: string;
  category: 'filesystem' | 'git' | 'testing' | 'linting' | 'database' | 'search';
  inputArguments: Record<string, any>;
  responsePayload: Record<string, any> | string;
  startedAt: string;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout';
  error?: string;
}

export interface ExecutionStep {
  id: string;
  stepNumber: number;
  timestamp: string;
  type: 
    | 'task_received'
    | 'context_assembled'
    | 'prompt_submitted'
    | 'llm_response_received'
    | 'tool_invoked'
    | 'tool_response_received'
    | 'code_changed'
    | 'tests_executed'
    | 'handoff_completed';
  title: string;
  description: string;
  durationMs: number;
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  toolCallId?: string;
  metadata?: Record<string, any>;
}

export interface AgentRunOutput {
  summary: string;
  filesChanged: {
    path: string;
    additions: number;
    deletions: number;
    changeType: 'modified' | 'created' | 'deleted';
  }[];
  testResults: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    durationSeconds: number;
    failedTests?: string[];
  };
  recommendations: string[];
  errors: string[];
  warnings: string[];
}

export interface AgentRun {
  id: string;
  traceId: string;
  agentName: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  agentRole: string;
  avatar: string;
  taskId: string;
  taskTitle: string;
  taskKey: string;
  projectId: string;
  projectName: string;
  client: string;
  status: AgentExecutionStatus;
  provider: LLMProviderName;
  modelName: string;
  currentActivity: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  retryCount: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  estimatedCost: number;
  lastActive: string;
  steps: ExecutionStep[];
  toolCalls: ToolCall[];
  output?: AgentRunOutput;
  promptRecordId?: string;
}

export interface PromptContextItem {
  key: string;
  title: string;
  sourceType: 'user_request' | 'project_repo' | 'architecture_spec' | 'agent_handoff' | 'system_rules';
  sourceAgent?: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  tokenCount: number;
  content: string;
  isRedacted?: boolean;
}

export interface PromptRecord {
  id: string;
  runId: string;
  traceId: string;
  agentName: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  taskKey: string;
  taskTitle: string;
  provider: LLMProviderName;
  modelName: string;
  timestamp: string;
  originalUserRequest: string;
  systemInstructions: string;
  taskInstructions: string;
  projectContext: string;
  previousHandoffContext: {
    sourceAgent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
    summary: string;
    payload: string;
  };
  toolInstructions: string;
  modelParameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
    stopSequences?: string[];
    seed?: number;
  };
  finalModelResponse: string;
  conciseReasoningSummary: string; // Ethical concise reasoning summary, NOT private hidden CoT
  toolCalls: ToolCall[];
  contextItems: PromptContextItem[];
  tokens: {
    input: number;
    output: number;
    cached: number;
    reasoning: number;
    total: number;
  };
  cost: number;
  latencyMs: number;
  retryVersion: number;
  hasRedactedSecrets: boolean;
}

export interface AgentHandoff {
  id: string;
  traceId: string;
  stepNumber: number;
  fromAgent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'User';
  toAgent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena' | 'User' | 'Team';
  timestamp: string;
  message: string;
  taskId: string;
  taskTitle: string;
  status: 'Acknowledged' | 'Actioned' | 'In Review' | 'Completed' | 'Pending';
  handoffReference: string;
  payloadSummary: string;
  artifactsTransferred: string[];
}

export interface LLMRequestRecord {
  id: string;
  traceId: string;
  runId: string;
  timestamp: string;
  agentName: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  provider: LLMProviderName;
  modelName: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  cost: number;
  status: 'success' | 'rate_limited' | 'error' | 'retried';
  errorMessage?: string;
}

export interface ProviderUsageStats {
  provider: LLMProviderName;
  models: {
    modelName: string;
    requestCount: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    reasoningTokens: number;
    totalCost: number;
    failedRequests: number;
    retryRequests: number;
    avgLatencyMs: number;
  }[];
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  balanceStatus: 'Balance unavailable (Invoiced)' | 'Prepaid tier active' | 'GCP Project linked' | 'Demo mock';
  creditsRemainingFormatted?: string;
  billingType: 'Enterprise Invoiced' | 'Pay-as-you-go' | 'Monthly Quota';
}

export interface BudgetConfig {
  monthlyBudget: number; // e.g. 500
  currentMonthlySpent: number; // e.g. 428.60
  warningThresholdPercent: number; // e.g. 80
  projectBudgets: {
    projectId: string;
    projectName: string;
    budget: number;
    spent: number;
  }[];
  agentBudgets: {
    agentName: string;
    budget: number;
    spent: number;
  }[];
  alerts: {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    timestamp: string;
  }[];
}

export interface ExecutionEvent {
  id: string;
  traceId: string;
  timestamp: string;
  elapsedMs: number;
  type: 
    | 'user_request'
    | 'workflow_step'
    | 'agent_start'
    | 'llm_call'
    | 'tool_execution'
    | 'git_operation'
    | 'test_run'
    | 'review_audit'
    | 'approval_gate'
    | 'agent_handoff';
  title: string;
  detail: string;
  agentName?: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  durationMs: number;
  status: 'success' | 'warning' | 'error' | 'in_progress';
  metadata?: Record<string, any>;
}

export interface ExecutionTrace {
  traceId: string;
  rootTaskId: string;
  taskKey: string;
  taskTitle: string;
  client: string;
  projectName: string;
  initialUserRequest: string;
  status: 'In Progress' | 'Completed' | 'Awaiting Sign-off' | 'Failed';
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  totalCost: number;
  totalTokens: number;
  participatingAgents: ('Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena')[];
  primaryModel: string;
  events: ExecutionEvent[];
}

export interface ObservabilityState {
  agentRuns: AgentRun[];
  promptRecords: PromptRecord[];
  handoffs: AgentHandoff[];
  llmRequests: LLMRequestRecord[];
  providerStats: ProviderUsageStats[];
  budgetConfig: BudgetConfig;
  traces: ExecutionTrace[];
}

/**
 * Interface prepared for future backend OpenTelemetry / Langfuse / Temporal integration.
 */
export interface IObservabilityService {
  getLiveAgents(): Promise<AgentRun[]>;
  getAgentRuns(filters?: { agent?: string; status?: string; taskId?: string }): Promise<AgentRun[]>;
  getPromptRecord(id: string): Promise<PromptRecord | null>;
  getExecutionTraces(filters?: { query?: string; status?: string; agent?: string }): Promise<ExecutionTrace[]>;
  getTraceById(traceId: string): Promise<ExecutionTrace | null>;
  getLLMUsageStats(dateRange?: string): Promise<ProviderUsageStats[]>;
  getBudgetConfig(): Promise<BudgetConfig>;
  updateBudgetLimit(newLimit: number): Promise<void>;
}
