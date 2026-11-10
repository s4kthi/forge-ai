import { 
  ProjectModel, 
  TaskModel, 
  AgentModel, 
  AgentCollaborationThread, 
  MeetingModel, 
  NoteModel, 
  CalendarEventModel,
  ConversationModel 
} from '../types/workspace';

export const seedProjects: ProjectModel[] = [
  {
    id: 'proj-acme',
    name: 'Acme Portal Hub',
    key: 'ACME',
    client: 'Acme Digital Agency',
    description: 'Enterprise partner portal with SSO, multi-tenant RBAC, and analytics dashboard.',
    repository: 'acme-org/portal-hub',
    repositoryBranch: 'main',
    health: 'Healthy',
    progress: 74,
    openTasks: 5,
    completedTasks: 38,
    updatedAt: '12m ago',
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Auth0']
  },
  {
    id: 'proj-northstar',
    name: 'Northstar Storefront',
    key: 'NSTR',
    client: 'Northstar Commerce',
    description: 'High-conversion headless e-commerce frontend with sub-second catalog search and localized checkout.',
    repository: 'northstar-co/storefront-v2',
    repositoryBranch: 'main',
    health: 'Optimal',
    progress: 88,
    openTasks: 3,
    completedTasks: 42,
    updatedAt: '1h ago',
    techStack: ['React', 'Remix', 'Shopify Storefront API', 'Stripe', 'Algolia']
  },
  {
    id: 'proj-vertex',
    name: 'Vertex Cloud Platform',
    key: 'VTX',
    client: 'Vertex Technologies',
    description: 'Distributed vector database management console with telemetry pipelines and API gateways.',
    repository: 'vertex-tech/cloud-core',
    repositoryBranch: 'production',
    health: 'Needs Attention',
    progress: 52,
    openTasks: 8,
    completedTasks: 26,
    updatedAt: '3h ago',
    techStack: ['Go', 'TypeScript', 'gRPC', 'Kubernetes', 'ClickHouse']
  }
];

export const seedAgents: AgentModel[] = [
  {
    id: 'agent-alex',
    name: 'Alex',
    role: 'Project Manager',
    specialty: 'Requirement decomposition, sprint planning, and cross-agent coordination.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Working',
    currentTaskTitle: 'Coordinating OAuth token refresh bug triage',
    currentTaskId: 'task-101',
    lastActive: 'Just now',
    tasksCompleted: 42,
    successRate: 98.4,
    avgDuration: '2.4m',
    capabilities: ['Requirement Analysis', 'Task Breakdown', 'Workforce Orchestration', 'Risk Assessment']
  },
  {
    id: 'agent-marcus',
    name: 'Marcus',
    role: 'Software Architect',
    specialty: 'System topology, dependency mapping, RFC creation, and security posture auditing.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Planning',
    currentTaskTitle: 'Evaluating passkey WebAuthn FIDO2 attestation',
    currentTaskId: 'task-102',
    lastActive: '4m ago',
    tasksCompleted: 35,
    successRate: 97.1,
    avgDuration: '3.8m',
    capabilities: ['System Design', 'RFC Authoring', 'Dependency Audit', 'Performance Modeling']
  },
  {
    id: 'agent-devon',
    name: 'Devon',
    role: 'Software Developer',
    specialty: 'Full-stack engineering, test-driven refactoring, API integration, and clean code diffs.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Working',
    currentTaskTitle: 'Implementing RFC 5322 email validation fix in auth pipeline',
    currentTaskId: 'task-101',
    lastActive: '1m ago',
    tasksCompleted: 58,
    successRate: 95.2,
    avgDuration: '5.2m',
    capabilities: ['Full-stack TypeScript', 'Go Backend', 'Test-Driven Development', 'Git Patch Generation']
  },
  {
    id: 'agent-tessa',
    name: 'Tessa',
    role: 'QA Engineer',
    specialty: 'End-to-end regression suites, edge-case generation, browser automation, and mutation testing.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'Testing',
    currentTaskTitle: 'Running cross-browser matrix on authentication flow',
    currentTaskId: 'task-101',
    lastActive: '2m ago',
    tasksCompleted: 49,
    successRate: 98.8,
    avgDuration: '3.1m',
    capabilities: ['Playwright E2E', 'Unit Assertions', 'Fuzz Testing Corpus', 'Mutation Coverage']
  },
  {
    id: 'agent-elena',
    name: 'Elena',
    role: 'Code Reviewer',
    specialty: 'Static security analysis (SAST), ReDoS prevention, architectural purity, and PR auditing.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Reviewing',
    currentTaskTitle: 'Reviewing Pull Request #248 for ReDoS immunity',
    currentTaskId: 'task-101',
    lastActive: 'Just now',
    tasksCompleted: 44,
    successRate: 99.4,
    avgDuration: '2.6m',
    capabilities: ['SAST Security Audits', 'Style & Boundary Checks', 'Complexity Profiling', 'HITL PR Approvals']
  }
];

