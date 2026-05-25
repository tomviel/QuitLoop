import Link from 'next/link';

export const metadata = { title: 'Contact – QuitLoop' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">Contact</h1>
        <p className="text-text-secondary mb-10">
          We&rsquo;re a small team. Every email goes to a real person.
        </p>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-1">General enquiries</h2>
            <p className="text-text-secondary text-sm mb-3">
              Questions about the app, feedback, or anything else.
            </p>
            <a
              href="mailto:hello@quitloop.app"
              className="text-primary text-sm font-medium hover:underline"
            >
              hello@quitloop.app
            </a>
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-1">Billing &amp; subscriptions</h2>
            <p className="text-text-secondary text-sm mb-3">
              Issues with payments, cancellations, or refund requests.
            </p>
            <a
              href="mailto:billing@quitloop.app"
              className="text-primary text-sm font-medium hover:underline"
            >
              billing@quitloop.app
            </a>
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-1">Privacy &amp; data requests</h2>
            <p className="text-text-secondary text-sm mb-3">
              Account deletion, data export, or GDPR requests.
            </p>
            <a
              href="mailto:privacy@quitloop.app"
              className="text-primary text-sm font-medium hover:underline"
            >
              privacy@quitloop.app
            </a>
          </div>
        </div>

        <p className="text-text-muted text-xs mt-10">
          We aim to respond within 48 hours on business days.
        </p>
      </div>
    </div>
  );
}
