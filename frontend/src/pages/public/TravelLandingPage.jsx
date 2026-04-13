import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const stations = [
  {
    route: "/projects",
    title: "Projects",
    subtitle: "Explore active builds, experiments, and deployment stories.",
    stop: "01",
    highlights: ["Featured repositories", "Tech stacks", "Contributor crews"],
  },
  {
    route: "/team",
    title: "Meet the Team",
    subtitle: "See who ships, mentors, and keeps the coding loop alive.",
    stop: "02",
    highlights: ["Core members", "Roles", "Mentor guidance"],
  },
  {
    route: "/events",
    title: "Events",
    subtitle: "Track workshops, sprints, and coding mission briefings.",
    stop: "03",
    highlights: ["Upcoming sessions", "Past highlights", "Talk lineups"],
  },
  {
    route: "/apply",
    title: "Apply",
    subtitle: "Join the next batch and start building with the squad.",
    stop: "04",
    highlights: ["Application flow", "Onboarding path", "Build tracks"],
  },
  {
    route: "/contact",
    title: "Contact",
    subtitle: "Open a direct channel with the core team.",
    stop: "05",
    highlights: ["Message desk", "Collaboration requests", "Community support"],
  },
];

const STATION_VISIBILITY_THRESHOLD = 0.035;
const STATION_PREVIEW_MS = 1000;
const WHEEL_PROGRESS_FACTOR = 0.0008;
const PROGRESS_SMOOTHING = 0.16;
const PROGRESS_EPSILON = 0.0006;
const ROUTE_END_THRESHOLD = 1 - PROGRESS_EPSILON;
const FOOTER_REDIRECT_COOLDOWN_MS = 700;
const LANE_PATH_START = 0.04;
const LANE_PATH_END = 0.965;

