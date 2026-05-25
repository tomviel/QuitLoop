'use client';

import { useState, useEffect, useRef } from 'react';

const TOTAL_SECONDS = 60;
// Breathing cycle: inhale 4s → hold 4s → exhale 6s = 14s per cycle
const PHASES = [
  { label: 'Inhale', duration: 4 },
  { label: 'Hold', duration: 4 },
  { label: 'Exhale', duration: 6 },
] as const;

function getPhase(elapsed: number): { label: string; progress: number } {
  const cycleLen = PHASES.reduce((s, p) => s + p.duration, 0); // 14
  const pos = elapsed % cycleLen;
  let acc = 0;
  for (const phase of PHASES) {
    if (pos < acc + phase.duration) {
      return { label: phase.label, progress: (pos - acc) / phase.duration };
    }
    acc += phase.duration;
  }
  return { label: 'Inhale', progress: 0 };
}

interface BreathingTimerProps {
  onComplete?: () => void;
}

export function BreathingTimer({ onComplete }: BreathingTimerProps) {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSec = (now - startedAt.current) / 1000;
      const remaining = Math.max(0, TOTAL_SECONDS - elapsedSec);

      setElapsed(elapsedSec);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  const { label: phaseLabel, progress: phaseProgress } = getPhase(elapsed);

  const RADIUS = 48;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const overallProgress = 1 - timeLeft / TOTAL_SECONDS;
  const dashOffset = CIRCUMFERENCE * (1 - overallProgress);

  // Breathing scale: 0.85 → 1.0 on inhale, 1.0 on hold, 1.0 → 0.85 on exhale
  let bubbleScale = 1;
  if (phaseLabel === 'Inhale') bubbleScale = 0.85 + phaseProgress * 0.15;
  else if (phaseLabel === 'Hold') bubbleScale = 1;
  else bubbleScale = 1 - phaseProgress * 0.15;

  if (timeLeft === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 animate-fade-in">
        <div className="w-28 h-28 rounded-full border-2 border-success/40 flex items-center justify-center">
          <span className="text-3xl">✓</span>
        </div>
        <p className="text-success font-semibold text-sm">60 seconds done</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative w-28 h-28">
        {/* Background track */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="#2A2A2A" strokeWidth="4" />
          <circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke="#C0392B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>

        {/* Breathing bubble */}
        <div
          className="absolute inset-3 rounded-full bg-primary/15 flex items-center justify-center"
          style={{
            transform: `scale(${bubbleScale})`,
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary leading-none">
              {timeLeft}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">sec</div>
          </div>
        </div>
      </div>

      {/* Phase label */}
      <div className="text-center">
        <p className="text-text-primary font-semibold text-base">{phaseLabel}</p>
        <p className="text-text-muted text-xs mt-0.5">
          {phaseLabel === 'Inhale' && '4 counts through your nose'}
          {phaseLabel === 'Hold' && 'Hold gently'}
          {phaseLabel === 'Exhale' && '6 counts through your mouth'}
        </p>
      </div>
    </div>
  );
}
