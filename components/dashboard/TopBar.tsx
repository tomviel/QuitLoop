interface TopBarProps {
  currentStreak: number;
}

export function TopBar({ currentStreak }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          QL
        </span>
        <span className="font-bold text-text-primary text-lg">QuitLoop</span>
      </div>

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
