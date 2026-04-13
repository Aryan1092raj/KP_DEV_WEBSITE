import { Skeleton } from "boneyard-js/react";

import EventForm from "../../components/admin/EventForm";
import { AdminCrudPageFallback } from "../../components/common/BoneyardFallbacks";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useAdminCrudPage } from "../../hooks/useAdminCrudPage";
import { useFetch } from "../../hooks/useFetch";
import { eventService } from "../../services/eventService";

const fixtureEvents = [
  {
    id: "fixture-event-1",
    title: "Frontend systems workshop",
    event_date: "2026-04-15",
    end_date: "2026-04-18",
    event_type: "Workshop",
    is_upcoming: true,
    is_ongoing: false,
  },
  {
    id: "fixture-event-2",
    title: "Backend review session",
    event_date: "2026-03-30",
    end_date: "2026-04-02",
    event_type: "Session",
    is_upcoming: false,
    is_ongoing: true,
  },
];

function getEventStatus(event) {
  if (event?.is_ongoing) {
    return "Ongoing";
  }

  if (event?.is_upcoming) {
    return "Upcoming";
  }

  return "Completed";
}

function formatEventDateRange(event) {
  const start = typeof event?.event_date === "string" ? event.event_date.slice(0, 10) : "";
  const end = typeof event?.end_date === "string" ? event.end_date.slice(0, 10) : "";

  if (start && end) {
    return `${start} to ${end}`;
  }

  return start || "Date not set";
}

function getRequestErrorMessage(requestError, fallbackMessage) {
  if (Array.isArray(requestError?.details) && requestError.details.length > 0) {
    const firstIssue = requestError.details[0];
    if (firstIssue?.msg && Array.isArray(firstIssue?.loc)) {
      return `${firstIssue.loc.slice(-1)[0]}: ${firstIssue.msg}`;
    }
  }

  return requestError?.message || fallbackMessage;
}

export default function ManageEvents() {
  const { data, error, loading, refetch } = useFetch(eventService.getAdminAll);
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
    service: eventService,
    refetch,
    createSuccessMessage: "Event created successfully.",
    updateSuccessMessage: "Event updated successfully.",
    deleteSuccessMessage: "Event deleted successfully.",
    saveErrorMessage: "Unable to save event.",
    deleteErrorMessage: "Unable to delete event.",
    getSaveErrorMessage: getRequestErrorMessage,
  });
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const events = boneyardBuildMode ? fixtureEvents : data ?? [];

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete event"
        loading={deleting}
        message={`Delete ${deletingItem?.title || "this event"}?`}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingItem)}
        title="Confirm delete"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Events" radius={85} />
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            <VariableText label="Manage sessions, workshops, and talks" />
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveItem(null)} type="button">
          <VariableText label="New event" radius={85} />
        </button>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}
      {!showError ? (
        <Skeleton
          fallback={<AdminCrudPageFallback listItems={4} />}
          fixture={<AdminCrudPageFallback listItems={4} />}
          loading={boneyardBuildMode || loading}
          name="admin-manage-events"
        >
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <EventForm
              initialData={activeItem}
              loading={saving}
              onCancel={() => setActiveItem(null)}
              onSubmit={handleSave}
            />

            <div className="admin-card">
              <h2 className="text-2xl font-semibold">
                <VariableText label="Event list" />
              </h2>
              <div className="mt-4 space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                          {formatEventDateRange(event)} • {event.event_type} • {getEventStatus(event)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveItem(event)} type="button">
                          <VariableText label="Edit" radius={85} />
                        </button>
                        <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingItem(event)} type="button">
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
