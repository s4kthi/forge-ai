import { 
  AgentRun, 
  PromptRecord, 
  AgentHandoff, 
  ProviderUsageStats, 
  BudgetConfig, 
  ExecutionTrace 
} from '../types/observability';

export const seedAgentRuns: AgentRun[] = [
  {
    id: 'run-devon-248',
    traceId: 'tr-forge-8921-auth',
    agentName: 'Devon',
    agentRole: 'Software Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    taskKey: 'ACME-248',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    status: 'Waiting for another agent',
    provider: 'OpenAI',
    modelName: 'gpt-4o',
    currentActivity: 'Devon implemented the email regex normalization patch in src/auth/login.tsx and is waiting for Tessa to complete regression test validation.',
    startedAt: '10:42:01 UTC',
    completedAt: undefined,
    durationSeconds: 342,
    retryCount: 1,
    inputTokens: 38400,
    outputTokens: 6200,
    cachedTokens: 14200,
    reasoningTokens: 0,
    estimatedCost: 0.158,
    lastActive: '1m ago',
    steps: [
      {
        id: 'step-d1',
        stepNumber: 1,
        timestamp: '10:42:01 UTC',
        type: 'task_received',
        title: 'Task Received from Alex',
        description: 'Received technical specification and acceptance criteria for ACME-248 from Alex (PM).',
        durationMs: 120,
        status: 'completed'
      },
      {
        id: 'step-d2',
        stepNumber: 2,
        timestamp: '10:42:05 UTC',
        type: 'context_assembled',
        title: 'Repository Context Assembled',
        description: 'Fetched Marcus RFC document on RFC-5222 email normalization and parsed src/auth/login.tsx AST.',
        durationMs: 420,
        status: 'completed'
      },
      {
        id: 'step-d3',
        stepNumber: 3,
        timestamp: '10:42:11 UTC',
        type: 'prompt_submitted',
        title: 'Submitted Patch Generation Prompt to GPT-4o',
        description: 'Transmitted system prompt, context files, and tool definitions to OpenAI gpt-4o endpoint.',
        durationMs: 1480,
        status: 'completed'
      },
      {
        id: 'step-d4',
        stepNumber: 4,
        timestamp: '10:42:16 UTC',
        type: 'tool_invoked',
        title: 'Invoked ast_grep_search',
        description: 'Searched repository for all references to isValidEmail and trim() helpers.',
        durationMs: 310,
        status: 'completed',
        toolCallId: 'tc-devon-ast-1'
      },
      {
        id: 'step-d5',
        stepNumber: 5,
        timestamp: '10:42:24 UTC',
        type: 'code_changed',
        title: 'Applied Patch to src/auth/login.tsx',
        description: 'Updated input regex to RFC-5222 compliant pattern and added sanitizeEmail() pipeline step.',
        durationMs: 580,
        status: 'completed'
      },
      {
        id: 'step-d6',
        stepNumber: 6,
        timestamp: '10:42:32 UTC',
        type: 'tests_executed',
        title: 'Triggered Test Suite with Tessa',
        description: 'Dispatched automated verification suite (24 unit tests, 8 integration tests) to Tessa (QA).',
        durationMs: 820,
        status: 'completed'
      },
      {
        id: 'step-d7',
        stepNumber: 7,
        timestamp: '10:42:48 UTC',
        type: 'handoff_completed',
        title: 'Handoff to Elena for Code Review',
        description: 'All 37 test cases passed. Code submitted to Elena for static audit and quality gate sign-off.',
        durationMs: 240,
        status: 'completed'
      }
    ],
    toolCalls: [
      {
        id: 'tc-devon-ast-1',
        toolName: 'ast_grep_search',
        category: 'filesystem',
        inputArguments: {
          pattern: 'function isValidEmail($$$) { $$$ }',
          paths: ['src/auth', 'src/utils']
        },
        responsePayload: {
          matchesCount: 2,
          files: ['src/auth/login.tsx:42', 'src/utils/validators.ts:18']
        },
        startedAt: '10:42:16 UTC',
        durationMs: 310,
        status: 'success'
      },
      {
        id: 'tc-devon-git-1',
        toolName: 'git_diff_staged',
        category: 'git',
        inputArguments: {
          files: ['src/auth/login.tsx', 'src/utils/validators.ts']
        },
        responsePayload: {
          additions: 14,
          deletions: 3,
          diffSizeKb: 1.8
        },
        startedAt: '10:42:25 UTC',
        durationMs: 140,
        status: 'success'
      }
    ],
    output: {
      summary: 'Replaced legacy lax regex with strict RFC-5222 compliant validator, preventing sub-domain and unicode injection attacks.',
      filesChanged: [
        { path: 'src/auth/login.tsx', additions: 14, deletions: 3, changeType: 'modified' },
        { path: 'src/utils/validators.ts', additions: 8, deletions: 2, changeType: 'modified' }
      ],
      testResults: {
        total: 37,
        passed: 37,
        failed: 0,
        skipped: 0,
        durationSeconds: 4.8
      },
      recommendations: [
        'Consider enabling DNS MX-record lookup check in a subsequent async microservice.',
        'Migrate legacy accounts with historic unescaped domains on next login.'
      ],
      errors: [],
      warnings: ['Unicode homoglyph warning: Cyrillic letters in email domains are flagged for MFA challenge.']
    },
    promptRecordId: 'pr-devon-248'
  },
  {
    id: 'run-marcus-248',
    traceId: 'tr-forge-8921-auth',
    agentName: 'Marcus',
    agentRole: 'Software Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    taskKey: 'ACME-248',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    status: 'Completed',
    provider: 'Anthropic',
    modelName: 'claude-3-5-sonnet-20241022',
    currentActivity: 'Architecture plan approved. Spec transferred to Devon for implementation.',
    startedAt: '10:35:12 UTC',
    completedAt: '10:41:40 UTC',
    durationSeconds: 388,
    retryCount: 0,
    inputTokens: 52100,
    outputTokens: 8900,
    cachedTokens: 28400,
    reasoningTokens: 0,
    estimatedCost: 0.289,
    lastActive: '8m ago',
    steps: [
      {
        id: 'step-m1',
        stepNumber: 1,
        timestamp: '10:35:12 UTC',
        type: 'task_received',
        title: 'Requirement Decomposition Received',
        description: 'Received initial customer bug report from Alex (PM).',
        durationMs: 90,
        status: 'completed'
      },
      {
        id: 'step-m2',
        stepNumber: 2,
        timestamp: '10:36:04 UTC',
        type: 'tool_invoked',
        title: 'Invoked dependency_tree_inspector',
        description: 'Checked existing auth dependencies for validator.js or zod compatibility.',
        durationMs: 440,
        status: 'completed'
      },
      {
        id: 'step-m3',
        stepNumber: 3,
        timestamp: '10:38:20 UTC',
        type: 'llm_response_received',
        title: 'Generated Architecture RFC',
        description: 'Created ADR-042: RFC-5222 Compliant Email Normalization without adding heavy third-party dependencies.',
        durationMs: 2800,
        status: 'completed'
      },
      {
        id: 'step-m4',
        stepNumber: 4,
        timestamp: '10:41:40 UTC',
        type: 'handoff_completed',
        title: 'Handoff to Devon',
        description: 'Provided formal interface definition to Devon (Software Developer).',
        durationMs: 180,
        status: 'completed'
      }
    ],
    toolCalls: [
      {
        id: 'tc-marcus-dep-1',
        toolName: 'dependency_tree_inspector',
        category: 'filesystem',
        inputArguments: { packageJsonPath: 'package.json' },
        responsePayload: { dependenciesCount: 42, hasZod: true, zodVersion: '^3.23.8' },
        startedAt: '10:36:04 UTC',
        durationMs: 440,
        status: 'success'
      }
    ],
    output: {
      summary: 'ADR-042 authored and committed to workspace. Devon assigned to write unit tests and patch regex.',
      filesChanged: [{ path: 'docs/adr/042-email-normalization.md', additions: 64, deletions: 0, changeType: 'created' }],
      testResults: { total: 0, passed: 0, failed: 0, skipped: 0, durationSeconds: 0 },
      recommendations: ['Avoid installing 400KB email libraries; use native Zod schema extension.'],
      errors: [],
      warnings: []
    },
    promptRecordId: 'pr-marcus-248'
  },
  {
    id: 'run-tessa-248',
    traceId: 'tr-forge-8921-auth',
    agentName: 'Tessa',
    agentRole: 'QA Engineer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    taskKey: 'ACME-248',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    status: 'Testing',
    provider: 'Google Gemini',
    modelName: 'gemini-1.5-flash',
    currentActivity: 'Tessa is validating browser regression test cases using Chromium headless runner.',
    startedAt: '10:42:30 UTC',
    completedAt: undefined,
    durationSeconds: 210,
    retryCount: 0,
    inputTokens: 24600,
    outputTokens: 4100,
    cachedTokens: 11000,
    reasoningTokens: 0,
    estimatedCost: 0.048,
    lastActive: 'Just now',
    steps: [
      {
        id: 'step-t1',
        stepNumber: 1,
        timestamp: '10:42:30 UTC',
        type: 'task_received',
        title: 'Patch Received from Devon',
        description: 'Received diff patch on branch fix/email-validation-248.',
        durationMs: 80,
        status: 'completed'
      },
      {
        id: 'step-t2',
        stepNumber: 2,
        timestamp: '10:42:36 UTC',
        type: 'tool_invoked',
        title: 'Invoked npm_test_runner',
        description: 'Running vitest unit test suite across src/auth/__tests__.',
        durationMs: 2400,
        status: 'completed'
      },
      {
        id: 'step-t3',
        stepNumber: 3,
        timestamp: '10:42:48 UTC',
        type: 'tool_invoked',
        title: 'Executing Cypress E2E Login Scenarios',
        description: 'Simulating valid, invalid, unicode, and plus-addressed email inputs.',
        durationMs: 3800,
        status: 'completed'
      }
    ],
    toolCalls: [
      {
        id: 'tc-tessa-test-1',
        toolName: 'vitest_runner',
        category: 'testing',
        inputArguments: { filter: 'auth.test.ts', coverage: true },
        responsePayload: { passed: 24, failed: 0, coveragePct: 98.4 },
        startedAt: '10:42:36 UTC',
        durationMs: 2400,
        status: 'success'
      }
    ],
    output: {
      summary: '24 unit tests, 8 integration tests, and 5 browser end-to-end tests completed with 100% pass rate.',
      filesChanged: [{ path: 'src/auth/__tests__/login.test.ts', additions: 32, deletions: 4, changeType: 'modified' }],
      testResults: { total: 37, passed: 37, failed: 0, skipped: 0, durationSeconds: 6.2 },
      recommendations: ['Add performance benchmark on 10,000 bulk email sanitization loops.'],
      errors: [],
      warnings: []
    },
    promptRecordId: 'pr-tessa-248'
  },
  {
    id: 'run-elena-248',
    traceId: 'tr-forge-8921-auth',
    agentName: 'Elena',
    agentRole: 'Code Reviewer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    taskKey: 'ACME-248',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    status: 'Reviewing',
    provider: 'Anthropic',
    modelName: 'claude-3-5-sonnet-20241022',
    currentActivity: 'Elena is conducting a static security vulnerability audit for RegEx Denial of Service (ReDoS) vulnerabilities.',
    startedAt: '10:43:02 UTC',
    completedAt: undefined,
    durationSeconds: 154,
    retryCount: 0,
    inputTokens: 41200,
    outputTokens: 7800,
    cachedTokens: 18900,
    reasoningTokens: 0,
    estimatedCost: 0.241,
    lastActive: '30s ago',
    steps: [
      {
        id: 'step-e1',
        stepNumber: 1,
        timestamp: '10:43:02 UTC',
        type: 'task_received',
        title: 'Review Request Dispatched',
        description: 'Received diff from Devon with Tessa passing test certification.',
        durationMs: 70,
        status: 'completed'
      },
      {
        id: 'step-e2',
        stepNumber: 2,
        timestamp: '10:43:12 UTC',
        type: 'tool_invoked',
        title: 'Invoked security_audit_scanner',
        description: 'Analyzed regular expression catastrophic backtracking complexity.',
        durationMs: 890,
        status: 'completed'
      }
    ],
    toolCalls: [
      {
        id: 'tc-elena-sec-1',
        toolName: 'redos_analyzer',
        category: 'linting',
        inputArguments: { regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        responsePayload: { complexity: 'linear O(n)', vulnerable: false },
        startedAt: '10:43:12 UTC',
        durationMs: 890,
        status: 'success'
      }
    ],
    output: {
      summary: 'Verified linear O(n) regex complexity. Zero ReDoS attack surface detected. Code ready for Pull Request #248 human lead sign-off.',
      filesChanged: [],
      testResults: { total: 0, passed: 0, failed: 0, skipped: 0, durationSeconds: 0 },
      recommendations: ['Human sign-off required according to SOC2 Tier-1 auth governance policy.'],
      errors: [],
      warnings: []
    },
    promptRecordId: 'pr-elena-248'
  },
  {
    id: 'run-alex-104',
    traceId: 'tr-forge-8922-db',
    agentName: 'Alex',
    agentRole: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    taskId: 'task-3',
    taskTitle: 'Optimize database connection pool for checkout surges',
    taskKey: 'NST-104',
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    client: 'Northstar Commerce',
    status: 'Planning',
    provider: 'Anthropic',
    modelName: 'claude-3-5-sonnet-20241022',
    currentActivity: 'Alex is gathering Black Friday throughput telemetry to calculate PostgreSQL pool sizing requirements.',
    startedAt: '11:15:00 UTC',
    completedAt: undefined,
    durationSeconds: 180,
    retryCount: 0,
    inputTokens: 29500,
    outputTokens: 5400,
    cachedTokens: 12400,
    reasoningTokens: 0,
    estimatedCost: 0.169,
    lastActive: '4m ago',
    steps: [
      {
        id: 'step-a1',
        stepNumber: 1,
        timestamp: '11:15:00 UTC',
        type: 'task_received',
        title: 'New High Priority Issue Triaged',
        description: 'Triaged NST-104 from Northstar Commerce account manager.',
        durationMs: 110,
        status: 'completed'
      },
      {
        id: 'step-a2',
        stepNumber: 2,
        timestamp: '11:15:40 UTC',
        type: 'context_assembled',
        title: 'Aggregated Datadog Connection Metrics',
        description: 'Extracted peak concurrent connection saturation reports.',
        durationMs: 650,
        status: 'completed'
      }
    ],
    toolCalls: [],
    promptRecordId: 'pr-alex-104'
  }
];

export const seedPromptRecords: PromptRecord[] = [
  {
    id: 'pr-devon-248',
    runId: 'run-devon-248',
    traceId: 'tr-forge-8921-auth',
    agentName: 'Devon',
    taskKey: 'ACME-248',
    taskTitle: 'Fix email validation in authentication flow',
    provider: 'OpenAI',
    modelName: 'gpt-4o',
    timestamp: '10:42:11 UTC',
    originalUserRequest: 'Users with valid apostrophes (e.g. o\'connor@acme.org) or plus signs (e.g. user+tag@domain.com) are rejected by the login form. Please fix the regex to support all RFC-5222 standard emails while avoiding catastrophic ReDoS.',
    systemInstructions: `You are Devon, the AI Full-Stack Developer on the FORGE AI workforce.
Your core competencies: TypeScript, React 19, Node.js, and zero-defect code patches.
Operating constraints:
1. Preserve all existing docstrings and comments unrelated to code changes.
2. Adhere strictly to the architectural constraints provided by Marcus in ADR-042.
3. Write clean, idiomatic TypeScript with strict type checking.
4. Do not commit hardcoded secrets, tokens, or environment variables.
Environment Configuration:
- RUNTIME: Node.js 22 LTS
- CLIENT_KEY: [REDACTED_CLIENT_SECRET]
- DATABASE_HOST: pg-cluster-prod-01.internal
- AUTH_SECRET: [REDACTED_HMAC_KEY]`,
    taskInstructions: `Task ID: ACME-248
Title: Fix email validation in authentication flow
Acceptance Criteria:
- Accept valid RFC-5222 emails including plus-tagging and single apostrophes.
- Reject invalid domains without top-level domain suffixes.
- Sanitize whitespace before submission.
- Ensure linear time complexity to prevent ReDoS.`,
    projectContext: `Project: Acme Portal Hub (acme-org/portal-hub)
Stack: React 19, Tailwind CSS, Zod v3.23, Vite.
File under inspection: src/auth/login.tsx
Related validator: src/utils/validators.ts`,
    previousHandoffContext: {
      sourceAgent: 'Marcus',
      summary: 'ADR-042 Architectural Decision: Extend existing Zod schema rather than introducing an external dependency.',
      payload: 'export const EmailSchema = z.string().trim().email().min(5).max(254);'
    },
    toolInstructions: `Available Tools:
- ast_grep_search(pattern, paths): Fast AST pattern matcher across repo files.
- git_diff_staged(files): Returns unified diff of currently modified buffers.
- npm_test_runner(filter): Runs local test suites.`,
    modelParameters: {
      temperature: 0.1,
      topP: 0.95,
      maxTokens: 4096,
      stopSequences: ['```end'],
      seed: 42
    },
    finalModelResponse: `Based on Marcus's ADR-042, here is the implementation patch for \`src/auth/login.tsx\` and \`src/utils/validators.ts\`.

### 1. Root Cause
The legacy validator in \`login.tsx\` used \`/^[a-z0-9]+@[a-z0-9]+\\.[a-z]{2,4}$/i\` which strictly omitted standard characters like \`+\`, \`'\`, and international sub-domains.

### 2. Implementation Patch
\`\`\`typescript
// src/utils/validators.ts
import { z } from 'zod';

export const emailValidator = z
  .string({ required_error: 'Email is required' })
  .trim()
  .min(3, 'Email must be at least 3 characters')
  .max(254, 'Email exceeds maximum allowed length')
  .regex(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
    'Please enter a valid RFC-compliant email address'
  );
\`\`\`

All regex quantifiers are un-nested, guaranteeing linear \\(O(n)\\) complexity and total ReDoS immunity.`,
    conciseReasoningSummary: 'Evaluated Zod standard email helper vs RFC-5222 regex. Selected optimized un-nested quantifier pattern to guarantee linear execution time and support plus-tagging without introducing new npm dependencies.',
    toolCalls: [
      {
        id: 'tc-devon-ast-1',
        toolName: 'ast_grep_search',
        category: 'filesystem',
        inputArguments: {
          pattern: 'function isValidEmail($$$) { $$$ }',
          paths: ['src/auth', 'src/utils']
        },
        responsePayload: {
          matchesCount: 2,
          files: ['src/auth/login.tsx:42', 'src/utils/validators.ts:18']
        },
        startedAt: '10:42:16 UTC',
        durationMs: 310,
        status: 'success'
      }
    ],
    contextItems: [
      {
        key: 'req-original',
        title: 'Original User Request',
        sourceType: 'user_request',
        tokenCount: 82,
        content: 'Users with valid apostrophes or plus signs are rejected by login form.'
      },
      {
        key: 'sys-rules',
        title: 'Devon System Prompt',
        sourceType: 'system_rules',
        tokenCount: 240,
        content: 'You are Devon, the AI Full-Stack Developer on the FORGE AI workforce...'
      },
      {
        key: 'adr-042',
        title: 'Marcus Architecture Handoff',
        sourceType: 'agent_handoff',
        sourceAgent: 'Marcus',
        tokenCount: 310,
        content: 'ADR-042: Use un-nested quantifier regex with Zod v3.23...'
      },
      {
        key: 'env-config',
        title: 'Runtime Environment Variables (Redacted)',
        sourceType: 'system_rules',
        tokenCount: 95,
        content: 'AUTH_SECRET: [REDACTED_HMAC_KEY]\nCLIENT_KEY: [REDACTED_CLIENT_SECRET]',
        isRedacted: true
      }
    ],
    tokens: {
      input: 38400,
      output: 6200,
      cached: 14200,
      reasoning: 0,
      total: 44600
    },
    cost: 0.158,
    latencyMs: 1480,
    retryVersion: 1,
    hasRedactedSecrets: true
  },
  {
    id: 'pr-marcus-248',
    runId: 'run-marcus-248',
    traceId: 'tr-forge-8921-auth',
    agentName: 'Marcus',
    taskKey: 'ACME-248',
    taskTitle: 'Architecture Plan for RFC-5222 Email Standardization',
    provider: 'Anthropic',
    modelName: 'claude-3-5-sonnet-20241022',
    timestamp: '10:38:20 UTC',
    originalUserRequest: 'Analyze authentication email failure logs and formulate an architectural specification for the workforce.',
    systemInstructions: `You are Marcus, the AI Software Architect on the FORGE AI workforce.
Your core competencies: Distributed systems design, dependency governance, RFC compliance, and zero-trust engineering.
Always produce lightweight, maintainable Architectural Decision Records (ADRs).
Redact all company API tokens: [REDACTED_TOKEN].`,
    taskInstructions: 'Analyze requirements, evaluate dependency bloat risk, and return actionable specification for Devon.',
    projectContext: 'Acme Portal Hub. Tech stack: React 19, Node.js, Zod.',
    previousHandoffContext: {
      sourceAgent: 'Alex',
      summary: 'Customer escalated issue ACME-248 to Tier 1 priority.',
      payload: 'Affecting ~3.2% of corporate enterprise sign-ups with corporate alias formatting.'
    },
    toolInstructions: 'dependency_tree_inspector, read_ast',
    modelParameters: {
      temperature: 0.2,
      topP: 0.9,
      maxTokens: 4096
    },
    finalModelResponse: '# ADR-042: RFC-5222 Email Normalization\n\n## Status\nApproved\n\n## Context\nUsers with valid RFC aliases are facing false-positive validation errors.\n\n## Decision\nExtend existing Zod schema rather than importing 400KB external libraries. Ensure linear time regex complexity.',
    conciseReasoningSummary: 'Evaluated bundle size impact of validator.js (+420KB) vs custom Zod schema (+0KB). Chose zero-dependency Zod regex to preserve 98 Lighthouse performance score.',
    toolCalls: [],
    contextItems: [
      {
        key: 'alex-req',
        title: 'PM Task Handoff',
        sourceType: 'agent_handoff',
        sourceAgent: 'Alex',
        tokenCount: 160,
        content: 'Customer escalated issue ACME-248 to Tier 1 priority.'
      }
    ],
    tokens: {
      input: 52100,
      output: 8900,
      cached: 28400,
      reasoning: 0,
      total: 61000
    },
    cost: 0.289,
    latencyMs: 2800,
    retryVersion: 0,
    hasRedactedSecrets: true
  }
];

export const seedAgentHandoffs: AgentHandoff[] = [
  {
    id: 'h-1',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 1,
    fromAgent: 'User',
    toAgent: 'Alex',
    timestamp: '10:32:00 UTC',
    message: 'Sarah submitted issue ACME-248: Users with apostrophes and plus signs cannot log in.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'ISSUE-REPORT #248',
    payloadSummary: 'User report with reproduction steps and stack trace.',
    artifactsTransferred: ['repro_payload.json']
  },
  {
    id: 'h-2',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 2,
    fromAgent: 'Alex',
    toAgent: 'Marcus',
    timestamp: '10:34:10 UTC',
    message: 'Alex decomposed requirements: Marcus, please analyze architecture and determine dependency impact.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'REQ-SPEC-248',
    payloadSummary: 'Task breakdown with priority High and target branch main.',
    artifactsTransferred: ['task_spec.md']
  },
  {
    id: 'h-3',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 3,
    fromAgent: 'Marcus',
    toAgent: 'Alex',
    timestamp: '10:41:40 UTC',
    message: 'Marcus completed architecture review: Authored ADR-042 recommending zero-dependency Zod schema.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'ADR-042-SPEC',
    payloadSummary: 'Formal architectural decision and interface contract.',
    artifactsTransferred: ['docs/adr/042-email-normalization.md']
  },
  {
    id: 'h-4',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 4,
    fromAgent: 'Alex',
    toAgent: 'Devon',
    timestamp: '10:42:01 UTC',
    message: 'Alex assigned implementation to Devon with Marcus ADR-042 attached.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'DISPATCH-DEVON-01',
    payloadSummary: 'Implementation mandate targeting src/auth/login.tsx.',
    artifactsTransferred: ['docs/adr/042-email-normalization.md', 'acceptance_criteria.json']
  },
  {
    id: 'h-5',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 5,
    fromAgent: 'Devon',
    toAgent: 'Tessa',
    timestamp: '10:42:30 UTC',
    message: 'Devon generated initial patch and requested test validation.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'PATCH-V1',
    payloadSummary: 'Diff patch with preliminary unit test modifications.',
    artifactsTransferred: ['patch_v1.diff']
  },
  {
    id: 'h-6',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 6,
    fromAgent: 'Tessa',
    toAgent: 'Devon',
    timestamp: '10:42:35 UTC',
    message: 'Tessa reported 1 failed test: plus-tagging with multiple dots (user+test.1@domain.com) failed regex.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'TEST-FAILURE-REPORT',
    payloadSummary: 'Failed assertion: Expected true, received false for user+test.1@domain.com.',
    artifactsTransferred: ['failed_test_case_4.json']
  },
  {
    id: 'h-7',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 7,
    fromAgent: 'Devon',
    toAgent: 'Tessa',
    timestamp: '10:42:40 UTC',
    message: 'Devon resolved edge case: Updated un-nested quantifier to handle sub-delimiter dots.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'PATCH-V2',
    payloadSummary: 'Amended patch addressing sub-delimiter edge cases.',
    artifactsTransferred: ['patch_v2.diff']
  },
  {
    id: 'h-8',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 8,
    fromAgent: 'Tessa',
    toAgent: 'Elena',
    timestamp: '10:42:50 UTC',
    message: 'Tessa confirmed 37/37 tests passed. Transferred verified code to Elena for code review.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'QA-CERTIFICATION-248',
    payloadSummary: 'Test report with 98.4% code coverage and zero regressions.',
    artifactsTransferred: ['test_report.json', 'coverage_lcov.info']
  },
  {
    id: 'h-9',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 9,
    fromAgent: 'Elena',
    toAgent: 'Alex',
    timestamp: '10:43:40 UTC',
    message: 'Elena completed security audit: Zero ReDoS risk, full compliance. Pull Request #248 prepared.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Actioned',
    handoffReference: 'SECURITY-AUDIT-CLEARANCE',
    payloadSummary: 'Signed audit clearance and PR #248 summary.',
    artifactsTransferred: ['audit_summary.md', 'pr_dossier_248.json']
  },
  {
    id: 'h-10',
    traceId: 'tr-forge-8921-auth',
    stepNumber: 10,
    fromAgent: 'Alex',
    toAgent: 'User',
    timestamp: '10:44:00 UTC',
    message: 'Alex dispatched Pull Request #248 to Dr. Sarah Chen for human quality gate approval.',
    taskId: 'task-1',
    taskTitle: 'Fix email validation in authentication flow',
    status: 'Pending',
    handoffReference: 'PR-APPROVAL-QUEUE #248',
    payloadSummary: 'Awaiting human authorization before merge into main.',
    artifactsTransferred: ['pr_248_dossier']
  }
];

export const seedProviderStats: ProviderUsageStats[] = [
  {
    provider: 'Anthropic',
    models: [
      {
        modelName: 'claude-3-5-sonnet-20241022',
        requestCount: 428,
        inputTokens: 1120000,
        outputTokens: 215000,
        cachedTokens: 380000,
        reasoningTokens: 0,
        totalCost: 268.40,
        failedRequests: 1,
        retryRequests: 2,
        avgLatencyMs: 1640
      },
      {
        modelName: 'claude-3-5-haiku-20241022',
        requestCount: 184,
        inputTokens: 340000,
        outputTokens: 48000,
        cachedTokens: 90000,
        reasoningTokens: 0,
        totalCost: 31.20,
        failedRequests: 0,
        retryRequests: 0,
        avgLatencyMs: 580
      }
    ],
    totalRequests: 612,
    totalTokens: 1723000,
    totalCost: 299.60,
    balanceStatus: 'Balance unavailable (Invoiced)',
    creditsRemainingFormatted: 'Monthly Enterprise Invoicing (Post-paid)',
    billingType: 'Enterprise Invoiced'
  },
  {
    provider: 'OpenAI',
    models: [
      {
        modelName: 'gpt-4o',
        requestCount: 214,
        inputTokens: 480000,
        outputTokens: 89000,
        cachedTokens: 120000,
        reasoningTokens: 0,
        totalCost: 98.40,
        failedRequests: 2,
        retryRequests: 3,
        avgLatencyMs: 1420
      },
      {
        modelName: 'o1-preview',
        requestCount: 28,
        inputTokens: 95000,
        outputTokens: 18400,
        cachedTokens: 15000,
        reasoningTokens: 48200,
        totalCost: 24.80,
        failedRequests: 0,
        retryRequests: 1,
        avgLatencyMs: 4890
      }
    ],
    totalRequests: 242,
    totalTokens: 682400,
    totalCost: 123.20,
    balanceStatus: 'Prepaid tier active',
    creditsRemainingFormatted: '$376.80 available balance',
    billingType: 'Pay-as-you-go'
  },
  {
    provider: 'Google Gemini',
    models: [
      {
        modelName: 'gemini-1.5-flash',
        requestCount: 142,
        inputTokens: 185000,
        outputTokens: 31200,
        cachedTokens: 25000,
        reasoningTokens: 0,
        totalCost: 5.80,
        failedRequests: 0,
        retryRequests: 0,
        avgLatencyMs: 420
      }
    ],
    totalRequests: 142,
    totalTokens: 241200,
    totalCost: 5.80,
    balanceStatus: 'GCP Project linked',
    creditsRemainingFormatted: 'Google Cloud Project: forge-prod-881 (Direct Billing)',
    billingType: 'Monthly Quota'
  }
];

export const seedBudgetConfig: BudgetConfig = {
  monthlyBudget: 500.00,
  currentMonthlySpent: 428.60, // Exactly $428.60 matching Top Metrics
  warningThresholdPercent: 80,
  projectBudgets: [
    {
      projectId: 'proj-acme',
      projectName: 'Acme Portal Hub',
      budget: 250.00,
      spent: 218.40
    },
    {
      projectId: 'proj-northstar',
      projectName: 'Northstar Storefront',
      budget: 150.00,
      spent: 124.80
    },
    {
      projectId: 'proj-vertex',
      projectName: 'Vertex Analytics Core',
      budget: 100.00,
      spent: 85.40
    }
  ],
  agentBudgets: [
    { agentName: 'Devon', budget: 180.00, spent: 154.20 },
    { agentName: 'Marcus', budget: 110.00, spent: 96.80 },
    { agentName: 'Elena', budget: 90.00, spent: 78.40 },
    { agentName: 'Alex', budget: 70.00, spent: 62.10 },
    { agentName: 'Tessa', budget: 50.00, spent: 37.10 }
  ],
  alerts: [
    {
      id: 'alt-1',
      severity: 'warning',
      title: 'Monthly Budget Threshold Exceeded (85.7%)',
      message: 'Workspace has consumed $428.60 of $500.00 monthly allocation. 7 days remaining in billing cycle.',
      timestamp: 'Today, 08:30 UTC'
    },
    {
      id: 'alt-2',
      severity: 'info',
      title: 'Anthropic Prompt Cache Efficiency: 28.4%',
      message: 'Prompt caching saved an estimated $42.10 across Claude 3.5 Sonnet architecture passes.',
      timestamp: 'Yesterday, 18:00 UTC'
    }
  ]
};

export const seedExecutionTraces: ExecutionTrace[] = [
  {
    traceId: 'tr-forge-8921-auth',
    rootTaskId: 'task-1',
    taskKey: 'ACME-248',
    taskTitle: 'Fix email validation in authentication flow',
    client: 'Acme Digital Agency',
    projectName: 'Acme Portal Hub',
    initialUserRequest: 'Users with valid apostrophes or plus signs in emails are failing validation. Fix regex without ReDoS risk.',
    status: 'Awaiting Sign-off',
    startedAt: '10:32:00 UTC',
    totalDurationMs: 720000,
    totalCost: 0.844,
    totalTokens: 156300,
    participatingAgents: ['Alex', 'Marcus', 'Devon', 'Tessa', 'Elena'],
    primaryModel: 'Claude 3.5 Sonnet / GPT-4o',
    events: [
      {
        id: 'ev-1',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:32:00 UTC',
        elapsedMs: 0,
        type: 'user_request',
        title: 'User Dispatched Issue ACME-248',
        detail: 'Inbound bug report filed by Dr. Sarah Chen.',
        durationMs: 40,
        status: 'success'
      },
      {
        id: 'ev-2',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:34:10 UTC',
        elapsedMs: 130000,
        type: 'agent_start',
        title: 'Alex Initiated Requirement Decomposition',
        detail: 'Generated acceptance criteria and prioritized issue as Urgent.',
        agentName: 'Alex',
        durationMs: 1800,
        status: 'success'
      },
      {
        id: 'ev-3',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:36:00 UTC',
        elapsedMs: 240000,
        type: 'agent_start',
        title: 'Marcus Authored Architecture Spec (ADR-042)',
        detail: 'Evaluated bundle size impact and selected native Zod schema.',
        agentName: 'Marcus',
        durationMs: 388000,
        status: 'success'
      },
      {
        id: 'ev-4',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:42:01 UTC',
        elapsedMs: 601000,
        type: 'llm_call',
        title: 'Devon Generated TypeScript Implementation Patch',
        detail: 'OpenAI gpt-4o generated regex patch with zero ReDoS risk.',
        agentName: 'Devon',
        durationMs: 1480,
        status: 'success'
      },
      {
        id: 'ev-5',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:42:16 UTC',
        elapsedMs: 616000,
        type: 'tool_execution',
        title: 'AST Grep Tool Search Across Auth Directory',
        detail: 'Matched 2 validator function declarations in src/auth and src/utils.',
        agentName: 'Devon',
        durationMs: 310,
        status: 'success'
      },
      {
        id: 'ev-6',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:42:36 UTC',
        elapsedMs: 636000,
        type: 'test_run',
        title: 'Tessa Executed Vitest & Cypress Validation Suite',
        detail: '24 unit tests, 8 integration tests, 5 E2E tests verified.',
        agentName: 'Tessa',
        durationMs: 6200,
        status: 'success'
      },
      {
        id: 'ev-7',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:43:12 UTC',
        elapsedMs: 672000,
        type: 'review_audit',
        title: 'Elena Audited Code for ReDoS and Static Invariants',
        detail: 'Verified linear O(n) regex complexity. Zero vulnerabilities detected.',
        agentName: 'Elena',
        durationMs: 890,
        status: 'success'
      },
      {
        id: 'ev-8',
        traceId: 'tr-forge-8921-auth',
        timestamp: '10:44:00 UTC',
        elapsedMs: 720000,
        type: 'approval_gate',
        title: 'Pull Request #248 Submitted for Governance Approval',
        detail: 'Dossier ready for human lead signature on /approvals.',
        durationMs: 0,
        status: 'in_progress'
      }
    ]
  },
  {
    traceId: 'tr-forge-8922-db',
    rootTaskId: 'task-3',
    taskKey: 'NST-104',
    taskTitle: 'Optimize database connection pool for checkout surges',
    client: 'Northstar Commerce',
    projectName: 'Northstar Storefront',
    initialUserRequest: 'Analyze and increase PostgreSQL connection pool limits for upcoming high-traffic sale.',
    status: 'In Progress',
    startedAt: '11:15:00 UTC',
    totalDurationMs: 420000,
    totalCost: 0.324,
    totalTokens: 64100,
    participatingAgents: ['Alex', 'Marcus'],
    primaryModel: 'Claude 3.5 Sonnet',
    events: [
      {
        id: 'ev-201',
        traceId: 'tr-forge-8922-db',
        timestamp: '11:15:00 UTC',
        elapsedMs: 0,
        type: 'user_request',
        title: 'Triaged High-Traffic DB Saturation Task',
        detail: 'Initiated sizing review for Black Friday capacity.',
        agentName: 'Alex',
        durationMs: 90,
        status: 'success'
      },
      {
        id: 'ev-202',
        traceId: 'tr-forge-8922-db',
        timestamp: '11:17:30 UTC',
        elapsedMs: 150000,
        type: 'llm_call',
        title: 'Marcus Ran Sizing Calculation Algorithm',
        detail: 'Calculated optimal max pool size = 48 connections based on 8 vCPU instances.',
        agentName: 'Marcus',
        durationMs: 2400,
        status: 'success'
      }
    ]
  },
  {
    traceId: 'tr-forge-8923-ws',
    rootTaskId: 'task-5',
    taskKey: 'VTX-402',
    taskTitle: 'Implement exponential backoff on WebSocket reconnection',
    client: 'Vertex Technologies',
    projectName: 'Vertex Analytics Core',
    initialUserRequest: 'Prevent thundering herd disconnect spikes with jittered exponential backoff.',
    status: 'Completed',
    startedAt: '09:10:00 UTC',
    completedAt: '09:28:40 UTC',
    totalDurationMs: 1120000,
    totalCost: 0.612,
    totalTokens: 112400,
    participatingAgents: ['Devon', 'Tessa', 'Elena'],
    primaryModel: 'GPT-4o',
    events: [
      {
        id: 'ev-301',
        traceId: 'tr-forge-8923-ws',
        timestamp: '09:10:00 UTC',
        elapsedMs: 0,
        type: 'agent_start',
        title: 'Devon Started Implementation of Reconnection Policy',
        detail: 'Wrote FullJitter algorithm in src/realtime/socket.ts.',
        agentName: 'Devon',
        durationMs: 184000,
        status: 'success'
      },
      {
        id: 'ev-302',
        traceId: 'tr-forge-8923-ws',
        timestamp: '09:22:00 UTC',
        elapsedMs: 720000,
        type: 'test_run',
        title: 'Tessa Ran 50 Simulated Disconnect Scenarios',
        detail: 'Verified zero thundering herd synchronization spikes.',
        agentName: 'Tessa',
        durationMs: 4200,
        status: 'success'
      },
      {
        id: 'ev-303',
        traceId: 'tr-forge-8923-ws',
        timestamp: '09:28:40 UTC',
        elapsedMs: 1120000,
        type: 'git_operation',
        title: 'Merged Pull Request #245 into main',
        detail: 'Production deployment automated through CI pipeline.',
        agentName: 'Elena',
        durationMs: 820,
        status: 'success'
      }
    ]
  }
];
