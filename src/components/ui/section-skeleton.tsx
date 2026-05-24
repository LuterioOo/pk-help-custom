export function SectionSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 md:px-8 py-12 ${className}`}>
      <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
    </div>
  );
}
