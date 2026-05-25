const STEPS = [
  {
    number: '01',
    title: 'Tell us your triggers and craving hours',
    description:
      'Select from common triggers (stress, boredom, evenings) and set the window when cravings usually hit.',
    icon: '⚙️',
  },
  {
    number: '02',
    title: 'We text you before your danger zone hits',
    description:
      'QuitLoop sends you a heads-up 15 minutes before your craving window — so you enter it prepared, not surprised.',
    icon: '📱',
  },
  {
    number: '03',
    title: 'Hit the button the moment a craving starts',
    description:
      'One tap. 3 quick questions. Then a personalized AI intervention: a breathing exercise + a cognitive reframe. Under 90 seconds.',
    icon: '🔴',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-bg-surface border-y border-border">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-3">How it works</h2>
          <p className="text-text-secondary">Set up once. Works when you need it most.</p>
        </div>

        <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-8">
          {STEPS.map(({ number, title, description, icon }) => (
            <div key={number} className="flex sm:flex-col gap-4 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20
                                flex items-center justify-center text-lg">
                  {icon}
                </div>
              </div>
              <div>
                <p className="text-primary text-xs font-bold mb-1">Step {number}</p>
                <h3 className="font-bold text-text-primary text-sm leading-snug mb-2">
                  {title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
