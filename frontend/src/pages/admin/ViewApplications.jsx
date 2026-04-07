import { useState } from "react";

import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toast from "../../components/common/Toast";
import { useFetch } from "../../hooks/useFetch";
import { applicationService } from "../../services/applicationService";

const statuses = ["pending", "accepted", "rejected"];

export default function ViewApplications() {
  const { data, error, loading, refetch } = useFetch(applicationService.getAdminAll);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast] = useState(null);

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
          Join applications
        </p>
        <h1 className="mt-3 text-4xl font-bold">Review, accept, or reject club applicants</h1>
      </div>

      {loading ? <LoadingSpinner label="Loading applications..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!loading && !error ? (
        <div className="grid gap-5">
          {data?.map((application) => (
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
                    {pendingId === application.id ? "Updating..." : `Mark ${status}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