export const seedTasks: TaskModel[] = [
  {
    id: 'task-101',
    key: 'ACME-248',
    title: 'Fix email validation and token refresh in authentication flow',
    description: 'Authentication fails when users sign in with subaddress tags (e.g. user+finance@domain.com) or when expired refresh tokens are returned.',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    repository: 'acme-org/portal-hub',
    status: 'in_review',
    priority: 'urgent',
    assignedAgent: 'Devon',
    assignedRole: 'Software Developer',
    dueDate: '2026-11-07',
    createdAt: '2026-11-06T10:00:00Z',
    updatedAt: '2026-11-07T11:45:00Z',
    acceptanceCriteria: [
      'Passes RFC 5322 email syntax with subaddressing support',
      'Neutralizes ReDoS vulnerability via linear 254-character bounds',
      'Refreshes expired JWT session seamlessly without login loop',
      '100% test pass in Playwright Chromium & Firefox'
    ],
    estimatedHours: 4,
    diffStats: {
      additions: 48,
      deletions: 14,
      files: 3
    }
  },
  {
    id: 'task-102',
    key: 'ACME-250',
    title: 'Implement WebAuthn FIDO2 passkey hardware attestation',
    description: 'Add biometric and hardware security key authentication support to reduce credential phishing risks.',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    repository: 'acme-org/portal-hub',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: 'Marcus',
    assignedRole: 'Software Architect',
    dueDate: '2026-11-09',
    createdAt: '2026-11-06T14:30:00Z',
    updatedAt: '2026-11-07T09:15:00Z',
    acceptanceCriteria: [
      'SimpleWebAuthn server-side attestation verification',
      'Public key credential storage isolated in secure enclave',
      'Graceful fallback to standard TOTP authenticator'
    ],
    estimatedHours: 8,
    diffStats: {
      additions: 124,
      deletions: 18,
      files: 4
    }
  },
  {
    id: 'task-103',
    key: 'NSTR-184',
    title: 'Optimize Algolia instant search indexing latency',
    description: 'Reduce product catalog sync time from 45 seconds to under 8 seconds during high-frequency inventory updates.',
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    client: 'Northstar Commerce',
    repository: 'northstar-co/storefront-v2',
    status: 'todo',
    priority: 'medium',
    assignedAgent: 'Devon',
    assignedRole: 'Software Developer',
    dueDate: '2026-11-10',
    createdAt: '2026-11-05T11:20:00Z',
    updatedAt: '2026-11-06T16:00:00Z',
    acceptanceCriteria: [
      'Batch delta indexing via Webhook workers',
      'Debounce search query requests to 150ms',
      'LCP impact verified < 1.2s on mobile'
    ],
    estimatedHours: 6
  },
  {
    id: 'task-104',
    key: 'VTX-92',
    title: 'Add connection retry backoff to vector clustering coordinator',
    description: 'Cluster nodes fail to re-register after transient network drops without exponential backoff.',
    projectId: 'proj-vertex',
    projectName: 'Vertex Cloud Platform',
    client: 'Vertex Technologies',
    repository: 'vertex-tech/cloud-core',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: 'Tessa',
    assignedRole: 'QA Engineer',
    dueDate: '2026-11-08',
    createdAt: '2026-11-06T08:00:00Z',
    updatedAt: '2026-11-07T10:30:00Z',
    acceptanceCriteria: [
      'Exponential backoff with randomized full jitter',
      'Deadlock prevention after 5 consecutive failures',
      'Telemetry alert sent to Slack channel'
    ],
    estimatedHours: 5
  },
  {
    id: 'task-105',
    key: 'ACME-252',
    title: 'Add audit logging for workspace permission changes',
    description: 'Record all role elevation and permission changes in immutable audit log with cryptographic hash verification.',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    client: 'Acme Digital Agency',
    repository: 'acme-org/portal-hub',
    status: 'completed',
    priority: 'medium',
    assignedAgent: 'Elena',
    assignedRole: 'Code Reviewer',
    dueDate: '2026-11-06',
    createdAt: '2026-11-04T09:00:00Z',
    updatedAt: '2026-11-06T18:00:00Z',
    acceptanceCriteria: [
      'SHA-256 tamper-evident log chaining',
      'SOC 2 compliance export endpoint'
    ],
    estimatedHours: 4
  },
  {
    id: 'task-106',
    key: 'NSTR-189',
    title: 'Implement localized VAT tax calculation for EU regions',
    description: 'Automate checkout calculation for Germany, France, and Spain with country-specific tax rules.',
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    client: 'Northstar Commerce',
    repository: 'northstar-co/storefront-v2',
    status: 'backlog',
    priority: 'low',
    assignedAgent: 'Alex',
    assignedRole: 'Project Manager',
    dueDate: '2026-11-15',
    createdAt: '2026-11-07T08:00:00Z',
    updatedAt: '2026-11-07T08:00:00Z',
    acceptanceCriteria: [
      'Stripe Tax API integration',
      'Display estimated VAT on product page'
    ],
    estimatedHours: 10
  }
];

