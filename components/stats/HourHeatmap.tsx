'use client';

import { useState } from 'react';

interface HourHeatmapProps {
  hourCounts: number[]; // length 24, index = hour 0–23
}

const HOUR_LABELS = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];

function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function HourHeatmap({ hourCounts }: HourHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ hour: number; count: number } | null>(null);
  const maxCount = Math.max(1, ...hourCounts);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Cravings by hour</h3>
        <p className="text-text-muted text-xs">All time</p>
      </div>

      {tooltip && (
        <div className="mb-3 text-center">
          <span className="text-text-secondary text-sm">
            {formatHour(tooltip.hour)}: <span className="text-text-primary font-semibold">{tooltip.count}</span> craving{tooltip.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
        {hourCounts.map((count, hour) => {
          const intensity = count / maxCount;
          const opacity = count === 0 ? 0.08 : 0.2 + intensity * 0.8;

          return (
            <button
              key={hour}
              onMouseEnter={() => setTooltip({ hour, count })}
              onMouseLeave={() => setTooltip(null)}
              onFocus={() => setTooltip({ hour, count })}
              onBlur={() => setTooltip(null)}
              className="h-7 rounded-sm transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-primary/50"
              style={{ backgroundColor: `rgba(192, 57, 43, ${opacity})` }}
              aria-label={`${formatHour(hour)}: ${count} cravings`}
            />
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="grid mt-1.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {HOUR_LABELS.map((label) => (
          <p key={label} className="text-[10px] text-text-muted text-center">
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}
