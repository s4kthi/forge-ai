import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { Shell } from './components/layout/Shell';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { WorkforcePage } from './pages/WorkforcePage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { ExecutionRoomPage } from './pages/ExecutionRoomPage';
import { AssistantPage } from './pages/AssistantPage';
import { NotesMeetingsPage } from './pages/NotesMeetingsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SecurityPage } from './pages/SecurityPage';
import { SettingsPage } from './pages/SettingsPage';
import { LiveMonitorPage } from './pages/observability/LiveMonitorPage';
import { AgentRunsPage } from './pages/observability/AgentRunsPage';
import { PromptInspectorPage } from './pages/observability/PromptInspectorPage';
import { LLMUsageCostsPage } from './pages/observability/LLMUsageCostsPage';
import { ExecutionTracesPage } from './pages/observability/ExecutionTracesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="command-center" element={<HomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="workforce" element={<WorkforcePage />} />
            <Route path="agent-activity" element={<AgentActivityPage />} />
            <Route path="execution-room" element={<ExecutionRoomPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="notes" element={<NotesMeetingsPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Observability routes */}
            <Route path="observability" element={<Navigate to="/observability/live-monitor" replace />} />
            <Route path="observability/live-monitor" element={<LiveMonitorPage />} />
            <Route path="observability/agent-runs" element={<AgentRunsPage />} />
            <Route path="observability/prompt-inspector" element={<PromptInspectorPage />} />
            <Route path="observability/llm-costs" element={<LLMUsageCostsPage />} />
            <Route path="observability/execution-traces" element={<ExecutionTracesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
};

export default App;
