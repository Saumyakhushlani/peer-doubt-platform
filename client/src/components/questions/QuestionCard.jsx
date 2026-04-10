import MarkdownPreview from "@uiw/react-markdown-preview";
import { Bookmark, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { formatTagLabel } from "../../lib/formatTag.js";

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
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function QuestionCard({
  question,
  voteType,
  votesCount,
  answersCount,
  bookmarksCount,
  isBookmarked,
  voting,
  bookmarking,
  onClick,
  onVote,
  onBookmark,
  onAddAnswer,
  showVoting = true,
  showBookmark = true,
  showAddAnswer = true,
  showBody = true,
  clampBody = true,
}) {
  const author = question.author;
  const tagRows = Array.isArray(question.tags) ? question.tags : [];
  const asked = formatAskedAt(question.createdAt);

  return (
    <li
      onClick={onClick}
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
              <>
                <span className="text-slate-300">·</span>
                <span>{asked}</span>
              </>
            )}
            {author?.department && (
              <>
                <span className="text-slate-300">·</span>
                <span className="truncate">{author.department.trim()}</span>
              </>
            )}
            {author?.year != null && (
              <>
                <span className="text-slate-300">·</span>
                <span>Year {author.year}</span>
              </>
            )}
          </div>

          {tagRows.length > 0 && (
            <div className="relative mt-3 min-h-7 overflow-hidden">
              <div className="flex flex-nowrap gap-2 overflow-hidden pr-8">
                {tagRows.map((t) => {
                  const name =
                    typeof t?.tag?.name === "string"
                      ? t.tag.name.trim()
                      : typeof t?.name === "string"
                        ? t.name.trim()
                        : "";
                  if (!name) return null;
                  return (
                    <span
                      key={t.tagId ?? t.tag?.id ?? t.id ?? `${question.id}-${name}`}
                      className="shrink-0 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-900"
                    >
                      {formatTagLabel(name)}
                    </span>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
            </div>
          )}

          {showBody && (
            <div
              className={`mt-3 text-sm text-slate-600 ${clampBody ? "line-clamp-4" : ""}`}
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
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {answersCount} {answersCount === 1 ? "answer" : "answers"}
            </span>

            {showAddAnswer && onAddAnswer && (
              <button
                type="button"
                onClick={onAddAnswer}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1e9df1] hover:bg-sky-50"
              >
                Add answer
              </button>
            )}

            {showVoting && (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => onVote?.(e, "UP")}
                  disabled={voting}
                  title="Upvote"
                  className={`transition-colors duration-150 disabled:opacity-50 ${
                    voteType === "UP"
                      ? "text-[#1e9df1]"
                      : "text-slate-500 hover:text-[#1e9df1]"
                  }`}
                >
                  <ThumbsUp
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
                      voteType === "UP"
                        ? "fill-[#1e9df1] text-[#1e9df1]"
                        : "text-slate-400"
                    }`}
                  />
                </button>
                <span
                  className={`min-w-[1.5ch] text-center font-bold ${
                    votesCount > 0
                      ? "text-[#1e9df1]"
                      : votesCount < 0
                        ? "text-red-500"
                        : "text-slate-500"
                  }`}
                >
                  {votesCount}
                </span>
                <button
                  type="button"
                  onClick={(e) => onVote?.(e, "DOWN")}
                  disabled={voting}
                  title="Downvote"
                  className={`transition-colors duration-150 disabled:opacity-50 ${
                    voteType === "DOWN"
                      ? "text-red-500"
                      : "text-slate-500 hover:text-red-500"
                  }`}
                >
                  <ThumbsDown
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
                      voteType === "DOWN"
                        ? "fill-red-500 text-red-500"
                        : "text-slate-400"
                    }`}
                  />
                </button>
              </div>
            )}

            {showBookmark && (
              <button
                type="button"
                onClick={onBookmark}
                disabled={bookmarking}
                className={`inline-flex items-center gap-1.5 transition-colors duration-150 disabled:opacity-50 ${
                  isBookmarked
                    ? "text-[#1e9df1]"
                    : "text-slate-500 hover:text-[#1e9df1]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Bookmark
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
                      isBookmarked
                        ? "fill-[#1e9df1] text-[#1e9df1]"
                        : "text-slate-400"
                    }`}
                  />
                  {bookmarksCount}{" "}
                  {bookmarksCount === 1 ? "bookmark" : "bookmarks"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

