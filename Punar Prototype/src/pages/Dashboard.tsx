import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  FolderGit2,
  Rocket,
  RotateCcw,
  Archive,
  Bell,
  Search,
  Server,
  Database,
  Cpu,
  HardDrive,
  ArrowUpRight,
  CheckCircle2,
  Shield,
  GitCommit,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { clsx } from 'clsx';

const deploymentData = [
  { day: 'Mon', successful: 4, failed: 0, recovered: 0 },
  { day: 'Tue', successful: 5, failed: 1, recovered: 1 },
  { day: 'Wed', successful: 3, failed: 0, recovered: 0 },
  { day: 'Thu', successful: 6, failed: 0, recovered: 0 },
  { day: 'Fri', successful: 3, failed: 2, recovered: 2 },
  { day: 'Sat', successful: 2, failed: 0, recovered: 0 },
  { day: 'Sun', successful: 5, failed: 0, recovered: 0 },
];

const HEALTH_ITEMS = [
  { label: 'API',            Icon: Server,   status: 'healthy' as const, latency: '42ms'  },
  { label: 'Database',       Icon: Database, status: 'healthy' as const, latency: '8ms'   },
  { label: 'Services',       Icon: Cpu,      status: 'healthy' as const, latency: '—'     },
  { label: 'Infrastructure', Icon: HardDrive, status: 'healthy' as const, latency: '—'    },
];

const ACTIVITY = [
  {
    type: 'deploy',
    time: '10:42 AM',
    title: 'Deployment v2.4.1 completed successfully',
    service: 'payment-service',
    status: 'success',
  },
  {
    type: 'recovery-point',
    time: '10:41 AM',
    title: 'Recovery Point RP-20394 created',
    service: 'payment-service',
    status: 'info',
  },
  {
    type: 'health',
    time: 'Yesterday',
    title: 'Post-deployment health validation passed',
    service: 'authentication-api',
    status: 'success',
  },
  {
    type: 'recovery',
    time: 'Yesterday',
    title: 'Production recovered to v2.3.0',
    service: 'payment-service',
    status: 'warning',
  },
  {
    type: 'recovery-point',
    time: '2 days ago',
    title: 'Recovery Point RP-20371 created',
    service: 'inventory-service',
    status: 'info',
  },
];

const ACTIVITY_ICON: Record<string, React.ElementType> = {
  deploy: Rocket,
  'recovery-point': Archive,
  health: CheckCircle2,
  recovery: RotateCcw,
};

