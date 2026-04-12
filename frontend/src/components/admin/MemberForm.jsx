import { useState } from "react";

import { useAdminForm } from "../../hooks/useAdminForm";
import { normalizeUrl } from "../../lib/utils";
import VariableText from "../common/VariableText";

const emptyMember = {
  name: "",
  role: "",
  batch: "",
  bio: "",
  photo_url: "",
  github_url: "",
  linkedin_url: "",
  is_active: true,
  display_order: 0,
};

export default function MemberForm({ initialData, onSubmit, onCancel, loading }) {
  const { form, setForm, handleChange } = useAdminForm(emptyMember, initialData);
  const [photoError, setPhotoError] = useState("");

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }

    if (file.size > 1_400_000) {
      setPhotoError("Image is too large. Please use a file smaller than 1.4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result.startsWith("data:image/")) {
        setPhotoError("Unable to read image file. Try another image.");
        return;
      }

      setPhotoError("");
      setForm((current) => ({ ...current, photo_url: result }));
    };

    reader.onerror = () => {
      setPhotoError("Unable to process image file.");
    };

    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPhotoError("");
    setForm((current) => ({ ...current, photo_url: "" }));
  }

  function submit(event) {
    event.preventDefault();

    onSubmit({
      ...form,
      photo_url: (form.photo_url || "").trim(),
      github_url: normalizeUrl(form.github_url),
      linkedin_url: normalizeUrl(form.linkedin_url),
      display_order: Number(form.display_order),
    });
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">
        <VariableText label={initialData ? "Edit member" : "Add member"} />
      </h3>
      {[
        ["name", "Name"],
        ["role", "Role"],
        ["batch", "Batch"],
        ["github_url", "GitHub URL"],
        ["linkedin_url", "LinkedIn URL"],
      ].map(([name, label]) => (
        <label key={name}>
          <span className="label">
            <VariableText label={label} radius={85} />
          </span>
          <input className="input" name={name} onChange={handleChange} value={form[name]} />
        </label>
      ))}
      <label>
        <span className="label">
          <VariableText label="Photo (Upload from local)" radius={85} />
        </span>
        <input accept="image/*" className="input" onChange={handlePhotoUpload} type="file" />
      </label>
      {photoError ? <p className="text-sm text-white">{photoError}</p> : null}
      {form.photo_url ? (
        <div className="rounded-2xl border border-slate-200/80 p-3 dark:border-white/10">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            <VariableText label="Photo preview" radius={85} />
          </p>
          <img alt="Uploaded member preview" className="h-24 w-24 rounded-2xl object-cover" src={form.photo_url} />
          <button className="btn-secondary mt-3 !px-4 !py-2" onClick={clearPhoto} type="button">
            <VariableText label="Remove photo" radius={85} />
          </button>
        </div>
      ) : null}
      <label>
        <span className="label">
          <VariableText label="Bio" radius={85} />
        </span>
        <textarea className="input min-h-[110px]" name="bio" onChange={handleChange} value={form.bio} />
      </label>
      <label>
        <span className="label">
          <VariableText label="Display order" radius={85} />
        </span>
        <input
          className="input"
          name="display_order"
          onChange={handleChange}
          type="number"
          value={form.display_order}
        />
      </label>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
        <VariableText label="Active member" radius={85} />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          <VariableText label={loading ? "Saving..." : initialData ? "Update member" : "Create member"} radius={85} />
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          <VariableText label="Cancel" radius={85} />
        </button>
      </div>
    </form>
  );
}
