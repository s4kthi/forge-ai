import assert from "node:assert/strict";
import { test } from "node:test";
import { mockCodingExecutor } from "./coding-executor.mock.ts";

test("coding executor contract replays events and looks up cancelled work without claiming changes or tests", async () => {
  const executor = mockCodingExecutor();
  const task = { assignmentId: "a", organizationId: "org", repositoryId: "repo", commitSha: "a".repeat(40),
    instruction: "Make an isolated change", idempotencyKey: "command-1" };
  const run = await executor.start(task);
  assert.deepEqual(await executor.start(task), run);
  assert.equal(run.status, "QUEUED");
  const cancelled = await executor.cancel(run.id);
  assert.equal(cancelled.status, "CANCELLED");
  assert.deepEqual(await executor.cancel(run.id), cancelled);
  assert.deepEqual(await executor.recover(run.id), cancelled);
  assert.equal(await executor.lookup("unknown"), null);
  assert.deepEqual((await Array.fromAsync(executor.events(run.id, 1))).map(({ sequence, status }) => [sequence, status]), [[2, "CANCELLED"]]);
  assert.deepEqual(await executor.changes(run.id), { files: [] });
  assert.deepEqual(await executor.testResults(run.id), { status: "NOT_RUN" });
});
