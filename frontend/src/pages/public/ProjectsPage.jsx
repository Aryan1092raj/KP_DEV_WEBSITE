import { Skeleton } from "boneyard-js/react";

import { CardGridFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import ProjectCard from "../../components/public/ProjectCard";
import { useFetch } from "../../hooks/useFetch";
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
  const { data, error, loading, refetch } = useFetch(projectService.getAll);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;

  return (
    <div className="page-shell space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="Projects showcase" />
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          <VariableText label="Full build archive from the club database" />
        </h1>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<CardGridFallback columns="lg:grid-cols-2" count={4} />}
          fixture={
            <div className="grid gap-5 lg:grid-cols-2">
              {fixtureProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          }
          loading={boneyardBuildMode || loading}
          name="projects-grid"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {(data ?? []).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
