import { processPlanningJob } from "../src/services/planning-worker.ts";
import { disconnectDatabase } from "../src/services/database.ts";

const mode = process.argv[2];
const alex = {
  summary: "Plan a scoped change", requirements: ["Keep existing behavior"],
  implementationSteps: ["Review the existing implementation"], acceptanceCriteria: ["Exercise expected behavior"],
  risks: [], handoffNotes: "Confirm acceptance criteria before writing code.",
};
const marcus = {
  architectureSummary: "Propose a service boundary. Repository structure is unknown.",
  proposedComponents: ["Planning service"], implementationApproach: ["Confirm repository conventions"],
  dataModelChanges: [], apiChanges: [], risks: [], testingStrategy: ["Propose a contract test"],
  openQuestions: ["Which repository owns this behavior?"],
};
const park = () => new Promise(() => {});
const send = (message) => new Promise((resolve, reject) => process.send(message, (error) => error ? reject(error) : resolve()));

try {
  await processPlanningJob({
    leaseMs: 1500,
    heartbeatMs: 150,
    providerFactory: () => ({
      name: "mock", model: "mock-planning",
      async generate({ systemInstruction }) {
        const isAlex = systemInstruction.includes("alex-plan-v1");
        await send({ type: "call", role: isAlex ? "ALEX" : "MARCUS" });
        if (mode === "in-flight") await park();
        return { text: JSON.stringify(isAlex ? alex : marcus) };
      },
    }),
    async onCheckpoint() {
      await send({ type: "checkpoint" });
      if (mode === "checkpoint") await park();
    },
  });
  await send({ type: "done" });
} finally {
  await disconnectDatabase();
  process.disconnect();
}
