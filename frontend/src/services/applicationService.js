import api from "../lib/api";
import { createAdminListService } from "./createAdminCrudService";

export const applicationService = {
  submit: async (payload) => (await api.post("/apply", payload)).data,
  ...createAdminListService("applications"),
  updateStatus: async (id, payload) =>
    (await api.put(`/admin/applications/${id}/status`, payload)).data,
};
