import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "boneyard-js/react";

import { ProjectsPageFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import ProjectCard from "../../components/public/ProjectCard";
import { useOneTimePageHeadingAnimation } from "../../hooks/useOneTimePageHeadingAnimation";
import { projectService } from "../../services/projectService";

const fixtureProjects = [
  {
    id: "fixture-project-1",
    status: "Active",
    title: "OrbitOps",
    year: "2026",
    description:
      "A student-built platform for planning experiments, collecting telemetry, and sharing findings across teams.",
    tech_stack: ["React", "FastAPI", "Supabase"],
    contributors: [{ member_name: "KP Core" }, { member_name: "Systems Team" }],
    github_url: "#",
    live_url: "#",
  },
  {
    id: "fixture-project-2",
    status: "Research",
    title: "Prompt Forge",
    year: "2025",
    description:
      "A lightweight experimentation stack for evaluating LLM prompt strategies and documenting repeatable workflows.",
    tech_stack: ["Python", "PostgreSQL", "Docker"],
    contributors: [{ member_name: "Applied ML" }],
    github_url: "#",
    live_url: null,
  },
  {
    id: "fixture-project-3",
    status: "Completed",
    title: "Hack Night Hub",
    year: "2024",
    description:
      "An internal dashboard that tracks teams, demos, and outcomes across recurring club hack sessions.",
    tech_stack: ["Vite", "Tailwind", "Node"],
    contributors: [{ member_name: "Frontend Crew" }],
    github_url: "#",
    live_url: "#",
  },
  {
    id: "fixture-project-4",
    status: "Active",
    title: "Edge Vision Kit",
    year: "2026",
    description:
      "A field-ready computer vision toolkit focused on low-latency inference for robotics prototypes.",
    tech_stack: ["C++", "OpenCV", "Python"],
    contributors: [{ member_name: "Robotics Wing" }],
    github_url: "#",
    live_url: null,
  },
];

export default function ProjectsPage() {
  const motionScopeRef = useRef(null);
  const cardRefs = useRef(new Map());
  const previousRectsRef = useRef(new Map());
  const [isBlockHovered, setIsBlockHovered] = useState(false);
  const [projectOrder, setProjectOrder] = useState([]);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getAll,
    enabled: !boneyardBuildMode,
    staleTime: 120_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
  const loading = boneyardBuildMode || isLoading;
  const projectsToRender = loading ? fixtureProjects : data ?? [];
  const errorMessage = !boneyardBuildMode && error ? error.message || "Unable to load projects." : "";
  const showError = Boolean(errorMessage);

  const orderedProjects = useMemo(() => {
    if (!projectOrder.length) {
      return projectsToRender;
    }

    const projectById = new Map(projectsToRender.map((project) => [project.id, project]));
    const sorted = projectOrder.map((id) => projectById.get(id)).filter(Boolean);
    const missing = projectsToRender.filter((project) => !projectOrder.includes(project.id));

    return [...sorted, ...missing];
  }, [projectOrder, projectsToRender]);

  useOneTimePageHeadingAnimation({
    enabled: !loading && !showError,
    scopeRef: motionScopeRef,
    visitTag: "projects",
  });

  useEffect(() => {
    const nextIds = projectsToRender.map((project) => project.id);

    setProjectOrder((current) => {
      if (!current.length) {
        return nextIds;
      }

      const retained = current.filter((id) => nextIds.includes(id));
      const missing = nextIds.filter((id) => !retained.includes(id));
      return [...retained, ...missing];
    });
  }, [projectsToRender]);

  useEffect(() => {
    if (showError || orderedProjects.length < 2 || isBlockHovered) {
      return;
    }

    const interval = window.setInterval(() => {
      const rectMap = new Map();

      orderedProjects.forEach((project) => {
        const element = cardRefs.current.get(project.id);
        if (element) {
          rectMap.set(project.id, element.getBoundingClientRect());
        }
      });

      previousRectsRef.current = rectMap;

      setProjectOrder((current) => {
        if (current.length < 2) {
          return current;
        }

        const [first, ...rest] = current;
        return [...rest, first];
      });
    }, 2600);

    return () => {
      window.clearInterval(interval);
    };
  }, [isBlockHovered, orderedProjects, showError]);

  useEffect(() => {
    const animations = [];

    previousRectsRef.current.forEach((previousRect, id) => {
      const element = cardRefs.current.get(id);
      if (!element) {
        return;
      }

      const nextRect = element.getBoundingClientRect();
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        return;
      }

      const movementAnimation = animate(element, {
        translateX: [deltaX, 0],
        translateY: [deltaY, 0],
        duration: 900,
        ease: "inOut(3)",
      });

      animations.push(movementAnimation);
    });

    previousRectsRef.current.clear();

    return () => {
      animations.forEach((animation) => animation?.pause?.());
    };
  }, [projectOrder]);

  return (
    <div className="page-shell">
      {showError ? <ErrorMessage message={errorMessage} onRetry={refetch} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<ProjectsPageFallback />}
          fixture={<ProjectsPageFallback />}
          loading={boneyardBuildMode || loading}
          name={boneyardBuildMode ? "projects-grid" : undefined}
        >
          <div className="space-y-6" ref={motionScopeRef}>
            <div>
              <p className="page-heading-anim text-sm font-semibold uppercase tracking-[0.28em] text-ember">
                <VariableText label="Projects showcase" />
              </p>
              <h1 className="page-heading-anim mt-3 text-4xl font-bold">
                <VariableText label="Build archive from across the club" />
              </h1>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {orderedProjects.map((project) => (
                <div
                  className="project-motion-shell"
                  key={project.id}
                  onBlur={() => setIsBlockHovered(false)}
                  onFocus={() => setIsBlockHovered(true)}
                  onPointerEnter={() => setIsBlockHovered(true)}
                  onPointerLeave={() => setIsBlockHovered(false)}
                  ref={(element) => {
                    if (element) {
                      cardRefs.current.set(project.id, element);
                    } else {
                      cardRefs.current.delete(project.id);
                    }
                  }}
                >
                  <span className="square project-square" aria-hidden="true" />
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
