import axios from "axios";

let unauthorizedHandler = null;
const ADMIN_TOKEN_STORAGE_KEY = "kp_admin_access_token";
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const normalizedBaseUrl = rawBaseUrl
  .split(",")[0]
  .trim()
  .replace(/\/+$/, "");
const apiBaseUrl =
  normalizedBaseUrl.endsWith("/api") || normalizedBaseUrl.endsWith("/api/v1")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;

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
  const responseData = error.response?.data;

  if (responseData?.message) {
    return responseData;
  }

  if (responseData?.detail?.message) {
    return responseData.detail;
  }

  if (typeof responseData === "string" && /<!doctype html|<html/i.test(responseData)) {
    return {
      error: true,
      code: "API_ENDPOINT_MISCONFIGURED",
      message:
        "Frontend received HTML instead of API JSON. Check VITE_API_BASE_URL (must point to backend and include /api).",
    };
  }

  return {
    error: true,
    message: error.message || "Something went wrong.",
    code: "REQUEST_FAILED",
  };
}

const api = axios.create({
  baseURL: apiBaseUrl,
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
