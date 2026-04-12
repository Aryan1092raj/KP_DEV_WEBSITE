import api from "../lib/api";
import { createAdminCrudService } from "./createAdminCrudService";

export const memberService = {
  getAll: async () => (await api.get("/members")).data,
  ...createAdminCrudService("members"),
};
