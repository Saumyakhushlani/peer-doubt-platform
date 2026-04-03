import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Bookmark, MessageSquare, ThumbsUp } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const PAGE_SIZE = 15;

function formatAskedAt(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function nameInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    return (w[0] ?? "?").toUpperCase();
  }
  const a = parts[0][0] ?? "";
  const b = parts[parts.length - 1][0] ?? "";
  return `${a}${b}`.toUpperCase();
}

export default function Question() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (cursor) => {
    const append = cursor != null;
    try {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/api/question`, {
        params: cursor ? { cursor } : {},
        headers: { Authorization: `Bearer ${token}` },
      });

      const batch = data.questions ?? [];
      setQuestions((prev) => (append ? [...prev, ...batch] : batch));
      setHasMore(
        typeof data.hasMore === "boolean"
          ? data.hasMore
          : batch.length === PAGE_SIZE
      );
    } catch (err) {
      setError(
        err.response?.data?.error ??
          err.message ??
          "Could not fetch questions"
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPage(null);
  }, [fetchPage]);

  function loadMore() {
    if (!hasMore || loadingMore || questions.length === 0) return;
    const lastId = questions[questions.length - 1].id;
    fetchPage(lastId);
  }

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

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {questions.map((question) => {
            const author = question.author;
            const tagRows = Array.isArray(question.tags) ? question.tags : [];
            const asked = formatAskedAt(question.createdAt);
            const c = question._count ?? {};
            const nAnswers = c.answers ?? 0;
            const nVotes = c.votes ?? 0;
            const nBookmarks = c.bookmarks ?? 0;

            return (
              <li
                onClick={() => navigate(`/question/${question.id}`)}
                key={question.id}
                className="rounded-2xl border border-slate-200 border-b-2 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-3">
                  <Link
                    to={`/profile/${question.authorId}`}
                    className="shrink-0"
                    aria-label={author?.name ? `Profile: ${author.name}` : "Author profile"}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-xs font-black tracking-tight text-sky-900"
                      aria-hidden
                    >
                      {nameInitials(author?.name)}
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold leading-snug text-[#0f1419]">
                      <Link
                        to={`/question/${question.id}`}
                        className="hover:text-[#1e9df1] hover:underline"
                      >
                        {question.title}
                      </Link>
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-500">
                      <Link
                        to={`/profile/${question.authorId}`}
                        className="font-semibold text-[#1e9df1] hover:underline"
                      >
                        {author?.name ?? "Unknown"}
                      </Link>
                      {asked && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{asked}</span>
                        </>
                      )}
                      {author?.department ? (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="truncate">{author.department.trim()}</span>
                        </>
                      ) : null}
                      {author?.year != null ? (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>Year {author.year}</span>
                        </>
                      ) : null}
                    </div>

                    {tagRows.length > 0 && (
                      <div className="relative mt-3 min-h-7 overflow-hidden">
                        <div className="flex flex-nowrap gap-2 overflow-hidden pr-8">
                          {tagRows.map((qt) => {
                            const name =
                              typeof qt?.tag?.name === "string"
                                ? qt.tag.name.trim()
                                : "";
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
                        <div
                          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent"
                          aria-hidden
                        />
                      </div>
                    )}

                    <div
                      className="mt-3 line-clamp-4 text-sm text-slate-600"
                      data-color-mode="light"
                    >
                      <MarkdownPreview
                        source={question.body ?? ""}
                        style={{ padding: 0 }}
                        rehypeRewrite={(node, parent) => {
                          if (
                            node.tagName === "a" &&
                            parent &&
                            /^h(1|2|3|4|5|6)/.test(parent.tagName)
                          ) {
                            parent.children = parent.children.slice(1);
                          }
                        }}
                      />
                    </div>

                    

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {nAnswers} {nAnswers === 1 ? "answer" : "answers"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {nVotes} {nVotes === 1 ? "vote" : "votes"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Bookmark className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {nBookmarks}{" "}
                        {nBookmarks === 1 ? "bookmark" : "bookmarks"}
                      </span>
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

        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mx-auto rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#0f1419] shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
