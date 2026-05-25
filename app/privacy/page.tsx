import Link from 'next/link';

export const metadata = { title: 'Privacy Policy – QuitLoop' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: May 2025</p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">1. Who we are</h2>
            <p>
              QuitLoop (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the QuitLoop mobile web application
              at quitloop.app. We help individuals break addiction habits through real-time
              AI-assisted interventions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">2. Data we collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-text-primary">Account data:</strong> email address, timezone, phone number (optional)</li>
              <li><strong className="text-text-primary">Usage data:</strong> craving sessions, answers to context questions, outcome (resisted / gave in)</li>
              <li><strong className="text-text-primary">Subscription data:</strong> Stripe customer ID, plan, billing cycle — no card numbers stored by us</li>
              <li><strong className="text-text-primary">SMS logs:</strong> timestamps of sent messages, no message content stored</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">3. How we use your data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To deliver AI-powered craving interventions personalised to your triggers</li>
              <li>To send optional SMS reminders during your configured craving window</li>
              <li>To compute and display your progress streaks and statistics</li>
              <li>To manage billing via Stripe</li>
              <li>To send transactional emails about your subscription (trial ending, payment issues)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">4. AI processing</h2>
            <p>
              Your craving session answers (location, trigger type, what&rsquo;s nearby) are sent to
              OpenAI&rsquo;s API to generate a personalised intervention. We do not use your data to
              train AI models. OpenAI&rsquo;s data retention policies apply to API usage — see
              openai.com/policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">5. Data retention</h2>
            <p>
              Your data is retained for as long as your account is active. You may request deletion
              at any time by emailing <a href="mailto:hello@quitloop.app" className="text-primary hover:underline">hello@quitloop.app</a>.
              Stripe retains billing records per their own policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">6. Third-party services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-text-primary">Supabase</strong> — database and authentication (EU region)</li>
              <li><strong className="text-text-primary">OpenAI</strong> — AI response generation</li>
              <li><strong className="text-text-primary">Twilio</strong> — SMS delivery</li>
              <li><strong className="text-text-primary">Stripe</strong> — payment processing</li>
              <li><strong className="text-text-primary">Resend</strong> — transactional email</li>
              <li><strong className="text-text-primary">Vercel</strong> — hosting and edge functions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">7. Your rights</h2>
            <p>
              Under GDPR you have the right to access, rectify, or erase your personal data, and to
              object to processing. Contact us at{' '}
              <a href="mailto:hello@quitloop.app" className="text-primary hover:underline">hello@quitloop.app</a>{' '}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">8. Not medical advice</h2>
            <p>
              QuitLoop is a behavioural support tool, not a medical device or substitute for
              professional medical advice. If you have a serious addiction, please consult a
              healthcare professional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">9. Contact</h2>
            <p>
              Questions about this policy?{' '}
              <a href="mailto:hello@quitloop.app" className="text-primary hover:underline">hello@quitloop.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
