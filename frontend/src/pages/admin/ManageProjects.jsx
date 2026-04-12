import { useEffect, useState } from "react";
import { Skeleton } from "boneyard-js/react";

import ProjectForm from "../../components/admin/ProjectForm";
import { AdminCrudPageFallback } from "../../components/common/BoneyardFallbacks";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useAdminCrudPage } from "../../hooks/useAdminCrudPage";
import { useFetch } from "../../hooks/useFetch";
import { memberService } from "../../services/memberService";
import { projectService } from "../../services/projectService";

const fixtureProjects = [
  {
    id: "fixture-project-1",
    title: "Prompt Studio",
    status: "active",
    year: "2026",
    description: "A sandbox for rapid prompt prototyping and evaluation workflows.",
  },
  {
    id: "fixture-project-2",
    title: "Community Dashboard",
    status: "completed",
    year: "2025",
    description: "An operations panel for events, membership, and communications.",
  },
];

export default function ManageProjects() {
  const { data, error, loading, refetch } = useFetch(projectService.getAdminAll);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
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
    service: projectService,
    refetch,
    createSuccessMessage: "Project created successfully.",
    updateSuccessMessage: "Project updated successfully.",
    deleteSuccessMessage: "Project deleted successfully.",
    saveErrorMessage: "Unable to save project.",
    deleteErrorMessage: "Unable to delete project.",
  });
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const projects = boneyardBuildMode ? fixtureProjects : data ?? [];
  const contributorOptions = members;

  useEffect(() => {
    if (boneyardBuildMode) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }

    memberService
      .getAdminAll()
      .then((result) => setMembers(result))
      .catch((requestError) =>
        setToast({
          type: "error",
          message: requestError.message || "Unable to load members for contributor selection.",
        })
      )
      .finally(() => setMembersLoading(false));
  }, [boneyardBuildMode]);

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete project"
        loading={deleting}
        message={`Delete ${deletingItem?.title || "this project"}? Contributor links will be removed too.`}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingItem)}
        title="Confirm delete"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Projects" radius={85} />
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            <VariableText label="Manage project metadata and contributors" />
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveItem(null)} type="button">
          <VariableText label="New project" radius={85} />
        </button>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}
      {!showError ? (
        <Skeleton
          fallback={<AdminCrudPageFallback listItems={4} />}
          fixture={<AdminCrudPageFallback listItems={4} />}
          loading={boneyardBuildMode || loading || membersLoading}
          name="admin-manage-projects"
        >
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ProjectForm
              initialData={activeItem}
              loading={saving}
              members={contributorOptions}
              onCancel={() => setActiveItem(null)}
              onSubmit={handleSave}
            />

            <div className="admin-card">
              <h2 className="text-2xl font-semibold">
                <VariableText label="Project list" />
              </h2>
              <div className="mt-4 space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{project.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                          {project.status} • {project.year || "Year TBD"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveItem(project)} type="button">
                          <VariableText label="Edit" radius={85} />
                        </button>
                        <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingItem(project)} type="button">
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
