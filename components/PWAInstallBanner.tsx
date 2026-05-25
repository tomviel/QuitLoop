'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, install, dismiss } = usePWAInstall();

  if (!isInstallable || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="card border-primary/30 bg-bg-surface shadow-2xl max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
            QL
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-semibold leading-tight">
              Add QuitLoop to your home screen
            </p>
            <p className="text-text-secondary text-xs mt-0.5">
              For instant access during cravings
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-text-muted hover:text-text-secondary p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
        <button
          onClick={install}
          className="btn-primary w-full mt-3 text-sm"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
