import { useEffect, useState } from "react";

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
  const [form, setForm] = useState(emptyMember);

  useEffect(() => {
    setForm(initialData ? { ...emptyMember, ...initialData } : emptyMember);
  }, [initialData]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    const normalizeUrl = (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return "";
      }

      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }

      return `https://${trimmed}`;
    };

    onSubmit({
      ...form,
      photo_url: normalizeUrl(form.photo_url),
      github_url: normalizeUrl(form.github_url),
      linkedin_url: normalizeUrl(form.linkedin_url),
      display_order: Number(form.display_order),
    });
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">{initialData ? "Edit member" : "Add member"}</h3>
      {[
        ["name", "Name"],
        ["role", "Role"],
        ["batch", "Batch"],
        ["photo_url", "Photo URL"],
        ["github_url", "GitHub URL"],
        ["linkedin_url", "LinkedIn URL"],
      ].map(([name, label]) => (
        <label key={name}>
          <span className="label">{label}</span>
          <input className="input" name={name} onChange={handleChange} value={form[name]} />
        </label>
      ))}
      <label>
        <span className="label">Bio</span>
        <textarea className="input min-h-[110px]" name="bio" onChange={handleChange} value={form.bio} />
      </label>
      <label>
        <span className="label">Display order</span>
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
        Active member
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Saving..." : initialData ? "Update member" : "Create member"}
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}
