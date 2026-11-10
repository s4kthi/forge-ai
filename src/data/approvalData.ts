export interface InlineComment {
  id: string;
  author: 'Devon' | 'Elena' | 'Tessa';
  role: string;
  avatar: string;
  timestamp: string;
  message: string;
  badge?: string;
  badgeColor?: 'violet' | 'blue' | 'emerald' | 'amber';
}

export interface DiffLine {
  type: 'context' | 'add' | 'del';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  comments?: InlineComment[];
}

export interface DiffFile {
  id: string;
  filename: string;
  status: 'modified' | 'added' | 'deleted';
  additions: number;
  deletions: number;
  lines: DiffLine[];
  summary: string;
}

export interface AssignedWorker {
  name: 'Devon' | 'Elena' | 'Tessa';
  role: string;
  avatar: string;
  contribution: string;
}

export interface VerificationCheck {
  id: string;
  label: string;
  result: string;
  detail: string;
  status: 'passed' | 'warning' | 'info';
  simulated: boolean;
}

export interface PullRequestDossier {
  id: string;
  number: number;
  title: string;
  client: string;
  repository: string;
  baseBranch: string;
  headBranch: string;
  linkedIssue: string;
  issueUrl: string;
  assignedWorkers: AssignedWorker[];
  duration: string;
  cost: string;
  status: 'Awaiting Approval' | 'Approved' | 'Changes Requested' | 'Rejected';
  implementationSummary: string;
  technicalHighlights: string[];
  stats: {
    filesModified: number;
    linesAdded: number;
    linesRemoved: number;
    testStatus: string;
    buildStatus: string;
    securityFindings: string;
    codeQualityScore: string;
    architectureCompliance: string;
  };
  verifications: VerificationCheck[];
  files: DiffFile[];
}

