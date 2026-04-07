import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { EventsPageFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import EventCard from "../../components/public/EventCard";
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
    <div className="page-shell">

      {showError ? <ErrorMessage message={error} onRetry={load} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<EventsPageFallback />}
          fixture={<EventsPageFallback />}
          loading={boneyardBuildMode || loading}
          name="events-page"
        >
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
                <VariableText label="Events and sessions" />
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                <VariableText label="Workshops, talks, hackathons, and club sessions" />
              </h1>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                <VariableText label="Upcoming" />
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {(boneyardBuildMode ? fixtureUpcomingEvents : normalizedUpcoming).length ? (
                  (boneyardBuildMode ? fixtureUpcomingEvents : normalizedUpcoming).map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))
                ) : (
                  <div className="section-card text-sm text-slate-600 dark:text-slate-300">
                    No upcoming event is marked right now.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                <VariableText label="Ongoing" />
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {(boneyardBuildMode ? fixtureOngoingEvents : ongoing).length ? (
                  (boneyardBuildMode ? fixtureOngoingEvents : ongoing).map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))
                ) : (
                  <div className="section-card text-sm text-slate-600 dark:text-slate-300">
                    No ongoing event right now.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                <VariableText label="All events" />
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {(boneyardBuildMode ? fixtureAllEvents : normalizedAllEvents).map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </div>
            </section>
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
