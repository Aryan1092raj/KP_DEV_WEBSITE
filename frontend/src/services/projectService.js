import api from "../lib/api";

export const projectService = {
  getAll: async () => (await api.get("/projects")).data,
  getFeatured: async () => (await api.get("/projects/featured")).data,
  getAdminAll: async () => (await api.get("/admin/projects")).data,
  create: async (payload) => (await api.post("/admin/projects", payload)).data,
  update: async (id, payload) => (await api.put(`/admin/projects/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/admin/projects/${id}`)).data,
};
