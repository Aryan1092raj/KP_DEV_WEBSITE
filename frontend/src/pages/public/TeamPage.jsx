import { useMemo } from "react";
import { Skeleton } from "boneyard-js/react";

import kpLogo from "../../assets/kp-logo.png";
import { TeamPageFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import CircularGallery from "../../components/public/CircularGallery";
import MemberCard from "../../components/public/MemberCard";
import { useFetch } from "../../hooks/useFetch";
import { memberService } from "../../services/memberService";

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
  const membersToRender = Array.isArray(data) ? data : [];

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
    <div className="page-shell">
      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<TeamPageFallback />}
          fixture={<TeamPageFallback />}
          loading={boneyardBuildMode || loading}
          name={boneyardBuildMode ? "team-grid" : undefined}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
                <VariableText label="Core team" />
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                <VariableText label="The builders behind Kamand Prompt" />
              </h1>
            </div>

            <section className="section-card !p-0">
              {membersToRender.length > 0 ? (
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
              ) : (
                <div className="p-8 text-sm text-slate-600 dark:text-slate-300">
                  Team members will appear here once published from admin.
                </div>
              )}
            </section>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {membersToRender.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
