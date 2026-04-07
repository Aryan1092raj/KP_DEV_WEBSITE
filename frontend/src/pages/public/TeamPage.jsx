import { useMemo } from "react";
import { Skeleton } from "boneyard-js/react";

import kpLogo from "../../assets/kp-logo.png";
import { TeamGridFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import CircularGallery from "../../components/public/CircularGallery";
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

function isValidImageSource(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "#") {
    return false;
  }

  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  );
}

export default function TeamPage() {
  const { data, error, loading, refetch } = useFetch(memberService.getAll);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const membersToRender = boneyardBuildMode || loading || !(data ?? []).length ? fixtureMembers : data ?? [];

  const galleryItems = useMemo(
    () =>
      membersToRender.map((member, index) => {
        const image = isValidImageSource(member.photo_url) ? member.photo_url.trim() : kpLogo;
        const text = member.name || `Member ${index + 1}`;
        return { image, text };
      }),
    [membersToRender],
  );

  return (
    <div className="page-shell space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="Core team" />
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          <VariableText label="The builders behind Kamand Prompt" />
        </h1>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      <section className="section-card !p-0">
        <div className="h-[340px] overflow-hidden rounded-[28px] sm:h-[420px]">
          <CircularGallery
            bend={1}
            borderRadius={0.05}
            items={galleryItems}
            scrollEase={0.05}
            scrollSpeed={2}
            textColor="#ffffff"
          />
        </div>
      </section>

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
