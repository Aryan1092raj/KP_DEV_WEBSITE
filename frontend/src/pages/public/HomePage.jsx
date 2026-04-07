import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "boneyard-js/react";

import {
  CardGridFallback,
  HomeHeroFallback,
  StatsFallback,
  TeamGridFallback,
  TimelineAnnouncementFallback,
} from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import AnnouncementCard from "../../components/public/AnnouncementCard";
import HeroSection from "../../components/public/HeroSection";
import MemberCard from "../../components/public/MemberCard";
import ProjectCard from "../../components/public/ProjectCard";
import StatsBar from "../../components/public/StatsBar";
import TimelineItem from "../../components/public/TimelineItem";
import { announcementService } from "../../services/announcementService";
import { memberService } from "../../services/memberService";
import { projectService } from "../../services/projectService";
import { timelineService } from "../../services/timelineService";

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

const memberFixture = [
  {
    id: "fixture-home-member-1",
    name: "Aarav Sharma",
    role: "Coordinator",
    bio: "Leads systems initiatives and keeps major build tracks moving.",
    batch: "2023",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-home-member-2",
    name: "Isha Verma",
    role: "Backend Lead",
    bio: "Owns platform architecture, data quality, and service reliability.",
    batch: "2022",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-home-member-3",
    name: "Rohit Menon",
    role: "Frontend Lead",
    bio: "Builds expressive interfaces with strong interaction and motion design.",
    batch: "2024",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-home-member-4",
    name: "Nisha Rao",
    role: "ML Engineer",
    bio: "Develops evaluation pipelines for applied AI and prompt workflows.",
    batch: "2023",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-home-member-5",
    name: "Kabir Singh",
    role: "Infra Engineer",
    bio: "Maintains local-dev and deployment paths for club platforms.",
    batch: "2022",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-home-member-6",
    name: "Diya Kapoor",
    role: "Community Ops",
    bio: "Runs events, communication loops, and contributor onboarding.",
    batch: "2024",
    github_url: "#",
    linkedin_url: "#",
  },
];

const timelineFixture = [
  {
    id: "fixture-home-timeline-1",
    year: "2019",
    title: "Club foundation",
    description: "Kamand Prompt starts with weekly programming circles and hands-on mentoring.",
  },
  {
    id: "fixture-home-timeline-2",
    year: "2021",
    title: "Build-track launch",
    description: "Project squads form around web, systems, and applied ML problem statements.",
  },
  {
    id: "fixture-home-timeline-3",
    year: "2023",
    title: "Public demo days",
    description: "Semester-end showcases begin with open demos, talks, and code walkthroughs.",
  },
  {
    id: "fixture-home-timeline-4",
    year: "2025",
    title: "Platform unification",
    description: "A shared backend and admin stack powers announcements, events, and applications.",
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

export default function HomePage() {
  const [data, setData] = useState({
    announcements: [],
    members: [],
    projects: [],
    timeline: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const boneyardBuildMode = isBoneyardBuildMode();

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [projects, members, timeline, announcements] = await Promise.all([
        projectService.getFeatured(),
        memberService.getAll(),
        timelineService.getAll(),
        announcementService.getPublished(),
      ]);

      setData({ announcements, members, projects, timeline });
    } catch (requestError) {
      setError(requestError.message || "Unable to load the homepage.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (boneyardBuildMode) {
      return;
    }
    load();
  }, [boneyardBuildMode]);

  if (loading || boneyardBuildMode) {
    return (
      <div className="page-shell space-y-6">
        <Skeleton
          fallback={<HomeHeroFallback />}
          fixture={<HeroSection stats={statsFixture} />}
          loading
          name="home-hero"
        >
          <HeroSection stats={statsFixture} />
        </Skeleton>
        <Skeleton
          fallback={<StatsFallback />}
          fixture={<StatsBar stats={statsFixture} />}
          loading
          name="home-stats"
        >
          <StatsBar stats={statsFixture} />
        </Skeleton>
        <Skeleton
          fallback={<CardGridFallback columns="lg:grid-cols-2" count={2} />}
          fixture={
            <div className="grid gap-5 lg:grid-cols-2">
              {projectFixture.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          }
          loading
          name="home-projects-preview"
        >
          <CardGridFallback columns="lg:grid-cols-2" count={2} />
        </Skeleton>
        <Skeleton
          fallback={<TeamGridFallback />}
          fixture={
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {memberFixture.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          }
          loading
          name="home-team-preview"
        >
          <TeamGridFallback />
        </Skeleton>
        <Skeleton
          fallback={<TimelineAnnouncementFallback />}
          fixture={
            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="section-card space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
                    <VariableText label="Club timeline" />
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">
                    <VariableText label="Milestones that shaped KP" />
                  </h2>
                </div>
                {timelineFixture.map((item) => (
                  <TimelineItem item={item} key={item.id} />
                ))}
              </div>

              <div className="space-y-5">
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
              </div>
            </section>
          }
          loading
          name="home-timeline-announcements"
        >
          <TimelineAnnouncementFallback />
        </Skeleton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  const firstYear = data.timeline[0]?.year || new Date().getFullYear();
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
        <div className="flex items-center justify-between gap-4">
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
        <div className="flex items-center justify-between gap-4">
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

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-card space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              <VariableText label="Club timeline" />
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              <VariableText label="Milestones that shaped KP" />
            </h2>
          </div>
          {data.timeline.slice(0, 5).map((item) => (
            <TimelineItem item={item} key={item.id} />
          ))}
        </div>

        <div className="space-y-5">
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
        </div>
      </section>
    </div>
  );
}
