function BoneBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-[22px] bg-slate-200/80 dark:bg-white/10 ${className}`} />;
}

export function CardGridFallback({ columns = "lg:grid-cols-2", count = 2 }) {
  return (
    <div className={`grid gap-5 ${columns}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="section-card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <BoneBlock className="h-4 w-20" />
              <BoneBlock className="h-8 w-48" />
            </div>
            <BoneBlock className="h-8 w-16 rounded-full" />
          </div>
          <BoneBlock className="h-4 w-full" />
          <BoneBlock className="h-4 w-11/12" />
          <BoneBlock className="h-4 w-3/4" />
          <div className="flex flex-wrap gap-2 pt-2">
            <BoneBlock className="h-8 w-24 rounded-full" />
            <BoneBlock className="h-8 w-20 rounded-full" />
            <BoneBlock className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamGridFallback() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="section-card space-y-5">
          <div className="flex items-center gap-4">
            <BoneBlock className="h-16 w-16 rounded-3xl" />
            <div className="space-y-3">
              <BoneBlock className="h-6 w-36" />
              <BoneBlock className="h-4 w-28" />
            </div>
          </div>
          <BoneBlock className="h-4 w-full" />
          <BoneBlock className="h-4 w-5/6" />
          <div className="flex items-center justify-between">
            <BoneBlock className="h-4 w-20" />
            <div className="flex gap-3">
              <BoneBlock className="h-4 w-12" />
              <BoneBlock className="h-4 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeHeroFallback() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="section-card space-y-5 overflow-hidden">
        <BoneBlock className="h-4 w-40" />
        <BoneBlock className="h-14 w-full max-w-3xl" />
        <BoneBlock className="h-14 w-4/5 max-w-2xl" />
        <BoneBlock className="h-5 w-full max-w-2xl" />
        <BoneBlock className="h-5 w-4/5 max-w-xl" />
        <div className="flex flex-wrap gap-3 pt-4">
          <BoneBlock className="h-12 w-36 rounded-full" />
          <BoneBlock className="h-12 w-40 rounded-full" />
        </div>
      </div>
      <div className="section-card space-y-6 bg-ink text-white dark:bg-white/5">
        <div className="space-y-4">
          <BoneBlock className="h-4 w-24 bg-white/10" />
          <BoneBlock className="h-10 w-3/4 bg-white/10" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <BoneBlock className="h-8 w-16 bg-white/10" />
              <BoneBlock className="mt-3 h-4 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsFallback() {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="section-card">
          <BoneBlock className="h-4 w-24" />
          <BoneBlock className="mt-4 h-10 w-16" />
        </div>
      ))}
    </section>
  );
}

export function TimelineAnnouncementFallback() {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="section-card space-y-6">
        <div className="space-y-3">
          <BoneBlock className="h-4 w-28" />
          <BoneBlock className="h-8 w-60" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 border-l border-slate-200 pl-5 dark:border-white/10">
            <BoneBlock className="h-4 w-16" />
            <BoneBlock className="h-5 w-40" />
            <BoneBlock className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <div className="space-y-3">
          <BoneBlock className="h-4 w-32" />
          <BoneBlock className="h-8 w-64" />
        </div>
        <div className="grid gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="section-card space-y-4">
              <BoneBlock className="h-6 w-3/4" />
              <BoneBlock className="h-4 w-28" />
              <BoneBlock className="h-4 w-full" />
              <BoneBlock className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventsPageFallback() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <BoneBlock className="h-8 w-32" />
        <CardGridFallback columns="lg:grid-cols-2" count={2} />
      </section>
      <section className="space-y-4">
        <BoneBlock className="h-8 w-32" />
        <CardGridFallback columns="lg:grid-cols-2" count={4} />
      </section>
    </div>
  );
}
