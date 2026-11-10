export interface SimulationStep {
  stepIndex: number;
  stage: 'INGESTION' | 'INDEXING' | 'PLANNING' | 'DEVELOPMENT' | 'VERIFICATION' | 'AUDITING' | 'DELIVERY';
  agent: 'Alex' | 'Marcus' | 'Devon' | 'Tessa' | 'Elena';
  agentRole: string;
  activityMessage: string;
  terminalOutput: string[];
  tokensInputIncrement: number;
  tokensOutputIncrement: number;
  costIncrement: number;
  progressPercent: number;
  handoff?: {
    from: string;
    to: string;
    reason: string;
    artifact: string;
  };
  testSummary?: {
    passed: number;
    failed: number;
    total: number;
    suiteName: string;
  };
}

export interface ChangedFileItem {
  path: string;
  changeType: 'M' | 'A' | 'D';
  additions: number;
  deletions: number;
  oldContent?: string;
  newContent: string;
}

export interface ExecutionTaskScenario {
  id: string;
  title: string;
  client: string;
  clientCode: string;
  repository: string;
  branch: string;
  initialAgent: string;
  initialRole: string;
  model: string;
  baseCost: number;
  files: ChangedFileItem[];
  steps: SimulationStep[];
}

export const mockExecutionScenarios: ExecutionTaskScenario[] = [
  {
    id: 'exec-auth-01',
    title: 'Implement WebAuthn FIDO2 attestation & passkey hardware validation',
    client: 'Acme Digital Agency',
    clientCode: 'ACME',
    repository: 'acme-org/portal-hub',
    branch: 'forge/devon/webauthn-fido2-attest',
    initialAgent: 'Devon',
    initialRole: 'AI Full-Stack Developer',
    model: 'Claude 3.5 Sonnet (Direct Enclave)',
    baseCost: 0.85,
    files: [
      {
        path: 'src/auth/webauthn.ts',
        changeType: 'M',
        additions: 124,
        deletions: 18,
        newContent: `import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { db } from '@/lib/db';
import { fido2Credentials } from '@/schema/auth';

/**
 * Validates FIDO2 hardware authenticator response and stores verified public key credential
 */
export async function verifyPasskeyAttestation(
  userId: string,
  response: any,
  expectedChallenge: string
) {
  // 1. Enforce WebAuthn RP origin and challenge verification
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: process.env.NEXTAUTH_URL || 'https://acme-portal.internal',
    expectedRPID: process.env.RP_ID || 'acme-portal.internal',
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('FIDO2_ATTESTATION_FAILED: Invalid signature or untrusted authenticator');
  }

  const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

  // 2. Persist hardware credential in isolated enclave ledger
  await db.insert(fido2Credentials).values({
    userId,
    credentialId: Buffer.from(credentialID).toString('base64url'),
    publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
    signCount: counter,
    transports: response.response.transports || ['internal'],
    createdAt: new Date(),
  });

  return { success: true, credentialId: Buffer.from(credentialID).toString('base64url') };
}`,
      },
      {
        path: 'src/auth/login.tsx',
        changeType: 'M',
        additions: 48,
        deletions: 6,
        newContent: `import React, { useState } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { KeyRound, ShieldCheck, Loader2 } from 'lucide-react';

export function PasskeyAuthButton({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasskeySignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/auth/passkey/generate-options');
      const options = await resp.json();
      
      const authResult = await startAuthentication(options);
      const verifyResp = await fetch('/api/auth/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResult),
      });

      if (!verifyResp.ok) throw new Error('Biometric passkey signature failed verification');
      onAuthenticated();
    } catch (err: any) {
      setError(err.message || 'Passkey authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePasskeySignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-mono text-xs"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
      <span>Sign in with Hardware Passkey</span>
    </button>
  );
}`,
      },
      {
        path: 'tests/auth/webauthn.test.ts',
        changeType: 'A',
        additions: 86,
        deletions: 0,
        newContent: `import { describe, it, expect, vi } from 'vitest';
import { verifyPasskeyAttestation } from '../../src/auth/webauthn';

describe('WebAuthn FIDO2 Attestation Invariants', () => {
  it('should successfully verify valid authenticator registration response', async () => {
    const mockResponse = {
      id: 'mock-cred-123',
      rawId: 'mock-cred-123',
      response: { clientDataJSON: 'eyJjaGFsbGVuZ2UiOiJ0ZXN0In0', attestationObject: 'mock-attest' },
      type: 'public-key',
    };

    const result = await verifyPasskeyAttestation('user-001', mockResponse, 'expected-challenge');
    expect(result.success).toBe(true);
  });

  it('should reject tampered or modified challenge payload', async () => {
    await expect(
      verifyPasskeyAttestation('user-001', { response: {} }, 'tampered-challenge')
    ).rejects.toThrow('FIDO2_ATTESTATION_FAILED');
  });
});`,
      },
      {
        path: 'src/schema/auth.ts',
        changeType: 'M',
        additions: 22,
        deletions: 2,
        newContent: `import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const fido2Credentials = pgTable('fido2_credentials', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  credentialId: text('credential_id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  signCount: integer('sign_count').default(0).notNull(),
  transports: text('transports').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});`,
      },
    ],
    steps: [
      {
        stepIndex: 1,
        stage: 'INGESTION',
        agent: 'Alex',
        agentRole: 'AI Product Manager',
        activityMessage: 'Alex initialized requirement analysis and ticket specification parsing.',
        terminalOutput: [
          '> Initializing Enclave Workspace isolated runner node #4...',
          '> Loaded ticket specs: FIDO2 Passkey Attestation (PRD-402)',
          '> Parsing acceptance criteria: WebAuthn Level 3 compliance & HMAC verification',
          '> Environment check: Node.js v24.2.0, Rust toolchain, Vitest 2.1.8',
        ],
        tokensInputIncrement: 2400,
        tokensOutputIncrement: 620,
        costIncrement: 0.04,
        progressPercent: 14,
        handoff: {
          from: 'Alex (AI PM)',
          to: 'Marcus (AI Architect)',
          reason: 'Requirements decomposed into AST task DAG. Handoff to Architecture Planning.',
          artifact: 'spec/webauthn-architecture-madr.md',
        },
      },
      {
        stepIndex: 2,
        stage: 'INDEXING',
        agent: 'Marcus',
        agentRole: 'AI Software Architect',
        activityMessage: 'Marcus indexed repository AST syntax trees and identified credential dependencies.',
        terminalOutput: [
          '> git checkout -b forge/devon/webauthn-fido2-attest',
          '> ast-grep scan --lang typescript --pattern "export function verifyRegistrationResponse($$$)"',
          '> Indexed 3,420 AST nodes across src/auth/ and src/schema/',
          '> Target packages validated: @simplewebauthn/server @simplewebauthn/browser',
        ],
        tokensInputIncrement: 5800,
        tokensOutputIncrement: 1200,
        costIncrement: 0.08,
        progressPercent: 28,
      },
      {
        stepIndex: 3,
        stage: 'PLANNING',
        agent: 'Marcus',
        agentRole: 'AI Software Architect',
        activityMessage: 'Marcus generated architectural specification for FIDO2 credential storage schema.',
        terminalOutput: [
          '> Generating Architectural Decision Record ADR-0089...',
          '> Invariant modeling: Hardware credential keys must be base64url encoded',
          '> Dependency cycle analysis: Clean (0 circular imports detected)',
          '> Dispatched implementation roadmap to Devon (AI Full-Stack Developer)',
        ],
        tokensInputIncrement: 7200,
        tokensOutputIncrement: 1950,
        costIncrement: 0.11,
        progressPercent: 42,
        handoff: {
          from: 'Marcus (AI Architect)',
          to: 'Devon (AI Full-Stack Developer)',
          reason: 'ADR-0089 validated. Initiating autonomous source code implementation.',
          artifact: 'docs/adr/0089-webauthn-fido2.md',
        },
      },
      {
        stepIndex: 4,
        stage: 'DEVELOPMENT',
        agent: 'Devon',
        agentRole: 'AI Full-Stack Developer',
        activityMessage: 'Devon authored verifyPasskeyAttestation() and biometric login React button.',
        terminalOutput: [
          '> Modifying src/auth/webauthn.ts (+124 lines / -18 lines)',
          '> Updating src/auth/login.tsx (+48 lines / -6 lines)',
          '> Applying Drizzle ORM schema migration for fido2_credentials table',
          '> Running typecheck: npx tsc --noEmit (0 TypeScript errors)',
        ],
        tokensInputIncrement: 14500,
        tokensOutputIncrement: 4200,
        costIncrement: 0.24,
        progressPercent: 62,
      },
      {
        stepIndex: 5,
        stage: 'VERIFICATION',
        agent: 'Tessa',
        agentRole: 'AI QA Engineer',
        activityMessage: 'Tessa executed Vitest invariant assertions and Playwright headless biometric test flows.',
        terminalOutput: [
          '> vitest run tests/auth/webauthn.test.ts',
          '  ✓ WebAuthn FIDO2 Attestation Invariants > should verify valid registration (14ms)',
          '  ✓ WebAuthn FIDO2 Attestation Invariants > should reject tampered challenge (8ms)',
          '  ✓ Playwright mock authenticator flow > 12 scenarios passed in 3.4s',
          '> Test Suites: 1 passed, 1 total | Tests: 24 passed, 24 total (100% clean)',
        ],
        tokensInputIncrement: 8900,
        tokensOutputIncrement: 1800,
        costIncrement: 0.14,
        progressPercent: 78,
        testSummary: {
          passed: 24,
          failed: 0,
          total: 24,
          suiteName: 'tests/auth/webauthn.test.ts & Playwright FIDO2 Mock Suite',
        },
        handoff: {
          from: 'Tessa (AI QA Engineer)',
          to: 'Elena (AI Code Reviewer)',
          reason: '100% tests passed without regression. Dispatched for static security review.',
          artifact: 'reports/vitest-webauthn-coverage.json',
        },
      },
      {
        stepIndex: 6,
        stage: 'AUDITING',
        agent: 'Elena',
        agentRole: 'AI Code Reviewer',
        activityMessage: 'Elena completed static Semgrep AST security scan and TruffleHog secret check.',
        terminalOutput: [
          '> semgrep --config=p/owasp-top-ten src/auth/',
          '  [SEMGREP] 0 high findings, 0 medium findings (Passed)',
          '> trufflehog filesystem --entropy=true src/auth/login.tsx',
          '  [TRUFFLEHOG] 0 credentials or high-entropy secrets found',
          '> Verified constant-time challenge comparison to prevent timing attacks',
        ],
        tokensInputIncrement: 6400,
        tokensOutputIncrement: 1400,
        costIncrement: 0.10,
        progressPercent: 92,
      },
      {
        stepIndex: 7,
        stage: 'DELIVERY',
        agent: 'Elena',
        agentRole: 'AI Code Reviewer',
        activityMessage: 'Elena synthesized PR #89 with verified cryptographic signature and approval sign-off.',
        terminalOutput: [
          '> git commit -m "feat(auth): implement WebAuthn FIDO2 attestation & hardware passkeys"',
          '> git push origin forge/devon/webauthn-fido2-attest',
          '> Pull Request #89 published: https://github.com/acme-org/portal-hub/pull/89',
          '> Automated compliance gate passed: SOC2 Type II & FedRAMP Moderate verified',
          '> TASK EXECUTION COMPLETED SUCCESSFULLY [Duration: 14m 22s]',
        ],
        tokensInputIncrement: 3200,
        tokensOutputIncrement: 850,
        costIncrement: 0.06,
        progressPercent: 100,
      },
    ],
  },
  {
    id: 'exec-raft-02',
    title: 'Vectorized quorum heartbeat optimization via epoll event ring',
    client: 'Acme Digital Agency',
    clientCode: 'ACME',
    repository: 'acme-org/consensus-mesh',
    branch: 'forge/devon/vector-heartbeat',
    initialAgent: 'Marcus',
    initialRole: 'AI Software Architect',
    model: 'Claude 3.5 Sonnet (Direct Enclave)',
    baseCost: 1.15,
    files: [
      {
        path: 'src/raft/heartbeat.rs',
        changeType: 'M',
        additions: 384,
        deletions: 112,
        newContent: `use std::sync::atomic::{AtomicU64, Ordering};
use tokio::io::unix::AsyncFd;

/// Lockless vectorized 64-slot ringbuffer for quorum heartbeats
pub struct VectorRingHeartbeat {
    head: AtomicU64,
    tail: AtomicU64,
    slots: [AtomicU64; 64],
}

impl VectorRingHeartbeat {
    pub const fn new() -> Self {
        Self {
            head: AtomicU64::new(0),
            tail: AtomicU64::new(0),
            slots: [const { AtomicU64::new(0) }; 64],
        }
    }

    #[inline(always)]
    pub fn push_batch_heartbeat(&self, leader_term: u64, follower_mask: u64) -> bool {
        let current_tail = self.tail.load(Ordering::Acquire);
        let next_tail = current_tail.wrapping_add(1);
        let slot_idx = (current_tail as usize) & 63;
        self.slots[slot_idx].store(follower_mask, Ordering::Release);
        self.tail.store(next_tail, Ordering::Release);
        true
    }
}`,
      },
      {
        path: 'benches/heartbeat_bench.rs',
        changeType: 'A',
        additions: 92,
        deletions: 0,
        newContent: `use criterion::{black_box, criterion_group, criterion_main, Criterion};
use consensus_mesh::raft::VectorRingHeartbeat;

pub fn criterion_benchmark(c: &mut Criterion) {
    let ring = VectorRingHeartbeat::new();
    c.bench_function("vectorized_heartbeat_64_slot", |b| {
        b.iter(|| ring.push_batch_heartbeat(black_box(42), black_box(0xFF)))
    });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);`,
      },
    ],
    steps: [
      {
        stepIndex: 1,
        stage: 'INGESTION',
        agent: 'Alex',
        agentRole: 'AI Product Manager',
        activityMessage: 'Alex ingested high-concurrency ticket: Eliminate lock contention on leader quorum.',
        terminalOutput: [
          '> Checking out consensus-mesh @ rev 9f8a2b',
          '> Profiling telemetry: p99 heartbeat latency spikes detected at 142 microseconds',
          '> Requirement: Latency must drop below 100 microseconds with 0 heap allocations',
        ],
        tokensInputIncrement: 3100,
        tokensOutputIncrement: 800,
        costIncrement: 0.05,
        progressPercent: 15,
      },
      {
        stepIndex: 2,
        stage: 'INDEXING',
        agent: 'Marcus',
        agentRole: 'AI Software Architect',
        activityMessage: 'Marcus analyzed Tokio async channel allocations in src/raft/heartbeat.rs.',
        terminalOutput: [
          '> cargo check --target x86_64-unknown-linux-gnu',
          '> AST analysis identified 4 crossbeam channels allocated on heap per follower tick',
          '> Formulated lock-free ringbuffer design using AtomicU64 atomic memory ordering',
        ],
        tokensInputIncrement: 6200,
        tokensOutputIncrement: 1400,
        costIncrement: 0.09,
        progressPercent: 30,
      },
      {
        stepIndex: 3,
        stage: 'DEVELOPMENT',
        agent: 'Devon',
        agentRole: 'AI Full-Stack Developer',
        activityMessage: 'Devon implemented 64-slot atomic RingBuffer with zero-copy vectorized batching.',
        terminalOutput: [
          '> rustc src/raft/heartbeat.rs -C opt-level=3',
          '> Replaced crossbeam channels with AtomicU64 slot array',
          '> Zero unsafe blocks required; verified memory barrier ordering with release-acquire semantics',
        ],
        tokensInputIncrement: 12400,
        tokensOutputIncrement: 3800,
        costIncrement: 0.22,
        progressPercent: 65,
      },
      {
        stepIndex: 4,
        stage: 'VERIFICATION',
        agent: 'Tessa',
        agentRole: 'AI QA Engineer',
        activityMessage: 'Tessa ran Criterion benchmarks and Knossos linearizability proofs.',
        terminalOutput: [
          '> cargo bench --bench heartbeat_bench',
          '  Benchmarking vectorized_heartbeat_64_slot: [85.2 ns 86.8 ns 88.4 ns]',
          '  Performance improvement: -38.6% p99 execution latency (p99: 87us)',
          '> cargo test --test linear_invariants -- --nocapture',
          '  48/48 assertions passed without deadlock or data races',
        ],
        tokensInputIncrement: 9400,
        tokensOutputIncrement: 2100,
        costIncrement: 0.16,
        progressPercent: 85,
        testSummary: {
          passed: 48,
          failed: 0,
          total: 48,
          suiteName: 'cargo test --test linear_invariants & Criterion Benches',
        },
      },
      {
        stepIndex: 5,
        stage: 'DELIVERY',
        agent: 'Elena',
        agentRole: 'AI Code Reviewer',
        activityMessage: 'Elena completed security review and merged PR #142 to develop branch.',
        terminalOutput: [
          '> cargo clippy --all-targets -- -D warnings (0 warnings)',
          '> PR #142 validated and merged: consensus engine throughput increased by 2.4x',
          '> TASK COMPLETED SUCCESSFULLY',
        ],
        tokensInputIncrement: 4100,
        tokensOutputIncrement: 950,
        costIncrement: 0.07,
        progressPercent: 100,
      },
    ],
  },
];
