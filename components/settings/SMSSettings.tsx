'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/utils';

interface SMSSettingsProps {
  cravingStart: string;
  cravingEnd: string;
  active: boolean;
  timezone: string;
}

export function SMSSettings({
  cravingStart: initialStart,
  cravingEnd: initialEnd,
  active: initialActive,
  timezone,
}: SMSSettingsProps) {
  const [cravingStart, setCravingStart] = useState(initialStart);
  const [cravingEnd, setCravingEnd] = useState(initialEnd);
  const [active, setActive] = useState(initialActive);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/settings/sms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cravingStart, cravingEnd, active }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function toggleActive(val: boolean) {
    setActive(val);
    await fetch('/api/settings/sms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: val }),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">SMS alerts</h2>
        {/* Toggle */}
        <button
          onClick={() => toggleActive(!active)}
          className={`w-10 h-6 rounded-full border-2 flex items-center transition-all ${
            active
              ? 'bg-primary border-primary justify-end pr-0.5'
              : 'bg-transparent border-border justify-start pl-0.5'
          }`}
          aria-label={active ? 'Disable SMS' : 'Enable SMS'}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>

      {active && (
        <div className="card space-y-4">
          <p className="text-text-muted text-xs">
            Timezone: {timezone}
          </p>

          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Craving window</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">From</label>
                <input
                  type="time"
                  value={cravingStart}
                  onChange={(e) => {
                    setCravingStart(e.target.value);
                    setDirty(true);
                  }}
                  className="input text-center"
                />
              </div>
              <span className="text-text-muted mt-5">→</span>
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">To</label>
                <input
                  type="time"
                  value={cravingEnd}
                  onChange={(e) => {
                    setCravingEnd(e.target.value);
                    setDirty(true);
                  }}
                  className="input text-center"
                />
              </div>
            </div>
            <p className="text-text-muted text-xs mt-1.5">
              Alert sent at {formatTime(cravingStart)} (15 min before)
            </p>
          </div>

          {dirty && (
            <Button onClick={save} loading={saving} size="sm" className="w-full">
              {saved ? '✓ Saved' : 'Save changes'}
            </Button>
          )}
        </div>
      )}

      {!active && (
        <p className="text-text-muted text-xs mt-1">
          SMS alerts are off. Turn on to get reminders before your craving window.
        </p>
      )}
    </div>
  );
}
