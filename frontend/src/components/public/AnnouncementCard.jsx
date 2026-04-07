import VariableText from "../common/VariableText";

export default function AnnouncementCard({ announcement }) {
  return (
    <article className="section-card h-full">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
        <VariableText label={announcement.author} radius={85} />
      </p>
      <h3 className="mt-3 text-2xl font-semibold">
        <VariableText label={announcement.title} />
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <VariableText label={announcement.body} radius={85} />
      </p>
      <p className="mt-5 text-xs uppercase tracking-[0.24em] text-slate-400">
        <VariableText label={announcement.published_at || announcement.created_at} radius={85} />
      </p>
    </article>
  );
}
