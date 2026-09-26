import { useState } from 'react';
import { clsx } from 'clsx';

const TABS = ['General', 'Recovery Policies', 'Health Checks', 'Notifications', 'Team'] as const;
type Tab = typeof TABS[number];

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
      {desc && <p className="text-[12px] text-muted-foreground mt-0.5">{desc}</p>}
    </div>
  );
}

function SettingRow({
  label, desc, children,
}: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-border last:border-0">
      <div className="flex-1 mr-8">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {desc && <p className="text-[12px] text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={clsx(
        'w-9 h-5 rounded-full transition-colors relative',
        enabled ? 'bg-primary' : 'bg-secondary border border-border'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
        enabled ? 'left-[18px]' : 'left-0.5'
      )} />
    </button>
  );
}

function TextInput({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      className="bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono text-foreground outline-none focus:border-primary/50 transition-colors w-48"
    />
  );
}

function SelectInput({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono text-foreground cursor-pointer hover:border-border/60 transition-colors">
      <span>{value}</span>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="General" desc="Basic workspace and environment settings." />
        <div>
          <SettingRow label="Workspace Name">
            <TextInput value="Team Workspace" />
          </SettingRow>
          <SettingRow label="Default Environment">
            <SelectInput value="Production" />
          </SettingRow>
          <SettingRow label="Timezone" desc="Used for log timestamps and reporting.">
            <SelectInput value="UTC" />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function RecoveryPoliciesTab() {
  const [autoRP, setAutoRP] = useState(true);
  const [verifyDb, setVerifyDb] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Recovery Point Policies" desc="Control how and when Punar creates recovery points." />
        <div>
          <SettingRow
            label="Auto-create Recovery Point before deployment"
            desc="Creates a snapshot of application state, database, and environment before every production deployment."
          >
            <Toggle enabled={autoRP} onChange={() => setAutoRP((v) => !v)} />
          </SettingRow>
          <SettingRow
            label="Retention Period"
            desc="How long Recovery Points are retained before automatic deletion."
          >
            <SelectInput value="30 days" />
          </SettingRow>
          <SettingRow
            label="Verify database snapshot after creation"
            desc="Validates that the database snapshot is restorable before marking the Recovery Point as verified."
          >
            <Toggle enabled={verifyDb} onChange={() => setVerifyDb((v) => !v)} />
          </SettingRow>
          <SettingRow
            label="Maximum Recovery Points per project"
            desc="Older points are deleted when the limit is reached."
          >
            <TextInput value="10" />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function HealthChecksTab() {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Health Check Thresholds" desc="Punar will trigger analysis when these thresholds are exceeded post-deployment." />
        <div>
          <SettingRow label="Error Rate Threshold" desc="HTTP 5xx and application errors as percentage of total requests.">
            <TextInput value="5%" />
          </SettingRow>
          <SettingRow label="API Latency Threshold" desc="95th percentile response time threshold.">
            <TextInput value="500 ms" />
          </SettingRow>
          <SettingRow label="HTTP 5xx Threshold" desc="Absolute count of server errors within the evaluation window.">
            <TextInput value="50" />
          </SettingRow>
          <SettingRow label="Evaluation Window" desc="Time window used to evaluate post-deployment health metrics.">
            <SelectInput value="5 minutes" />
          </SettingRow>
          <SettingRow label="Consecutive failures before alert" desc="Number of failed health checks before Punar initiates analysis.">
            <TextInput value="3" />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    deployFail: true,
    recoveryStart: true,
    recoveryDone: true,
    degradation: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Notification Preferences" desc="Choose which events trigger notifications." />
        <div>
          <SettingRow label="Deployment failure" desc="Alert when a deployment enters a failed or critical health state.">
            <Toggle enabled={prefs.deployFail} onChange={() => toggle('deployFail')} />
          </SettingRow>
          <SettingRow label="Recovery started" desc="Notify when Punar initiates a recovery operation.">
            <Toggle enabled={prefs.recoveryStart} onChange={() => toggle('recoveryStart')} />
          </SettingRow>
          <SettingRow label="Recovery completed" desc="Notify when production is successfully restored.">
            <Toggle enabled={prefs.recoveryDone} onChange={() => toggle('recoveryDone')} />
          </SettingRow>
          <SettingRow label="Health degradation detected" desc="Alert when post-deployment metrics exceed configured thresholds.">
            <Toggle enabled={prefs.degradation} onChange={() => toggle('degradation')} />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function TeamTab() {
  const members = [
    { name: 'Developer',    email: 'dev@company.com',    role: 'Owner'  },
    { name: 'Alice Chen',   email: 'alice@company.com',  role: 'Admin'  },
    { name: 'Bob Nakamura', email: 'bob@company.com',    role: 'Member' },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <SectionHeader title="Team Members" />
          <button className="text-[13px] text-primary hover:text-primary/80 transition-colors font-medium">
            + Invite member
          </button>
        </div>
        <div className="divide-y divide-border">
          {members.map(({ name, email, role }) => (
            <div key={email} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-primary">{name[0]}</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{email}</p>
                </div>
              </div>
              <span className={clsx(
                'text-[11px] px-2 py-0.5 rounded font-medium',
                role === 'Owner' ? 'bg-primary/10 text-primary' : 'bg-secondary border border-border text-muted-foreground'
              )}>
                {role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<Tab, React.ReactNode> = {
  'General':           <GeneralTab />,
  'Recovery Policies': <RecoveryPoliciesTab />,
  'Health Checks':     <HealthChecksTab />,
  'Notifications':     <NotificationsTab />,
  'Team':              <TeamTab />,
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('General');

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-[15px] font-semibold">Settings</h1>
      </header>

      <div className="px-8 py-8 max-w-[900px]">
        {/* Tab nav */}
        <div className="flex items-center gap-1 mb-8 border-b border-border pb-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2.5 text-[13px] font-medium transition-colors relative -mb-px',
                activeTab === tab
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {TAB_CONTENT[activeTab]}

        {activeTab !== 'Team' && (
          <div className="mt-6 flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
            <button className="px-5 py-2.5 rounded-md border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors">
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
