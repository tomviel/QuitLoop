import Link from 'next/link';

export function Hero() {
  return (
    <section className="pt-20 pb-16 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20
                        text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          AI responds in under 30 seconds
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-5">
          Your cravings last{' '}
          <span className="text-primary">20 minutes.</span>
          <br />
          We&apos;ll get you through them.
        </h1>

        <p className="text-text-secondary text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto">
          AI-powered intervention the moment a craving hits. For vaping and junk food addiction.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="btn-primary text-base px-8 py-4 rounded-2xl min-w-[220px] text-center"
          >
            Start free — no card needed
          </Link>
          <p className="text-text-muted text-sm">
            7-day free trial · Takes 2 minutes
          </p>
        </div>

        {/* Mini social proof */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="flex -space-x-2">
            {['SB', 'TK', 'LD'].map((initials) => (
              <div
                key={initials}
                className="w-8 h-8 rounded-full bg-bg-surface border-2 border-bg
                           flex items-center justify-center text-xs font-semibold text-text-secondary"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-text-secondary text-sm">
            Joined by <span className="text-text-primary font-semibold">1,200+</span> people this month
          </p>
        </div>
      </div>
    </section>
  );
}
