'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function OnboardedBanner() {
  const searchParams = useSearchParams();
  const { isInstallable, install, dismiss } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onboarded = searchParams.get('onboarded') === 'true';
    const checkoutSuccess = searchParams.get('checkout') === 'success';

    if (onboarded || checkoutSuccess) {
      setVisible(true);
      // Clean the param from the URL without a navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('onboarded');
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  if (!visible || installed) return null;

  // Not installable (iOS or already installed): show an iOS hint instead
  if (!isInstallable) {
    return (
      <div className="mx-4 mb-4">
        <div className="card border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">📱</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                Add QuitLoop to your home screen
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                For instant access during cravings — tap Share then
                &ldquo;Add to Home Screen&rdquo;
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-text-muted hover:text-text-secondary p-1 flex-shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      <div className="card border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl flex-shrink-0">📱</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              Add QuitLoop to your home screen
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              For instant access during cravings
            </p>
          </div>
          <button
            onClick={() => {
              dismiss();
              setVisible(false);
            }}
            className="text-text-muted hover:text-text-secondary p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
        <button
          onClick={async () => {
            const ok = await install();
            if (ok) setInstalled(true);
          }}
          className="btn-primary w-full text-sm py-2.5"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
