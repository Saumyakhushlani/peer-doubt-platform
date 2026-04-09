import { api, authHeader } from "./client.js";

export async function createAnswer({ questionId, body }) {
  const { data } = await api.post(
    "/answer",
    { questionId, body },
    { headers: authHeader() }
  );
  return data;
}

