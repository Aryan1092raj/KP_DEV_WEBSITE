import { Skeleton } from "boneyard-js/react";

import { CardGridFallback } from "../../components/common/BoneyardFallbacks";
import BounceCards from "../../components/common/BounceCards";
import ErrorMessage from "../../components/common/ErrorMessage";
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
  const sourceProjects = (data?.length ? data : fixtureProjects).slice(0, 5);
  const projectShowcaseCards = sourceProjects.map((project) => ({
    id: project.id,
    title: project.title,
    subtitle: project.status || "project",
    description: project.description,
    badge: project.year ? String(project.year) : project.tech_stack?.[0] || "Build",
    href: project.live_url || project.github_url || "/projects",
    imageUrl: project.thumbnail_url || "",
    cta: project.live_url ? "Live demo" : project.github_url ? "GitHub" : "View",
  }));

  return (
    <div className="page-shell space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          Projects showcase
        </p>
        <h1 className="mt-3 text-4xl font-bold">Full build archive from the club database</h1>
      </div>

      <section className="section-card overflow-hidden">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          Visual stack
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Project quick cards</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Live records from database rendered as clickable cards.
        </p>
        <div className="mt-5">
          <BounceCards
            animationDelay={0.2}
            cards={projectShowcaseCards}
            containerHeight={280}
            containerWidth="100%"
            enableHover={!boneyardBuildMode}
            imageAltPrefix="project"
          />
        </div>
      </section>

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
