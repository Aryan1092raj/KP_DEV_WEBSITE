import { Link } from "react-router-dom";

export default function HeroSection({ stats }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="section-card overflow-hidden">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          Official Programming Club
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight">
          We turn curiosity into code, demos, and deep engineering culture.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Kamand Prompt brings together builders at IIT Mandi through projects,
          workshops, talks, hackathons, and a relentless practice loop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/apply">
            Join the club
          </Link>
          <Link className="btn-secondary" to="/projects">
            Explore projects
          </Link>
        </div>
      </div>

      <div className="section-card flex flex-col justify-between bg-ink text-white dark:bg-white/5">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Club Pulse</p>
          <h2 className="mt-4 text-3xl font-semibold">Built from live platform data.</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[22px] border border-white/10 bg-white/5 p-4"
            >
              <p className="text-3xl font-bold text-orange-300">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