export const seedCollaborations: AgentCollaborationThread[] = [
  {
    id: 'collab-1',
    taskId: 'task-101',
    taskTitle: 'Fix email validation and token refresh in authentication flow',
    projectName: 'Acme Portal Hub',
    stage: 'Review',
    participatingAgents: ['Alex', 'Marcus', 'Devon', 'Tessa', 'Elena'],
    startedAt: '10:40 AM',
    updatedAt: '10:46 AM',
    summary: 'Team triaged and resolved bug where subaddressed emails failed RFC checks and expired tokens looped.',
    messages: [
      {
        id: 'msg-1',
        fromAgent: 'Alex',
        toAgent: 'Marcus',
        timestamp: '10:41 AM',
        content: 'Please analyse the authentication issue reported by Acme (subaddressed emails failing login and token loop) and propose an implementation plan.',
        type: 'assignment'
      },
      {
        id: 'msg-2',
        fromAgent: 'Marcus',
        toAgent: 'Alex',
        timestamp: '10:42 AM',
        content: 'I analysed src/auth/validators/email.ts. The issue is two-fold: a naive regex rejects RFC 5322 plus-tags, and an expired refresh token throws an unhandled rejection in the NextAuth callback. I recommend replacing the regex with a linear finite-state automaton (strictly capped at 254 octets to avoid ReDoS) and wrapping the token rotation in a try/catch handler.',
        type: 'proposal'
      },
      {
        id: 'msg-3',
        fromAgent: 'Alex',
        toAgent: 'Devon',
        timestamp: '10:43 AM',
        content: 'Please implement Marcus\'s proposed solution in branch forge/devon/fix-email-validation.',
        type: 'assignment'
      },
      {
        id: 'msg-4',
        fromAgent: 'Devon',
        toAgent: 'Tessa',
        timestamp: '10:44 AM',
        content: 'Implementation is complete. Updated email.ts, added 12 unit tests, and handled token refresh in login.tsx. Please test token refresh and session expiry across edge cases.',
        type: 'review'
      },
      {
        id: 'msg-5',
        fromAgent: 'Tessa',
        toAgent: 'Devon',
        timestamp: '10:44 AM',
        content: 'Found one edge case: when the refresh token is missing from the cookie store entirely, it returns a 500 instead of a clean 401 redirect to /login. Please fix it.',
        type: 'bug_report',
        statusBadge: 'Edge Case Found'
      },
      {
        id: 'msg-6',
        fromAgent: 'Devon',
        toAgent: 'Tessa',
        timestamp: '10:45 AM',
        content: 'Fixed. Added a null check on the session cookie with immediate 401 fallback. Please rerun the tests.',
        type: 'review'
      },
      {
        id: 'msg-7',
        fromAgent: 'Tessa',
        toAgent: 'Elena',
        timestamp: '10:45 AM',
        content: 'All 37 test cases passed (24 unit, 8 integration, 5 Playwright browser tests). Clean execution in 14ms. Ready for review.',
        type: 'approval',
        statusBadge: 'Tests Passed (37/37)'
      },
      {
        id: 'msg-8',
        fromAgent: 'Elena',
        toAgent: 'Alex',
        timestamp: '10:46 AM',
        content: 'Code review completed. Verified RFC 5322 syntax and confirmed polynomial ReDoS execution is bounded to <0.04ms. No blocking issues found. Pull Request #248 is submitted for human engineering lead sign-off.',
        type: 'approval',
        statusBadge: 'PR #248 Ready for Human Sign-off'
      }
    ]
  },
  {
    id: 'collab-2',
    taskId: 'task-102',
    taskTitle: 'Implement WebAuthn FIDO2 passkey hardware attestation',
    projectName: 'Acme Portal Hub',
    stage: 'Planning',
    participatingAgents: ['Alex', 'Marcus'],
    startedAt: '09:15 AM',
    updatedAt: '09:40 AM',
    summary: 'Evaluating hardware authenticator compatibility and data residency requirements.',
    messages: [
      {
        id: 'msg-201',
        fromAgent: 'Alex',
        toAgent: 'Marcus',
        timestamp: '09:15 AM',
        content: 'Acme requested FIDO2 passkeys for their upcoming enterprise security audit. What is the architecture plan?',
        type: 'assignment'
      },
      {
        id: 'msg-202',
        fromAgent: 'Marcus',
        toAgent: 'Alex',
        timestamp: '09:22 AM',
        content: 'We should use @simplewebauthn/server with an isolated credentials table. Hardware counter verification will prevent cloned authenticators. Preparing RFC spec for Devon.',
        type: 'proposal'
      }
    ]
  }
];

