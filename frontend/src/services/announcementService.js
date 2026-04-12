import api from "../lib/api";
import { createAdminCrudService } from "./createAdminCrudService";

export const announcementService = {
  getPublished: async () => (await api.get("/announcements")).data,
  ...createAdminCrudService("announcements"),
};
