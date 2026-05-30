import { Logo } from '@/components/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} />
          <h1 className="text-xl font-bold text-text-primary mt-4">QuitLoop</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
