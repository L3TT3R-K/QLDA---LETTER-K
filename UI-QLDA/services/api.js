import axios from "axios";
import { tokenStorageKey } from "@/lib/auth"; //

const api = axios.create({
  // Bắt buộc trỏ về Backend Java (Không dùng process.env để tránh nhầm lẫn lúc này)
  baseURL: "http://localhost:8080", 
});

// Tự động đính kèm Token để vượt qua JwtAuthenticationFilter
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; //
  }
  return config;
});

export default api;