'use client';

interface WeekData {
  label: string; // e.g. "May 5"
  total: number;
  resisted: number;
}

interface WeeklyTrendProps {
  weeks: WeekData[];
}

export function WeeklyTrend({ weeks }: WeeklyTrendProps) {
  const maxVal = Math.max(1, ...weeks.map((w) => w.total));

  const CHART_H = 100;
  const BAR_W = 20;
  const GAP = 8;
  const GROUP_W = BAR_W * 2 + GAP + 10;
  const TOTAL_W = GROUP_W * weeks.length + 16;

  if (weeks.every((w) => w.total === 0)) {
    return (
      <div className="card text-center py-8">
        <p className="text-text-muted text-sm">No craving data yet.</p>
        <p className="text-text-muted text-xs mt-1">Your weekly trends will appear here.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">8-week trend</h3>
        <div className="flex items-center gap-3">
          <Legend color="#C0392B" label="Resisted" />
          <Legend color="#2A2A2A" label="Gave in" />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${TOTAL_W} ${CHART_H + 24}`}
        className="w-full overflow-visible"
        aria-label="8-week craving trend"
      >
        {weeks.map((week, i) => {
          const x = i * GROUP_W + 8;
          const resistedH = Math.max((week.resisted / maxVal) * CHART_H, week.resisted > 0 ? 3 : 0);
          const gaveInCount = week.total - week.resisted;
          const gaveInH = Math.max((gaveInCount / maxVal) * CHART_H, gaveInCount > 0 ? 3 : 0);

          return (
            <g key={week.label}>
              {/* Gave in bar */}
              <rect
                x={x}
                y={CHART_H - gaveInH}
                width={BAR_W}
                height={Math.max(gaveInH, 2)}
                fill={gaveInH > 0 ? '#2A2A2A' : '#1A1A1A'}
                rx="3"
              />
              {/* Resisted bar */}
              <rect
                x={x + BAR_W + GAP}
                y={CHART_H - resistedH}
                width={BAR_W}
                height={Math.max(resistedH, 2)}
                fill={resistedH > 0 ? '#C0392B' : '#1A1A1A'}
                rx="3"
              />
              {/* Week label */}
              <text
                x={x + BAR_W + GAP / 2}
                y={CHART_H + 16}
                textAnchor="middle"
                fontSize="9"
                fill="#555555"
              >
                {week.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
