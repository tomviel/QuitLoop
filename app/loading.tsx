import { Logo } from '@/components/Logo';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={64} />
        </div>
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    </div>
  );
}
