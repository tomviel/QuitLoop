'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MODULE_DISPLAY } from '@/types';
import type { AddictionType } from '@/types';

interface ModuleSettingsProps {
  activeModules: AddictionType[];
  plan: string;
}

const ALL_MODULES: AddictionType[] = ['vaping', 'junkfood'];

export function ModuleSettings({ activeModules: initial, plan }: ModuleSettingsProps) {
  const [activeModules, setActiveModules] = useState<AddictionType[]>(initial);
  const [loading, setLoading] = useState<AddictionType | null>(null);
  const [error, setError] = useState('');

  const canAddMore = plan !== 'starter' || activeModules.length < 1;

  async function toggle(type: AddictionType) {
    const willBeActive = !activeModules.includes(type);

    // Starter plan: can only have 1 module
    if (willBeActive && plan === 'starter' && activeModules.length >= 1) {
      setError('Upgrade to Pro to add a second module.');
      return;
    }
    // Must keep at least one module
    if (!willBeActive && activeModules.length === 1) {
      setError('You need at least one active module.');
      return;
    }

    setError('');
    setLoading(type);

    const res = await fetch('/api/settings/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addictionType: type, active: willBeActive }),
    });

    setLoading(null);

    if (!res.ok) {
      setError('Failed to update module. Try again.');
      return;
    }

    setActiveModules((prev) =>
      willBeActive ? [...prev, type] : prev.filter((m) => m !== type)
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary mb-3">Active modules</h2>
      <div className="space-y-2">
        {ALL_MODULES.map((type) => {
          const display = MODULE_DISPLAY[type];
          const isActive = activeModules.includes(type);
          const isLocked = !isActive && !canAddMore;

          return (
            <button
              key={type}
              onClick={() => toggle(type)}
              disabled={loading === type || isLocked}
              className={cn(
                'w-full flex items-center gap-3 card text-left',
                'transition-all duration-150 active:scale-[0.99]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive ? 'border-primary/30' : ''
              )}
            >
              <span className="text-2xl leading-none flex-shrink-0">{display.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-sm">{display.label}</p>
                <p className="text-text-muted text-xs">{display.description}</p>
              </div>
              {loading === type ? (
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div
                  className={cn(
                    'w-10 h-6 rounded-full border-2 flex items-center transition-all flex-shrink-0',
                    isActive
                      ? 'bg-primary border-primary justify-end pr-0.5'
                      : 'bg-transparent border-border justify-start pl-0.5'
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
