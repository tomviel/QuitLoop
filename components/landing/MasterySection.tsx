export function MasterySection() {
  const scoreEvents = [
    { icon: '✊', label: 'Resist a craving', points: '+10 pts' },
    { icon: '🔥', label: 'Streak day bonus', points: '+5 pts' },
    { icon: '📅', label: 'Weekly reset', points: 'fresh start' },
  ];

  const tiers = [
    { name: 'Beginner',   range: '0–99',    color: 'text-text-muted' },
    { name: 'Apprentice', range: '100–249',  color: 'text-sky-400' },
    { name: 'Warrior',    range: '250–499',  color: 'text-emerald-400' },
    { name: 'Champion',   range: '500–749',  color: 'text-amber-400' },
    { name: 'Legend',     range: '750–999',  color: 'text-orange-400' },
    { name: 'Master',     range: '1000+',    color: 'text-primary' },
  ];

  return (
    <section className="py-16 px-4 bg-bg-surface">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            How the score works
          </h2>
          <p className="text-text-secondary">
            Every craving you resist earns points. The score is proof your brain is rewiring.
          </p>
        </div>

        {/* Earning events */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {scoreEvents.map(({ icon, label, points }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-bg p-4 text-center"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-xs text-text-secondary leading-snug mb-1">{label}</p>
              <p className="text-sm font-bold text-primary">{points}</p>
            </div>
          ))}
        </div>

        {/* Tier ladder */}
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-3">
            Mastery Tiers
          </p>
          {tiers.map(({ name, range, color }, i) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-2.5"
            >
              <div className="flex items-center gap-1 w-6 justify-center flex-shrink-0">
                {Array.from({ length: Math.min(i + 1, 5) }).map((_, j) => (
                  <div
                    key={j}
                    className={`w-1.5 h-4 rounded-full ${i >= j ? 'bg-primary' : 'bg-border'}`}
                  />
                ))}
              </div>
              <span className={`font-semibold text-sm flex-1 ${color}`}>{name}</span>
              <span className="text-xs text-text-muted">{range} pts</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
