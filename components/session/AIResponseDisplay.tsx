'use client';

import { useEffect, useState } from 'react';
import { BreathingTimer } from './BreathingTimer';

interface AIResponseDisplayProps {
  text: string;
  isStreaming: boolean;
  addictionType: 'vaping' | 'junkfood';
}

// Detect the start of the exercise section in the AI response
function hasExerciseSection(text: string): boolean {
  return (
    text.includes('Breathe with me') ||
    text.includes('Ground yourself') ||
    text.includes('Inhale') ||
    text.includes('Name 5')
  );
}

export function AIResponseDisplay({
  text,
  isStreaming,
  addictionType,
}: AIResponseDisplayProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [timerTriggered, setTimerTriggered] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    if (!timerTriggered && hasExerciseSection(text)) {
      setTimerTriggered(true);
      setShowTimer(true);
    }
  }, [text, timerTriggered]);

  if (!text && isStreaming) {
    return (
      <div className="flex items-center gap-3 py-8">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-text-secondary text-sm">Getting your intervention ready…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Streamed text */}
      <div
        className="text-text-primary leading-relaxed whitespace-pre-wrap text-[15px]"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {text}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 animate-pulse align-middle" />
        )}
      </div>

      {/* Breathing/grounding timer — appears when exercise section is detected */}
      {showTimer && !timerDone && (
        <div className="card border-primary/20 bg-primary/5">
          <p className="text-center text-sm font-semibold text-text-primary mb-1">
            {addictionType === 'vaping' ? 'Breathe with me' : 'Ground yourself'}
          </p>
          <BreathingTimer onComplete={() => setTimerDone(true)} />
        </div>
      )}

      {timerDone && (
        <div className="card border-success/20 bg-success/5 text-center py-4 animate-fade-in">
          <p className="text-success font-semibold">
            {addictionType === 'vaping'
              ? '60 seconds done. Your nervous system just shifted.'
              : '60 seconds done. You just grounded yourself.'}
          </p>
        </div>
      )}
    </div>
  );
}
