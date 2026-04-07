import { useState } from "react";

import TimelineForm from "../../components/admin/TimelineForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useFetch } from "../../hooks/useFetch";
import { timelineService } from "../../services/timelineService";

export default function ManageTimeline() {
  const { data, error, loading, refetch } = useFetch(timelineService.getAdminAll);
  const [activeItem, setActiveItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (activeItem) {
        await timelineService.update(activeItem.id, payload);
        setToast({ type: "success", message: "Timeline entry updated." });
      } else {
        await timelineService.create(payload);
        setToast({ type: "success", message: "Timeline entry created." });
      }
      setActiveItem(null);
      refetch();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to save timeline entry.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingItem) {
      return;
    }
    setDeleting(true);
    try {
      await timelineService.remove(deletingItem.id);
      setToast({ type: "success", message: "Timeline entry deleted." });
      setDeletingItem(null);
      refetch();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to delete timeline entry.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete milestone"
        loading={deleting}
        message={`Delete ${deletingItem?.title || "this milestone"}?`}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingItem)}
        title="Confirm delete"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Timeline" radius={85} />
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            <VariableText label="Curate club milestones and historical order" />
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveItem(null)} type="button">
          <VariableText label="New milestone" radius={85} />
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TimelineForm
          initialData={activeItem}
          loading={saving}
          onCancel={() => setActiveItem(null)}
          onSubmit={handleSave}
        />

        <div className="admin-card">
          <h2 className="text-2xl font-semibold">
            <VariableText label="Timeline list" />
          </h2>
          {loading ? <LoadingSpinner label="Loading timeline..." /> : null}
          {error ? <ErrorMessage message={error} onRetry={refetch} /> : null}
          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {data?.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {item.year} • sort {item.sort_order}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveItem(item)} type="button">
                        <VariableText label="Edit" radius={85} />
                      </button>
                      <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingItem(item)} type="button">
                        <VariableText label="Delete" radius={85} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
