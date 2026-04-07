import { useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { AdminApplicationsFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useFetch } from "../../hooks/useFetch";
import { applicationService } from "../../services/applicationService";

const statuses = ["pending", "accepted", "rejected"];
const fixtureApplications = [
  {
    id: "fixture-application-1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    branch: "CSE",
    batch: "2023",
    status: "pending",
    why_join: "I want to contribute to production-grade student systems.",
    skills: "React, Python",
  },
  {
    id: "fixture-application-2",
    name: "Ishita Verma",
    email: "ishita@example.com",
    branch: "EE",
    batch: "2024",
    status: "accepted",
    why_join: "Looking to grow in systems design and community collaboration.",
    skills: "C++, Figma",
  },
];

export default function ViewApplications() {
  const { data, error, loading, refetch } = useFetch(applicationService.getAdminAll);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast] = useState(null);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const applications =
    boneyardBuildMode || loading || !(data ?? []).length ? fixtureApplications : data ?? [];

  async function updateStatus(id, status) {
    setPendingId(id);
    try {
      await applicationService.updateStatus(id, { status });
      setToast({ type: "success", message: "Application status updated." });
      refetch();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to update application status.",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="Join applications" radius={85} />
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          <VariableText label="Review, accept, or reject club applicants" />
        </h1>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<AdminApplicationsFallback />}
          fixture={<AdminApplicationsFallback />}
          loading={boneyardBuildMode || loading}
          name="admin-view-applications"
        >
          <div className="grid gap-5">
            {applications.map((application) => (
              <div className="admin-card" key={application.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{application.name}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {application.email} • {application.branch} • {application.batch}
                    </p>
                  </div>
                  <span className="chip">{application.status}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {application.why_join}
                </p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                  Skills: {application.skills || "Not specified"}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      className={status === "rejected" ? "btn-danger !px-4 !py-2" : "btn-secondary !px-4 !py-2"}
                      disabled={pendingId === application.id}
                      onClick={() => updateStatus(application.id, status)}
                      type="button"
                    >
                      <VariableText
                        label={pendingId === application.id ? "Updating..." : `Mark ${status}`}
                        radius={85}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
