export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="section-card animate-pulse space-y-3">
      <div className="h-6 w-1/3 rounded-full bg-slate-200 dark:bg-white/10" />
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded-full bg-slate-200 dark:bg-white/10"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
