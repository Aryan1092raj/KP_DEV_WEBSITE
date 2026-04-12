import { useEffect, useMemo, useRef } from "react";
import { animate } from "animejs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "boneyard-js/react";

import { EventsPageFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import EventCard from "../../components/public/EventCard";
import { useOneTimePageHeadingAnimation } from "../../hooks/useOneTimePageHeadingAnimation";
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

const REFRESH_COOLDOWN_MS = 60_000;

export default function EventsPage() {
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const lastRefreshRef = useRef(0);
  const motionScopeRef = useRef(null);

  const {
    data: allEvents = [],
    error: allEventsError,
    isLoading: allEventsLoading,
    refetch: refetchAllEvents,
  } = useQuery({
    queryKey: ["events", "all"],
    queryFn: eventService.getAll,
    enabled: !boneyardBuildMode,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: upcoming = [],
    error: upcomingError,
    isLoading: upcomingLoading,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: eventService.getUpcoming,
    enabled: !boneyardBuildMode,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });

  const loading = !boneyardBuildMode && (allEventsLoading || upcomingLoading);
  const errorMessage =
    !boneyardBuildMode
      ? allEventsError?.message || upcomingError?.message || ""
      : "";
  const showError = Boolean(errorMessage);

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
  const pageLoading = boneyardBuildMode || loading;
  const upcomingToRender = pageLoading ? fixtureUpcomingEvents : normalizedUpcoming;
  const ongoingToRender = pageLoading ? fixtureOngoingEvents : ongoing;
  const allEventsToRender = pageLoading ? fixtureAllEvents : normalizedAllEvents;

  useOneTimePageHeadingAnimation({
    enabled: !showError && !pageLoading,
    scopeRef: motionScopeRef,
    visitTag: "events",
  });

  const load = () => {
    lastRefreshRef.current = Date.now();
    void Promise.all([refetchAllEvents(), refetchUpcoming()]);
  };

  useEffect(() => {
    if (boneyardBuildMode) {
      return;
    }

    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < REFRESH_COOLDOWN_MS) {
        return;
      }

      lastRefreshRef.current = now;
      void Promise.all([refetchAllEvents(), refetchUpcoming()]);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [boneyardBuildMode, refetchAllEvents, refetchUpcoming]);

  useEffect(() => {
    const scope = motionScopeRef.current;

    if (!scope || showError) {
      return;
    }

    const movingTargets = Array.from(scope.querySelectorAll(".dir-motion-block"));

    const motionAnimation =
      movingTargets.length > 0
        ? animate(movingTargets, {
            x: ["-17rem", "17rem"],
            ease: "linear",
            duration: 4200,
            loop: true,
          })
        : null;

    return () => {
      motionAnimation?.pause?.();
    };
  }, [allEventsToRender.length, ongoingToRender.length, upcomingToRender.length, showError]);

  return (
    <div className="page-shell">
      {showError ? <ErrorMessage message={errorMessage} onRetry={load} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<EventsPageFallback />}
          fixture={<EventsPageFallback />}
          loading={pageLoading}
          name={boneyardBuildMode ? "events-page" : undefined}
        >
          <div className="space-y-8" ref={motionScopeRef}>
            <div>
              <p className="page-heading-anim text-sm font-semibold uppercase tracking-[0.28em] text-ember">
                <VariableText label="Events and sessions" />
              </p>
              <h1 className="page-heading-anim mt-3 text-4xl font-bold">
                <VariableText label="Workshops, talks, hackathons, and club sessions" />
              </h1>
            </div>

            <section className="space-y-4">
              <h2 className="events-section-heading">
                <VariableText label="Upcoming" />
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {upcomingToRender.length ? (
                  upcomingToRender.map((event) => (
                    <div className="dir-motion-block" key={event.id}>
                      <EventCard event={event} />
                    </div>
                  ))
                ) : (
                  <div className="section-card dir-motion-block text-sm text-slate-600 dark:text-slate-300">
                    No upcoming event is marked right now.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="events-section-heading">
                <VariableText label="Ongoing" />
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {ongoingToRender.length ? (
                  ongoingToRender.map((event) => (
                    <div className="dir-motion-block" key={event.id}>
                      <EventCard event={event} />
                    </div>
                  ))
                ) : (
                  <div className="section-card dir-motion-block text-sm text-slate-600 dark:text-slate-300">
                    No ongoing event right now.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="events-section-heading">
                <VariableText label="All events" />
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">
                {allEventsToRender.map((event) => (
                  <div className="dir-motion-block" key={event.id}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
