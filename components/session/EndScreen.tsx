'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface EndScreenProps {
  resisted: boolean;
  newStreak: number;
  onChoose: (resisted: boolean) => void;
  loading: boolean;
}

export function EndScreen({ resisted: hasChosen, newStreak, onChoose, loading }: EndScreenProps) {
  const router = useRouter();
  const confettiRef = useRef(false);

  // Fire confetti after "yes" is confirmed
  useEffect(() => {
    if (!hasChosen || confettiRef.current || newStreak === 0) return;
    confettiRef.current = true;

    import('canvas-confetti').then(({ default: confetti }) => {
      // Left side shooter
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#C0392B', '#E74C3C', '#FFFFFF', '#27AE60'],
      });
      // Right side shooter
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#C0392B', '#E74C3C', '#FFFFFF', '#27AE60'],
      });
    });
  }, [hasChosen, newStreak]);

  // After showing result, auto-navigate to dashboard after 4 seconds
  useEffect(() => {
    if (!hasChosen && newStreak === -1) return; // no choice made yet
    if (loading) return;
    const t = setTimeout(() => router.push('/dashboard'), 5000);
    return () => clearTimeout(t);
  }, [hasChosen, newStreak, loading, router]);

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-2xl font-bold text-text-primary mb-3">
        Did you resist the craving?
      </h2>
      <p className="text-text-secondary text-sm mb-8">
        Be honest — both answers help you.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onChoose(true)}
          disabled={loading}
          className="w-full min-h-[64px] rounded-2xl bg-success/15 border border-success/30
                     hover:bg-success/25 active:scale-[0.98]
                     text-success font-bold text-lg
                     transition-all duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-success/40"
        >
          ✓ Yes, I made it
        </button>

        <button
          onClick={() => onChoose(false)}
          disabled={loading}
          className="w-full min-h-[56px] rounded-2xl bg-bg-surface border border-border
                     hover:border-text-muted active:scale-[0.98]
                     text-text-secondary font-semibold text-base
                     transition-all duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-border"
        >
          No, I gave in
        </button>
      </div>
    </div>
  );
}

// Outcome display after user made their choice
export function OutcomeDisplay({
  resisted,
  newStreak,
}: {
  resisted: boolean;
  newStreak: number;
}) {
  if (resisted) {
    return (
      <div className="animate-fade-in text-center py-8">
        <div className="text-5xl mb-4">🔥</div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">You did it.</h2>
        {newStreak > 0 && (
          <p className="text-success font-semibold text-lg mb-3">
            {newStreak} day streak
          </p>
        )}
        <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
          Every craving you resist makes the next one easier. Your brain is literally rewiring.
        </p>
        <p className="text-text-muted text-xs mt-6">Returning to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-center py-8">
      <div className="text-4xl mb-4">💪</div>
      <h2 className="text-xl font-bold text-text-primary mb-3">
        That&apos;s okay.
      </h2>
      <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
        Every craving you fight makes the next one easier. Your streak restarts tomorrow.
        The fact that you opened this app means you&apos;re still fighting.
      </p>
      <p className="text-text-muted text-xs mt-6">Returning to dashboard…</p>
    </div>
  );
}
