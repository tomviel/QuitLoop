'use client';

import { useState, useCallback } from 'react';
import { QuestionStep } from './QuestionStep';
import { AIResponseDisplay } from './AIResponseDisplay';
import { EndScreen, OutcomeDisplay } from './EndScreen';
import { LOCATION_OPTIONS, NEARBY_OPTIONS, MODULE_DISPLAY } from '@/types';
import type { AddictionType } from '@/types';

type Step = 'module' | 'q1' | 'q2' | 'q3' | 'ai' | 'end';

interface SessionFlowProps {
  modules: AddictionType[];
  userTriggers: string[];
}

export function SessionFlow({ modules, userTriggers }: SessionFlowProps) {
  const [step, setStep] = useState<Step>(modules.length > 1 ? 'module' : 'q1');
  const [selectedModule, setSelectedModule] = useState<AddictionType>(
    modules[0] ?? 'vaping'
  );
  const [location, setLocation] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [nearby, setNearby] = useState<string | null>(null);

  const [aiText, setAiText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [outcomeLoading, setOutcomeLoading] = useState(false);
  const [outcome, setOutcome] = useState<{ resisted: boolean; newStreak: number } | null>(null);

  // Q2 trigger options: user's saved triggers + "Something else"
  const triggerOptions = [...userTriggers, 'Something else'];

  const startAI = useCallback(
    async (loc: string, trig: string, near: string) => {
      setStep('ai');
      setIsStreaming(true);
      setAiText('');

      try {
        const res = await fetch('/api/ai/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addictionType: selectedModule,
            location: loc,
            trigger: trig,
            nearby: near,
          }),
        });

        if (!res.ok || !res.body) {
          setAiText(
            'Unable to connect right now. Focus on your breathing — inhale for 4 counts, hold 4, exhale 6. Repeat until the craving passes.'
          );
          setIsStreaming(false);
          return;
        }

        const sid = res.headers.get('X-Session-Id');
        if (sid) setSessionId(sid);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setAiText(accumulated);
        }
      } catch {
        setAiText(
          'Unable to connect right now. Focus on your breathing — inhale for 4 counts, hold 4, exhale 6. Repeat until the craving passes.'
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [selectedModule]
  );

  async function handleOutcome(resisted: boolean) {
    setOutcomeLoading(true);

    try {
      const res = await fetch('/api/ai/session/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, resisted }),
      });

      const data = await res.json();
      setOutcome({ resisted, newStreak: data.newStreak ?? 0 });
    } catch {
      setOutcome({ resisted, newStreak: 0 });
    } finally {
      setOutcomeLoading(false);
    }
  }

  // ── Module selection (only shown if user has 2 modules) ──────────────────
  if (step === 'module') {
    return (
      <div className="animate-fade-in">
        <p className="text-text-secondary text-sm mb-2">Which craving is hitting?</p>
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Choose your module
        </h2>
        <div className="flex flex-col gap-3">
          {modules.map((mod) => {
            const display = MODULE_DISPLAY[mod];
            return (
              <button
                key={mod}
                onClick={() => {
                  setSelectedModule(mod);
                  setStep('q1');
                }}
                className="card flex items-center gap-4 text-left hover:border-primary/40
                           active:scale-[0.99] transition-all duration-150"
              >
                <span className="text-3xl leading-none">{display.icon}</span>
                <div>
                  <p className="font-semibold text-text-primary">{display.label}</p>
                  <p className="text-text-secondary text-sm">{display.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Q1: Location ─────────────────────────────────────────────────────────
  if (step === 'q1') {
    return (
      <QuestionStep
        question="Where are you right now?"
        options={LOCATION_OPTIONS}
        selected={location}
        onSelect={(ans) => {
          setLocation(ans);
          setStep('q2');
        }}
      />
    );
  }

  // ── Q2: Trigger ──────────────────────────────────────────────────────────
  if (step === 'q2') {
    return (
      <QuestionStep
        question="What triggered it?"
        options={triggerOptions}
        selected={trigger}
        onSelect={(ans) => {
          setTrigger(ans);
          setStep('q3');
        }}
      />
    );
  }

  // ── Q3: Nearby ───────────────────────────────────────────────────────────
  if (step === 'q3') {
    return (
      <QuestionStep
        question="What's within reach right now?"
        options={NEARBY_OPTIONS}
        selected={nearby}
        onSelect={(ans) => {
          setNearby(ans);
          startAI(location!, trigger!, ans);
        }}
      />
    );
  }

  // ── AI streaming ─────────────────────────────────────────────────────────
  if (step === 'ai') {
    return (
      <div>
        <div className="mb-6">
          <p className="text-text-muted text-xs mb-1">
            {MODULE_DISPLAY[selectedModule].icon} {MODULE_DISPLAY[selectedModule].label}
          </p>
          <h2 className="text-xl font-bold text-text-primary">
            Here&apos;s what to do right now:
          </h2>
        </div>

        <AIResponseDisplay
          text={aiText}
          isStreaming={isStreaming}
          addictionType={selectedModule}
        />

        {/* Show end screen once streaming is done */}
        {!isStreaming && aiText.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            {outcome ? (
              <OutcomeDisplay resisted={outcome.resisted} newStreak={outcome.newStreak} />
            ) : (
              <EndScreen
                resisted={false}
                newStreak={-1}
                onChoose={handleOutcome}
                loading={outcomeLoading}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
