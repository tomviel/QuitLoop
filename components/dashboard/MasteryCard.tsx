'use client';

interface MasteryCardProps {
  totalScore: number;
  weeklyScore: number;
}

const TIERS = [
  { name: 'Beginner',   min: 0,    max: 99  },
  { name: 'Apprentice', min: 100,  max: 249 },
  { name: 'Warrior',    min: 250,  max: 499 },
  { name: 'Champion',   min: 500,  max: 749 },
  { name: 'Legend',     min: 750,  max: 999 },
  { name: 'Master',     min: 1000, max: Infinity },
] as const;

function getTier(score: number) {
  return TIERS.find((t) => score >= t.min && score <= t.max) ?? TIERS[0];
}

export function MasteryCard({ totalScore, weeklyScore }: MasteryCardProps) {
  const tier = getTier(totalScore);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];

  // Progress within current tier
  const tierRange = nextTier ? nextTier.min - tier.min : 1;
  const progressInTier = nextTier ? totalScore - tier.min : tierRange;
  const pct = Math.min(100, Math.round((progressInTier / tierRange) * 100));

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-0.5">
            Mastery Score
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">{totalScore}</span>
            <span className="text-sm font-semibold text-primary">{tier.name}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">This week</p>
          <p className="text-lg font-bold text-success">+{weeklyScore}</p>
        </div>
      </div>

      {/* Progress bar to next tier */}
      {nextTier && (
        <div>
          <div className="h-2 bg-bg rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>{tier.name}</span>
            <span>{nextTier.min - totalScore} pts to {nextTier.name}</span>
          </div>
        </div>
      )}

      {tier.name === 'Master' && (
        <p className="text-xs text-primary font-medium text-center mt-1">
          🏆 Maximum tier reached — keep the streak alive
        </p>
      )}

      <p className="text-xs text-text-muted mt-3">
        +10 pts for resisting · +5 pts per streak day
      </p>
    </div>
  );
}
