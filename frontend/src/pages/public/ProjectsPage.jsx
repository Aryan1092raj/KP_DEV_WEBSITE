import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "boneyard-js/react";

import { ProjectsPageFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import ProjectCard from "../../components/public/ProjectCard";
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
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
                <VariableText label="Projects showcase" />
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                <VariableText label="Build archive from across the club" />
              </h1>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {projectsToRender.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
