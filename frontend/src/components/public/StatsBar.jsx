import VariableText from "../common/VariableText";

export default function StatsBar({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="section-card">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
            <VariableText label={stat.label} radius={85} />
          </p>
          <p className="mt-3 text-3xl font-bold text-ink dark:text-white sm:text-4xl">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
