import { api, authHeader } from "./client.js";

export async function getMe() {
  const { data } = await api.get("/user/me", { headers: authHeader() });
  return data;
}

