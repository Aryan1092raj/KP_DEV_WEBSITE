import api from "../lib/api";

export const memberService = {
  getAll: async () => (await api.get("/members")).data,
  getAdminAll: async () => (await api.get("/admin/members")).data,
  create: async (payload) => (await api.post("/admin/members", payload)).data,
  update: async (id, payload) => (await api.put(`/admin/members/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/admin/members/${id}`)).data,
};
