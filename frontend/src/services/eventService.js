import api from "../lib/api";
import { createAdminCrudService } from "./createAdminCrudService";

export const eventService = {
  getAll: async () => (await api.get("/events")).data,
  getUpcoming: async () => (await api.get("/events/upcoming")).data,
  ...createAdminCrudService("events"),
};
