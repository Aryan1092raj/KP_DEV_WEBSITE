import axios from "axios";

let unauthorizedHandler = null;

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
