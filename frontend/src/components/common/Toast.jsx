import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  const type = toast?.type || "success";
  const isLoading = type === "loading";

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    if (isLoading) {
      return undefined;
    }

    const timeout = window.setTimeout(onClose, toast.duration ?? 4200);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose, isLoading]);

  if (!toast) {
    return null;
  }

  const variants = {
    success: {
      shell: "allow-accent border-emerald-500/35 bg-emerald-950/28 text-emerald-100",
      icon: "allow-accent text-emerald-300",
      symbol: "✓",
      live: "polite",
    },
    error: {
      shell: "allow-accent border-rose-500/45 bg-rose-950/30 text-rose-100",
      icon: "allow-accent text-rose-300",
      symbol: "!",
      live: "assertive",
    },
    loading: {
      shell: "allow-accent border-white/20 bg-[#111111] text-white",
      icon: "allow-accent text-white",
      symbol: null,
      live: "polite",
    },
  };

  const selected = variants[type] || variants.success;

  return (
    <div className="fixed right-4 top-[calc(var(--kp-nav-height,84px)+0.75rem)]" style={{ zIndex: 1005 }}>
      <div
        aria-live={selected.live}
        role="status"
        className={`min-w-[260px] max-w-[calc(100vw-2rem)] rounded-2xl border px-4 py-3 shadow-soft ${selected.shell}`}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="allow-accent flex items-center gap-2 text-sm font-medium">
            {isLoading ? (
              <span
                aria-hidden="true"
                className="allow-accent h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <span aria-hidden="true" className={selected.icon}>
                {selected.symbol}
              </span>
            )}
            {toast.message}
          </p>
          <button
            aria-label="Close notification"
            className="allow-accent flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-rose-400 hover:text-rose-300"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">✕</span>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
