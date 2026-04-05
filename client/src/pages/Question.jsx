import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { Bookmark, Loader2, MessageSquare, ThumbsDown, ThumbsUp, X } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 15;

function formatAskedAt(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function nameInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Question() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);

  const [myVotes, setMyVotes] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [votingId, setVotingId] = useState(null);

  const [myBookmarks, setMyBookmarks] = useState({});
  const [bookmarkCounts, setBookmarkCounts] = useState({});
  const [bookmarkingId, setBookmarkingId] = useState(null);

  const [answerCounts, setAnswerCounts] = useState({});
  const [answerModalId, setAnswerModalId] = useState(null);
  const [answerModalTitle, setAnswerModalTitle] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [answerSaving, setAnswerSaving] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  const fetchPage = useCallback(async (cursor) => {
    const append = cursor != null;
    try {
      if (append) setLoadingMore(true);
      else { setLoading(true); setError(null); }

      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const { data } = await axios.get(`${BASE_URL}/api/question`, {
        params: cursor ? { cursor } : {},
        headers: { Authorization: `Bearer ${token}` },
      });

      const batch = data.questions ?? [];
      setQuestions((prev) => (append ? [...prev, ...batch] : batch));
      setHasMore(typeof data.hasMore === "boolean" ? data.hasMore : batch.length === PAGE_SIZE);

      setVoteCounts((prev) => {
        const next = { ...prev };
        batch.forEach((q) => {
          next[q.id] = q._count?.votes ?? 0;
        });
        return next;
      });
      setBookmarkCounts((prev) => {
        const next = { ...prev };
        batch.forEach((q) => {
          next[q.id] = q._count?.bookmarks ?? 0;
        });
        return next;
      });
      setAnswerCounts((prev) => {
        const next = { ...prev };
        batch.forEach((q) => {
          next[q.id] = q._count?.answers ?? 0;
        });
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? "Could not fetch questions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [navigate]);

  useEffect(() => { fetchPage(null); }, [fetchPage]);

  useEffect(() => {
    async function fetchMyVotes() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const { data } = await axios.get(`${BASE_URL}/api/vote/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const voteMap = {};
        (data.votes ?? []).forEach((v) => {
          if (v.questionId) voteMap[v.questionId] = v.type;
        });
        setMyVotes(voteMap);
      } catch {
      }
    }
    fetchMyVotes();
  }, []);

  useEffect(() => {
    async function loadBookmarks() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const { data: me } = await axios.get(`${BASE_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const uid = me.userId;
        if (!uid) return;
        const { data } = await axios.get(`${BASE_URL}/api/bookmark/user/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const map = {};
        (data.bookmarks ?? []).forEach((b) => {
          if (b.questionId) map[b.questionId] = true;
        });
        setMyBookmarks(map);
      } catch {
        
      }
    }
    loadBookmarks();
  }, []);

  async function handleVote(e, questionId, type) {
    e.stopPropagation();
    if (votingId === questionId) return;

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const currentVoteType = myVotes[questionId];
    setVotingId(questionId);

    if (currentVoteType === type) {
      setMyVotes((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
      setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) - (type === "UP" ? 1 : -1) }));

      try {
        await axios.delete(`${BASE_URL}/api/vote/question/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        setMyVotes((prev) => ({ ...prev, [questionId]: type }));
        setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + (type === "UP" ? 1 : -1) }));
      }
    } else {
      let diff = 0;
      if (currentVoteType === "UP" && type === "DOWN") diff = -2;
      else if (currentVoteType === "DOWN" && type === "UP") diff = 2;
      else if (!currentVoteType && type === "UP") diff = 1;
      else if (!currentVoteType && type === "DOWN") diff = -1;

      setMyVotes((prev) => ({ ...prev, [questionId]: type }));
      setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + diff }));

      try {
        await axios.post(
          `${BASE_URL}/api/vote`,
          { type, questionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {
        if (currentVoteType) {
          setMyVotes((prev) => ({ ...prev, [questionId]: currentVoteType }));
        } else {
          setMyVotes((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
        }
        setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) - diff }));
      }
    }

    setVotingId(null);
  }

  function openAnswerModal(e, question) {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setAnswerModalId(question.id);
    setAnswerModalTitle(question.title ?? "");
    setAnswerDraft("");
    setAnswerError(null);
  }

  function dismissAnswerModal() {
    setAnswerModalId(null);
    setAnswerModalTitle("");
    setAnswerDraft("");
    setAnswerError(null);
  }

  function closeAnswerModal() {
    if (answerSaving) return;
    dismissAnswerModal();
  }

  async function submitAnswer() {
    if (!answerModalId || answerSaving) return;
    const body = String(answerDraft ?? "").trim();
    if (!body) {
      setAnswerError("Write your answer in the editor.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setAnswerSaving(true);
    setAnswerError(null);
    const qid = answerModalId;
    try {
      await axios.post(
        `${BASE_URL}/api/answer`,
        { questionId: qid, body: answerDraft },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswerCounts((prev) => ({
        ...prev,
        [qid]: (prev[qid] ?? 0) + 1,
      }));
      dismissAnswerModal();
    } catch (err) {
      setAnswerError(
        err.response?.data?.error ?? err.message ?? "Could not post answer"
      );
    } finally {
      setAnswerSaving(false);
    }
  }

  async function handleBookmark(e, questionId, currentCount) {
    e.stopPropagation();
    if (bookmarkingId === questionId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const isOn = !!myBookmarks[questionId];
    setBookmarkingId(questionId);

    if (isOn) {
      setMyBookmarks((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });
      setBookmarkCounts((prev) => ({
        ...prev,
        [questionId]: Math.max(0, (prev[questionId] ?? currentCount) - 1),
      }));
      try {
        await axios.delete(`${BASE_URL}/api/bookmark/question/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        setMyBookmarks((prev) => ({ ...prev, [questionId]: true }));
        setBookmarkCounts((prev) => ({
          ...prev,
          [questionId]: (prev[questionId] ?? 0) + 1,
        }));
      }
    } else {
      setMyBookmarks((prev) => ({ ...prev, [questionId]: true }));
      setBookmarkCounts((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] ?? currentCount) + 1,
      }));
      try {
        await axios.post(
          `${BASE_URL}/api/bookmark`,
          { questionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {
        setMyBookmarks((prev) => {
          const n = { ...prev };
          delete n[questionId];
          return n;
        });
        setBookmarkCounts((prev) => ({
          ...prev,
          [questionId]: currentCount,
        }));
      }
    }

    setBookmarkingId(null);
  }
  function loadMore() {
    if (!hasMore || loadingMore || questions.length === 0) return;
    fetchPage(questions[questions.length - 1].id);
  }

  function getAllUniqueTags() {
    const tagSet = new Set();
    questions.forEach((q) => {
      if (Array.isArray(q.tags)) {
        q.tags.forEach((qt) => {
          const name = typeof qt?.tag?.name === "string" ? qt.tag.name.trim() : "";
          if (name) tagSet.add(name);
        });
      }
    });
    return Array.from(tagSet).sort();
  }

  function toggleTag(tagName) {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  }

  function getFilteredQuestions() {
    if (selectedTags.length === 0) return questions;
    return questions.filter((q) => {
      if (!Array.isArray(q.tags)) return false;
      const names = q.tags.map((qt) => qt?.tag?.name?.trim()).filter(Boolean);
      return selectedTags.some((t) => names.includes(t));
    });
  }

  const filteredQuestions = getFilteredQuestions();
  const allUniqueTags = getAllUniqueTags();

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f7fc] px-6 py-16 text-center text-slate-600">
        Loading questions…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f7fc] px-6 pb-20 pt-10 font-sans text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-[#0f1419]">Questions</h1>
          <Link
            to="/question/create"
            className="rounded-xl bg-[#1e9df1] px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-95"
          >
            Ask a question
          </Link>
        </div>

        {allUniqueTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Topics:
            </span>
            {allUniqueTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ${isActive
                      ? "bg-[#1e9df1] text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-[#1e9df1] hover:text-[#1e9df1]"
                    }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="ml-1 text-xs font-semibold text-slate-400 transition-colors hover:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {filteredQuestions.map((question) => {
            const author = question.author;
            const tagRows = Array.isArray(question.tags) ? question.tags : [];
            const asked = formatAskedAt(question.createdAt);
            const c = question._count ?? {};
            const nAnswers = answerCounts[question.id] ?? c.answers ?? 0;
            const nBookmarks = bookmarkCounts[question.id] ?? c.bookmarks ?? 0;
            const nVotes = voteCounts[question.id] ?? c.votes ?? 0;
            const voteType = myVotes[question.id];

            return (
              <li
                key={question.id}
                onClick={() => navigate(`/question/${question.id}`)}
                className="cursor-pointer rounded-2xl border border-b-2 border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-150 hover:shadow-md"
              >
                <div className="flex gap-3">

                  <Link
                    to={`/profile/${question.authorId}`}
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-xs font-black tracking-tight text-sky-900">
                      {nameInitials(author?.name)}
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">

                    <h2 className="text-xl font-bold leading-snug text-[#0f1419]">
                      <Link
                        to={`/question/${question.id}`}
                        className="hover:text-[#1e9df1] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {question.title}
                      </Link>
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-500">
                      <Link
                        to={`/profile/${question.authorId}`}
                        className="font-semibold text-[#1e9df1] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {author?.name ?? "Unknown"}
                      </Link>
                      {asked && (
                        <><span className="text-slate-300">·</span><span>{asked}</span></>
                      )}
                      {author?.department && (
                        <><span className="text-slate-300">·</span><span className="truncate">{author.department.trim()}</span></>
                      )}
                      {author?.year != null && (
                        <><span className="text-slate-300">·</span><span>Year {author.year}</span></>
                      )}
                    </div>

                    {tagRows.length > 0 && (
                      <div className="relative mt-3 min-h-7 overflow-hidden">
                        <div className="flex flex-nowrap gap-2 overflow-hidden pr-8">
                          {tagRows.map((qt) => {
                            const name = typeof qt?.tag?.name === "string" ? qt.tag.name.trim() : "";
                            if (!name) return null;
                            return (
                              <span
                                key={qt.tagId ?? qt.tag?.id ?? `${question.id}-${name}`}
                                className="shrink-0 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-900"
                              >
                                {name}
                              </span>
                            );
                          })}
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
                      </div>
                    )}

                    <div className="mt-3 line-clamp-4 text-sm text-slate-600" data-color-mode="light">
                      <MarkdownPreview
                        source={question.body ?? ""}
                        style={{ padding: 0 }}
                        rehypeRewrite={(node, parent) => {
                          if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
                            parent.children = parent.children.slice(1);
                          }
                        }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">

                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {nAnswers} {nAnswers === 1 ? "answer" : "answers"}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => openAnswerModal(e, question)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1e9df1] hover:bg-sky-50"
                      >
                        Add answer
                      </button>

                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleVote(e, question.id, "UP")}
                          disabled={votingId === question.id}
                          title="Upvote"
                          className={`transition-colors duration-150 disabled:opacity-50 ${
                            voteType === "UP" ? "text-[#1e9df1]" : "text-slate-500 hover:text-[#1e9df1]"
                          }`}
                        >
                          <ThumbsUp
                            className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
                              voteType === "UP" ? "fill-[#1e9df1] text-[#1e9df1]" : "text-slate-400"
                            }`}
                          />
                        </button>
                        <span className={`min-w-[1.5ch] text-center font-bold ${nVotes > 0 ? "text-[#1e9df1]" : nVotes < 0 ? "text-red-500" : "text-slate-500"}`}>{nVotes}</span>
                        <button
                          onClick={(e) => handleVote(e, question.id, "DOWN")}
                          disabled={votingId === question.id}
                          title="Downvote"
                          className={`transition-colors duration-150 disabled:opacity-50 ${
                            voteType === "DOWN" ? "text-red-500" : "text-slate-500 hover:text-red-500"
                          }`}
                        >
                          <ThumbsDown
                            className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
                              voteType === "DOWN" ? "fill-red-500 text-red-500" : "text-slate-400"
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) =>
                          handleBookmark(e, question.id, c.bookmarks ?? 0)
                        }
                        disabled={bookmarkingId === question.id}
                        className={`inline-flex items-center gap-1.5 transition-colors duration-150 disabled:opacity-50 ${
                          myBookmarks[question.id]
                            ? "text-[#1e9df1]"
                            : "text-slate-500 hover:text-[#1e9df1]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Bookmark className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${myBookmarks[question.id] ? "fill-[#1e9df1] text-[#1e9df1]" : "text-slate-400"
                            }`} />
                          {nBookmarks} {nBookmarks === 1 ? "bookmark" : "bookmarks"}
                        </span>
                      </button>

                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {questions.length === 0 && !error && (
          <p className="text-center text-slate-500">No questions yet.</p>
        )}
        {questions.length > 0 && filteredQuestions.length === 0 && (
          <p className="text-center text-slate-500">No questions match the selected tags.</p>
        )}

        {hasMore && filteredQuestions.length > 0 && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mx-auto rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#0f1419] shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}

        {answerModalId && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-modal-title"
            onClick={closeAnswerModal}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Your answer
                  </p>
                  <h3
                    id="answer-modal-title"
                    className="mt-1 line-clamp-2 text-base font-bold text-[#0f1419]"
                  >
                    {answerModalTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeAnswerModal}
                  disabled={answerSaving}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {answerError && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {answerError}
                  </div>
                )}
                <div
                  data-color-mode="light"
                  className="overflow-hidden rounded-xl border-2 border-slate-300"
                >
                  <MDEditor
                    value={answerDraft}
                    onChange={(v) => setAnswerDraft(v ?? "")}
                    height={300}
                    preview="edit"
                    visibleDragbar={false}
                  />
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={closeAnswerModal}
                  disabled={answerSaving}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={answerSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1e9df1] px-4 py-2 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {answerSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting…
                    </>
                  ) : (
                    "Post answer"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}