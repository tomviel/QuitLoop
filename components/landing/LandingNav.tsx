import Link from 'next/link';
import { Logo } from '@/components/Logo';

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Logo size={32} showWordmark />
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-text-secondary hover:text-text-primary text-sm font-medium
                       px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="btn-primary text-sm px-4 py-2 rounded-xl"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
