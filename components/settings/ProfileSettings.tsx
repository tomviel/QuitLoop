'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ProfileSettingsProps {
  phone: string | null;
  email: string;
}

export function ProfileSettings({ phone: initialPhone, email }: ProfileSettingsProps) {
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    setSaving(false);

    if (!res.ok) {
      setError('Failed to save. Try again.');
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary mb-3">Account</h2>
      <div className="card space-y-4">
        <div>
          <p className="text-xs text-text-muted mb-1">Email</p>
          <p className="text-text-secondary text-sm">{email}</p>
        </div>

        <form onSubmit={save} className="space-y-3">
          <Input
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            hint="Used for craving SMS alerts"
            error={error}
          />
          <Button type="submit" loading={saving} size="sm" className="w-full">
            {saved ? '✓ Saved' : 'Update phone'}
          </Button>
        </form>
      </div>
    </div>
  );
}
