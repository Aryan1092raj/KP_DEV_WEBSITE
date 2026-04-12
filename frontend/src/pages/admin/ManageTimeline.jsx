import { Skeleton } from "boneyard-js/react";

import TimelineForm from "../../components/admin/TimelineForm";
import { AdminCrudPageFallback } from "../../components/common/BoneyardFallbacks";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useAdminCrudPage } from "../../hooks/useAdminCrudPage";
import { useFetch } from "../../hooks/useFetch";
import { timelineService } from "../../services/timelineService";

const fixtureTimeline = [
  { id: "fixture-milestone-1", title: "Club foundation", year: "2019", sort_order: 1 },
  { id: "fixture-milestone-2", title: "Demo day launch", year: "2023", sort_order: 2 },
];

export default function ManageTimeline() {
  const { data, error, loading, refetch } = useFetch(timelineService.getAdminAll);
  const {
    activeItem,
    setActiveItem,
    saving,
    toast,
    setToast,
    deletingItem,
    setDeletingItem,
    deleting,
    handleSave,
    handleDelete,
  } = useAdminCrudPage({
    service: timelineService,
    refetch,
    createSuccessMessage: "Timeline entry created.",
    updateSuccessMessage: "Timeline entry updated.",
    deleteSuccessMessage: "Timeline entry deleted.",
    saveErrorMessage: "Unable to save timeline entry.",
    deleteErrorMessage: "Unable to delete timeline entry.",
  });
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const items = boneyardBuildMode ? fixtureTimeline : data ?? [];

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

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}
      {!showError ? (
        <Skeleton
          fallback={<AdminCrudPageFallback listItems={4} />}
          fixture={<AdminCrudPageFallback listItems={4} />}
          loading={boneyardBuildMode || loading}
          name="admin-manage-timeline"
        >
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
              <div className="mt-4 space-y-3">
                {items.map((item) => (
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
            </div>
          </div>
        </Skeleton>
      ) : null}
    </div>
  );
}
