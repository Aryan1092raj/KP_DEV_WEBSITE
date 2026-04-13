import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Skeleton } from "boneyard-js/react";

import {
  CardGridFallback,
  HomeHeroFallback,
  StatsFallback,
  TeamGridFallback,
} from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import AnnouncementCard from "../../components/public/AnnouncementCard";
import HeroSection from "../../components/public/HeroSection";
import MemberCard from "../../components/public/MemberCard";
import ProjectCard from "../../components/public/ProjectCard";
import StatsBar from "../../components/public/StatsBar";
import { announcementService } from "../../services/announcementService";
import { memberService } from "../../services/memberService";
import { projectService } from "../../services/projectService";

const statsFixture = [
  { label: "Active members", value: 12 },
  { label: "Featured builds", value: 4 },
  { label: "Years of momentum", value: 6 },
];

const projectFixture = [
  {
    id: "fixture-home-project-1",
    status: "Active",
    title: "OrbitOps",
    year: "2026",
    description:
      "A student-built platform for planning experiments, collecting telemetry, and sharing findings across teams.",
    tech_stack: ["React", "FastAPI", "Supabase"],
    contributors: [{ member_name: "KP Core" }],
    github_url: "#",
    live_url: "#",
  },
  {
    id: "fixture-home-project-2",
    status: "Research",
    title: "Prompt Forge",
    year: "2025",
    description:
      "A lightweight experimentation stack for evaluating LLM prompt strategies and documenting repeatable workflows.",
    tech_stack: ["Python", "Docker", "PostgreSQL"],
    contributors: [{ member_name: "Applied ML" }],
    github_url: "#",
    live_url: null,
  },
];

const announcementFixture = [
  {
    id: "fixture-home-announcement-1",
    author: "Core Team",
    title: "Spring build sprint opens",
    body: "Project tracks are live. Pick your lane and start shipping from week one.",
    published_at: "2026-04-01",
  },
  {
    id: "fixture-home-announcement-2",
    author: "Events Desk",
    title: "Systems design workshop",
    body: "Join the new architecture session focused on reliability and platform evolution.",
    published_at: "2026-03-28",
  },
  {
    id: "fixture-home-announcement-3",
    author: "Mentor Circle",
    title: "Code review office hours",
    body: "Drop in with your PRs for direct feedback from maintainers and alumni.",
    published_at: "2026-03-22",
  },
];

function isBoneyardBuildMode() {
  return typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
}

async function fetchHomeData() {
  const [projects, members, announcements] = await Promise.all([
    projectService.getFeatured(),
    memberService.getAll(),
    announcementService.getPublished(),
  ]);

  return { announcements, members, projects };
}

const EMPTY_HOME_DATA = {
  announcements: [],
  members: [],
  projects: [],
};

function HomeProjectsPreviewFixture() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {projectFixture.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function HomeAnnouncementsFixture() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="Announcements" />
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          <VariableText label="What the club is saying this week" />
        </h2>
      </div>
      <div className="grid gap-5">
        {announcementFixture.map((announcement) => (
          <AnnouncementCard announcement={announcement} key={announcement.id} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const boneyardBuildMode = isBoneyardBuildMode();
  const {
    data = EMPTY_HOME_DATA,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
    enabled: !boneyardBuildMode,
    staleTime: 120_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });

  const errorMessage =
    !boneyardBuildMode && error ? error.message || "Unable to load the homepage." : "";
  const loading = boneyardBuildMode || isLoading;

  if (loading) {
    return (
      <div className="page-shell space-y-6">
        <Skeleton
          fallback={<HomeHeroFallback />}
          fixture={<HeroSection stats={statsFixture} />}
          loading
          name={boneyardBuildMode ? "home-hero" : undefined}
        >
          <HeroSection stats={statsFixture} />
        </Skeleton>
        <Skeleton
          fallback={<StatsFallback />}
          fixture={<StatsBar stats={statsFixture} />}
          loading
          name={boneyardBuildMode ? "home-stats" : undefined}
        >
          <StatsBar stats={statsFixture} />
        </Skeleton>
        <Skeleton
          fallback={<CardGridFallback columns="lg:grid-cols-2" count={2} />}
          fixture={<HomeProjectsPreviewFixture />}
          loading
          name={boneyardBuildMode ? "home-projects-preview" : undefined}
        >
          <HomeProjectsPreviewFixture />
        </Skeleton>
        <Skeleton
          fallback={<TeamGridFallback />}
          fixture={<TeamGridFallback />}
          loading
          name={boneyardBuildMode ? "home-team-preview" : undefined}
        >
          <TeamGridFallback />
        </Skeleton>
        <Skeleton
          fallback={<CardGridFallback count={3} />}
          fixture={<HomeAnnouncementsFixture />}
          loading
        >
          <HomeAnnouncementsFixture />
        </Skeleton>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-shell">
        <ErrorMessage message={errorMessage} onRetry={refetch} />
      </div>
    );
  }

  const numericProjectYears = data.projects
    .map((project) => Number(project?.year))
    .filter((year) => Number.isFinite(year));
  const firstYear =
    numericProjectYears.length > 0
      ? Math.min(...numericProjectYears)
      : new Date().getFullYear();
  const stats = [
    { label: "Active members", value: data.members.length },
    { label: "Featured builds", value: data.projects.length },
    { label: "Years of momentum", value: new Date().getFullYear() - firstYear + 1 },
  ];

  return (
    <div className="page-shell space-y-10">
      <HeroSection stats={stats} />
      <StatsBar stats={stats} />

      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              <VariableText label="Featured projects" />
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              <VariableText label="What the club is building right now" />
            </h2>
          </div>
          <Link className="btn-secondary" to="/projects">
            <VariableText label="See all projects" radius={85} />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {data.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              <VariableText label="Core team" />
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              <VariableText label="People who keep the loop alive" />
            </h2>
          </div>
          <Link className="btn-secondary" to="/team">
            <VariableText label="Meet the team" radius={85} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.members.slice(0, 6).map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Announcements" />
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            <VariableText label="What the club is saying this week" />
          </h2>
        </div>
        <div className="grid gap-5">
          {data.announcements.slice(0, 3).map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