export const seedMeetings: MeetingModel[] = [
  {
    id: 'meet-1',
    title: 'Acme Q4 Architecture & Security Review',
    date: '2026-11-07',
    time: '11:00 AM',
    duration: '45m',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    participants: ['Dr. Sarah Chen (Chief Architect)', 'Alex (AI PM)', 'Marcus (AI Architect)', 'David Miller (Acme VP Eng)'],
    summary: 'Aligned on passkey rollout timeline, verified dual-custody approval gates for upcoming SOC 2 audit, and approved PR #248 triage plan.',
    discussionPoints: [
      'Subaddressed email issues reported by Acme enterprise customers.',
      'FIDO2 WebAuthn rollout roadmap and hardware key support.',
      'Dual-custody approval thresholds for autonomous AI agent commits.'
    ],
    decisions: [
      'Prioritize Pull Request #248 (email RFC fix) for immediate deployment today.',
      'Mandate human engineering lead sign-off on any PR affecting authentication or IAM.',
      'Stage WebAuthn passkeys in canary environment next Monday.'
    ],
    actionItems: [
      {
        id: 'act-1',
        text: 'Deploy and verify email validation patch PR #248 on staging',
        assignee: 'Devon',
        dueDate: '2026-11-07',
        completed: false,
        convertedTaskId: 'task-101'
      },
      {
        id: 'act-2',
        text: 'Prepare technical RFC for WebAuthn credential schema migration',
        assignee: 'Marcus',
        dueDate: '2026-11-09',
        completed: false
      },
      {
        id: 'act-3',
        text: 'Set up canary deployment pipeline in AWS GovCloud sandbox',
        assignee: 'Devon',
        dueDate: '2026-11-11',
        completed: false
      }
    ],
    transcript: [
      { speaker: 'David Miller', time: '11:02 AM', text: 'Thanks for jumping on. We had three corporate pilots report login rejections when using plus-tags like user+finance@corp.com.' },
      { speaker: 'Dr. Sarah Chen', time: '11:04 AM', text: 'Marcus and Devon diagnosed this earlier this morning. The regex parser was too strict and omitted RFC 5322 plus-addressing. We already have an implementation and 37 tests passing.' },
      { speaker: 'Marcus', time: '11:07 AM', text: 'Correct. We also verified ReDoS immunity with linear length boundaries. Pull Request #248 is queued for Sarah’s review right now.' },
      { speaker: 'David Miller', time: '11:10 AM', text: 'That is outstanding turnaround. Once approved, let us stage it immediately.' }
    ],
    recordingStatus: 'not_connected'
  },
  {
    id: 'meet-2',
    title: 'Northstar Storefront Performance Sync',
    date: '2026-11-08',
    time: '2:30 PM',
    duration: '30m',
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    participants: ['Dr. Sarah Chen', 'Tessa (AI QA)', 'Rachel Vance (Northstar Lead)'],
    summary: 'Reviewed Algolia indexing benchmarks and mobile Core Web Vitals targets ahead of holiday traffic peak.',
    discussionPoints: [
      'Search debounce reduction to 150ms.',
      'Image asset CDN caching and WebP optimization.'
    ],
    decisions: [
      'Target LCP of under 1.2s on standard 4G mobile connections.',
      'Enable batch delta indexing for inventory webhooks.'
    ],
    actionItems: [
      {
        id: 'act-4',
        text: 'Run 100-user simulated load test on Algolia catalog endpoints',
        assignee: 'Tessa',
        dueDate: '2026-11-10',
        completed: false
      }
    ],
    recordingStatus: 'not_connected'
  }
];

