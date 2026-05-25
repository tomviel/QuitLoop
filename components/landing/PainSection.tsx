const PAIN_CARDS = [
  {
    icon: '🌙',
    text: "It's 10pm. The craving hits. You give in. Again.",
  },
  {
    icon: '💪',
    text: "You've tried willpower. It's not enough alone.",
  },
  {
    icon: '⚡',
    text: 'What if something responded in 30 seconds, every time?',
    highlight: true,
  },
];

export function PainSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4">
          {PAIN_CARDS.map(({ icon, text, highlight }) => (
            <div
              key={text}
              className={`rounded-2xl border p-6 ${
                highlight
                  ? 'border-primary/40 bg-primary/8'
                  : 'border-border bg-bg-surface'
              }`}
            >
              <p className="text-2xl mb-3">{icon}</p>
              <p
                className={`text-base leading-relaxed font-medium ${
                  highlight ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
