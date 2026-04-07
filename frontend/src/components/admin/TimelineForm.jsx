import { useEffect, useState } from "react";

import VariableText from "../common/VariableText";

const emptyTimeline = {
  year: "",
  title: "",
  description: "",
  sort_order: 0,
};

export default function TimelineForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(emptyTimeline);

  useEffect(() => {
    setForm(initialData ? { ...emptyTimeline, ...initialData } : emptyTimeline);
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      year: Number(form.year),
      sort_order: Number(form.sort_order),
    });
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">
        <VariableText label={initialData ? "Edit milestone" : "Add milestone"} />
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Year</span>
          <input className="input" name="year" onChange={handleChange} type="number" value={form.year} />
        </label>
        <label>
          <span className="label">Sort order</span>
          <input className="input" name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
        </label>
      </div>
      <label>
        <span className="label">
          <VariableText label="Title" radius={85} />
        </span>
        <input className="input" name="title" onChange={handleChange} value={form.title} />
      </label>
      <label>
        <span className="label">
          <VariableText label="Description" radius={85} />
        </span>
        <textarea className="input min-h-[110px]" name="description" onChange={handleChange} value={form.description} />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          <VariableText label={loading ? "Saving..." : initialData ? "Update milestone" : "Create milestone"} radius={85} />
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          <VariableText label="Cancel" radius={85} />
        </button>
      </div>
    </form>
  );
}
