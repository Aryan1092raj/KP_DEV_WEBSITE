import axios from "axios";

let accessToken = null;
let unauthorizedHandler = null;
const ADMIN_TOKEN_STORAGE_KEY = "kp_admin_access_token";

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ||
    window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  );
}

export function setAccessToken(token) {
  accessToken = token;
}

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
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (!accessToken) {
    accessToken = readStoredToken();
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
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
