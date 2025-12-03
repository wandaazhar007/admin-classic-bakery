import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
});

// Attach Firebase ID token if logged in
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    } as typeof config.headers;
  }
  return config;
});

export default api;