export const seedNotes: NoteModel[] = [
  {
    id: 'note-1',
    title: 'RFC: Subaddressing & Catastrophic Backtracking Prevention in Auth',
    category: 'Architecture Decision',
    content: `# RFC 5322 & ReDoS Mitigation

## Problem Statement
The legacy regex pattern \`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/\` in \`src/auth/validators/email.ts\` causes false-negative rejections for valid subaddressed corporate addresses (\`user+billing@acme.co.uk\`) and exhibits exponential backtracking when fed unclosed quote strings.

## Solution
1. Enforce RFC 5321 length check first: total length <= 254 octets, local-part <= 64 octets.
2. Evaluate non-backtracking regular expression.
3. Consolidate client-side and server-side validation on single source of truth.

## Result
Validated against standard OWASP ReDoS benchmark corpus. Mean execution time dropped from 18ms to 0.04ms.`,
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    linkedTaskId: 'task-101',
    tags: ['Architecture', 'Security', 'Auth', 'RFC'],
    isPinned: true,
    author: 'Marcus (AI Architect)',
    updatedAt: '10:30 AM',
    createdAt: '2026-11-06'
  },
  {
    id: 'note-2',
    title: 'Acme Digital Client Kickoff & Governance Rules',
    category: 'Client Meeting',
    content: `# Acme Digital Agency Workspace Charter

- **Security Tier**: SOC 2 Type II dual-custody.
- **Branch Protection**: Direct commits to main/production are forbidden. All agent changes require PR via \`forge/*\` branches.
- **Human Approval**: Mandatory human approval required for:
  - Any pull request touching authentication or database schemas.
  - Any task with projected token spend > $10.00 USD.
- **Tech Stack**: Next.js 14, Tailwind CSS, TypeScript, PostgreSQL.`,
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    tags: ['Governance', 'Client', 'Onboarding'],
    isPinned: true,
    author: 'Dr. Sarah Chen',
    updatedAt: 'Yesterday',
    createdAt: '2026-11-04'
  },
  {
    id: 'note-3',
    title: 'Algolia Search Indexing Strategy',
    category: 'Technical Spec',
    content: `# Algolia Catalog Synchronization Strategy

To avoid webhook throttling during catalog updates:
- Aggregate catalog mutations into 500-item micro-batches.
- Queue via Redis BullMQ worker.
- Cache popular query results at Cloudflare edge with 5-minute TTL.`,
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    tags: ['Search', 'Performance', 'Caching'],
    isPinned: false,
    author: 'Devon (AI Developer)',
    updatedAt: '2 days ago',
    createdAt: '2026-11-03'
  }
];

