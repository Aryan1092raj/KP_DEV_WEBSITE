import { useState } from "react";

import EventForm from "../../components/admin/EventForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toast from "../../components/common/Toast";
import { useFetch } from "../../hooks/useFetch";
import { eventService } from "../../services/eventService";

export default function ManageEvents() {
  const { data, error, loading, refetch } = useFetch(eventService.getAdminAll);
  const [activeEvent, setActiveEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (activeEvent) {
        await eventService.update(activeEvent.id, payload);
        setToast({ type: "success", message: "Event updated successfully." });
      } else {
        await eventService.create(payload);
        setToast({ type: "success", message: "Event created successfully." });
      }
      setActiveEvent(null);
      refetch();
    } catch (requestError) {
      setToast({ type: "error", message: requestError.message || "Unable to save event." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingEvent) {
      return;
    }

    setDeleting(true);
    try {
      await eventService.remove(deletingEvent.id);
      setToast({ type: "success", message: "Event deleted successfully." });
      setDeletingEvent(null);
      refetch();
    } catch (requestError) {
      setToast({ type: "error", message: requestError.message || "Unable to delete event." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete event"
        loading={deleting}
        message={`Delete ${deletingEvent?.title || "this event"}?`}
        onCancel={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingEvent)}
        title="Confirm delete"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            Events
          </p>
          <h1 className="mt-3 text-4xl font-bold">Manage sessions, workshops, and talks</h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveEvent(null)} type="button">
          New event
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <EventForm
          initialData={activeEvent}
          loading={saving}
          onCancel={() => setActiveEvent(null)}
          onSubmit={handleSave}
        />

        <div className="admin-card">
          <h2 className="text-2xl font-semibold">Event list</h2>
          {loading ? <LoadingSpinner label="Loading events..." /> : null}
          {error ? <ErrorMessage message={error} onRetry={refetch} /> : null}
          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {data?.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {event.event_date} • {event.event_type} • {event.is_upcoming ? "Upcoming" : "Completed"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveEvent(event)} type="button">
                        Edit
                      </button>
                      <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingEvent(event)} type="button">
                        Delete
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
