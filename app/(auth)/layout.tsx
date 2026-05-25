export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-lg mb-4">
            QL
          </span>
          <h1 className="text-xl font-bold text-text-primary">QuitLoop</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
