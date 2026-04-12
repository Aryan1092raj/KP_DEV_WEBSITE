import api from "../lib/api";
import { createAdminCrudService } from "./createAdminCrudService";

export const timelineService = {
  getAll: async () => (await api.get("/timeline")).data,
  ...createAdminCrudService("timeline"),
};
