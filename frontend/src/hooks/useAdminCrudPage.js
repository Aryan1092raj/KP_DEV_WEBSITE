import { useState } from "react";

export function useAdminCrudPage({
  service,
  refetch,
  createSuccessMessage,
  updateSuccessMessage,
  deleteSuccessMessage,
  saveErrorMessage,
  deleteErrorMessage,
  getSaveErrorMessage,
  getDeleteErrorMessage,
}) {
  const [activeItem, setActiveItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (activeItem) {
        await service.update(activeItem.id, payload);
        setToast({ type: "success", message: updateSuccessMessage });
      } else {
        await service.create(payload);
        setToast({ type: "success", message: createSuccessMessage });
      }
      setActiveItem(null);
      refetch();
    } catch (requestError) {
      const message = getSaveErrorMessage
        ? getSaveErrorMessage(requestError, saveErrorMessage)
        : requestError?.message || saveErrorMessage;
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingItem) {
      return;
    }

    setDeleting(true);
    try {
      await service.remove(deletingItem.id);
      setToast({ type: "success", message: deleteSuccessMessage });
      setDeletingItem(null);
      refetch();
    } catch (requestError) {
      const message = getDeleteErrorMessage
        ? getDeleteErrorMessage(requestError, deleteErrorMessage)
        : requestError?.message || deleteErrorMessage;
      setToast({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  }

  return {
    activeItem,
    setActiveItem,
    saving,
    toast,
    setToast,
    deletingItem,
    setDeletingItem,
    deleting,
    handleSave,
    handleDelete,
  };
}
