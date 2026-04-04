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
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchPage = useCallback(
    async (cursor) => {
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
            : batch.length === PAGE_SIZE,
        );
      } catch (err) {
        setError(
          err.response?.data?.error ??
            err.message ??
            "Could not fetch questions",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    fetchPage(null);
  }, [fetchPage]);

  function loadMore() {
    if (!hasMore || loadingMore || questions.length === 0) return;
    const lastId = questions[questions.length - 1].id;
    fetchPage(lastId);
  }

  function getAllUniqueTags() {
    const tagSet = new Set();
    questions.forEach((q) => {
      if (Array.isArray(q.tags)) {
        q.tags.forEach((qt) => {
          const tagName =
            typeof qt?.tag?.name === "string" ? qt.tag.name.trim() : "";
          if (tagName) tagSet.add(tagName);
        });
      }
    });
    return Array.from(tagSet).sort();
  }

  function toggleTag(tagName) {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  }

  function getFilteredQuestions() {
    if (selectedTags.length === 0) return questions;
    return questions.filter((question) => {
      if (!Array.isArray(question.tags)) return false;
      const questionTagNames = question.tags
        .map((qt) =>
          typeof qt?.tag?.name === "string" ? qt.tag.name.trim() : "",
        )
        .filter(Boolean);
      return selectedTags.some((tag) => questionTagNames.includes(tag));
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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-[#0f1419]">Questions</h1>
          <Link
            to="/question/create"
            className="rounded-xl bg-[#1e9df1] px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-95"
          >
            Ask a question
          </Link>
        </div>

        {/* ── Professional Filter Panel ── */}
        {allUniqueTags.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Panel header */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Filter by tag
              </span>
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 ${
                  selectedTags.length > 0
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M2 2l8 8M10 2l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Clear all
              </button>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2">
              {allUniqueTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "border border-[#185FA5] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] hover:border-[#0C447C]"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    {/* Checkmark icon shown only when active */}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={`shrink-0 transition-all duration-150 ${
                        isActive ? "opacity-100 w-[11px]" : "opacity-0 w-0"
                      }`}
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Active filter chips row */}
            {selectedTags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Active
                </span>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 py-0.5 pl-2.5 pr-1.5 text-xs font-medium text-sky-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      aria-label={`Remove ${tag} filter`}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-sky-400 transition-colors hover:bg-sky-200 hover:text-sky-800"
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
                <span className="ml-auto text-xs text-slate-400">
                  {filteredQuestions.length}{" "}
                  {filteredQuestions.length === 1 ? "result" : "results"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Questions list */}
        <ul className="flex flex-col gap-4">
          {filteredQuestions.map((question) => {
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
                className="cursor-pointer rounded-2xl border border-slate-200 border-b-2 bg-white p-5 shadow-sm transition-shadow duration-150 hover:shadow-md"
              >
                <div className="flex gap-3">
                  <Link
                    to={`/profile/${question.authorId}`}
                    className="shrink-0"
                    aria-label={
                      author?.name
                        ? `Profile: ${author.name}`
                        : "Author profile"
                    }
                    onClick={(e) => e.stopPropagation()}
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
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{asked}</span>
                        </>
                      )}
                      {author?.department ? (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="truncate">
                            {author.department.trim()}
                          </span>
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
                                key={
                                  qt.tagId ??
                                  qt.tag?.id ??
                                  `${question.id}-${name}`
                                }
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

        {/* Empty states */}
        {questions.length === 0 && !error && (
          <p className="text-center text-slate-500">No questions yet.</p>
        )}

        {questions.length > 0 && filteredQuestions.length === 0 && (
          <p className="text-center text-slate-500">
            No questions match the selected tags.
          </p>
        )}

        {/* Load more */}
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
      </div>
    </div>
  );
}
