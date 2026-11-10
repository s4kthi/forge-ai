import { 
  ProjectModel, 
  TaskModel, 
  AgentModel, 
  MeetingModel, 
  NoteModel, 
  ChatMessageModel 
} from '../types/workspace';

export interface AssistantContext {
  projects: ProjectModel[];
  tasks: TaskModel[];
  agents: AgentModel[];
  meetings: MeetingModel[];
  notes: NoteModel[];
  selectedProjectId?: string;
}

/**
 * Assistant Service Interface
 * Prepared for plug-and-play LLM backend connectivity (e.g. Claude 3.5 Sonnet / OpenAI API)
 */
export class AssistantService {
  /**
   * Generates a context-aware response based on the current workspace state.
   * Uses a deterministic semantic pattern matcher for prototype demonstrations.
   */
  public static async queryAssistant(
    userQuery: string,
    context: AssistantContext
  ): Promise<ChatMessageModel> {
    // Simulate natural LLM typing latency
    await new Promise((resolve) => setTimeout(resolve, 550));

    const q = userQuery.toLowerCase().trim();
    let replyText = '';
    let suggestedFollowUps: string[] = [];

    // 1. Acme project status
    if (q.includes('acme') || (q.includes('status') && context.selectedProjectId === 'proj-acme')) {
      const acme = context.projects.find(p => p.id === 'proj-acme');
      const acmeTasks = context.tasks.filter(t => t.projectId === 'proj-acme');
      const inReview = acmeTasks.filter(t => t.status === 'in_review');
      const inProgress = acmeTasks.filter(t => t.status === 'in_progress');

      replyText = `### Acme Portal Hub — Project Health & Status

- **Status**: **${acme?.health || 'Healthy'}** (${acme?.progress}% completed)
- **Active Feature Branch**: \`forge/devon/fix-email-validation\`
- **Recent Delivery**: **ACME-248** (Email RFC 5322 validation fix) is currently in review.
- **In Progress**: **ACME-250** (WebAuthn FIDO2 passkeys) assigned to Marcus.
- **Open Tasks**: ${acmeTasks.length} total (${inReview.length} in review, ${inProgress.length} in development).

Would you like me to open the Approval Dossier for PR #248 or inspect Marcus's architecture notes?`;

      suggestedFollowUps = [
        'Which pull requests are waiting for approval?',
        'What did Marcus decide about the architecture?',
        'What has Devon completed?'
      ];
    }
    // 2. What tasks are blocked?
    else if (q.includes('blocked') || q.includes('blocker') || q.includes('failing')) {
      const urgentBacklog = context.tasks.filter(t => t.status === 'backlog' && t.priority === 'urgent');
      const countNote = urgentBacklog.length > 0 ? ` (${urgentBacklog.length} urgent backlog item(s))` : '';
      replyText = `### Blocked & High-Risk Items

Good news: **There are currently zero strictly blocked tasks** across the active workforce${countNote}.

However, there is **1 item requiring attention**:
- **ACME-248**: Currently **awaiting human approval** before merging into \`main\`. Devon completed the patch and Tessa passed all 37 tests, but company policy requires a human lead signature for authentication changes.

All other autonomous threads are running smoothly without deadlock.`;

      suggestedFollowUps = [
        'Which pull requests are waiting for approval?',
        'What should our AI team work on next?'
      ];
    }
    // 3. What did Marcus decide about architecture?
    else if (q.includes('marcus') || q.includes('architecture') || q.includes('decision')) {
      replyText = `### Marcus's Architectural Decisions & RFCs

**Marcus (AI Software Architect)** has logged the following core decisions:

1. **RFC 5322 Strict Length Check (ACME-248)**:
   - Enforced maximum total length boundary of **254 octets** per RFC 5321 before running regex parsing.
   - Bounded polynomial worst-case execution time to **<0.04ms**, eliminating all ReDoS vulnerability vectors.
   - Preserved isolated pure utility function architecture with zero side-effects.

2. **WebAuthn FIDO2 Integration (ACME-250)**:
   - Recommended \`@simplewebauthn/server\` with dedicated enclave key persistence.
   - Enforced hardware authenticator clone detection via incremental monotonic counters.

You can inspect the full markdown document in **Notes & Meetings** under *"RFC: Subaddressing & Catastrophic Backtracking Prevention in Auth"*.`;

      suggestedFollowUps = [
        'What has Devon completed?',
        'Summarise yesterday\'s meeting',
        'What is the current status of the Acme project?'
      ];
    }
    // 4. Summarize meeting
    else if (q.includes('meeting') || q.includes('summarise') || q.includes('summarize')) {
      const meet = context.meetings[0];
      replyText = `### Meeting Summary: ${meet.title} (${meet.date})

**Participants**: ${meet.participants.join(', ')}

**Key Discussion**:
${meet.discussionPoints.map(p => `- ${p}`).join('\n')}

**Decisions Made**:
${meet.decisions.map(d => `- **${d}**`).join('\n')}

**Extracted Action Items**:
${meet.actionItems.map(a => `- [${a.completed ? 'x' : ' '}] **${a.text}** (Assigned to: ${a.assignee}, Due: ${a.dueDate})`).join('\n')}

*Note: You can convert any unassigned action item directly into a task on the Notes & Meetings page.*`;

      suggestedFollowUps = [
        'Which pull requests are waiting for approval?',
        'What should our AI team work on next?'
      ];
    }
    // 5. What has Devon completed?
    else if (q.includes('devon') || q.includes('developer')) {
      replyText = `### Devon's Activity & Completed Deliverables

**Devon (AI Full-Stack Developer)**:
- **Current Status**: **Working** (58 tasks completed to date, 95.2% first-pass test rate).
- **Recent Work**: Implemented the RFC 5322 email validation fix in \`src/auth/validators/email.ts\` (+48 / -14 lines).
- **Test Results**: Handed off to Tessa; verified 24 unit tests and 5 browser end-to-end tests passing without regression.
- **Next Assignment**: Scheduled to implement Algolia search debounce optimization for Northstar Commerce Storefront once PR #248 merges.`;

      suggestedFollowUps = [
        'Which pull requests are waiting for approval?',
        'What did Marcus decide about the architecture?'
      ];
    }
    // 6. Which pull requests are waiting for approval?
    else if (q.includes('approval') || q.includes('pull request') || q.includes('pr')) {
      replyText = `### Pull Requests Awaiting Human Approval

There is **1 critical Pull Request** waiting in the Quality Gate:

- **Pull Request #248**: *Fix email validation in authentication flow*
  - **Repository**: \`acme-org/portal-hub\` (\`forge/devon/fix-email-validation\` → \`main\`)
  - **Collaborators**: Devon (Implementation) • Elena (SAST Review) • Tessa (QA Testing)
  - **Test Status**: **100% Passed (37 / 37 assertions)**
  - **Security Scan**: Zero vulnerabilities, ReDoS safe (<0.04ms)
  - **Compute Cost**: $0.428 USD (4m 18s duration)

You can review the full unified code diff and authorize it in the **Approvals** section.`;

      suggestedFollowUps = [
        'What has Devon completed?',
        'What is the current status of the Acme project?'
      ];
    }
    // 7. What should our AI team work on next?
    else if (q.includes('next') || q.includes('priority') || q.includes('recommend')) {
      replyText = `### Recommended Next Actions for the AI Team

Based on sprint velocity and project milestones:

1. **Immediate (Today)**:
   - **Review & Authorize PR #248**: Unblocks Acme Digital's corporate pilot users.
2. **Next Sprint Target (Monday)**:
   - **ACME-250 (FIDO2 Passkeys)**: Marcus is finalizing the schema spec; Devon is queued to begin implementation.
3. **Performance Optimization**:
   - **NSTR-184 (Algolia search debounce)**: Northstar Commerce catalog indexing to reduce mobile LCP below 1.2s.

Would you like me to auto-assign any of these backlog items to Alex for task decomposition?`;

      suggestedFollowUps = [
        'What tasks are blocked?',
        'What is the current status of the Acme project?'
      ];
    }
    // Fallback general intelligent answer
    else {
      replyText = `I analyzed your project workspace data:

- **Active Projects**: ${context.projects.map(p => p.name).join(', ')}.
- **Autonomous Workforce**: 5 specialized agents (Alex, Marcus, Devon, Tessa, Elena) currently operational.
- **Open Deliverables**: ${context.tasks.filter(t => t.status !== 'completed').length} active tasks across your repositories.
- **Top Priority**: **PR #248** (Email RFC validation fix) is currently in the Approvals queue awaiting your authorization.

You can ask me questions about specific projects, agent decisions, meeting summaries, or task status!`;

      suggestedFollowUps = [
        'What is the current status of the Acme project?',
        'What did Marcus decide about the architecture?',
        'What has Devon completed?',
        'Which pull requests are waiting for approval?'
      ];
    }

    return {
      id: `cmsg-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps
    };
  }
}
