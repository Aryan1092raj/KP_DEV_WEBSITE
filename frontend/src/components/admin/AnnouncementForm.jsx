import { useEffect, useState } from "react";

const emptyAnnouncement = {
  title: "",
  body: "",
  author: "",
  is_published: false,
};

export default function AnnouncementForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState(emptyAnnouncement);

  useEffect(() => {
    setForm(initialData ? { ...emptyAnnouncement, ...initialData } : emptyAnnouncement);
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
    onSubmit(form);
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">
        {initialData ? "Edit announcement" : "Create announcement"}
      </h3>
      <label>
        <span className="label">Title</span>
        <input className="input" name="title" onChange={handleChange} value={form.title} />
      </label>
      <label>
        <span className="label">Author</span>
        <input className="input" name="author" onChange={handleChange} value={form.author} />
      </label>
      <label>
        <span className="label">Body</span>
        <textarea className="input min-h-[160px]" name="body" onChange={handleChange} value={form.body} />
      </label>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_published} name="is_published" onChange={handleChange} type="checkbox" />
        Publish immediately
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Saving..." : initialData ? "Update announcement" : "Create announcement"}
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}
