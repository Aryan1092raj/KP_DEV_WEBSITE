import { Skeleton } from "boneyard-js/react";

function SpinnerView({ label }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-300">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-ember dark:border-white/10 dark:border-t-ember" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default function LoadingSpinner({ label = "Loading..." }) {
  const skeletonName = `loading-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Skeleton
      fallback={<SpinnerView label={label} />}
      fixture={<SpinnerView label={label} />}
      loading
      name={skeletonName}
    >
      <SpinnerView label={label} />
    </Skeleton>
  );
}