export const seedCalendarEvents: CalendarEventModel[] = [
  {
    id: 'evt-1',
    title: 'Acme Q4 Architecture & Security Review',
    date: '2026-11-07',
    time: '11:00 AM',
    type: 'meeting',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    referenceId: 'meet-1'
  },
  {
    id: 'evt-2',
    title: 'Due: Fix email validation in authentication flow (PR #248)',
    date: '2026-11-07',
    time: '5:00 PM',
    type: 'task',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    referenceId: 'task-101',
    assignedTo: 'Devon',
    priority: 'urgent',
    status: 'in_review'
  },
  {
    id: 'evt-3',
    title: 'Northstar Storefront Performance Sync',
    date: '2026-11-08',
    time: '2:30 PM',
    type: 'meeting',
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    referenceId: 'meet-2'
  },
  {
    id: 'evt-4',
    title: 'Due: Connection retry backoff for vector coordinator',
    date: '2026-11-08',
    time: '6:00 PM',
    type: 'task',
    projectId: 'proj-vertex',
    projectName: 'Vertex Cloud Platform',
    referenceId: 'task-104',
    assignedTo: 'Tessa',
    priority: 'high',
    status: 'in_progress'
  },
  {
    id: 'evt-5',
    title: 'Milestone: FIDO2 Passkeys Hardware Canary Deployment',
    date: '2026-11-09',
    time: '10:00 AM',
    type: 'milestone',
    projectId: 'proj-acme',
    projectName: 'Acme Portal Hub',
    referenceId: 'task-102'
  },
  {
    id: 'evt-6',
    title: 'Due: Algolia search indexing latency optimization',
    date: '2026-11-10',
    time: '4:00 PM',
    type: 'task',
    projectId: 'proj-northstar',
    projectName: 'Northstar Storefront',
    referenceId: 'task-103',
    assignedTo: 'Devon',
    priority: 'medium',
    status: 'todo'
  },
  {
    id: 'evt-7',
    title: 'Sprint Retrospective & AI Workforce Throughput Review',
    date: '2026-11-13',
    time: '3:00 PM',
    type: 'meeting',
    projectName: 'All Projects'
  }
];

export const seedConversations: ConversationModel[] = [
  {
    id: 'conv-1',
    title: 'Acme Project Status & PR #248',
    lastMessage: 'Pull Request #248 has passed all 37 test cases and is awaiting your approval.',
    updatedAt: 'Just now',
    projectContextId: 'proj-acme',
    messages: [
      {
        id: 'cmsg-1',
        sender: 'user',
        text: 'What is the current status of the Acme project?',
        timestamp: '10:48 AM'
      },
      {
        id: 'cmsg-2',
        sender: 'assistant',
        text: `Here is the current status of **Acme Portal Hub**:

- **Project Health**: **Healthy** (Progress: 74%)
- **Active Execution**: Devon and Elena just completed **ACME-248** (*Fix email validation in authentication flow*).
- **Test Evidence**: **37 / 37 passed** (24 unit tests, 8 integration tests, 5 Playwright browser tests).
- **Security Check**: Verified ReDoS immunity with linear O(N) regex evaluation under 0.04ms.
- **Pending Action**: **Pull Request #248** is currently waiting in the **Approvals Dossier** for human sign-off.

Would you like me to open the approval dossier or provide a breakdown of the changed files?`,
        timestamp: '10:48 AM',
        suggestedFollowUps: [
          'Which pull requests are waiting for approval?',
          'What did Marcus decide about the architecture?',
          'What tasks are blocked?'
        ]
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Marcus Architecture Decisions',
    lastMessage: 'Marcus recommended a non-backtracking RFC 5322 parser capped at 254 octets.',
    updatedAt: '1h ago',
    projectContextId: 'all',
    messages: [
      {
        id: 'cmsg-21',
        sender: 'user',
        text: 'What did Marcus decide about the architecture for the email validation bug?',
        timestamp: '09:30 AM'
      },
      {
        id: 'cmsg-22',
        sender: 'assistant',
        text: `In today's architectural analysis of **ACME-248**, **Marcus (AI Software Architect)** documented:

1. **Root Cause**: The naive regex failed on RFC 5322 plus-tags (\`user+tag@domain.com\`) and exhibited exponential backtracking on malformed input.
2. **Decision**:
   - Enforce an early short-circuit length boundary (\`length <= 254\` octets per RFC 5321).
   - Implement a linear non-backtracking finite automaton parser.
   - Decouple validation into pure utility functions with zero side-effects.
3. **Execution**: Marcus created the specification and handed off implementation to Devon.

You can inspect the full RFC note in **Notes & Meetings** under *"RFC: Subaddressing & Catastrophic Backtracking Prevention in Auth"*.`,
        timestamp: '09:31 AM',
        suggestedFollowUps: [
          'What has Devon completed?',
          'Summarise yesterday\'s meeting',
          'What should our AI team work on next?'
        ]
      }
    ]
  }
];
