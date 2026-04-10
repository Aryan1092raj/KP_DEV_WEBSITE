import api from "../lib/api";

export const adminAuthService = {
  getSession: async () =>
    (
      await api.get("/admin/session", {
        skipAuthHandler: true,
      })
    ).data,
  login: async (payload) =>
    (
      await api.post("/admin/login", payload, {
        skipAuthHandler: true,
      })
    ).data,
  logout: async () =>
    (
      await api.post(
        "/admin/logout",
        {},
        {
          skipAuthHandler: true,
        }
      )
    ).data,
};
