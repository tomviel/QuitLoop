import { Logo } from '@/components/Logo';

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center pb-24">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={48} />
        </div>
      </div>
    </div>
  );
}
