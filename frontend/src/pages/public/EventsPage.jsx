import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { EventsPageFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import EventCard from "../../components/public/EventCard";
import Lanyard from "../../components/public/Lanyard";
import { eventService } from "../../services/eventService";

const fixtureUpcomingEvents = [
  {
    id: "fixture-upcoming-1",
    event_type: "Workshop",
    is_upcoming: true,
    title: "Systems Design Lab",
    event_date: "2026-04-20",
    description:
      "A guided session on backend tradeoffs, observability, and production constraints.",
    resource_url: "#",
  },
  {
    id: "fixture-upcoming-2",
    event_type: "Hackathon",
    is_upcoming: true,
    title: "Night Build Sprint",
    event_date: "2026-05-01",
    description:
      "An overnight sprint focused on shipping prototypes and demo-ready MVPs.",
    resource_url: "#",
  },
];

const fixtureOngoingEvents = [
  {
    id: "fixture-ongoing-1",
    event_type: "Hackathon",
    is_upcoming: false,
    is_ongoing: true,
    title: "Build Week",
    event_date: "2026-04-07",
    description:
      "A week-long build sprint where teams ship features, demos, and production fixes.",
    resource_url: "#",
  },
];

const fixtureAllEvents = [
  ...fixtureUpcomingEvents,
  ...fixtureOngoingEvents,
  {
    id: "fixture-past-1",
    event_type: "Talk",
    is_upcoming: false,
    title: "Scaling Student Projects",
    event_date: "2026-03-11",
    description:
      "A deep dive into architecture choices that survive rapid growth and team turnover.",
    resource_url: "#",
  },
  {
    id: "fixture-past-2",
    event_type: "Session",
    is_upcoming: false,
    title: "Prompt Evaluation Clinic",
    event_date: "2026-02-24",
    description:
      "Hands-on review of prompt evaluation methods and reproducible experiment design.",
    resource_url: "#",
  },
];

export default function EventsPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;

  const todayIso = new Date().toISOString().slice(0, 10);

  const normalizedUpcoming = useMemo(
    () =>
      (upcoming ?? []).map((event) => ({
        ...event,
        is_ongoing: false,
      })),
    [upcoming],
  );

  const normalizedAllEvents = useMemo(
    () =>
      (allEvents ?? []).map((event) => {
        const eventDate =
          typeof event.event_date === "string" ? event.event_date.slice(0, 10) : "";
        const isOngoing = !event.is_upcoming && Boolean(eventDate) && eventDate >= todayIso;

        return {
          ...event,
          is_ongoing: isOngoing,
        };
      }),
    [allEvents, todayIso],
  );

  const ongoing = useMemo(
    () => normalizedAllEvents.filter((event) => event.is_ongoing),
    [normalizedAllEvents],
  );

  const featuredEvent = useMemo(
    () => ongoing[0] ?? normalizedUpcoming[0] ?? normalizedAllEvents[0] ?? null,
    [ongoing, normalizedUpcoming, normalizedAllEvents],
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [all, next] = await Promise.all([
        eventService.getAll(),
        eventService.getUpcoming(),
      ]);
      setAllEvents(all);
      setUpcoming(next);
    } catch (requestError) {
      setError(requestError.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (boneyardBuildMode) {
      return;
    }

    load();

    const refresh = () => {
      load();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(refresh, 30000);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [boneyardBuildMode]);

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          Events and sessions
        </p>
        <h1 className="mt-3 text-4xl font-bold">Workshops, talks, hackathons, and club sessions</h1>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={load} /> : null}

      <section className="section-card !p-0">
        <div className="relative h-[320px] overflow-hidden rounded-[28px] sm:h-[420px]">
          <Lanyard gravity={[0, -40, 0]} position={[0, 0, 24]} />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-ink/65 p-4 backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Event spotlight
            </p>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              {featuredEvent?.title || "KP Dev Sessions"}
            </h2>
            <p className="mt-1 text-sm text-slate-200">
              {featuredEvent?.description || "Builds, talks, and hack nights from the KP community."}
            </p>
          </div>
        </div>
      </section>

      {!showError ? (
        <Skeleton
          fallback={<EventsPageFallback />}
          fixture={
            <>
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Upcoming</h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {fixtureUpcomingEvents.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Ongoing</h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {fixtureOngoingEvents.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">All events</h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {fixtureAllEvents.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              </section>
            </>
          }
          loading={boneyardBuildMode || loading}
          name="events-page"
        >
          <>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Upcoming</h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {normalizedUpcoming.length ? (
                  normalizedUpcoming.map((event) => <EventCard event={event} key={event.id} />)
                ) : (
                  <div className="section-card text-sm text-slate-600 dark:text-slate-300">
                    No upcoming event is marked right now.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Ongoing</h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {ongoing.length ? (
                  ongoing.map((event) => <EventCard event={event} key={event.id} />)
                ) : (
                  <div className="section-card text-sm text-slate-600 dark:text-slate-300">
                    No ongoing event right now.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">All events</h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {normalizedAllEvents.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </div>
            </section>
          </>
        </Skeleton>
      ) : null}
    </div>
  );
}
