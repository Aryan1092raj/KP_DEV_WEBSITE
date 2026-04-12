import api from "../lib/api";
import { createAdminCrudService } from "./createAdminCrudService";

export const projectService = {
  getAll: async () => (await api.get("/projects")).data,
  getFeatured: async () => (await api.get("/projects/featured")).data,
  ...createAdminCrudService("projects"),
};
