import api from "../lib/api";

export const eventService = {
  getAll: async () => (await api.get("/events")).data,
  getUpcoming: async () => (await api.get("/events/upcoming")).data,
  getAdminAll: async () => (await api.get("/admin/events")).data,
  create: async (payload) => (await api.post("/admin/events", payload)).data,
  update: async (id, payload) => (await api.put(`/admin/events/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/admin/events/${id}`)).data,
};
