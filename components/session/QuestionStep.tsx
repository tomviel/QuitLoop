'use client';

import { cn } from '@/lib/utils';

interface QuestionStepProps {
  question: string;
  options: readonly string[];
  selected: string | null;
  onSelect: (answer: string) => void;
}

export function QuestionStep({ question, options, selected, onSelect }: QuestionStepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-text-primary mb-6 leading-snug">
        {question}
      </h2>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={cn(
              'chip transition-all duration-150',
              selected === opt ? 'chip-selected' : 'hover:border-text-muted'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
