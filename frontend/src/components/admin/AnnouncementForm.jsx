import { useAdminForm } from "../../hooks/useAdminForm";
import VariableText from "../common/VariableText";

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
  const { form, handleChange } = useAdminForm(emptyAnnouncement, initialData);

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">
        <VariableText label={initialData ? "Edit announcement" : "Create announcement"} />
      </h3>
      <label>
        <span className="label">
          <VariableText label="Title" radius={85} />
        </span>
        <input className="input" name="title" onChange={handleChange} value={form.title} />
      </label>
      <label>
        <span className="label">
          <VariableText label="Author" radius={85} />
        </span>
        <input className="input" name="author" onChange={handleChange} value={form.author} />
      </label>
      <label>
        <span className="label">
          <VariableText label="Body" radius={85} />
        </span>
        <textarea className="input min-h-[160px]" name="body" onChange={handleChange} value={form.body} />
      </label>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_published} name="is_published" onChange={handleChange} type="checkbox" />
        <VariableText label="Publish immediately" radius={85} />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          <VariableText
            label={loading ? "Saving..." : initialData ? "Update announcement" : "Create announcement"}
            radius={85}
          />
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          <VariableText label="Cancel" radius={85} />
        </button>
      </div>
    </form>
  );
}
