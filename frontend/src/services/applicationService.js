import api from "../lib/api";

export const applicationService = {
  submit: async (payload) => (await api.post("/apply", payload)).data,
  getAdminAll: async () => (await api.get("/admin/applications")).data,
  updateStatus: async (id, payload) =>
    (await api.put(`/admin/applications/${id}/status`, payload)).data,
};
