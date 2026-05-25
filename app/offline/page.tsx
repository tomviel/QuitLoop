export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
        <span className="text-3xl">📵</span>
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-3">
        You&apos;re offline.
      </h1>
      <p className="text-text-secondary text-lg leading-relaxed">
        Your streak is safe.
      </p>
      <p className="text-text-muted text-sm mt-4 max-w-xs">
        Reconnect when you can. Your progress is saved and will sync automatically.
      </p>
    </div>
  );
}