const ACTIVITY_DOT: Record<string, string> = {
  success: 'bg-emerald-400',
  info:    'bg-indigo-400',
  warning: 'bg-amber-400',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141924] border border-border rounded-lg px-3 py-2.5 text-[12px] shadow-xl">
      <p className="font-mono text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.fill }} />
          <span className="text-foreground/70">{p.name}</span>
          <span className="font-mono text-foreground ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="min-h-full">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold text-foreground">Good morning, Developer</h1>
          <p className="text-[12px] text-muted-foreground leading-none mt-0.5">
            Your production systems are protected by Punar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground text-[13px] w-48">
            <Search size={13} className="shrink-0" />
            <span>Search...</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/[0.04] text-muted-foreground transition-colors relative">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary">D</span>
          </div>
          <Link
            to="/deployments/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Rocket size={13} />
            New Deployment
          </Link>
        </div>
      </header>

      {/* Page content */}
      <div className="px-8 py-8 max-w-[1260px] space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            icon={<FolderGit2 size={15} />}
            label="Active Projects"
            value="4"
            context="All protected"
            contextColor="text-emerald-400"
          />
          <MetricCard
            icon={<Rocket size={15} />}
            label="Deployments"
            value="28"
            context="Last 7 days"
          />
          <MetricCard
            icon={<RotateCcw size={15} />}
            label="Recoveries"
            value="3"
            context="Last 7 days"
          />
          <MetricCard
            icon={<Archive size={15} />}
            label="Recovery Points"
            value="12"
            context="Available"
          />
        </div>

        {/* Production Protection */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-muted-foreground" />
                <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                  Production Protection
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground/60 ml-5">
                Punar protection status across your production services.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">All Systems Protected</span>
            </div>
          </div>

          <div className="mt-5 flex items-end gap-8">
            <div>
              <span className="font-mono text-[36px] font-semibold leading-none text-foreground">4</span>
              <span className="font-mono text-[24px] font-normal text-muted-foreground/40 mx-1">/</span>
              <span className="font-mono text-[24px] font-semibold text-muted-foreground/60">4</span>
              <p className="text-[12px] text-muted-foreground mt-1">Protected Projects</p>
            </div>
            <div className="flex-1 pb-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground font-mono">coverage</span>
                <span className="text-[11px] font-mono text-emerald-400">100%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-full bg-emerald-400 rounded-full" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {['payment-service', 'authentication-api', 'customer-dashboard', 'inventory-service'].map((svc) => (
                  <div key={svc} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-[11px] font-mono text-muted-foreground truncate">{svc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Health row */}
        <div className="grid grid-cols-[1fr_340px] gap-4">

          {/* Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">Deployment Activity</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <LegendDot color="bg-emerald-500" label="Successful" />
                <LegendDot color="bg-red-500"     label="Failed"     />
                <LegendDot color="bg-indigo-500"  label="Recovered"  />
              </div>
            </div>
            <div className="h-[196px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deploymentData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2236" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#8892A4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="JetBrains Mono, monospace"
                  />
                  <YAxis
                    stroke="#8892A4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="JetBrains Mono, monospace"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="successful" stackId="s" fill="#22C55E" name="Successful" radius={[0, 0, 2, 2]} />
                  <Bar dataKey="failed"     stackId="s" fill="#EF4444" name="Failed" />
                  <Bar dataKey="recovered"  stackId="s" fill="#6366F1" name="Recovered" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">System Health</h2>
            <div className="flex-1 divide-y divide-border">
              {HEALTH_ITEMS.map(({ label, Icon, status, latency }) => (
                <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className="text-muted-foreground/50 shrink-0" />
                    <span className="text-[13px] font-medium text-foreground">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {latency !== '—' && (
                      <span className="text-[11px] font-mono text-muted-foreground/50">{latency}</span>
                    )}
                    <StatusBadge status={status} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Uptime (30d)</span>
                <span className="font-mono text-emerald-400">99.97%</span>
              </div>
              <div className="mt-2 flex gap-px">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex-1 h-5 rounded-[2px]',
                      i === 13 || i === 20 ? 'bg-amber-500/60' : 'bg-emerald-500/40'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Activity + Latest Deployment */}
        <div className="grid grid-cols-[1fr_340px] gap-4">

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-[14px] font-semibold text-foreground mb-5">Recent Activity</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-5">
                {ACTIVITY.map((item, i) => {
                  const Icon = ACTIVITY_ICON[item.type] ?? Rocket;
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className="relative z-10 shrink-0 w-[11px] h-[11px] mt-[3px] rounded-full border border-border bg-card flex items-center justify-center">
                        <span
                          className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            ACTIVITY_DOT[item.status] ?? 'bg-slate-500'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[13px] font-medium text-foreground leading-snug">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono text-muted-foreground/60">
                                {item.service}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground/50 shrink-0">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Latest Protected Deployment */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground mb-0.5">Latest Deployment</h2>
              <p className="text-[12px] text-muted-foreground">Currently protected service</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Service</p>
                <div className="flex items-center gap-2">
                  <FolderGit2 size={13} className="text-muted-foreground/60" />
                  <span className="text-[14px] font-semibold font-mono text-foreground">payment-service</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Version</p>
                  <span className="text-[13px] font-mono font-medium text-foreground">v2.4.1</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Environment</p>
                  <span className="text-[13px] font-mono font-medium text-foreground">Production</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Status</p>
                <StatusBadge status="healthy" />
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground mb-1.5">Recovery Point</p>
                <div className="flex items-center gap-2">
                  <Archive size={12} className="text-indigo-400" />
                  <span className="text-[13px] font-mono text-indigo-400">RP-20402</span>
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-1 font-mono">
                  Created 10:41 AM · Today
                </p>
              </div>
            </div>

            <Link
              to="/projects/payment-service"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
            >
              View Deployment
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  context,
  contextColor = 'text-muted-foreground',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  context: string;
  contextColor?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg px-5 py-4 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/30">{icon}</span>
      </div>
      <p className="font-mono text-[32px] font-semibold leading-none text-foreground">{value}</p>
      <p className={clsx('text-[11px] mt-2', contextColor)}>{context}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx('w-2 h-2 rounded-sm shrink-0', color)} />
      {label}
    </span>
  );
}
