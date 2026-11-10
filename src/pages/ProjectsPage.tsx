import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  GitBranch,
  Building2,
  Activity,
  Bot,
  ArrowUpRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { mockProjectEntities } from '../data/mockData';
import { ProjectEntity, ProjectHealth } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ProjectDetailsModal } from '../components/projects/ProjectDetailsModal';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectEntity[]>(mockProjectEntities);
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectEntity | null>(null);

  const navigate = useNavigate();

  const handleCreateProject = (newProject: ProjectEntity) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Client filter
      if (selectedClient !== 'ALL' && p.clientName !== selectedClient) {
        return false;
      }

      // Health filter
      if (healthFilter !== 'ALL' && p.health !== healthFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchKey = p.key.toLowerCase().includes(q);
        const matchClient = p.clientName.toLowerCase().includes(q);
        const matchRepo = p.repository.name.toLowerCase().includes(q);
        const matchTech = p.techStack.some((t) => t.toLowerCase().includes(q));
        const matchDesc = p.description.toLowerCase().includes(q);
        return matchName || matchKey || matchClient || matchRepo || matchTech || matchDesc;
      }

      return true;
    });
  }, [projects, selectedClient, healthFilter, searchQuery]);

  const clientsList = ['ALL', 'Acme Digital Agency', 'Northstar Commerce', 'Vertex Technologies'];

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case 'Optimal':
        return <Badge variant="emerald" size="xs">OPTIMAL</Badge>;
      case 'Healthy':
        return <Badge variant="blue" size="xs">HEALTHY</Badge>;
      case 'Needs Attention':
        return <Badge variant="amber" size="xs">NEEDS ATTN</Badge>;
      case 'At Risk':
        return <Badge variant="rose" size="xs">AT RISK</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1680px] mx-auto select-none">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900">
              Multi-Client Projects
            </h1>
            <Badge variant="blue" size="sm">
              {projects.length} ACTIVE WORKSPACES
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Agency client portfolios, Git repositories, architectural tech stacks, and delivery pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          {/* View switcher */}
          <div className="flex items-center rounded-lg bg-surface border border-border p-0.5 text-zinc-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-surface-elevated text-zinc-100' : 'hover:text-zinc-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-surface-elevated text-zinc-100' : 'hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 font-mono shadow-glow-violet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE PROJECT</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          CLIENT FILTER TABS
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-charcoal-400 text-[11px] uppercase mr-1">CLIENT:</span>
          {clientsList.map((client) => (
            <button
              key={client}
              onClick={() => setSelectedClient(client)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap border text-xs ${
                selectedClient === client
                  ? 'bg-primary text-white border-primary font-bold shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {client === 'ALL' ? 'All Clients (3)' : client}
            </button>
          ))}
        </div>

        {/* Health status filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-400 text-[11px]">HEALTH:</span>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-800 focus:outline-none focus:border-primary shadow-xs"
          >
            <option value="ALL">ALL HEALTH TIERS</option>
            <option value="Optimal">OPTIMAL</option>
            <option value="Healthy">HEALTHY</option>
            <option value="Needs Attention">NEEDS ATTENTION</option>
            <option value="At Risk">AT RISK</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          SEARCH BAR
          ========================================================================= */}
      <div className="relative">
        <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by project name, tech stack (e.g. 'Rust', 'Kafka', 'React 19'), repository, or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary shadow-xs"
        />
      </div>

      {/* =========================================================================
          PROJECT DISPLAY (GRID OR TABLE)
          ========================================================================= */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center text-xs font-mono text-zinc-500 space-y-2">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">No projects match the current filter criteria.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedClient('ALL');
              setHealthFilter('ALL');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const totalTasks = project.openTasksCount + project.completedTasksCount;
            const progressPercent = totalTasks > 0 ? Math.round((project.completedTasksCount / totalTasks) * 100) : 0;

            return (
              <Card
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group bg-white border-slate-200 shadow-card overflow-hidden"
              >
                <div>
                  {/* Card Header */}
                  <CardHeader className="bg-slate-50/70 pb-3 border-b border-slate-100">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Badge variant="subtle" size="xs">
                          {project.key}
                        </Badge>
                        <span className="text-[11px] text-charcoal-500 flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-charcoal-400 flex-shrink-0" />
                          <span className="truncate">{project.clientName}</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                    </div>

                    <div className="flex-shrink-0">
                      {getHealthBadge(project.health)}
                    </div>
                  </CardHeader>

                  {/* Card Content Body */}
                  <CardContent className="space-y-4 pt-3.5">
                    <p className="text-xs text-charcoal-600 leading-relaxed font-sans line-clamp-2">
                      {project.description}
                    </p>

                    {/* Repository Info */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-charcoal-800 truncate font-medium">{project.repository.name}</span>
                        <Badge variant="subtle" size="xs">
                          {project.repository.defaultBranch}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-charcoal-400 flex-shrink-0">{project.lastActivity}</span>
                    </div>

                    {/* Tasks Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-charcoal-500 flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-primary" />
                          <span>{project.openTasksCount} open tasks</span>
                        </span>
                        <span className="text-emerald-700 font-bold">{progressPercent}% shipped</span>
                      </div>
                      <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.map((tech) => (
                        <Badge key={tech} variant="subtle" size="xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2.5 border-t border-border bg-surface-muted/40 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                    <Bot className="w-3 h-3 text-amber-400" />
                    <span>Lead: {project.leadEmployee}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tasks?client=${encodeURIComponent(project.clientName)}`);
                    }}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                  >
                    <span>View Tasks</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-elevated/40 text-zinc-400 border-b border-border text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">PROJECT NAME</th>
                  <th className="py-2.5 px-3.5 font-semibold">CLIENT</th>
                  <th className="py-2.5 px-3.5 font-semibold">REPOSITORY</th>
                  <th className="py-2.5 px-3.5 font-semibold">TECH STACK</th>
                  <th className="py-2.5 px-3.5 font-semibold">HEALTH</th>
                  <th className="py-2.5 px-3.5 font-semibold">TASKS</th>
                  <th className="py-2.5 px-3.5 font-semibold">LAST ACTIVITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className="hover:bg-surface-elevated/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-sans font-bold text-zinc-100 group-hover:text-violet-300 transition-colors">
                        {p.name}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{p.key}</span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-zinc-300">
                      {p.clientName}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-violet-300">
                      {p.repository.name}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.slice(0, 3).map((t) => (
                          <Badge key={t} variant="subtle" size="xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getHealthBadge(p.health)}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="text-zinc-200">{p.openTasksCount} open</span>
                      <span className="text-zinc-500"> / {p.completedTasksCount} done</span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-zinc-400">
                      {p.lastActivity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onNavigateToTasks={(projName) => {
          setSelectedProject(null);
          navigate(`/tasks?search=${encodeURIComponent(projName)}`);
        }}
      />
    </div>
  );
};
