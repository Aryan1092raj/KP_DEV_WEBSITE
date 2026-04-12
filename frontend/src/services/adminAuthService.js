import api from "../lib/api";

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureValidAdminSessionPayload(payload) {
  if (!isObject(payload) || !isObject(payload.user) || payload.user.role !== "admin") {
    throw {
      error: true,
      code: "INVALID_AUTH_PAYLOAD",
      message:
        "Received an invalid login/session response from API. Verify backend URL, /api routing, and admin auth deployment.",
    };
  }

  return payload;
}

export const adminAuthService = {
  getSession: async () => {
    const response = await api.get("/admin/session", {
      skipAuthHandler: true,
    });
    return ensureValidAdminSessionPayload(response.data);
  },
  login: async (payload) => {
    const response = await api.post("/admin/login", payload, {
      skipAuthHandler: true,
    });
    return ensureValidAdminSessionPayload(response.data);
  },
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
