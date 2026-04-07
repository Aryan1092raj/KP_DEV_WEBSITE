import api from "../lib/api";

export const contactService = {
  submit: async (payload) => (await api.post("/contact", payload)).data,
  getAdminAll: async () => (await api.get("/admin/contact-messages")).data,
};
