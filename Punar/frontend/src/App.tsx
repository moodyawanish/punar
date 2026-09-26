import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FlaskConical,
  FileText,
  History,
  ShieldCheck,
  Settings,
  ChevronDown,
  GitCompare,
} from 'lucide-react';
import { clsx } from 'clsx';

import { Dashboard }              from './pages/Dashboard';
import { Projects }               from './pages/Projects';
import { ProjectOverview }        from './pages/ProjectOverview';
import { ChangeAnalysis }         from './pages/ChangeAnalysis';
import { DeploymentConfig }       from './pages/DeploymentConfig';
import { DeploymentProgress }     from './pages/DeploymentProgress';
import { Monitoring }             from './pages/Monitoring';
import { RecoveryReport }         from './pages/RecoveryReport';
import { RecoveryPoints }         from './pages/RecoveryPoints';
import { RecoveryHistory }        from './pages/RecoveryHistory';
import { AuditLogs }              from './pages/AuditLogs';
import { SettingsPage }           from './pages/Settings';

function PunarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 2.5A7.5 7.5 0 1 0 17.5 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10 2.5V6.5H14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Routes>
          <Route path="/"                                    element={<Dashboard />} />
          <Route path="/projects"                            element={<Projects />} />
          <Route path="/projects/:id"                        element={<ProjectOverview />} />
          <Route path="/projects/:id/change-analysis"        element={<ChangeAnalysis />} />
          <Route path="/projects/:id/rollback-check"         element={<DeploymentConfig />} />
          <Route path="/projects/:id/rehearsal"              element={<DeploymentProgress />} />
          <Route path="/projects/:id/analysis"               element={<Monitoring />} />
          <Route path="/projects/:id/report"                 element={<RecoveryReport />} />
          {/* Legacy routes kept for internal navigation compatibility */}
          <Route path="/deployments/new"                     element={<DeploymentConfig />} />
          <Route path="/deployments/progress"                element={<DeploymentProgress />} />
          <Route path="/monitoring"                          element={<Monitoring />} />
          <Route path="/recovery/report"                     element={<RecoveryReport />} />
          <Route path="/snapshots"                           element={<RecoveryPoints />} />
          <Route path="/check-history"                       element={<RecoveryHistory />} />
          <Route path="/audit"                               element={<AuditLogs />} />
          <Route path="/settings"                            element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar() {
  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col border-r border-border"
      style={{ background: 'var(--color-sidebar)' }}
    >
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-7 h-7 rounded-[6px] bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
          <PunarMark className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[15px] font-semibold tracking-tight">Punar</span>
          <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-[0.12em] leading-none mt-0.5">Platform</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <NavGroup label="Overview">
          <NavItem to="/"         icon={<LayoutDashboard size={15} />} label="Dashboard" />
          <NavItem to="/projects" icon={<FolderGit2 size={15} />}     label="Projects" />
        </NavGroup>
        <NavGroup label="Rollback Safety">
          <NavItem to="/deployments/new"   icon={<GitCompare size={15} />}    label="Rollback Checks" />
          <NavItem to="/deployments/progress" icon={<FlaskConical size={15} />} label="Rehearsals" />
          <NavItem to="/snapshots"         icon={<FileText size={15} />}      label="Snapshots" />
        </NavGroup>
        <NavGroup label="History">
          <NavItem to="/check-history" icon={<History size={15} />}    label="Check History" />
          <NavItem to="/audit"         icon={<ShieldCheck size={15} />} label="Audit Logs" />
        </NavGroup>
        <div className="pt-1">
          <NavItem to="/settings" icon={<Settings size={15} />} label="Settings" />
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm hover:bg-white/[0.03] transition-colors group">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-primary">D</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-medium text-foreground truncate leading-none">Developer</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">Team Workspace</p>
          </div>
          <ChevronDown size={13} className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </button>
      </div>
    </aside>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="px-2.5 mb-1 text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground/40 select-none">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors duration-150',
        isActive
          ? 'bg-primary/[0.08] text-foreground'
          : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground/80'
      )}
    >
      <span className={clsx('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/60')}>{icon}</span>
      <span className={clsx('font-medium', isActive && 'text-foreground')}>{label}</span>
    </Link>
  );
}
