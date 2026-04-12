export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/50 px-4" style={{ zIndex: 1050 }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-6 shadow-soft dark:bg-slate-950">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-danger" disabled={loading} onClick={onConfirm} type="button">
            {loading ? "Working..." : confirmLabel}
          </button>
          <button className="btn-secondary" disabled={loading} onClick={onCancel} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
