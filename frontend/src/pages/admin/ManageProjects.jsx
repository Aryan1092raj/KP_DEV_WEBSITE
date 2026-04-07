import { useEffect, useState } from "react";

import ProjectForm from "../../components/admin/ProjectForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useFetch } from "../../hooks/useFetch";
import { memberService } from "../../services/memberService";
import { projectService } from "../../services/projectService";

export default function ManageProjects() {
  const { data, error, loading, refetch } = useFetch(projectService.getAdminAll);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
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
  }, []);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (activeProject) {
        await projectService.update(activeProject.id, payload);
        setToast({ type: "success", message: "Project updated successfully." });
      } else {
        await projectService.create(payload);
        setToast({ type: "success", message: "Project created successfully." });
      }
      setActiveProject(null);
      refetch();
    } catch (requestError) {
      setToast({ type: "error", message: requestError.message || "Unable to save project." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingProject) {
      return;
    }

    setDeleting(true);
    try {
      await projectService.remove(deletingProject.id);
      setToast({ type: "success", message: "Project deleted successfully." });
      setDeletingProject(null);
      refetch();
    } catch (requestError) {
      setToast({ type: "error", message: requestError.message || "Unable to delete project." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <ConfirmModal
        confirmLabel="Delete project"
        loading={deleting}
        message={`Delete ${deletingProject?.title || "this project"}? Contributor links will be removed too.`}
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingProject)}
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
        <button className="btn-primary" onClick={() => setActiveProject(null)} type="button">
          <VariableText label="New project" radius={85} />
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {membersLoading ? (
          <LoadingSpinner label="Loading contributors..." />
        ) : (
          <ProjectForm
            initialData={activeProject}
            loading={saving}
            members={members}
            onCancel={() => setActiveProject(null)}
            onSubmit={handleSave}
          />
        )}

        <div className="admin-card">
          <h2 className="text-2xl font-semibold">
            <VariableText label="Project list" />
          </h2>
          {loading ? <LoadingSpinner label="Loading projects..." /> : null}
          {error ? <ErrorMessage message={error} onRetry={refetch} /> : null}
          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {data?.map((project) => (
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
                      <button className="btn-secondary !px-4 !py-2" onClick={() => setActiveProject(project)} type="button">
                        <VariableText label="Edit" radius={85} />
                      </button>
                      <button className="btn-danger !px-4 !py-2" onClick={() => setDeletingProject(project)} type="button">
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
