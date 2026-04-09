import MarkdownPreview from "@uiw/react-markdown-preview";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

function formatWhen(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

export default function AnswerCard({
  answer,
  voteType,
  votesCount,
  voting,
  onVote,
}) {
  const author = answer.author;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <Link
          to={`/profile/${answer.authorId}`}
          className="shrink-0"
          aria-label={author?.name ? `Profile: ${author.name}` : "Answer author"}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-xs font-black text-sky-900">
            {nameInitials(author?.name)}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2 text-sm">
              <Link
                to={`/profile/${answer.authorId}`}
                className="font-bold text-[#1e9df1] hover:underline"
              >
                {author?.name ?? "Unknown"}
              </Link>
              <span className="text-xs text-slate-400">
                {formatWhen(answer.createdAt)}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
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
                  className={`h-4 w-4 transition-colors duration-150 ${
                    voteType === "UP"
                      ? "fill-[#1e9df1] text-[#1e9df1]"
                      : "text-slate-400"
                  }`}
                />
              </button>
              <span
                className={`min-w-[1.5ch] text-center font-bold text-sm ${
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
                  className={`h-4 w-4 transition-colors duration-150 ${
                    voteType === "DOWN"
                      ? "fill-red-500 text-red-500"
                      : "text-slate-400"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-800" data-color-mode="light">
            <MarkdownPreview source={answer.body ?? ""} style={{ padding: 0 }} />
          </div>
        </div>
      </div>
    </li>
  );
}

