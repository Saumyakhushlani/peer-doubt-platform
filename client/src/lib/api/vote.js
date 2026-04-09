import { api, authHeader } from "./client.js";

export async function getMyVotes() {
  const { data } = await api.get("/vote/my", { headers: authHeader() });
  return data;
}

export async function voteQuestion({ questionId, type }) {
  const { data } = await api.post(
    "/vote",
    { questionId, type },
    { headers: authHeader() }
  );
  return data;
}

export async function voteAnswer({ answerId, type }) {
  const { data } = await api.post(
    "/vote",
    { answerId, type },
    { headers: authHeader() }
  );
  return data;
}

export async function deleteVoteForQuestion(questionId) {
  const { data } = await api.delete(`/vote/question/${questionId}`, {
    headers: authHeader(),
  });
  return data;
}

export async function deleteVoteForAnswer(answerId) {
  const { data } = await api.delete(`/vote/answer/${answerId}`, {
    headers: authHeader(),
  });
  return data;
}

