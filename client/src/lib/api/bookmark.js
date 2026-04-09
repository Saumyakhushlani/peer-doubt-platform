import { api, authHeader } from "./client.js";

export async function getBookmarksByUser(userId) {
  const { data } = await api.get(`/bookmark/user/${userId}`, {
    headers: authHeader(),
  });
  return data;
}

export async function addBookmark(questionId) {
  const { data } = await api.post(
    "/bookmark",
    { questionId },
    { headers: authHeader() }
  );
  return data;
}

export async function removeBookmark(questionId) {
  const { data } = await api.delete(`/bookmark/question/${questionId}`, {
    headers: authHeader(),
  });
  return data;
}

