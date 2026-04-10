import MarkdownPreview from "@uiw/react-markdown-preview";
import { Bookmark, MessageSquare, ThumbsDown, ThumbsUp, Plus } from "lucide-react";
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
      className="group cursor-pointer border-b-2 border-slate-900 bg-white p-6 transition-all hover:bg-slate-50"
    >
      <div className="flex items-start gap-4">
        <Link
          to={`/profile/${question.authorId}`}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-sm font-black text-white rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {nameInitials(author?.name)}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link
              to={`/profile/${question.authorId}`}
              className="text-blue-600 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              {author?.name ?? "Unknown"}
            </Link>
            <span>•</span>
            <span>{asked}</span>
            {author?.department && (
              <>
                <span>•</span>
                <span className="truncate max-w-[100px]">{author.department}</span>
              </>
            )}
          </div>

          <h2 className="mt-1 text-xl font-black leading-tight text-slate-900 md:text-2xl">
            <Link
              to={`/question/${question.id}`}
              className="hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {question.title}
            </Link>
          </h2>

          {tagRows.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tagRows.map((t) => {
                const name = t?.tag?.name || t?.name || "";
                if (!name) return null;
                return (
                  <span
                    key={t.tagId || name}
                    className="border border-slate-900 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-slate-900"
                  >
                    {formatTagLabel(name)}
                  </span>
                );
              })}
            </div>
          )}

          {showBody && (
            <div
              className={`mt-4 text-sm leading-relaxed text-slate-600 ${clampBody ? "line-clamp-3" : ""}`}
              data-color-mode="light"
            >
              <MarkdownPreview
                source={question.body ?? ""}
                style={{ padding: 0, backgroundColor: 'transparent', fontSize: 'inherit' }}
                rehypeRewrite={(node, parent) => {
                  if (node.tagName === "a" && parent && /^h[1-6]/.test(parent.tagName)) {
                    parent.children = parent.children.slice(1);
                  }
                }}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center border-2 border-slate-900 rounded-sm overflow-hidden bg-white">
              <button
                type="button"
                onClick={(e) => onVote?.(e, "UP")}
                disabled={voting}
                className={`flex h-8 w-8 items-center justify-center transition-colors border-r border-slate-900 ${
                  voteType === "UP" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
                }`}
              >
                <ThumbsUp size={14} strokeWidth={3} fill={voteType === "UP" ? "currentColor" : "none"} />
              </button>
              <span className="px-3 text-xs font-black tracking-tighter">
                {votesCount}
              </span>
              <button
                type="button"
                onClick={(e) => onVote?.(e, "DOWN")}
                disabled={voting}
                className={`flex h-8 w-8 items-center justify-center transition-colors border-l border-slate-900 ${
                  voteType === "DOWN" ? "bg-red-500 text-white" : "hover:bg-slate-100"
                }`}
              >
                <ThumbsDown size={14} strokeWidth={3} fill={voteType === "DOWN" ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase text-slate-500">
              <MessageSquare size={14} strokeWidth={3} />
              {answersCount} {answersCount === 1 ? "Solution" : "Solutions"}
            </div>

            <button
              type="button"
              onClick={onBookmark}
              disabled={bookmarking}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase transition-colors rounded-sm ${
                isBookmarked ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Bookmark size={14} strokeWidth={3} fill={isBookmarked ? "currentColor" : "none"} />
              {bookmarksCount}
            </button>

            {showAddAnswer && (
              <button
                type="button"
                onClick={onAddAnswer}
                className="ml-auto flex items-center gap-1.5 bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-600 transition-colors rounded-sm shadow-sm"
              >
                <Plus size={12} strokeWidth={4} />
                Respond
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}