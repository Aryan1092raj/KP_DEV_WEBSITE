import { Skeleton } from "boneyard-js/react";

import AnnouncementForm from "../../components/admin/AnnouncementForm";
import { AdminCrudPageFallback } from "../../components/common/BoneyardFallbacks";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useAdminCrudPage } from "../../hooks/useAdminCrudPage";
import { useFetch } from "../../hooks/useFetch";
import { announcementService } from "../../services/announcementService";

const fixtureAnnouncements = [
  {
    id: "fixture-announcement-1",
    title: "Mentorship office hours",
    author: "Core Team",
    is_published: true,
  },
  {
    id: "fixture-announcement-2",
    title: "Build sprint checkpoint",
    author: "Program Desk",
    is_published: false,
  },
];

export default function ManageAnnouncements() {
  const { data, error, loading, refetch } = useFetch(announcementService.getAdminAll);
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
    service: announcementService,
    refetch,
    createSuccessMessage: "Announcement created.",
    updateSuccessMessage: "Announcement updated.",
    deleteSuccessMessage: "Announcement deleted.",
    saveErrorMessage: "Unable to save announcement.",
    deleteErrorMessage: "Unable to delete announcement.",
  });
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const announcements = boneyardBuildMode ? fixtureAnnouncements : data ?? [];

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete announcement"
        loading={deleting}
        message={`Delete ${deletingItem?.title || "this announcement"}?`}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingItem)}
        title="Confirm delete"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Announcements" radius={85} />
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            <VariableText label="Create drafts or publish club updates" />
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveItem(null)} type="button">
          <VariableText label="New announcement" radius={85} />
        </button>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}
      {!showError ? (
        <Skeleton
          fallback={<AdminCrudPageFallback listItems={4} />}
          fixture={<AdminCrudPageFallback listItems={4} />}
          loading={boneyardBuildMode || loading}
          name="admin-manage-announcements"
        >
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <AnnouncementForm
              initialData={activeItem}
              loading={saving}
              onCancel={() => setActiveItem(null)}
              onSubmit={handleSave}
            />

            <div className="admin-card">
              <h2 className="text-2xl font-semibold">
                <VariableText label="Announcement list" />
              </h2>
              <div className="mt-4 space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{announcement.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                          {announcement.author} • {announcement.is_published ? "Published" : "Draft"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveItem(announcement)} type="button">
                          <VariableText label="Edit" radius={85} />
                        </button>
                        <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingItem(announcement)} type="button">
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
