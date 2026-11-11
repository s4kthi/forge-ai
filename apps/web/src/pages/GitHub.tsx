import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";
import { useProjects } from "../queries";
import { Empty, Loading, PageTitle, Panel, Problem } from "../ui";

export function GitHub({ org, canManage }: { org: string; canManage: boolean }) {
  const client = useQueryClient();
  const [installationId, setInstallationId] = useState("");
  const [browseId, setBrowseId] = useState("");
  const [page, setPage] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [repoId, setRepoId] = useState("");
  const connections = useQuery({ queryKey: ["github", org], queryFn: ({ signal }) => api.githubConnections(org, signal) });
  const projects = useProjects(org);
  const catalog = useQuery({
    queryKey: ["github-catalog", org, browseId, page], enabled: canManage && !!browseId, retry: false,
    queryFn: ({ signal }) => api.githubCatalog(org, browseId, page, signal),
  });
  const refresh = () => client.invalidateQueries({ queryKey: ["github", org] });
  const connect = useMutation({ mutationFn: () => api.connectGitHub(org, installationId.trim()), onSuccess: () => {
    setInstallationId(""); return refresh();
  } });
  const select = useMutation({ mutationFn: (githubId: string) => api.selectRepository(org, browseId, githubId), onSettled: refresh });
  const link = useMutation({
    mutationFn: () => api.linkRepository(org, projectId, repoId || null),
    onSuccess: () => client.invalidateQueries({ queryKey: ["projects", org] }),
  });
  const selected = (connections.data ?? []).filter((entry) => !entry.revokedAt).flatMap((entry) => entry.repositories);
  return <>
    <PageTitle title="GitHub repositories" subtitle="Connect a read-only GitHub App installation and choose repositories for project planning." />
    {canManage && <Panel title="Connect an installation"><form className="integration-form" onSubmit={(event) => {
      event.preventDefault(); connect.mutate();
    }}><TextField size="small" label="GitHub installation ID" required value={installationId} onChange={(event) => setInstallationId(event.target.value)} />
      <Button type="submit" variant="outlined" disabled={connect.isPending}>Connect installation</Button>
      <small>Install the Forge GitHub App and have an operator approve the organization binding first.</small>
    </form>{connect.error && <Problem error={connect.error} />}</Panel>}
    <Panel title="Connected installations">
      {connections.isPending ? <Loading /> : connections.error ? <Problem error={connections.error} /> :
        !connections.data.length ? <Empty title="No GitHub installations connected" /> :
          <Stack spacing={2} className="integration-form">{connections.data.map((entry) => <div key={entry.id}>
            <strong>{entry.account}</strong> {entry.revokedAt && <span>Revoked or suspended</span>}
            {entry.repositories.length > 0 && <ul>{entry.repositories.map((repo) =>
              <li key={repo.id}>{repo.fullName} · {repo.defaultBranch ?? "No default branch"} · {repo.private ? "Private" : "Public"}</li>)}</ul>}
            {canManage && <Button size="small" onClick={() => {
              setBrowseId(entry.id); setPage(1); if (browseId === entry.id && page === 1) void catalog.refetch();
            }}>Browse repositories</Button>}
          </div>)}</Stack>}
    </Panel>
    {canManage && browseId && <Panel title="Installation repositories">
      {catalog.isPending ? <Loading /> : catalog.error ? <Problem error={catalog.error} /> : <div className="integration-form">
        {!catalog.data.repositories.length && <p>No repositories on this page.</p>}
        {catalog.data.repositories.map((repo) => <div key={repo.githubId}>
          {repo.fullName} <Button size="small" disabled={select.isPending} onClick={() => select.mutate(repo.githubId)}>Select repository</Button>
        </div>)}
        <Stack direction="row"><Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button disabled={!catalog.data.hasMore || page === 100} onClick={() => setPage(page + 1)}>Next</Button></Stack>
        {select.isSuccess && <p role="status">Repository selected.</p>}
      </div>}
      {select.error && <Problem error={select.error} />}
    </Panel>}
    {canManage && <Panel title="Link a project">
      {projects.error && <Problem error={projects.error} />}
      <form className="integration-form" onSubmit={(event) => { event.preventDefault(); link.mutate(); }}>
        <label>Project<select required value={projectId} onChange={(event) => {
          const value = event.target.value; setProjectId(value);
          setRepoId(projects.data?.find(({ id }) => id === value)?.githubRepository?.id ?? "");
        }}><option value="">Choose a project</option>{projects.data?.map((project) =>
          <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label>Repository<select value={repoId} onChange={(event) => setRepoId(event.target.value)}>
          <option value="">No repository (unlink)</option>{selected.map((repo) =>
            <option key={repo.id} value={repo.id}>{repo.fullName}</option>)}</select></label>
        <Button type="submit" variant="outlined" disabled={!projectId || link.isPending}>Save project repository</Button>
        <small>Linked planning sends selected paths and configuration structure to the configured planning provider.</small>
        {link.isSuccess && <p role="status">Project repository saved.</p>}
      </form>{link.error && <Problem error={link.error} />}
    </Panel>}
  </>;
}
