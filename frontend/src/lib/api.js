import axios from "axios";

let unauthorizedHandler = null;
const ADMIN_TOKEN_STORAGE_KEY = "kp_admin_access_token";
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const normalizedBaseUrl = rawBaseUrl
  .split(",")[0]
  .trim()
  .replace(/\/+$/, "");

function clearLegacyStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

clearLegacyStoredToken();

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function extractError(error) {
  if (error.response?.data?.message) {
    return error.response.data;
  }

  return {
    error: true,
    message: error.message || "Something went wrong.",
    code: "REQUEST_FAILED",
  };
}

const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      unauthorizedHandler &&
      !error.config?.skipAuthHandler
    ) {
      await unauthorizedHandler();
    }
    return Promise.reject(extractError(error));
  }
);

export default api;
