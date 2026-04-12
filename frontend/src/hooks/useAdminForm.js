import { useEffect, useState } from "react";

export function useAdminForm(emptyState, initialData, options = {}) {
  const { mapInitialData } = options;
  const [form, setForm] = useState(emptyState);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyState);
      return;
    }

    if (mapInitialData) {
      setForm(mapInitialData(initialData, emptyState));
      return;
    }

    setForm({ ...emptyState, ...initialData });
  }, [emptyState, initialData, mapInitialData]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return {
    form,
    setForm,
    handleChange,
  };
}
