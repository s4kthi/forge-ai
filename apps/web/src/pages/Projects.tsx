import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { api, priorities, taskStatuses } from "../api";
import type { NewTask, Project } from "../api";
import { useProjects } from "../queries";
import { Badge, Empty, label, Loading, PageTitle, Panel, Problem } from "../ui";

function ProjectTasks({ org, project }: { org: string; project: Project }) {
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const client = useQueryClient();
  const key = ["tasks", org, project.id];
  const tasks = useQuery({ queryKey: key, queryFn: ({ signal }) => api.tasks(project.id, signal) });
  const chosen = tasks.data?.find(({ id }) => id === params.get("task")) ?? tasks.data?.[0];
  const mutation = useMutation({
    mutationFn: (input: NewTask) => api.createTask(project.id, input),
    onSuccess: (task) => {
      client.setQueryData(key, (previous: typeof tasks.data) => [...(previous ?? []), task]);
      void client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: ["inventory", org] });
      setParams({ project: project.id, task: task.id });
      setCreating(false);
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) return;
    const description = String(form.get("description")).trim();
    mutation.mutate({
      title, description: description || undefined,
      status: form.get("status") as NewTask["status"],
      priority: form.get("priority") as NewTask["priority"],
    });
  }

  return <div className="project-detail">
    <Panel title={project.name} aside={<Badge value={project.status} />}>
      <div className="integration-form">
        <p><strong>Repository:</strong> {project.githubRepository ? `${project.githubRepository.fullName} · ${project.githubRepository.defaultBranch ?? "No default branch"}` : "No GitHub repository linked"}
          {project.githubRepository?.installation.revokedAt && " · Installation unavailable"}</p>
        <Link to="/github">GitHub repositories</Link>
      </div>
      <div className="project-intro"><p>{project.description ?? "No project description."}</p>
        <button className="button secondary" onClick={() => { mutation.reset(); setCreating(!creating); }}>
          <Plus size={15} />{creating ? "Close form" : "New task"}
        </button>
      </div>
      {creating && <form className="task-form" onSubmit={submit}>
        <label>Task title<input name="title" placeholder="e.g. Outline acceptance criteria" required maxLength={200} /></label>
        <label>Description<textarea name="description" rows={3} maxLength={5000} /></label>
        <div className="form-grid">
          <label>Status<select name="status" defaultValue="TODO">{taskStatuses.map((value) =>
            <option key={value} value={value}>{label(value)}</option>)}</select></label>
          <label>Priority<select name="priority" defaultValue="MEDIUM">{priorities.map((value) =>
            <option key={value} value={value}>{label(value)}</option>)}</select></label>
        </div>
        {mutation.isError && <Problem error={mutation.error} />}
        <button className="button primary" disabled={mutation.isPending}>{mutation.isPending ? "Creating task…" : "Create task"}</button>
      </form>}
      {tasks.isPending ? <Loading label="Loading tasks…" /> :
        tasks.isError ? <Problem error={tasks.error} retry={() => { void tasks.refetch(); }} /> :
        !tasks.data.length ? <Empty title="No tasks yet">Create a task to start planning work.</Empty> :
        <div className="table-scroll"><table><thead><tr><th scope="col">Task</th><th scope="col">Status</th>
          <th scope="col">Priority</th></tr></thead><tbody>{tasks.data.map((task) =>
            <tr key={task.id} className={task.id === chosen?.id ? "selected-row" : undefined}><td>
              <button className="row-title text-button" aria-pressed={task.id === chosen?.id}
                onClick={() => setParams({ project: project.id, task: task.id })}>{task.title}</button>
            </td><td><Badge value={task.status} /></td><td><Badge value={task.priority} /></td></tr>)}</tbody></table></div>}
    </Panel>
    {chosen && <Panel title="Task details" aside={<Link className="text-link" to={`/workforce?project=${project.id}&task=${chosen.id}`}>
      Plan with agents <ArrowRight size={14} /></Link>}>
      <div className="task-detail"><h3>{chosen.title}</h3><p>{chosen.description ?? "No task description."}</p></div>
    </Panel>}
  </div>;
}

export function Projects({ org }: { org: string }) {
  const projects = useProjects(org);
  const [params, setParams] = useSearchParams();
  const chosen = projects.data?.find(({ id }) => id === params.get("project")) ?? projects.data?.[0];
  return <>
    <PageTitle title="Projects" subtitle="Browse project scope, track tasks, and select work for the AI workforce." />
    {projects.isPending ? <Loading label="Loading projects…" /> :
      projects.isError ? <Problem error={projects.error} retry={() => { void projects.refetch(); }} /> :
      !chosen ? <Empty title="No projects in this organization">Add a project through the local API or seed demo data.</Empty> :
      <div className="projects-grid"><Panel title="Project list"><ul className="project-list">{projects.data?.map((project) =>
        <li key={project.id}><button aria-pressed={project.id === chosen.id} onClick={() => setParams({ project: project.id })}>
          <FolderKanban size={17} /><span>{project.name}</span></button></li>)}</ul></Panel>
        <ProjectTasks key={chosen.id} org={org} project={chosen} /></div>}
  </>;
}
