export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen relative z-10 pointer-events-auto">{children}</div>;
}
