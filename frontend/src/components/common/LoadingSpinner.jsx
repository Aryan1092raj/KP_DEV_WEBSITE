export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-300">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-ember dark:border-white/10 dark:border-t-ember" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
