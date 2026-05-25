import Link from 'next/link';

interface TrialBannerProps {
  trialEndsAt: string;
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  if (daysLeft > 1) return null;

  return (
    <div className="mx-4 mb-4">
      <div className="card border-warning/30 bg-warning/5">
        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0">⏳</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning">
              {daysLeft === 1 ? 'Your trial ends tomorrow' : 'Your trial ends today'}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Subscribe to keep your streaks alive.
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 bg-warning/20 hover:bg-warning/30 text-warning
                       text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors min-h-[44px]
                       flex items-center"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}
