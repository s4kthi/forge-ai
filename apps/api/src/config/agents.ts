import { AgentRole } from "../generated/prisma/enums.ts";

interface AgentIdentity {
  name: string;
  role: string;
  capabilities: readonly string[];
}

const identities = {
  ALEX: {
    name: "Alex",
    role: "Project Manager",
    capabilities: ["Clarify requirements", "Define acceptance criteria", "Coordinate handoffs"],
  },
  MARCUS: {
    name: "Marcus",
    role: "Software Architect",
    capabilities: ["Assess architecture", "Plan implementation", "Identify technical risks"],
  },
  DEVON: {
    name: "Devon",
    role: "Developer",
    capabilities: ["Implement changes", "Write tests", "Summarize changes"],
  },
  TESSA: {
    name: "Tessa",
    role: "QA Engineer",
    capabilities: ["Plan verification", "Check acceptance criteria", "Report defects"],
  },
  ELENA: {
    name: "Elena",
    role: "Code Reviewer",
    capabilities: ["Review changes", "Identify regressions", "Summarize review findings"],
  },
} as const satisfies Record<AgentRole, AgentIdentity>;

export const agents = Object.values(AgentRole).map((id) => ({ id, ...identities[id] }));
