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
      <div className="space-y-3">
        <BoneBlock className="h-4 w-40" />
        <BoneBlock className="h-10 w-96 max-w-full" />
      </div>

      <section className="space-y-4">
        <BoneBlock className="h-8 w-32" />
        <CardGridFallback columns="lg:grid-cols-2" count={2} />
      </section>

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

export function ProjectsPageFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <BoneBlock className="h-4 w-40" />
        <BoneBlock className="h-10 w-96 max-w-full" />
      </div>
      <CardGridFallback columns="lg:grid-cols-2" count={4} />
    </div>
  );
}

export function TeamPageFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <BoneBlock className="h-4 w-28" />
        <BoneBlock className="h-10 w-96 max-w-full" />
      </div>

      <section className="section-card !p-0">
        <div className="h-[340px] rounded-[28px] p-6 sm:h-[420px]">
          <BoneBlock className="h-full w-full rounded-[20px]" />
        </div>
      </section>

      <TeamGridFallback />
    </div>
  );
}

export function AdminDashboardFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <BoneBlock className="h-4 w-28" />
        <BoneBlock className="h-10 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="admin-card space-y-3">
            <BoneBlock className="h-4 w-24" />
            <BoneBlock className="h-10 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`admin-card space-y-4 ${index === 2 ? "xl:col-span-2" : ""}`}>
            <BoneBlock className="h-7 w-56" />
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: index === 2 ? 4 : 3 }).map((__, innerIndex) => (
                <div key={innerIndex} className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
                  <BoneBlock className="h-5 w-3/4" />
                  <BoneBlock className="mt-3 h-4 w-1/2" />
                  <BoneBlock className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCrudPageFallback({ listItems = 4 }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="section-card space-y-5">
        <BoneBlock className="h-8 w-44" />
        <BoneBlock className="h-4 w-full" />
        <BoneBlock className="h-4 w-5/6" />
        <BoneBlock className="h-11 w-full rounded-xl" />
        <BoneBlock className="h-11 w-full rounded-xl" />
        <BoneBlock className="h-24 w-full rounded-xl" />
        <div className="flex gap-3">
          <BoneBlock className="h-11 w-36 rounded-full" />
          <BoneBlock className="h-11 w-28 rounded-full" />
        </div>
      </div>

      <div className="admin-card space-y-4">
        <BoneBlock className="h-8 w-36" />
        {Array.from({ length: listItems }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200/70 p-4 dark:border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <BoneBlock className="h-5 w-52" />
                <BoneBlock className="h-4 w-40" />
                <BoneBlock className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <BoneBlock className="h-9 w-16 rounded-full" />
                <BoneBlock className="h-9 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminApplicationsFallback() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="admin-card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <BoneBlock className="h-6 w-48" />
              <BoneBlock className="h-4 w-64" />
            </div>
            <BoneBlock className="h-8 w-24 rounded-full" />
          </div>
          <BoneBlock className="h-4 w-full" />
          <BoneBlock className="h-4 w-5/6" />
          <BoneBlock className="h-4 w-1/2" />
          <div className="flex flex-wrap gap-3 pt-1">
            <BoneBlock className="h-9 w-32 rounded-full" />
            <BoneBlock className="h-9 w-32 rounded-full" />
            <BoneBlock className="h-9 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminContactMessagesFallback() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="admin-card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <BoneBlock className="h-6 w-40" />
              <BoneBlock className="h-4 w-56" />
            </div>
            <BoneBlock className="h-8 w-28 rounded-full" />
          </div>
          <BoneBlock className="h-4 w-full" />
          <BoneBlock className="h-4 w-full" />
          <BoneBlock className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function AdminLoginFallback() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="section-card space-y-4">
        <BoneBlock className="h-4 w-32" />
        <BoneBlock className="h-10 w-72 max-w-full" />
        <BoneBlock className="h-4 w-full" />
        <BoneBlock className="h-4 w-5/6" />
      </div>
      <div className="section-card space-y-4">
        <BoneBlock className="h-8 w-24" />
        <BoneBlock className="h-4 w-20" />
        <BoneBlock className="h-11 w-full rounded-xl" />
        <BoneBlock className="h-4 w-28" />
        <BoneBlock className="h-11 w-full rounded-xl" />
        <BoneBlock className="h-10 w-40 rounded-full" />
        <BoneBlock className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
