import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { Run, Task } from "./api";

export const projectLimit = 12;
export const taskLimit = 24;
export const usageLimit = 16;
export const collaborationKey = ["collaborate"] as const;
export const isActivePlanning = (run?: Run) => !!run?.planningJob && (run.status === "PENDING" || run.status === "RUNNING");

export async function inBatches<Item, Result>(items: Item[], load: (item: Item) => Promise<Result>) {
  const results: Result[] = [];
  for (let offset = 0; offset < items.length; offset += 4) {
    results.push(...await Promise.all(items.slice(offset, offset + 4).map(load)));
  }
  return results;
}

export function useProjects(org: string) {
  return useQuery({ queryKey: ["projects", org], queryFn: ({ signal }) => api.projects(org, signal) });
}

export function useInventory(org: string) {
  const projects = useProjects(org);
  const ids = projects.data?.slice(0, projectLimit).map(({ id }) => id) ?? [];
  const tasks = useQuery({
    queryKey: ["inventory", org, ids],
    enabled: !!projects.data,
    queryFn: async ({ signal }) => (await inBatches(ids, (id) => api.tasks(id, signal))).flat(),
  });
  return {
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
    pending: projects.isPending || (!!projects.data && tasks.isPending),
    error: projects.error ?? tasks.error,
    retry: () => { void (projects.isError ? projects.refetch() : tasks.refetch()); },
  };
}

export function newest<T extends { createdAt: string; id: string }>(items: T[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export function useRuns(org: string, inventory: ReturnType<typeof useInventory>) {
  const ids = newest(inventory.tasks).slice(0, taskLimit).map(({ id }) => id);
  return useQuery<Run[]>({
    queryKey: ["runs", org, ids],
    enabled: !inventory.pending && !inventory.error,
    refetchInterval: ({ state }) => state.data?.some(isActivePlanning) ? 5000 : false,
    queryFn: async ({ signal }) => newest((await inBatches(ids, (id) => api.runs(id, org, signal))).flat()),
  });
}

export function runTask(run: Run, tasks: Task[]) {
  return tasks.find(({ id }) => id === run.taskId);
}
