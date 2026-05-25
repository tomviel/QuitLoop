const TESTIMONIALS = [
  {
    initials: 'SM',
    name: 'Sophie M.',
    meta: '28, Paris · Vaping',
    quote:
      "I haven't touched a vape in 3 weeks. The intervention actually works when you're in the moment. I was ready to give in and the breathing exercise broke the cycle.",
    streak: '21 days',
  },
  {
    initials: 'TK',
    name: 'Thomas K.',
    meta: '34, Berlin · Junk food',
    quote:
      "I used to binge snack every evening. The grounding exercise sounds too simple but it genuinely works. 12 days streak and I've stopped buying chips entirely.",
    streak: '12 days',
  },
  {
    initials: 'LD',
    name: 'Léa D.',
    meta: '31, Lyon · Both modules',
    quote:
      "Started with vaping, added junk food two weeks later. 18 days clean on both. The SMS before my evening craving window is what made the difference.",
    streak: '18 days',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Real people, real streaks
          </h2>
          <p className="text-text-secondary">
            Not willpower. A system that works when you&apos;re at your weakest.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map(({ initials, name, meta, quote, streak }) => (
            <div key={name} className="card flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center
                                justify-center text-sm font-bold text-primary flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{name}</p>
                  <p className="text-text-muted text-xs">{meta}</p>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                  <p className="text-success text-xs font-bold">🔥 {streak}</p>
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
