import { api, authHeader } from "./client.js";

export async function getQuestions({ cursor } = {}) {
  const { data } = await api.get("/question", {
    params: cursor ? { cursor } : {},
    headers: authHeader(),
  });
  return data;
}

export async function getQuestionById(id) {
  const { data } = await api.get(`/question/${id}`, { headers: authHeader() });
  return data;
}

export async function getQuestionsByAuthor(id) {
  const { data } = await api.get(`/question/author/${id}`, {
    headers: authHeader(),
  });
  return data;
}

