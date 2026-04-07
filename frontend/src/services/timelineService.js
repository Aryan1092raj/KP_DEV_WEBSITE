import api from "../lib/api";

export const timelineService = {
  getAll: async () => (await api.get("/timeline")).data,
  getAdminAll: async () => (await api.get("/admin/timeline")).data,
  create: async (payload) => (await api.post("/admin/timeline", payload)).data,
  update: async (id, payload) => (await api.put(`/admin/timeline/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/admin/timeline/${id}`)).data,
};
