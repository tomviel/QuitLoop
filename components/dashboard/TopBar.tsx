import { Logo } from '@/components/Logo';

interface TopBarProps {
  currentStreak: number;
}

export function TopBar({ currentStreak }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
      <Logo size={32} showWordmark />

      <div className="flex items-center gap-1.5 bg-bg-surface border border-border rounded-full px-3 py-1.5">
        <span className="text-base leading-none">🔥</span>
        <span className="font-bold text-text-primary text-sm">
          {currentStreak}
        </span>
        <span className="text-text-muted text-xs">
          {currentStreak === 1 ? 'day' : 'days'}
        </span>
      </div>
    </header>
  );
}
