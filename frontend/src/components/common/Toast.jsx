import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  const tone =
    toast.type === "error"
      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
      : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200";

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className={`min-w-[280px] rounded-2xl border px-4 py-3 shadow-soft ${tone}`}>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium">{toast.message}</p>
          <button className="text-xs uppercase tracking-[0.2em]" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
