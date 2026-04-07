import api from "../lib/api";

export const announcementService = {
  getPublished: async () => (await api.get("/announcements")).data,
  getAdminAll: async () => (await api.get("/admin/announcements")).data,
  create: async (payload) => (await api.post("/admin/announcements", payload)).data,
  update: async (id, payload) =>
    (await api.put(`/admin/announcements/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/admin/announcements/${id}`)).data,
};
