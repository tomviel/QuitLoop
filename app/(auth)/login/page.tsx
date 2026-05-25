'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📬</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Check your email</h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          We sent a magic link to{' '}
          <span className="text-text-primary font-medium">{email}</span>.
          <br />
          Tap it to sign in — no password needed.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-text-primary mb-1">Sign in</h2>
      <p className="text-text-secondary text-sm mb-6">
        Enter your email and we&apos;ll send you a magic link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
          error={error}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Send magic link
        </Button>
      </form>

      <p className="text-text-muted text-xs text-center mt-6 leading-relaxed">
        By signing in, you agree to our{' '}
        <a href="/terms" className="hover:text-text-secondary transition-colors">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="hover:text-text-secondary transition-colors">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
