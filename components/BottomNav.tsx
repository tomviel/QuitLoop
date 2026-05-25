'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  locked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/stats', label: 'Stats', icon: '📊' },
  { href: '/community', label: 'Community', icon: '👥', locked: true },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

interface BottomNavProps {
  plan?: string;
}

export function BottomNav({ plan }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = item.locked && plan === 'starter';

          return (
            <Link
              key={item.href}
              href={isLocked ? '#' : item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px]',
                'text-xs font-medium transition-colors duration-150',
                isActive
                  ? 'text-text-primary'
                  : 'text-text-muted hover:text-text-secondary',
                isLocked && 'opacity-40 cursor-not-allowed'
              )}
              aria-label={item.label}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="leading-none">
                {item.label}
                {isLocked && ' 🔒'}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