export default function TravelLandingPage() {
  const wheelAreaRef = useRef(null);
  const travelShellRef = useRef(null);
  const flightLaneRef = useRef(null);
  const touchYRef = useRef(null);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const footerRedirectAtRef = useRef(0);
  const motionFrameRef = useRef(null);
  const speedProgressPerSecondRef = useRef(0);
  const lastFrameTimeRef = useRef(null);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [isTravelling, setIsTravelling] = useState(false);
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const [visibleStationIndex, setVisibleStationIndex] = useState(0);
  const [showStation, setShowStation] = useState(true);
  const [travelVelocity, setTravelVelocity] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const stationCount = stations.length;
  const segments = Math.max(stationCount - 1, 1);
  const lanePathSpan = LANE_PATH_END - LANE_PATH_START;

  const stationPositions = useMemo(
    () => stations.map((_, index) => (segments <= 0 ? 0 : index / segments)),
    [segments]
  );

  const laneStopPositions = useMemo(
    () => stations.map((_, index) => LANE_PATH_START + (segments <= 0 ? 0 : (index / segments) * lanePathSpan)),
    [lanePathSpan, segments]
  );

  const nearestStationIndex = useMemo(() => {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    stationPositions.forEach((position, index) => {
      const distance = Math.abs(scrollProgress - position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }, [scrollProgress, stationPositions]);

  const nearestStationDistance = useMemo(() => {
    return Math.abs(scrollProgress - stationPositions[nearestStationIndex]);
  }, [scrollProgress, stationPositions, nearestStationIndex]);

  useEffect(() => {
    setActiveStationIndex(nearestStationIndex);
  }, [nearestStationIndex]);

  useEffect(() => {
    if (!showStation) {
      setVisibleStationIndex(nearestStationIndex);
    }
  }, [nearestStationIndex, showStation]);

  const planeBoost = useMemo(() => Math.min(1, travelVelocity * 1.3), [travelVelocity]);

  const planeProgress = useMemo(() => scrollProgress, [scrollProgress]);

  const planeDepth = useMemo(() => Math.min(1.28, scrollProgress + planeBoost * 0.35), [scrollProgress, planeBoost]);
  const planeScale = useMemo(
    () => Math.max(0.22, 1.22 - scrollProgress * 0.9 - planeBoost * 0.22),
    [scrollProgress, planeBoost]
  );
  const planeFade = useMemo(
    () => Math.max(0.48, 1 - scrollProgress * 0.46 - planeBoost * 0.12),
    [scrollProgress, planeBoost]
  );
  const planeX = useMemo(
    () => {
      const baseX = LANE_PATH_START + scrollProgress * lanePathSpan;
      const edgeTaper = Math.min(scrollProgress, 1 - scrollProgress) * 2;
      const wobble = Math.sin(planeProgress * Math.PI * 2.8) * 0.008 * edgeTaper;
      return Math.min(LANE_PATH_END, Math.max(LANE_PATH_START, baseX + wobble));
    },
    [lanePathSpan, planeProgress, scrollProgress]
  );
  const planeY = useMemo(() => 0.72 - scrollProgress * 0.36 - planeBoost * 0.03, [scrollProgress, planeBoost]);
  const planeHeading = useMemo(() => 10 - scrollProgress * 18 - planeBoost * 4, [scrollProgress, planeBoost]);
  const planeNose = useMemo(() => 8 + scrollProgress * 24 + planeBoost * 8, [scrollProgress, planeBoost]);
  const stationSideClass = activeStationIndex % 2 === 0 ? "is-left" : "is-right";

  const planeBank = useMemo(() => {
    return Math.sin(scrollProgress * Math.PI * 2.3) * 0.58;
  }, [scrollProgress]);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    return () => {
      if (motionFrameRef.current) {
        cancelAnimationFrame(motionFrameRef.current);
      }
    };
  }, []);

  function openStationWindow(stationIndex) {
    setVisibleStationIndex(stationIndex);
    setShowStation(true);
  }

  function clampProgress(value) {
    return Math.min(1, Math.max(0, value));
  }

  function startMotion() {
    if (motionFrameRef.current) {
      return;
    }

    const frame = (timestamp) => {
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;
      const delta = diff * PROGRESS_SMOOTHING;
      const next = Math.abs(diff) < PROGRESS_EPSILON ? target : current + delta;

      if (lastFrameTimeRef.current !== null) {
        const elapsedSeconds = Math.max((timestamp - lastFrameTimeRef.current) / 1000, 1 / 240);
        speedProgressPerSecondRef.current = Math.abs(next - current) / elapsedSeconds;
      }
      lastFrameTimeRef.current = timestamp;

      progressRef.current = next;
      setScrollProgress(next);

      const velocity = Math.abs(next - current);
      const normalizedVelocity = Math.min(1, velocity * 55);
      const moving = Math.abs(target - next) > PROGRESS_EPSILON;

      setTravelVelocity(normalizedVelocity);
      setIsTravelling(moving);

      if (next <= PROGRESS_EPSILON && target <= PROGRESS_EPSILON && !moving) {
        setJourneyStarted(false);
      }

      if (!moving) {
        motionFrameRef.current = null;
        setTravelVelocity(0);
        setIsTravelling(false);
        speedProgressPerSecondRef.current = 0;
        lastFrameTimeRef.current = null;
        return;
      }

      motionFrameRef.current = requestAnimationFrame(frame);
    };

    motionFrameRef.current = requestAnimationFrame(frame);
  }

  function updateTarget(nextTarget) {
    const clampedTarget = clampProgress(nextTarget);
    targetProgressRef.current = clampedTarget;

    if (clampedTarget > 0 && !journeyStarted) {
      startJourney();
    }

    if (journeyStarted || clampedTarget > 0) {
      startMotion();
    }
  }

  function redirectToFooter() {
    const now = Date.now();
    if (now - footerRedirectAtRef.current < FOOTER_REDIRECT_COOLDOWN_MS) {
      return;
    }

    footerRedirectAtRef.current = now;

    const travelShell = travelShellRef.current;
    const scroller = travelShell?.closest(".kp-public-scroll");

    if (!(scroller instanceof HTMLElement)) {
      return;
    }

    const footer = scroller.querySelector("footer");

    if (footer instanceof HTMLElement) {
      const scrollerRect = scroller.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const targetTop = scroller.scrollTop + (footerRect.top - scrollerRect.top);

      scroller.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      return;
    }

    scroller.scrollBy({
      top: scroller.clientHeight,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (!journeyStarted) {
      return;
    }

    const speed = speedProgressPerSecondRef.current;
    const etaToNearestMs = speed > 0 ? (nearestStationDistance / speed) * 1000 : Number.POSITIVE_INFINITY;

    if (etaToNearestMs <= STATION_PREVIEW_MS || nearestStationDistance <= STATION_VISIBILITY_THRESHOLD) {
      openStationWindow(nearestStationIndex);
    }
  }, [journeyStarted, nearestStationDistance, nearestStationIndex, scrollProgress]);

  useEffect(() => {
    const onGlobalWheel = (event) => {
      const flightLane = flightLaneRef.current;
      const insideFlightLane =
        Boolean(flightLane) && event.target instanceof Node && flightLane.contains(event.target);
      const scrollingDown = event.deltaY > 0;
      const atRouteEnd =
        progressRef.current >= ROUTE_END_THRESHOLD &&
        targetProgressRef.current >= ROUTE_END_THRESHOLD;

      // Scrolling outside the rectangular travel lane should move the page.
      if (!insideFlightLane) {
        return;
      }

      if (!journeyStarted) {
        if (event.deltaY <= 0) {
          return;
        }
        event.preventDefault();
        updateTarget(targetProgressRef.current + event.deltaY * WHEEL_PROGRESS_FACTOR);
        return;
      }

      // Once the aircraft is already at the final station, release wheel-down
      // and send the user to the footer section.
      if (scrollingDown && atRouteEnd) {
        event.preventDefault();
        redirectToFooter();
        return;
      }

      event.preventDefault();
      updateTarget(targetProgressRef.current + event.deltaY * WHEEL_PROGRESS_FACTOR);
    };

    window.addEventListener("wheel", onGlobalWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onGlobalWheel);
    };
  }, [journeyStarted]);

  function startJourney() {
    setJourneyStarted((current) => {
      if (current) {
        return current;
      }

      window.requestAnimationFrame(() => {
        wheelAreaRef.current?.focus();
      });

      return true;
    });
  }

  function handleStationSelect(stationIndex) {
    if (!Number.isInteger(stationIndex) || stationIndex < 0 || stationIndex >= stationCount) {
      return;
    }

    startJourney();
    openStationWindow(stationIndex);
    updateTarget(stationPositions[stationIndex]);
  }

  function handleLaneKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      updateTarget(targetProgressRef.current + 0.08);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      updateTarget(targetProgressRef.current - 0.08);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      updateTarget(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      updateTarget(1);
    }
  }

  function handleLaneTouchStart(event) {
    if (event.touches.length !== 1) {
      return;
    }

    touchYRef.current = event.touches[0].clientY;
    startJourney();
  }

  function handleLaneTouchMove(event) {
    if (event.touches.length !== 1 || touchYRef.current === null) {
      return;
    }

    const nextY = event.touches[0].clientY;
    const deltaY = touchYRef.current - nextY;
    touchYRef.current = nextY;

    if (Math.abs(deltaY) < 0.6) {
      return;
    }

    const atRouteEnd =
      progressRef.current >= ROUTE_END_THRESHOLD &&
      targetProgressRef.current >= ROUTE_END_THRESHOLD;

    if (deltaY > 0 && atRouteEnd) {
      if (event.cancelable) {
        event.preventDefault();
      }
      redirectToFooter();
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    updateTarget(targetProgressRef.current + deltaY * WHEEL_PROGRESS_FACTOR * 1.6);
  }

  function handleLaneTouchEnd() {
    touchYRef.current = null;
  }

  return (
    <main className="travel-page">
      <div className="travel-backdrop" aria-hidden="true" />
      <div className="travel-grid" aria-hidden="true">
        <span className="travel-dot travel-dot-a" />
        <span className="travel-dot travel-dot-b" />
        <span className="travel-dot travel-dot-c" />
      </div>

      <section className="travel-shell" ref={travelShellRef}>
        <div
          className="travel-scroll-route"
          onKeyDown={handleLaneKeyDown}
          ref={wheelAreaRef}
          role="application"
          tabIndex={0}
        >
          <div className="travel-flight-stage">
            <div
              className="travel-flight-lane allow-accent-border"
              aria-label="Landing route preview"
              onTouchCancel={handleLaneTouchEnd}
              onTouchEnd={handleLaneTouchEnd}
              onTouchMove={handleLaneTouchMove}
              onTouchStart={handleLaneTouchStart}
              ref={flightLaneRef}
              style={{
                "--travel-progress": planeProgress,
                "--travel-depth": planeDepth,
                "--travel-boost": planeBoost,
                "--travel-scale": planeScale,
                "--travel-fade": planeFade,
                "--travel-bank": planeBank,
                "--travel-x": planeX,
                "--travel-y": planeY,
                "--travel-heading": planeHeading,
                "--travel-nose": planeNose,
              }}
            >
              <div className="travel-lane-rings">
                <span className="travel-lane-ring" />
                <span className="travel-lane-ring" />
                <span className="travel-lane-ring" />
                <span className="travel-lane-ring" />
                <span className="travel-lane-ring" />
              </div>

              <div className="travel-cloud-belt">
                <span className="travel-cloud" />
                <span className="travel-cloud" />
                <span className="travel-cloud" />
                <span className="travel-cloud" />
                <span className="travel-cloud" />
                <span className="travel-cloud travel-cloud-foreground" />
                <span className="travel-cloud travel-cloud-foreground" />
              </div>

              <span className="travel-flight-dot" />
              <span className="travel-flight-dot" />
              <span className="travel-flight-dot" />
              <span className="travel-flight-dot" />
              <span className="travel-flight-dot" />

              <div className="travel-lane-stops">
                {stations.map((station, index) => (
                  <span
                    className={`travel-lane-stop ${index === activeStationIndex ? "is-active" : ""}`}
                    key={station.stop}
                    style={{ left: `${laneStopPositions[index] * 100}%` }}
                  >
                    <span>{station.stop}</span>
                  </span>
                ))}
              </div>

              <span className="travel-plane-wrap">
                <span className="travel-plane-3d">
                  <svg className="travel-plane" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M198 53L110 16C101 12 91 17 88 26L81 50L42 48L21 35C17 32 11 34 8 39C4 44 6 51 11 54L30 66L27 78L13 84C8 86 6 92 8 97C11 102 17 104 22 101L44 88L82 91L92 111C95 119 104 123 112 120C121 117 126 107 123 98L116 76L198 66C208 65 216 57 216 50C216 42 208 35 198 34V53Z"
                      fill="currentColor"
                    />
                    <path d="M130 42L162 36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.65" />
                    <path d="M125 76L162 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.65" />
                    <circle cx="84" cy="68" r="5" fill="#111" opacity="0.38" />
                    <path d="M16 61H35" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity="0.7" />
                  </svg>
                </span>
              </span>

              <div className={`travel-scene-copy ${stationSideClass}`}>
                <span className={`travel-stop-code ${showStation ? "is-visible" : "is-hidden"}`}>
                  Station {stations[visibleStationIndex].stop}
                </span>
                <h2 className={showStation ? "is-visible" : "is-hidden"}>{stations[visibleStationIndex].title}</h2>
                <p className={showStation ? "is-visible" : "is-hidden"}>{stations[visibleStationIndex].subtitle}</p>
                <ul className={`travel-stop-highlights ${showStation ? "is-visible" : "is-hidden"}`}>
                  {stations[visibleStationIndex].highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <Link
                  className={`travel-jump allow-accent-border ${showStation ? "is-visible" : "is-hidden"}`}
                  to={stations[visibleStationIndex].route}
                >
                  Enter {stations[visibleStationIndex].title}
                </Link>
              </div>
            </div>
          </div>

          <div aria-label="Route stations" className="travel-station-rail" role="tablist">
            {stations.map((station, index) => (
              <button
                aria-selected={index === activeStationIndex}
                className={`travel-station-tab allow-accent-border ${index === activeStationIndex ? "is-active" : ""}`}
                key={station.stop}
                onClick={() => handleStationSelect(index)}
                type="button"
              >
                <span>{station.stop}</span>
                {station.title}
              </button>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}
