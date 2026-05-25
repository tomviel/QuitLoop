import type { AddictionType } from '@/types';

interface MoneySavedProps {
  resistedByType: Record<AddictionType, number>;
}

const COST_PER_CRAVING: Record<AddictionType, number> = {
  vaping: 3,
  junkfood: 2,
};

export function MoneySaved({ resistedByType }: MoneySavedProps) {
  const totalResisted = Object.values(resistedByType).reduce((s, n) => s + n, 0);
  const totalSaved = (Object.entries(resistedByType) as [AddictionType, number][]).reduce(
    (sum, [type, count]) => sum + count * COST_PER_CRAVING[type],
    0
  );

  if (totalResisted === 0) return null;

  return (
    <div className="card border-success/20 bg-success/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">💰</span>
        <div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Money saved</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            You&apos;ve resisted{' '}
            <span className="text-text-primary font-semibold">{totalResisted}</span>{' '}
            {totalResisted === 1 ? 'craving' : 'cravings'}.{' '}
            That&apos;s roughly{' '}
            <span className="text-success font-bold text-base">€{totalSaved}</span>{' '}
            saved on vapes and snacks.
          </p>
          {Object.entries(resistedByType).map(([type, count]) =>
            count > 0 ? (
              <p key={type} className="text-text-muted text-xs mt-1">
                {type === 'vaping' ? '🚭' : '🍬'}{' '}
                {count} × €{COST_PER_CRAVING[type as AddictionType]} = €{count * COST_PER_CRAVING[type as AddictionType]}
              </p>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
