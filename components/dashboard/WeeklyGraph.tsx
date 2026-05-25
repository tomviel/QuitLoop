'use client';

interface DayData {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

interface WeeklyGraphProps {
  data: DayData[];
  totalThisWeek: number;
  totalLastWeek: number;
}

export function WeeklyGraph({ data, totalThisWeek, totalLastWeek }: WeeklyGraphProps) {
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.thisWeek, d.lastWeek)));

  const CHART_H = 80;
  const BAR_W = 10;
  const GAP = 3;
  const GROUP_W = BAR_W * 2 + GAP + 10;
  const TOTAL_W = GROUP_W * 7 + 16;

  const trend =
    totalLastWeek === 0
      ? null
      : totalThisWeek < totalLastWeek
      ? 'better'
      : totalThisWeek > totalLastWeek
      ? 'worse'
      : 'same';

  const trendText =
    trend === 'better'
      ? `↓ ${totalLastWeek - totalThisWeek} fewer than last week`
      : trend === 'worse'
      ? `↑ ${totalThisWeek - totalLastWeek} more than last week`
      : trend === 'same'
      ? 'Same as last week'
      : null;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Cravings this week</h3>
          {trendText && (
            <p
              className={`text-xs mt-0.5 ${
                trend === 'better'
                  ? 'text-success'
                  : trend === 'worse'
                  ? 'text-primary'
                  : 'text-text-muted'
              }`}
            >
              {trendText}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Legend color="#C0392B" label="This week" />
          <Legend color="#2A2A2A" label="Last week" />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${TOTAL_W} ${CHART_H + 18}`}
        className="w-full"
        aria-label="Weekly craving comparison chart"
      >
        {data.map((day, i) => {
          const x = i * GROUP_W + 8;
          const thisH = Math.max((day.thisWeek / maxVal) * CHART_H, day.thisWeek > 0 ? 3 : 0);
          const lastH = Math.max((day.lastWeek / maxVal) * CHART_H, day.lastWeek > 0 ? 3 : 0);

          return (
            <g key={day.day}>
              {/* Last week bar */}
              <rect
                x={x}
                y={CHART_H - lastH}
                width={BAR_W}
                height={Math.max(lastH, 2)}
                fill={lastH > 0 ? '#2A2A2A' : '#1A1A1A'}
                rx="2"
              />
              {/* This week bar */}
              <rect
                x={x + BAR_W + GAP}
                y={CHART_H - thisH}
                width={BAR_W}
                height={Math.max(thisH, 2)}
                fill={thisH > 0 ? '#C0392B' : '#1A1A1A'}
                rx="2"
              />
              {/* Day label */}
              <text
                x={x + BAR_W + GAP / 2}
                y={CHART_H + 13}
                textAnchor="middle"
                fontSize="9"
                fill="#555555"
              >
                {day.day}
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
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
