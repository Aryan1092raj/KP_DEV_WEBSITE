import { useAdminForm } from "../../hooks/useAdminForm";
import { normalizeUrl } from "../../lib/utils";
import VariableText from "../common/VariableText";

const emptyEvent = {
  title: "",
  description: "",
  event_date: "",
  end_date: "",
  event_type: "session",
  resource_url: "",
  is_upcoming: false,
  is_ongoing: false,
};

function mapEventInitialData(initialData, emptyState) {
  return {
    ...emptyState,
    ...initialData,
    event_date:
      typeof initialData.event_date === "string" && initialData.event_date.length >= 10
        ? initialData.event_date.slice(0, 10)
        : "",
    end_date:
      typeof initialData.end_date === "string" && initialData.end_date.length >= 10
        ? initialData.end_date.slice(0, 10)
        : "",
    resource_url: initialData.resource_url ?? "",
  };
}

export default function EventForm({ initialData, onSubmit, onCancel, loading }) {
  const { form, setForm } = useAdminForm(emptyEvent, initialData, {
    mapInitialData: mapEventInitialData,
  });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "is_upcoming" && checked) {
        next.is_ongoing = false;
      }

      if (name === "is_ongoing" && checked) {
        next.is_upcoming = false;
      }

      if (name === "event_date" && next.end_date && next.end_date < value) {
        next.end_date = value;
      }

      return next;
    });
  }

  function submit(event) {
    event.preventDefault();

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      event_date: form.event_date,
      end_date: form.end_date || null,
      event_type: form.event_type,
      resource_url: normalizeUrl(form.resource_url),
      is_upcoming: Boolean(form.is_upcoming),
      is_ongoing: Boolean(form.is_ongoing),
    });
  }

  return (
    <form className="admin-card space-y-4" onSubmit={submit}>
      <h3 className="text-2xl font-semibold">
        <VariableText label={initialData ? "Edit event" : "Create event"} />
      </h3>

      <label>
        <span className="label">
          <VariableText label="Title" radius={85} />
        </span>
        <input className="input" name="title" onChange={handleChange} required value={form.title} />
      </label>

      <label>
        <span className="label">
          <VariableText label="Description" radius={85} />
        </span>
        <textarea className="input min-h-[110px]" name="description" onChange={handleChange} value={form.description} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className="label">
            <VariableText label="Event date" radius={85} />
          </span>
          <input className="input" name="event_date" onChange={handleChange} required type="date" value={form.event_date} />
        </label>
        <label>
          <span className="label">
            <VariableText label="End date (optional)" radius={85} />
          </span>
          <input
            className="input"
            min={form.event_date || undefined}
            name="end_date"
            onChange={handleChange}
            type="date"
            value={form.end_date}
          />
        </label>
        <label>
          <span className="label">
            <VariableText label="Event type" radius={85} />
          </span>
          <select className="input" name="event_type" onChange={handleChange} value={form.event_type}>
            <option value="session">session</option>
            <option value="workshop">workshop</option>
            <option value="hackathon">hackathon</option>
            <option value="talk">talk</option>
          </select>
        </label>
      </div>

      <label>
        <span className="label">
          <VariableText label="Resource URL" radius={85} />
        </span>
        <input
          className="input"
          name="resource_url"
          onChange={handleChange}
          placeholder="https://example.com"
          type="url"
          value={form.resource_url}
        />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_upcoming} name="is_upcoming" onChange={handleChange} type="checkbox" />
        <VariableText label="Mark as upcoming" radius={85} />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input checked={form.is_ongoing} name="is_ongoing" onChange={handleChange} type="checkbox" />
        <VariableText label="Mark as ongoing" radius={85} />
      </label>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={loading} type="submit">
          <VariableText label={loading ? "Saving..." : initialData ? "Update event" : "Create event"} radius={85} />
        </button>
        <button className="btn-secondary" onClick={onCancel} type="button">
          <VariableText label="Cancel" radius={85} />
        </button>
      </div>
    </form>
  );
}
