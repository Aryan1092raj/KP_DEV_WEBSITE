import { Skeleton } from "boneyard-js/react";

import MemberForm from "../../components/admin/MemberForm";
import { AdminCrudPageFallback } from "../../components/common/BoneyardFallbacks";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useAdminCrudPage } from "../../hooks/useAdminCrudPage";
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
    service: memberService,
    refetch,
    createSuccessMessage: "Member created successfully.",
    updateSuccessMessage: "Member updated successfully.",
    deleteSuccessMessage: "Member deleted successfully.",
    saveErrorMessage: "Unable to save member.",
    deleteErrorMessage: "Unable to delete member.",
    getSaveErrorMessage: getRequestErrorMessage,
  });
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const members = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete member"
        loading={deleting}
        message={`Delete ${deletingItem?.name || "this member"}? This cannot be undone.`}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingItem)}
        title="Confirm delete"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Team members" radius={85} />
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            <VariableText label="Manage current members and alumni state" />
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveItem(null)} type="button">
          <VariableText label="New member" radius={85} />
        </button>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}
      {!showError ? (
        <Skeleton
          fallback={<AdminCrudPageFallback listItems={5} />}
          fixture={<AdminCrudPageFallback listItems={5} />}
          loading={boneyardBuildMode || loading}
          name="admin-manage-members"
        >
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <MemberForm
              initialData={activeItem}
              loading={saving}
              onCancel={() => setActiveItem(null)}
              onSubmit={handleSave}
            />

            <div className="admin-card">
              <h2 className="text-2xl font-semibold">
                <VariableText label="All members" />
              </h2>
              <div className="mt-4 space-y-3">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    No members found. Create your first member from the form.
                  </p>
                ) : null}
                {members.map((member) => (
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
                        <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveItem(member)} type="button">
                          <VariableText label="Edit" radius={85} />
                        </button>
                        <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingItem(member)} type="button">
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