export const primaryApprovalDossier: PullRequestDossier = {
  id: 'pr-248',
  number: 248,
  title: 'Fix email validation in authentication flow',
  client: 'Acme Digital Agency',
  repository: 'acme-org/portal-hub',
  baseBranch: 'main',
  headBranch: 'forge/devon/fix-email-validation',
  linkedIssue: 'ISSUE-248: Auth login fails on quoted email and plus-addressing RFC edge cases',
  issueUrl: '#',
  assignedWorkers: [
    {
      name: 'Devon',
      role: 'AI Full-Stack Developer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      contribution: 'Authored RFC 5322 regex parser and test cases'
    },
    {
      name: 'Elena',
      role: 'AI Code Reviewer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      contribution: 'Validated ReDoS immunity and architectural boundary'
    },
    {
      name: 'Tessa',
      role: 'AI QA Engineer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      contribution: 'Executed Playwright browser regression test suite'
    }
  ],
  duration: '4m 18s',
  cost: '$0.428',
  status: 'Awaiting Approval',
  implementationSummary: 
    'Resolves an issue where valid RFC 5322 email addresses (specifically addressing tags like user+dev@domain.com, subdomains, and quoted local-parts) were erroneously rejected by the legacy naive regex in the login dialog. Replaced the vulnerable regex with a deterministic finite-state automaton that enforces strict 254-character bounds to eliminate ReDoS vulnerabilities while retaining full backwards compatibility with OAuth single-sign-on providers.',
  technicalHighlights: [
    'Replaced vulnerable nested exponential quantifier with linear O(N) RFC 5322-compliant syntax checker',
    'Enforces maximum length constraint of 254 octets per RFC 5321 §4.5.3.1.3 before evaluation',
    'Added support for plus-addressing (subaddress tags), uppercase hex encodings, and modern gTLDs',
    'Preserved isolated pure function signature with zero external dependencies and zero side-effects',
    'Eliminated duplicated ad-hoc client-side regex in login component, consolidating on core validator'
  ],
  stats: {
    filesModified: 3,
    linesAdded: 48,
    linesRemoved: 14,
    testStatus: 'All 37 Tests Passed (100%)',
    buildStatus: 'Passed (Zero Warnings)',
    securityFindings: '0 Critical / 0 High (ReDoS Safe)',
    codeQualityScore: 'Grade A (Cyclomatic Complexity: 3)',
    architectureCompliance: '100% Boundary Compliant'
  },
  verifications: [
    {
      id: 'v-1',
      label: 'Unit Tests',
      result: '24 / 24 passed',
      detail: '100% branch and condition coverage across email parsing logic',
      status: 'passed',
      simulated: true
    },
    {
      id: 'v-2',
      label: 'Integration Tests',
      result: '8 / 8 passed',
      detail: 'Validated NextAuth credentials provider and JWT session exchange',
      status: 'passed',
      simulated: true
    },
    {
      id: 'v-3',
      label: 'Browser Tests',
      result: '5 / 5 passed',
      detail: 'Headless Playwright run across Chromium, Firefox, and WebKit',
      status: 'passed',
      simulated: true
    },
    {
      id: 'v-4',
      label: 'Production Build',
      result: 'Passed in 42.4ms',
      detail: 'Zero TypeScript errors, bundle size delta within +0.12 kB budget',
      status: 'passed',
      simulated: true
    },
    {
      id: 'v-5',
      label: 'Mutation Score',
      result: '86% (simulated)',
      detail: 'Stryker Mutator survived 3 / 22 mutants (high fault-detection depth)',
      status: 'passed',
      simulated: true
    },
    {
      id: 'v-6',
      label: 'Security Scan',
      result: 'No critical issues',
      detail: 'Semgrep rule auth.insecure-regex and Snyk SAST zero CVE findings',
      status: 'passed',
      simulated: true
    }
  ],
  files: [
    {
      id: 'file-1',
      filename: 'src/auth/validators/email.ts',
      status: 'modified',
      additions: 32,
      deletions: 8,
      summary: 'Replaces naive regex with RFC 5322-compliant validator & ReDoS bounds check',
      lines: [
        {
          type: 'context',
          oldLineNumber: 1,
          newLineNumber: 1,
          content: '/**'
        },
        {
          type: 'context',
          oldLineNumber: 2,
          newLineNumber: 2,
          content: ' * Authentication Email Validator'
        },
        {
          type: 'context',
          oldLineNumber: 3,
          newLineNumber: 3,
          content: ' */'
        },
        {
          type: 'del',
          oldLineNumber: 4,
          content: '- // Naive email check (causes false negatives on subaddresses and RFC plus-tags)'
        },
        {
          type: 'del',
          oldLineNumber: 5,
          content: '- const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;'
        },
        {
          type: 'del',
          oldLineNumber: 6,
          content: '- export function isValidEmail(email: string): boolean {'
        },
        {
          type: 'del',
          oldLineNumber: 7,
          content: '-   return EMAIL_REGEX.test(email);'
        },
        {
          type: 'del',
          oldLineNumber: 8,
          content: '- }'
        },
        {
          type: 'add',
          newLineNumber: 4,
          content: '+ // Maximum allowed length per RFC 5321 section 4.5.3.1.3'
        },
        {
          type: 'add',
          newLineNumber: 5,
          content: '+ const MAX_EMAIL_OCTETS = 254;'
        },
        {
          type: 'add',
          newLineNumber: 6,
          content: '+ const MAX_LOCAL_PART_OCTETS = 64;'
        },
        {
          type: 'add',
          newLineNumber: 7,
          content: '+ '
        },
        {
          type: 'add',
          newLineNumber: 8,
          content: '+ // Strict RFC 5322 compatible linear parser pattern with catastrophic backtracking immunity'
        },
        {
          type: 'add',
          newLineNumber: 9,
          content: '+ const RFC5322_EMAIL_REGEX = /^(?:[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$/;'
        },
        {
          type: 'add',
          newLineNumber: 10,
          content: '+ ',
          comments: [
            {
              id: 'c-1',
              author: 'Elena',
              role: 'AI Code Reviewer',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
              timestamp: '10:44:12 UTC',
              badge: 'Security Verified',
              badgeColor: 'emerald',
              message: 'Verified regex pattern against standard ReDoS fuzz testing corpus. With the initial 254 octet short-circuit check, polynomial worst-case execution time is strictly bounded to <0.04ms.'
            },
            {
              id: 'c-2',
              author: 'Devon',
              role: 'AI Full-Stack Developer',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              timestamp: '10:44:38 UTC',
              badge: 'Implementation Note',
              badgeColor: 'violet',
              message: 'Correct. Also added explicit test fixtures for nested plus-tags (user+tag1+tag2@domain.co.uk) and IP literal domain brackets.'
            }
          ]
        },
        {
          type: 'add',
          newLineNumber: 11,
          content: '+ export function isValidEmail(email: string | null | undefined): boolean {'
        },
        {
          type: 'add',
          newLineNumber: 12,
          content: '+   if (!email || typeof email !== "string") return false;'
        },
        {
          type: 'add',
          newLineNumber: 13,
          content: '+   const trimmed = email.trim();'
        },
        {
          type: 'add',
          newLineNumber: 14,
          content: '+   if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_OCTETS) return false;'
        },
        {
          type: 'add',
          newLineNumber: 15,
          content: '+   '
        },
        {
          type: 'add',
          newLineNumber: 16,
          content: '+   const atIndex = trimmed.lastIndexOf("@");'
        },
        {
          type: 'add',
          newLineNumber: 17,
          content: '+   if (atIndex <= 0 || atIndex >= trimmed.length - 1) return false;'
        },
        {
          type: 'add',
          newLineNumber: 18,
          content: '+   if (atIndex > MAX_LOCAL_PART_OCTETS) return false;'
        },
        {
          type: 'add',
          newLineNumber: 19,
          content: '+   '
        },
        {
          type: 'add',
          newLineNumber: 20,
          content: '+   return RFC5322_EMAIL_REGEX.test(trimmed);'
        },
        {
          type: 'add',
          newLineNumber: 21,
          content: '+ }'
        },
        {
          type: 'context',
          oldLineNumber: 9,
          newLineNumber: 22,
          content: ''
        },
        {
          type: 'context',
          oldLineNumber: 10,
          newLineNumber: 23,
          content: 'export function normalizeEmail(email: string): string {'
        },
        {
          type: 'context',
          oldLineNumber: 11,
          newLineNumber: 24,
          content: '  return email.trim().toLowerCase();'
        },
        {
          type: 'context',
          oldLineNumber: 12,
          newLineNumber: 25,
          content: '}'
        }
      ]
    },
    {
      id: 'file-2',
      filename: 'src/auth/validators/email.test.ts',
      status: 'modified',
      additions: 16,
      deletions: 2,
      summary: 'Adds 12 regression test cases covering RFC plus-tags, quoted strings, and length boundary limits',
      lines: [
        {
          type: 'context',
          oldLineNumber: 14,
          newLineNumber: 14,
          content: '  describe("isValidEmail()", () => {'
        },
        {
          type: 'context',
          oldLineNumber: 15,
          newLineNumber: 15,
          content: '    it("should accept standard corporate email formats", () => {'
        },
        {
          type: 'context',
          oldLineNumber: 16,
          newLineNumber: 16,
          content: '      expect(isValidEmail("engineer@acme-org.com")).toBe(true);'
        },
        {
          type: 'context',
          oldLineNumber: 17,
          newLineNumber: 17,
          content: '    });'
        },
        {
          type: 'add',
          newLineNumber: 18,
          content: '+   it("should accept RFC plus-addressing subaddress tags", () => {'
        },
        {
          type: 'add',
          newLineNumber: 19,
          content: '+     expect(isValidEmail("user+finance.billing@acme.co.uk")).toBe(true);'
        },
        {
          type: 'add',
          newLineNumber: 20,
          content: '+     expect(isValidEmail("alex+staging+v2@domain.io")).toBe(true);'
        },
        {
          type: 'add',
          newLineNumber: 21,
          content: '+   });'
        },
        {
          type: 'add',
          newLineNumber: 22,
          content: '+ '
        },
        {
          type: 'add',
          newLineNumber: 23,
          content: '+   it("should reject inputs exceeding RFC 5321 254-character bounds", () => {'
        },
        {
          type: 'add',
          newLineNumber: 24,
          content: '+     const oversized = `${"a".repeat(250)}@acme.com`;'
        },
        {
          type: 'add',
          newLineNumber: 25,
          content: '+     expect(isValidEmail(oversized)).toBe(false);'
        },
        {
          type: 'add',
          newLineNumber: 26,
          content: '+   });',
          comments: [
            {
              id: 'c-3',
              author: 'Tessa',
              role: 'AI QA Engineer',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
              timestamp: '10:45:01 UTC',
              badge: 'QA Approved',
              badgeColor: 'blue',
              message: 'Executed 24 unit permutations including unicode emoji domains, unclosed quotes, and trailing dots. All 24 assertions passed in 14ms.'
            }
          ]
        },
        {
          type: 'context',
          oldLineNumber: 18,
          newLineNumber: 27,
          content: '  });'
        }
      ]
    },
    {
      id: 'file-3',
      filename: 'src/auth/login.tsx',
      status: 'modified',
      additions: 0,
      deletions: 4,
      summary: 'Removes redundant inline regex in login component, directing validation to isValidEmail()',
      lines: [
        {
          type: 'context',
          oldLineNumber: 38,
          newLineNumber: 38,
          content: '  const handleFormSubmit = async (e: React.FormEvent) => {'
        },
        {
          type: 'context',
          oldLineNumber: 39,
          newLineNumber: 39,
          content: '    e.preventDefault();'
        },
        {
          type: 'del',
          oldLineNumber: 40,
          content: '-   // Redundant ad-hoc regex check'
        },
        {
          type: 'del',
          oldLineNumber: 41,
          content: '-   if (!/\\S+@\\S+\\.\\S+/.test(emailInput)) {'
        },
        {
          type: 'del',
          oldLineNumber: 42,
          content: '-     setError("Invalid email format"); return;'
        },
        {
          type: 'del',
          oldLineNumber: 43,
          content: '-   }'
        },
        {
          type: 'context',
          oldLineNumber: 44,
          newLineNumber: 40,
          content: '    if (!isValidEmail(emailInput)) {'
        },
        {
          type: 'context',
          oldLineNumber: 45,
          newLineNumber: 41,
          content: '      setError("Please provide a valid corporate email address.");'
        },
        {
          type: 'context',
          oldLineNumber: 46,
          newLineNumber: 42,
          content: '      return;'
        },
        {
          type: 'context',
          oldLineNumber: 47,
          newLineNumber: 43,
          content: '    }'
        }
      ]
    }
  ]
};
