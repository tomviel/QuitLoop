import type { AddictionType } from '@/types';
import { MODULE_DISPLAY } from '@/types';

interface DashboardModuleCardProps {
  type: AddictionType;
  currentStreak: number;
  longestStreak: number;
  weekResisted: number;
  weekTotal: number;
}

export function DashboardModuleCard({
  type,
  currentStreak,
  longestStreak,
  weekResisted,
  weekTotal,
}: DashboardModuleCardProps) {
  const display = MODULE_DISPLAY[type];

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl leading-none">{display.icon}</span>
        <div>
          <h3 className="font-semibold text-text-primary text-sm">{display.label}</h3>
          <p className="text-text-muted text-xs">{display.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Current streak"
          value={currentStreak}
          unit="days"
          highlight={currentStreak > 0}
        />
        <Stat
          label="Best streak"
          value={longestStreak}
          unit="days"
        />
        <Stat
          label="This week"
          value={weekResisted}
          unit={`/ ${weekTotal}`}
          highlight={weekTotal > 0 && weekResisted === weekTotal}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-bg rounded-xl p-3 text-center">
      <div
        className={`text-xl font-bold leading-none ${
          highlight ? 'text-success' : 'text-text-primary'
        }`}
      >
        {value}
      </div>
      <div className="text-text-muted text-xs mt-0.5">{unit}</div>
      <div className="text-text-muted text-[10px] mt-1 leading-tight">{label}</div>
    </div>
  );
}
