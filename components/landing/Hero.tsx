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
          Master yourself.{' '}
          <span className="text-primary">Break every loop.</span>
        </h1>

        <p className="text-text-secondary text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto">
          AI-powered craving intervention + a mastery score that proves you&apos;re getting stronger
          — every single day.
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

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">1,200+</p>
            <p className="text-xs text-text-muted">people this month</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">83%</p>
            <p className="text-xs text-text-muted">resist rate week 2</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">21 days</p>
            <p className="text-xs text-text-muted">avg streak at 60 days</p>
          </div>
        </div>
      </div>
    </section>
  );
}
