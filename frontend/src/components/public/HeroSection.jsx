import { Link } from "react-router-dom";

import VariableText from "../common/VariableText";

export default function HeroSection({ stats }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="section-card overflow-hidden">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
          <VariableText label="Official Programming Club" />
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          <VariableText label="We turn curiosity into code, demos, and deep engineering culture." />
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white">
          <VariableText
            label="Kamand Prompt brings together builders at IIT Mandi through projects, workshops, talks, hackathons, and a relentless practice loop."
            radius={80}
          />
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/apply">
            <VariableText label="Join the club" radius={85} />
          </Link>
          <Link className="btn-secondary" to="/projects">
            <VariableText label="Explore projects" radius={85} />
          </Link>
        </div>
      </div>

      <div className="section-card flex flex-col justify-between bg-ink text-white dark:bg-white/5">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-white">
            <VariableText label="Club Pulse" />
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            <VariableText label="Built from live platform data." />
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 lg:grid-cols-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[22px] border border-white/10 bg-white/5 p-4"
            >
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-white">
                <VariableText label={stat.label} radius={90} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
