import api from "../lib/api";
import { createAdminListService } from "./createAdminCrudService";

export const contactService = {
  submit: async (payload) => (await api.post("/contact", payload)).data,
  ...createAdminListService("contact-messages"),
};
