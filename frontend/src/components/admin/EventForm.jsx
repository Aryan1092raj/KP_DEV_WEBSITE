import { useEffect, useState } from "react";

const emptyEvent = {
  title: "",
  description: "",
  event_date: "",
  event_type: "session",
  resource_url: "",
  is_upcoming: false,
};

export default function EventForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(emptyEvent);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyEvent);
      return;
    }

    setForm({
      ...emptyEvent,
      ...initialData,
      event_date:
        typeof initialData.event_date === "string" && initialData.event_date.length >= 10
          ? initialData.event_date.slice(0, 10)
          : "",
      resource_url: initialData.resource_url ?? "",
    });
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
      const trimmed = (value ?? "").trim();
      if (!trimmed) {
        return "";
      }

      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }

      return `https://${trimmed}`;
    };

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      event_date: form.event_date,
      event_type: form.event_type,
      resource_url: normalizeUrl(form.resource_url),
      is_upcoming: Boolean(form.is_upcoming),
    });
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">{initialData ? "Edit event" : "Create event"}</h3>
      <label>
        <span className="label">Title</span>
        <input className="input" name="title" onChange={handleChange} required value={form.title} />
      </label>
      <label>
        <span className="label">Description</span>
        <textarea className="input min-h-[110px]" name="description" onChange={handleChange} value={form.description} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Event date</span>
          <input className="input" name="event_date" onChange={handleChange} required type="date" value={form.event_date} />
        </label>
        <label>
          <span className="label">Event type</span>
          <select className="input" name="event_type" onChange={handleChange} value={form.event_type}>
            <option value="session">session</option>
            <option value="workshop">workshop</option>
            <option value="hackathon">hackathon</option>
            <option value="talk">talk</option>
          </select>
        </label>
      </div>
      <label>
        <span className="label">Resource URL</span>
        <input className="input" name="resource_url" onChange={handleChange} placeholder="https://example.com" type="url" value={form.resource_url} />
      </label>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_upcoming} name="is_upcoming" onChange={handleChange} type="checkbox" />
        Mark as upcoming
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Saving..." : initialData ? "Update event" : "Create event"}
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}
