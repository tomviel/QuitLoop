'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlanCard } from '@/components/onboarding/PlanCard';
import { ModuleCard } from '@/components/onboarding/ModuleCard';
import { getTimezone } from '@/lib/utils';
import { TRIGGER_OPTIONS } from '@/types';
import type { PlanId, BillingCycle, AddictionType } from '@/types';

const TOTAL_STEPS = 4;

interface OnboardingState {
  plan: PlanId;
  billingCycle: BillingCycle;
  modules: AddictionType[];
  triggers: string[];
  phone: string;
  cravingStart: string;
  cravingEnd: string;
  smsOptIn: boolean;
  timezone: string;
}

const DEFAULT_STATE: OnboardingState = {
  plan: 'pro',
  billingCycle: 'monthly',
  modules: ['vaping', 'junkfood'],
  triggers: [],
  phone: '',
  cravingStart: '20:00',
  cravingEnd: '22:00',
  smsOptIn: true,
  timezone: getTimezone(),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTrigger(trigger: string) {
    setState((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter((t) => t !== trigger)
        : [...prev.triggers, trigger],
    }));
  }

  function toggleModule(type: AddictionType) {
    setState((prev) => {
      const has = prev.modules.includes(type);
      if (prev.plan === 'starter') {
        // Starter: single module, toggle replaces
        return { ...prev, modules: [type] };
      }
      // Pro/Unlimited: can deselect but must keep at least one
      if (has && prev.modules.length === 1) return prev;
      return {
        ...prev,
        modules: has ? prev.modules.filter((m) => m !== type) : [...prev.modules, type],
      };
    });
  }

  function handlePlanChange(plan: PlanId) {
    setState((prev) => ({
      ...prev,
      plan,
      // Starter gets 1 module max; Pro/Unlimited default both
      modules:
        plan === 'starter'
          ? [prev.modules[0] ?? 'vaping']
          : ['vaping', 'junkfood'],
    }));
  }

  function canAdvance(): boolean {
    if (step === 1) return true;
    if (step === 2) return state.modules.length > 0;
    if (step === 3) return state.triggers.length > 0;
    if (step === 4) {
      return (
        state.phone.trim().length >= 7 &&
        state.cravingStart !== '' &&
        state.cravingEnd !== ''
      );
    }
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to dashboard with onboarded flag (triggers PWA install banner)
      router.push('/dashboard?onboarded=true');
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="text-text-muted hover:text-text-secondary p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <div className="flex-1">
          <p className="text-xs text-text-muted mb-1">
            Step {step} of {TOTAL_STEPS}
          </p>
          <ProgressBar current={step} total={TOTAL_STEPS} />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {step === 1 && (
          <Step1Plan
            plan={state.plan}
            billingCycle={state.billingCycle}
            onPlanChange={handlePlanChange}
            onCycleChange={(c) => update('billingCycle', c)}
          />
        )}
        {step === 2 && (
          <Step2Modules
            plan={state.plan}
            selectedModules={state.modules}
            onToggle={toggleModule}
          />
        )}
        {step === 3 && (
          <Step3Triggers
            selectedTriggers={state.triggers}
            onToggle={toggleTrigger}
          />
        )}
        {step === 4 && (
          <Step4Contact
            phone={state.phone}
            cravingStart={state.cravingStart}
            cravingEnd={state.cravingEnd}
            smsOptIn={state.smsOptIn}
            timezone={state.timezone}
            onPhoneChange={(v) => update('phone', v)}
            onStartChange={(v) => update('cravingStart', v)}
            onEndChange={(v) => update('cravingEnd', v)}
            onSmsOptIn={(v) => update('smsOptIn', v)}
          />
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      <Button
        onClick={handleNext}
        size="lg"
        className="w-full"
        disabled={!canAdvance()}
        loading={loading}
      >
        {step === TOTAL_STEPS ? 'Start my free trial' : 'Continue'}
      </Button>

      {step === TOTAL_STEPS && (
        <p className="text-text-muted text-xs text-center mt-3">
          7-day free trial · No credit card required
        </p>
      )}
    </div>
  );
}

// ─── Step 1: Plan ────────────────────────────────────────────────────────────

function Step1Plan({
  plan,
  billingCycle,
  onPlanChange,
  onCycleChange,
}: {
  plan: PlanId;
  billingCycle: BillingCycle;
  onPlanChange: (p: PlanId) => void;
  onCycleChange: (c: BillingCycle) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">
        Choose your plan
      </h2>
      <p className="text-text-secondary text-sm mb-5">
        All plans start with a 7-day free trial. No card needed.
      </p>

      {/* Billing toggle */}
      <div className="flex items-center bg-bg-surface border border-border rounded-xl p-1 mb-5 w-fit">
        {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
          <button
            key={cycle}
            onClick={() => onCycleChange(cycle)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
              billingCycle === cycle
                ? 'bg-bg text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
            {cycle === 'yearly' && (
              <span className="ml-1.5 text-xs text-success font-semibold">
                −30%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(['starter', 'pro', 'unlimited'] as PlanId[]).map((p) => (
          <PlanCard
            key={p}
            plan={p}
            billingCycle={billingCycle}
            selected={plan === p}
            recommended={p === 'pro'}
            onSelect={() => onPlanChange(p)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Modules ─────────────────────────────────────────────────────────

function Step2Modules({
  plan,
  selectedModules,
  onToggle,
}: {
  plan: PlanId;
  selectedModules: AddictionType[];
  onToggle: (t: AddictionType) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">
        What are you quitting?
      </h2>
      <p className="text-text-secondary text-sm mb-5">
        {plan === 'starter'
          ? 'Choose one addiction module.'
          : 'Both modules included. Deselect if you only need one.'}
      </p>
      <div className="space-y-3">
        {(['vaping', 'junkfood'] as AddictionType[]).map((type) => (
          <ModuleCard
            key={type}
            type={type}
            selected={selectedModules.includes(type)}
            onToggle={() => onToggle(type)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Triggers ─────────────────────────────────────────────────────────

function Step3Triggers({
  selectedTriggers,
  onToggle,
}: {
  selectedTriggers: string[];
  onToggle: (t: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">
        What triggers your cravings?
      </h2>
      <p className="text-text-secondary text-sm mb-5">
        Select all that apply. We&apos;ll use these to personalize your interventions.
      </p>
      <div className="flex flex-wrap gap-2">
        {TRIGGER_OPTIONS.map((trigger) => {
          const selected = selectedTriggers.includes(trigger);
          return (
            <button
              key={trigger}
              onClick={() => onToggle(trigger)}
              className={`chip transition-all ${selected ? 'chip-selected' : ''}`}
            >
              {trigger}
            </button>
          );
        })}
      </div>
      {selectedTriggers.length === 0 && (
        <p className="text-text-muted text-xs mt-4">
          Select at least one trigger to continue.
        </p>
      )}
    </div>
  );
}

// ─── Step 4: Contact + craving hours ─────────────────────────────────────────

function Step4Contact({
  phone,
  cravingStart,
  cravingEnd,
  smsOptIn,
  timezone,
  onPhoneChange,
  onStartChange,
  onEndChange,
  onSmsOptIn,
}: {
  phone: string;
  cravingStart: string;
  cravingEnd: string;
  smsOptIn: boolean;
  timezone: string;
  onPhoneChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onSmsOptIn: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">
        One last step
      </h2>
      <p className="text-text-secondary text-sm mb-5">
        Tell us when your cravings hit hardest. We&apos;ll have your back before they do.
      </p>

      <div className="space-y-5">
        <Input
          label="Phone number"
          type="tel"
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          autoComplete="tel"
          hint="International format. Used only for craving alerts."
        />

        <div>
          <p className="text-sm font-medium text-text-secondary mb-2">
            When do your cravings usually hit?
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">From</label>
              <input
                type="time"
                value={cravingStart}
                onChange={(e) => onStartChange(e.target.value)}
                className="input text-center"
              />
            </div>
            <span className="text-text-muted mt-5">→</span>
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">To</label>
              <input
                type="time"
                value={cravingEnd}
                onChange={(e) => onEndChange(e.target.value)}
                className="input text-center"
              />
            </div>
          </div>
          <p className="text-text-muted text-xs mt-1.5">
            Timezone: {timezone}
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => onSmsOptIn(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                smsOptIn
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-border group-hover:border-text-secondary'
              }`}
            >
              {smsOptIn && (
                <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-text-primary font-medium">
              Send me a heads-up 15 min before my craving window
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              We&apos;ll text you a reminder before your danger zone hits.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
