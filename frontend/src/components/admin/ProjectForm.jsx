import { useEffect, useState } from "react";

import VariableText from "../common/VariableText";

const emptyProject = {
  title: "",
  description: "",
  tech_stack: "",
  github_url: "",
  live_url: "",
  thumbnail_url: "",
  year: "",
  is_featured: false,
  status: "active",
  contributors: [],
};

export default function ProjectForm({
  initialData,
  members,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState(emptyProject);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyProject);
      return;
    }

    setForm({
      ...emptyProject,
      ...initialData,
      tech_stack: initialData.tech_stack?.join(", ") || "",
      year: initialData.year ?? "",
      contributors:
        initialData.contributors?.map((contributor) => ({
          member_id: contributor.member_id,
          role: contributor.role,
        })) || [],
    });
  }, [initialData]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function updateContributor(index, field, value) {
    setForm((current) => ({
      ...current,
      contributors: current.contributors.map((item, contributorIndex) =>
        contributorIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addContributor() {
    setForm((current) => ({
      ...current,
      contributors: [...current.contributors, { member_id: "", role: "" }],
    }));
  }

  function removeContributor(index) {
    setForm((current) => ({
      ...current,
      contributors: current.contributors.filter((_, contributorIndex) => contributorIndex !== index),
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      year: form.year ? Number(form.year) : null,
      tech_stack: form.tech_stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      contributors: form.contributors.filter(
        (contributor) => contributor.member_id && contributor.role.trim()
      ),
    });
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">
        <VariableText label={initialData ? "Edit project" : "Create project"} />
      </h3>
      {[
        ["title", "Title"],
        ["github_url", "GitHub URL"],
        ["live_url", "Live URL"],
        ["thumbnail_url", "Thumbnail URL"],
      ].map(([name, label]) => (
        <label key={name}>
          <span className="label">
            <VariableText label={label} radius={85} />
          </span>
          <input className="input" name={name} onChange={updateField} value={form[name]} />
        </label>
      ))}
      <label>
        <span className="label">
          <VariableText label="Description" radius={85} />
        </span>
        <textarea className="input min-h-[110px]" name="description" onChange={updateField} value={form.description} />
      </label>
      <label>
        <span className="label">Tech stack (comma separated)</span>
        <input className="input" name="tech_stack" onChange={updateField} value={form.tech_stack} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Year</span>
          <input className="input" name="year" onChange={updateField} type="number" value={form.year} />
        </label>
        <label>
          <span className="label">Status</span>
          <select className="input" name="status" onChange={updateField} value={form.status}>
            <option value="active">active</option>
            <option value="in-progress">in-progress</option>
            <option value="archived">archived</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_featured} name="is_featured" onChange={updateField} type="checkbox" />
        <VariableText label="Featured on homepage" radius={85} />
      </label>

      <div className="rounded-[24px] border border-slate-200/80 p-4 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-semibold">Contributors</h4>
          <button className="btn-secondary !px-4 !py-2" onClick={addContributor} type="button">
            Add contributor
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {form.contributors.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">No contributors added yet.</p>
          ) : null}
          {form.contributors.map((contributor, index) => (
            <div key={`${contributor.member_id}-${index}`} className="grid gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5 sm:grid-cols-[1fr_1fr_auto]">
              <select
                className="input"
                onChange={(event) => updateContributor(index, "member_id", event.target.value)}
                value={contributor.member_id}
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                className="input"
                onChange={(event) => updateContributor(index, "role", event.target.value)}
                placeholder="Role on project"
                value={contributor.role}
              />
              <button className="btn-danger !px-4 !py-2" onClick={() => removeContributor(index)} type="button">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          <VariableText label={loading ? "Saving..." : initialData ? "Update project" : "Create project"} radius={85} />
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          <VariableText label="Cancel" radius={85} />
        </button>
      </div>
    </form>
  );
}
