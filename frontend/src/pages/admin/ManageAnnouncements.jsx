import { useState } from "react";
import { Skeleton } from "boneyard-js/react";

import AnnouncementForm from "../../components/admin/AnnouncementForm";
import { AdminCrudPageFallback } from "../../components/common/BoneyardFallbacks";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
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
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const announcements = boneyardBuildMode ? fixtureAnnouncements : data ?? [];

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (activeAnnouncement) {
        await announcementService.update(activeAnnouncement.id, payload);
        setToast({ type: "success", message: "Announcement updated." });
      } else {
        await announcementService.create(payload);
        setToast({ type: "success", message: "Announcement created." });
      }
      setActiveAnnouncement(null);
      refetch();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to save announcement.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingAnnouncement) {
      return;
    }
    setDeleting(true);
    try {
      await announcementService.remove(deletingAnnouncement.id);
      setToast({ type: "success", message: "Announcement deleted." });
      setDeletingAnnouncement(null);
      refetch();
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to delete announcement.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete announcement"
        loading={deleting}
        message={`Delete ${deletingAnnouncement?.title || "this announcement"}?`}
        onCancel={() => setDeletingAnnouncement(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingAnnouncement)}
        title="Confirm delete"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Announcements" radius={85} />
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            <VariableText label="Create drafts or publish club updates" />
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveAnnouncement(null)} type="button">
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
              initialData={activeAnnouncement}
              loading={saving}
              onCancel={() => setActiveAnnouncement(null)}
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
                        <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveAnnouncement(announcement)} type="button">
                          <VariableText label="Edit" radius={85} />
                        </button>
                        <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingAnnouncement(announcement)} type="button">
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
