import VariableText from "../common/VariableText";

export default function EventCard({ event }) {
  const status = event.is_ongoing ? "ongoing" : event.is_upcoming ? "upcoming" : "completed";
  const statusLabel = status === "ongoing" ? "Ongoing" : status === "upcoming" ? "Upcoming" : "Completed";
  const statusClass =
    status === "upcoming"
      ? "!bg-emerald-100 !text-emerald-700 dark:!bg-emerald-500/20 dark:!text-emerald-200"
      : status === "ongoing"
        ? "!bg-amber-100 !text-amber-700 dark:!bg-amber-500/20 dark:!text-amber-200"
        : "";

  return (
    <article className="section-card h-full">
      <div className="flex items-center justify-between gap-3">
        <span className="chip">
          <VariableText label={event.event_type} radius={85} />
        </span>
        <span className={`chip ${statusClass}`}>
          <VariableText label={statusLabel} radius={85} />
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold">
        <VariableText label={event.title} />
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{event.event_date}</p>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {event.description || "Details will be shared with the club community."}
      </p>
      {event.resource_url ? (
        <a className="btn-secondary mt-6 !px-4 !py-2" href={event.resource_url} rel="noreferrer" target="_blank">
          Open resources
        </a>
      ) : null}
    </article>
  );
}
