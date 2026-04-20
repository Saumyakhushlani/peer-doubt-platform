import { api } from "./client.js";

const ADMIN_TOKEN_KEY = "adminToken";

export function adminAuthHeader() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminLogin(password) {
  const { data } = await api.post("/admin/login", { password });
  return data;
}

export async function getAdminQuestions({ isAnonymous } = {}) {
  const params = {};
  if (typeof isAnonymous === "boolean") {
    params.isAnonymous = String(isAnonymous);
  }

  const { data } = await api.get("/admin/questions", {
    params,
    headers: adminAuthHeader(),
  });
  return data;
}

export async function deleteAdminQuestion(id) {
  const { data } = await api.delete(`/admin/questions/${id}`, {
    headers: adminAuthHeader(),
  });
  return data;
}
