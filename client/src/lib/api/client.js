import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

