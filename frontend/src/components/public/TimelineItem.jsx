import VariableText from "../common/VariableText";

export default function TimelineItem({ item }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-ember" />
      <div className="absolute left-[5px] top-5 h-full w-px bg-slate-300 dark:bg-white/10" />
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
        <VariableText label={item.year} radius={85} />
      </p>
      <h3 className="mt-2 text-xl font-semibold">
        <VariableText label={item.title} />
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
    </div>
  );
}
