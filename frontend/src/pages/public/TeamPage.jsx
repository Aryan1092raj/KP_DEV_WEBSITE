import { Skeleton } from "boneyard-js/react";

import { TeamGridFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import MemberCard from "../../components/public/MemberCard";
import { useFetch } from "../../hooks/useFetch";
import { memberService } from "../../services/memberService";

const fixtureMembers = [
  {
    id: "fixture-member-1",
    name: "Aarav Sharma",
    role: "Coordinator",
    bio: "Leads systems initiatives and keeps major build tracks moving.",
    batch: "2023",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-member-2",
    name: "Isha Verma",
    role: "Backend Lead",
    bio: "Owns API design, data modeling, and reliability in club services.",
    batch: "2022",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-member-3",
    name: "Rohit Menon",
    role: "Frontend Lead",
    bio: "Builds expressive interfaces with strong interaction and motion design.",
    batch: "2024",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-member-4",
    name: "Nisha Rao",
    role: "ML Engineer",
    bio: "Develops evaluation pipelines for applied AI and prompt workflows.",
    batch: "2023",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-member-5",
    name: "Kabir Singh",
    role: "Infra Engineer",
    bio: "Maintains local-dev and deployment paths for club platforms.",
    batch: "2022",
    github_url: "#",
    linkedin_url: "#",
  },
  {
    id: "fixture-member-6",
    name: "Diya Kapoor",
    role: "Community Ops",
    bio: "Runs events, communication loops, and contributor onboarding.",
    batch: "2024",
    github_url: "#",
    linkedin_url: "#",
  },
];

export default function TeamPage() {
  const { data, error, loading, refetch } = useFetch(memberService.getAll);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;

  return (
    <div className="page-shell space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          Core team
        </p>
        <h1 className="mt-3 text-4xl font-bold">The builders behind Kamand Prompt</h1>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<TeamGridFallback />}
          fixture={
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {fixtureMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          }
          loading={boneyardBuildMode || loading}
          name="team-grid"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(data ?? []).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
