export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
        {children}
      </div>
    </div>
  );
}
