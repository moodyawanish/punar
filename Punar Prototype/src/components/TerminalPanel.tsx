import { clsx } from 'clsx';

interface LogLine {
  timestamp: string;
  text: string;
  level?: 'info' | 'warning' | 'error' | 'success';
}

interface TerminalPanelProps {
  lines: LogLine[];
  className?: string;
}

const LEVEL_COLOR: Record<string, string> = {
  info:    'text-muted-foreground',
  warning: 'text-amber-400',
  error:   'text-red-400',
  success: 'text-emerald-400',
};

export function TerminalPanel({ lines, className }: TerminalPanelProps) {
  return (
    <div className={clsx('bg-[#060810] border border-border rounded-lg overflow-hidden', className)}>
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
        <span className="ml-2 text-[11px] font-mono text-muted-foreground/40">deployment.log</span>
      </div>
      <div className="p-4 space-y-1 font-mono text-[12px] min-h-[180px]">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-muted-foreground/40 shrink-0 select-none">[{line.timestamp}]</span>
            <span className={clsx(LEVEL_COLOR[line.level ?? 'info'])}>{line.text}</span>
          </div>
        ))}
        {lines.length > 0 && (
          <div className="flex gap-3 pt-1">
            <span className="text-muted-foreground/40 select-none invisible">[00:00:00]</span>
            <span className="text-muted-foreground/40 animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}
