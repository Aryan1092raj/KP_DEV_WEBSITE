export default function AnnouncementCard({ announcement }) {
  return (
    <article className="section-card h-full">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
        {announcement.author}
      </p>
      <h3 className="mt-3 text-2xl font-semibold">{announcement.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {announcement.body}
      </p>
      <p className="mt-5 text-xs uppercase tracking-[0.24em] text-slate-400">
        {announcement.published_at || announcement.created_at}
      </p>
    </article>
  );
}
