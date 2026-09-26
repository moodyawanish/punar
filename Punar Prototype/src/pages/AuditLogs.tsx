import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

const EVENTS = [
  { ts: '12:44:39', user: 'System',    action: 'Production traffic restored',   project: 'payment-service', version: 'v2.3.0',  rp: 'RP-20394', result: 'success' },
  { ts: '12:44:35', user: 'System',    action: 'Application restored',          project: 'payment-service', version: 'v2.3.0',  rp: 'RP-20394', result: 'success' },
  { ts: '12:44:15', user: 'System',    action: 'Database restored',             project: 'payment-service', version: 'v2.3.0',  rp: 'RP-20394', result: 'success' },
  { ts: '12:44:02', user: 'Developer', action: 'Recovery initiated',            project: 'payment-service', version: 'v2.4.0',  rp: 'RP-20394', result: 'success' },
  { ts: '12:42:30', user: 'System',    action: 'Punar analysis generated',      project: 'payment-service', version: 'v2.4.0',  rp: 'RP-20394', result: 'success' },
  { ts: '12:42:25', user: 'System',    action: 'Health threshold exceeded',     project: 'payment-service', version: 'v2.4.0',  rp: null,       result: 'warning' },
  { ts: '12:42:16', user: 'System',    action: 'Database migration started',    project: 'payment-service', version: 'v2.4.0',  rp: null,       result: 'success' },
  { ts: '12:42:05', user: 'Developer', action: 'Deployment initiated',          project: 'payment-service', version: 'v2.4.0',  rp: 'RP-20394', result: 'success' },
  { ts: '12:42:01', user: 'System',    action: 'Recovery Point created',        project: 'payment-service', version: 'v2.3.0',  rp: 'RP-20394', result: 'success' },
  { ts: 'Yesterday', user: 'System',   action: 'Recovery Point created',        project: 'inventory-service', version: 'v3.4.1', rp: 'RP-20388', result: 'success' },
  { ts: 'Yesterday', user: 'Developer', action: 'Deployment initiated',         project: 'inventory-service', version: 'v3.4.1', rp: 'RP-20388', result: 'success' },
  { ts: '2 days ago', user: 'System',  action: 'Recovery Point created',        project: 'authentication-api', version: 'v5.1.2', rp: 'RP-20362', result: 'success' },
];

const RESULT_COLOR: Record<string, string> = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error:   'text-red-400',
};

const RESULT_DOT: Record<string, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
};

export function AuditLogs() {
  const [search, setSearch] = useState('');

  const filtered = EVENTS.filter((e) =>
    !search ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.project.toLowerCase().includes(search.toLowerCase()) ||
    (e.rp ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold">Audit Logs</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            All platform actions, deployments, and recovery operations.
          </p>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1260px] space-y-5">

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border text-[13px] text-muted-foreground flex-1 max-w-xs">
            <Search size={13} className="shrink-0" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground font-mono text-[12px]"
            />
          </div>
          {(['Project', 'Event Type', 'Status', 'Date'] as const).map((label) => (
            <button key={label} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-card border border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors">
              {label}
              <ChevronDown size={11} />
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border">
                  {['Timestamp', 'User', 'Action', 'Project', 'Version', 'Recovery Point', 'Result'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((event, i) => (
                  <tr key={i} className="hover:bg-white/[0.015] transition-colors">
                    <td className="px-5 py-3 font-mono text-muted-foreground/70">{event.ts}</td>
                    <td className="px-5 py-3">
                      <span className={clsx(
                        'text-[11px] px-1.5 py-0.5 rounded font-mono',
                        event.user === 'System' ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'
                      )}>
                        {event.user}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-foreground/90">{event.action}</td>
                    <td className="px-5 py-3 font-mono text-foreground/70">{event.project}</td>
                    <td className="px-5 py-3 font-mono text-foreground/70">{event.version}</td>
                    <td className="px-5 py-3">
                      {event.rp ? (
                        <span className="font-mono text-indigo-400/80">{event.rp}</span>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={clsx('flex items-center gap-1.5 font-medium', RESULT_COLOR[event.result])}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', RESULT_DOT[event.result])} />
                        {event.result.charAt(0).toUpperCase() + event.result.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <p className="text-[11px] font-mono text-muted-foreground/50">{filtered.length} events</p>
          </div>
        </div>

      </div>
    </div>
  );
}
