export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pt-[env(safe-area-inset-top)]">
      {children}
    </div>
  );
}
