import Link from 'next/link';

export const metadata = { title: 'Terms of Service – QuitLoop' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Terms of Service</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: May 2025</p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">1. Acceptance</h2>
            <p>
              By creating an account on QuitLoop (&ldquo;Service&rdquo;), you agree to these Terms of
              Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">2. Description of service</h2>
            <p>
              QuitLoop is a web application that provides real-time AI-assisted interventions to help
              users manage addiction cravings (vaping/smoking and junk food/sugar). It is a
              behavioural support tool only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">3. Eligibility</h2>
            <p>
              You must be at least 18 years old to use QuitLoop. By using the Service you represent
              that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">4. Free trial and subscriptions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>New accounts receive a 7-day free trial with full access to the selected plan</li>
              <li>After the trial, a paid subscription is required to continue using the Service</li>
              <li>Subscriptions are billed monthly or yearly in Euros via Stripe</li>
              <li>You may cancel at any time; cancellation takes effect at the end of the current billing period</li>
              <li>No refunds are issued for partial billing periods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Attempt to reverse-engineer, scrape, or abuse the Service</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Share your account credentials</li>
              <li>Attempt to circumvent subscription restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">6. Health disclaimer</h2>
            <p>
              QuitLoop is not a medical device and does not provide medical advice, diagnosis, or
              treatment. The AI responses are for motivational and behavioural support only. Always
              consult a qualified healthcare professional for medical concerns related to addiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, QuitLoop is provided &ldquo;as is&rdquo; without
              warranties of any kind. We are not liable for any indirect, incidental, or consequential
              damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">8. Changes to terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Service after changes
              constitutes acceptance of the new Terms. We will notify users of material changes via
              email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">9. Governing law</h2>
            <p>
              These Terms are governed by French law. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of Paris, France.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">10. Contact</h2>
            <p>
              Questions about these Terms?{' '}
              <a href="mailto:hello@quitloop.app" className="text-primary hover:underline">hello@quitloop.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
