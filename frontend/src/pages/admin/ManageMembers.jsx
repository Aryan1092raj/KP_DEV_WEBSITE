import { useState } from "react";

import MemberForm from "../../components/admin/MemberForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toast from "../../components/common/Toast";
import { useFetch } from "../../hooks/useFetch";
import { memberService } from "../../services/memberService";

function getRequestErrorMessage(requestError, fallbackMessage) {
  if (Array.isArray(requestError?.details) && requestError.details.length > 0) {
    const firstIssue = requestError.details[0];
    if (firstIssue?.msg && Array.isArray(firstIssue?.loc)) {
      return `${firstIssue.loc.slice(-1)[0]}: ${firstIssue.msg}`;
    }
  }

  return requestError?.message || fallbackMessage;
}

export default function ManageMembers() {
  const { data, error, loading, refetch } = useFetch(memberService.getAdminAll);
  const [activeMember, setActiveMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (activeMember) {
        await memberService.update(activeMember.id, payload);
        setToast({ type: "success", message: "Member updated successfully." });
      } else {
        await memberService.create(payload);
        setToast({ type: "success", message: "Member created successfully." });
      }
      setActiveMember(null);
      refetch();
    } catch (requestError) {
      setToast({
        type: "error",
        message: getRequestErrorMessage(requestError, "Unable to save member."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingMember) {
      return;
    }

    setDeleting(true);
    try {
      await memberService.remove(deletingMember.id);
      setToast({ type: "success", message: "Member deleted successfully." });
      setDeletingMember(null);
      refetch();
    } catch (requestError) {
      setToast({ type: "error", message: requestError.message || "Unable to delete member." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete member"
        loading={deleting}
        message={`Delete ${deletingMember?.name || "this member"}? This cannot be undone.`}
        onCancel={() => setDeletingMember(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingMember)}
        title="Confirm delete"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            Team members
          </p>
          <h1 className="mt-3 text-4xl font-bold">Manage current members and alumni state</h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveMember(null)} type="button">
          New member
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MemberForm
          initialData={activeMember}
          loading={saving}
          onCancel={() => setActiveMember(null)}
          onSubmit={handleSave}
        />

        <div className="admin-card">
          <h2 className="text-2xl font-semibold">All members</h2>
          {loading ? <LoadingSpinner label="Loading members..." /> : null}
          {error ? <ErrorMessage message={error} onRetry={refetch} /> : null}
          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {data?.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {member.role} • {member.batch} • {member.is_active ? "Active" : "Alumni"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveMember(member)} type="button">
                        Edit
                      </button>
                      <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingMember(member)} type="button">
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
