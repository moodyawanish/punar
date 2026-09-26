import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { Shield, ChevronRight, Server, Database } from 'lucide-react';

const projects = [
  {
    id: 'payment-service',
    name: 'payment-service',
    env: 'Production',
    version: 'v2.3.0',
    appHealth: 'healthy',
    dbHealth: 'healthy',
    lastDeployed: '2 hours ago',
  },
  {
    id: 'authentication-api',
    name: 'authentication-api',
    env: 'Production',
    version: 'v5.1.2',
    appHealth: 'healthy',
    dbHealth: 'healthy',
    lastDeployed: '1 day ago',
  },
  {
    id: 'customer-dashboard',
    name: 'customer-dashboard',
    env: 'Production',
    version: 'v1.0.4',
    appHealth: 'healthy',
    dbHealth: 'healthy',
    lastDeployed: '3 days ago',
  },
  {
    id: 'inventory-service',
    name: 'inventory-service',
    env: 'Production',
    version: 'v3.4.1',
    appHealth: 'healthy',
    dbHealth: 'healthy',
    lastDeployed: '5 hours ago',
  },
];

export function Projects() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">Applications currently protected by Punar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors group relative flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {project.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground font-mono">
                    {project.env}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {project.version}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                Protected
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  Application
                </p>
                <StatusBadge status="healthy" label="Healthy" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Database
                </p>
                <StatusBadge status="healthy" label="Healthy" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Last deployed {project.lastDeployed}</p>
              
              <div className="flex items-center gap-2">
                <Link 
                  to={`/projects/${project.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors px-3 py-1.5"
                >
                  View Project
                </Link>
                <Link
                  to={`/deployments/new?project=${project.id}`}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
                >
                  Deploy
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
