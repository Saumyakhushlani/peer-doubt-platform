import MarkdownPreview from "@uiw/react-markdown-preview";
import { ThumbsDown, ThumbsUp, GraduationCap, Clock } from "lucide-react";
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
    <li className="border-b-2 border-slate-900 bg-white p-6 transition-all hover:bg-slate-50">
      <div className="flex items-start gap-5">
        <Link
          to={`/profile/${answer.authorId}`}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-10 w-10 items-center justify-center bg-blue-600 text-xs font-black text-white rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {nameInitials(author?.name)}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${answer.authorId}`}
                className="text-xs font-black uppercase tracking-tight text-blue-600 hover:text-slate-950 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {author?.name ?? "Anonymous Student"}
              </Link>
              {author?.year && (
                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 rounded-sm">
                  <GraduationCap size={10} />
                  Year {author.year}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <Clock size={10} strokeWidth={3} />
              {formatWhen(answer.createdAt)}
            </div>
          </div>

          <div className="text-sm leading-relaxed text-slate-800 mb-6" data-color-mode="light">
            <MarkdownPreview 
              source={answer.body ?? ""} 
              style={{ padding: 0, backgroundColor: 'transparent', fontSize: 'inherit' }} 
            />
          </div>

          <div className="flex items-center w-fit border-2 border-slate-900 bg-white rounded-sm overflow-hidden shrink-0">
            <button
              type="button"
              onClick={(e) => onVote?.(e, "UP")}
              disabled={voting}
              className={`flex h-8 w-9 items-center justify-center border-r border-slate-900 transition-colors ${
                voteType === "UP" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
              }`}
            >
              <ThumbsUp size={14} strokeWidth={3} fill={voteType === "UP" ? "currentColor" : "none"} />
            </button>
            <span className="px-4 text-[11px] font-black tracking-tighter">
              {votesCount}
            </span>
            <button
              type="button"
              onClick={(e) => onVote?.(e, "DOWN")}
              disabled={voting}
              className={`flex h-8 w-9 items-center justify-center border-l border-slate-900 transition-colors ${
                voteType === "DOWN" ? "bg-red-500 text-white" : "hover:bg-slate-100"
              }`}
            >
              <ThumbsDown size={14} strokeWidth={3} fill={voteType === "DOWN" ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}