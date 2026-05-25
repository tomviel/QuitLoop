'use client';

import { useRouter } from 'next/navigation';

export function CravingButton() {
  const router = useRouter();

  function handlePress() {
    router.push('/session');
  }

  return (
    <div className="relative flex items-center justify-center py-10 px-4">
      {/* Expanding pulse rings */}
      <span
        className="absolute w-full max-w-sm h-20 rounded-2xl bg-primary/25 animate-pulse-ring"
        aria-hidden
      />
      <span
        className="absolute w-full max-w-sm h-20 rounded-2xl bg-primary/15 animate-pulse-ring"
        style={{ animationDelay: '0.75s' }}
        aria-hidden
      />

      {/* The button */}
      <button
        onClick={handlePress}
        className="relative z-10 w-full max-w-sm min-h-[64px] rounded-2xl
                   bg-primary hover:bg-primary-hover active:scale-[0.97]
                   text-white font-bold text-lg tracking-tight
                   shadow-xl shadow-primary/40
                   animate-craving-pulse
                   transition-all duration-150
                   focus:outline-none focus:ring-4 focus:ring-primary/40"
        aria-label="Start craving session"
      >
        I have a craving RIGHT NOW
      </button>
    </div>
  );
}
