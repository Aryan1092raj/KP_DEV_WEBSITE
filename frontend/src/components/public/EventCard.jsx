import VariableText from "../common/VariableText";

export default function EventCard({ event }) {
  const status = event.is_ongoing ? "ongoing" : event.is_upcoming ? "upcoming" : "completed";
  const statusLabel = status === "ongoing" ? "Ongoing" : status === "upcoming" ? "Upcoming" : "Completed";
  const statusClass =
    status === "upcoming"
      ? "!border-white/30 !bg-[#101010] !text-white"
      : status === "ongoing"
        ? "!border-white/40 !bg-[#161616] !text-white"
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
      <p className="mt-2 text-sm text-white">{event.event_date}</p>
      <p className="mt-4 text-sm leading-6 text-white">
        <VariableText label={event.description || "Details will be shared with the club community."} radius={85} />
      </p>
      {event.resource_url ? (
        <a className="btn-secondary mt-6 !px-4 !py-2" href={event.resource_url} rel="noreferrer" target="_blank">
          <VariableText label="Open resources" radius={85} />
        </a>
      ) : null}
    </article>
  );
}
