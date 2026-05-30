const WINS = [
  {
    initials: 'MR',
    streak: 14,
    message: '14 days no vaping. The morning craving used to destroy me. Not anymore.',
  },
  {
    initials: 'AS',
    streak: 7,
    message: 'Week 1 done. My partner is at 9 days — we push each other every single day.',
  },
  {
    initials: 'LB',
    streak: 30,
    message: '30 days no junk food. I hit Champion tier on the leaderboard. This actually works.',
  },
];

export function CommunitySection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            You&apos;re not doing this alone
          </h2>
          <p className="text-text-secondary">
            Every win gets shared. Every streak inspires the next person.
          </p>
        </div>

        <div className="space-y-3">
          {WINS.map(({ initials, streak, message }) => (
            <div key={initials} className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center
                                text-xs font-bold text-primary flex-shrink-0">
                  {initials}
                </div>
                <span className="text-xs font-semibold text-warning">
                  🔥 {streak} day streak
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">&ldquo;{message}&rdquo;</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🤝</span>
            <div>
              <p className="font-semibold text-text-primary text-sm mb-1">
                Accountability partners
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                Community and Elite members are automatically paired with an accountability
                partner at the same stage. You&apos;ll see their wins in your feed — and they&apos;ll see yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
