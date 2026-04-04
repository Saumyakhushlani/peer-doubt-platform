import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { ArrowLeft, Bookmark, Loader2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function formatAskedAt(iso) {
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
    if (parts.length === 1) {
        const w = parts[0];
        return (w[0] ?? "?").toUpperCase();
    }
    const a = parts[0][0] ?? "";
    const b = parts[parts.length - 1][0] ?? "";
    return `${a}${b}`.toUpperCase();
}

function isAnswerRow(a) {
    return a && typeof a.body === "string" && a.author;
}

export default function QuestionWithId() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myVote, setMyVote] = useState(null);
    const [voteCount, setVoteCount] = useState(0);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchQuestion = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            try {
                const { data } = await axios.get(`${BASE_URL}/api/question/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setQuestion(data.question ?? null);
                setVoteCount(data.question?._count?.votes ?? 0);
            } catch (err) {
                setError(
                    err.response?.data?.error ??
                    err.message ??
                    "Could not fetch question"
                );
                setQuestion(null);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id, navigate]);

    useEffect(() => {
        async function fetchMyVote() {
            const token = localStorage.getItem("token");
            if (!token || !id) return;
            try {
                const { data } = await axios.get(`${BASE_URL}/api/vote/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const v = data.votes?.find(v => v.questionId === id);
                if (v) setMyVote(v.type);
            } catch {}
        }
        fetchMyVote();
    }, [id]);

    async function handleVote(type) {
        if (voting) return;
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        setVoting(true);
        const currentVote = myVote;

        if (currentVote === type) {
            setMyVote(null);
            setVoteCount(prev => prev - (type === "UP" ? 1 : -1));
            try {
                await axios.delete(`${BASE_URL}/api/vote/question/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            } catch {
                setMyVote(currentVote);
                setVoteCount(prev => prev + (type === "UP" ? 1 : -1));
            }
        } else {
            let diff = 0;
            if (currentVote === "UP" && type === "DOWN") diff = -2;
            else if (currentVote === "DOWN" && type === "UP") diff = 2;
            else if (!currentVote && type === "UP") diff = 1;
            else if (!currentVote && type === "DOWN") diff = -1;

            setMyVote(type);
            setVoteCount(prev => prev + diff);
            try {
                await axios.post(`${BASE_URL}/api/vote`, { type, questionId: id }, { headers: { Authorization: `Bearer ${token}` } });
            } catch {
                setMyVote(currentVote);
                setVoteCount(prev => prev - diff);
            }
        }
        setVoting(false);
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f0f7fc] text-slate-600">
                <Loader2 className="h-8 w-8 animate-spin text-[#1e9df1]" />
                <span className="text-sm font-semibold">Loading question…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f0f7fc] px-6 py-16">
                <div className="mx-auto max-w-5xl">
                    <Link
                        to="/question"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#1e9df1] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to questions
                    </Link>
                    <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-[#f0f7fc] px-6 py-16 text-center text-slate-600">
                <p className="font-semibold">Question not found.</p>
                <Link
                    to="/question"
                    className="mt-4 inline-block text-sm font-bold text-[#1e9df1] hover:underline"
                >
                    Back to questions
                </Link>
            </div>
        );
    }

    const author = question.author;
    const tags = Array.isArray(question.tags) ? question.tags : [];
    const count = question._count ?? {};
    const answers = Array.isArray(question.answers)
        ? question.answers.filter(isAnswerRow)
        : [];
    const asked = formatAskedAt(question.createdAt);

    return (
        <div className="min-h-screen bg-[#f0f7fc] px-6 pb-20 pt-8 font-sans text-slate-900">
            <div className="mx-auto max-w-5xl">
                <Link
                    to="/question"
                    className="mb-6 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:opacity-90"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> BACK TO QUESTIONS
                </Link>

                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-sky-50/80 px-6 py-5 sm:px-8">
                        <div className="flex gap-4">
                            <Link
                                to={`/profile/${question.authorId}`}
                                className="shrink-0"
                                aria-label={author?.name ? `Profile: ${author.name}` : "Author"}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sm font-black tracking-tight text-sky-900">
                                    {nameInitials(author?.name)}
                                </div>
                            </Link>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-black leading-tight text-[#0f1419] sm:text-3xl">
                                    {question.title}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                                    <Link
                                        to={`/profile/${question.authorId}`}
                                        className="font-bold text-[#1e9df1] hover:underline"
                                    >
                                        {author?.name ?? "Unknown"}
                                    </Link>
                                    {asked && (
                                        <>
                                            <span className="text-slate-300">·</span>
                                            <span>{asked}</span>
                                        </>
                                    )}
                                    {author?.scholar_no ? (
                                        <>
                                            <span className="text-slate-300">·</span>
                                            <span className="font-mono text-xs">
                                                {author.scholar_no}
                                            </span>
                                        </>
                                    ) : null}
                                </div>
                                {(author?.department || author?.year != null) && (
                                    <p className="mt-1 text-sm text-slate-500">
                                        {author?.department?.trim()}
                                        {author?.department && author?.year != null ? " · " : ""}
                                        {author?.year != null ? `Year ${author.year}` : ""}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 sm:px-8">
                        {tags.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {tags.map((tag) => 
                                    <span
                                        key={tag.id ?? tag.name}
                                        className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900"
                                    >
                                        {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
                                    </span>
                                )}
                            </div>
                        )}

                        <div
                            className="markdown-question text-[15px] leading-relaxed text-slate-800"
                            data-color-mode="light"
                        >
                            <MarkdownPreview
                                source={question.body ?? ""}
                                style={{ padding: 0 }}
                            />
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-6 text-sm font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-slate-400" />
                                {count.answers ?? 0}{" "}
                                {(count.answers ?? 0) === 1 ? "answer" : "answers"}
                            </span>
                            <div className="inline-flex items-center gap-1.5">
                                <button
                                    onClick={() => handleVote("UP")}
                                    disabled={voting}
                                    title="Upvote"
                                    className={`transition-colors duration-150 disabled:opacity-50 ${
                                        myVote === "UP" ? "text-[#1e9df1]" : "text-slate-500 hover:text-[#1e9df1]"
                                    }`}
                                >
                                    <ThumbsUp
                                        className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                                            myVote === "UP" ? "fill-[#1e9df1] text-[#1e9df1]" : "text-slate-400"
                                        }`}
                                    />
                                </button>
                                <span className={`min-w-[1.5ch] text-center font-bold text-sm ${voteCount > 0 ? "text-[#1e9df1]" : voteCount < 0 ? "text-red-500" : "text-slate-500"}`}>
                                    {voteCount}
                                </span>
                                <button
                                    onClick={() => handleVote("DOWN")}
                                    disabled={voting}
                                    title="Downvote"
                                    className={`transition-colors duration-150 disabled:opacity-50 ${
                                        myVote === "DOWN" ? "text-red-500" : "text-slate-500 hover:text-red-500"
                                    }`}
                                >
                                    <ThumbsDown
                                        className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                                            myVote === "DOWN" ? "fill-red-500 text-red-500" : "text-slate-400"
                                        }`}
                                    />
                                </button>
                            </div>
                            <span className="inline-flex items-center gap-2">
                                <Bookmark className="h-4 w-4 text-slate-400" />
                                {count.bookmarks ?? 0}{" "}
                                {(count.bookmarks ?? 0) === 1 ? "bookmark" : "bookmarks"}
                            </span>
                        </div>
                    </div>
                </article>

                <section className="mt-8">
                    <h2 className="mb-4 text-lg font-black text-[#0f1419]">
                        Answers ({answers.length})
                    </h2>
                    {answers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center text-slate-500">
                            No answers yet. Be the first to help.
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-4">
                            {answers.map((ans) => (
                                <li
                                    key={ans.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/profile/${ans.authorId}`}
                                            className="shrink-0"
                                            aria-label={
                                                ans.author?.name
                                                    ? `Profile: ${ans.author.name}`
                                                    : "Answer author"
                                            }
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-xs font-black text-sky-900">
                                                {nameInitials(ans.author?.name)}
                                            </div>
                                        </Link>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-baseline gap-2 text-sm">
                                                <Link
                                                    to={`/profile/${ans.authorId}`}
                                                    className="font-bold text-[#1e9df1] hover:underline"
                                                >
                                                    {ans.author?.name ?? "Unknown"}
                                                </Link>
                                                <span className="text-xs text-slate-400">
                                                    {formatAskedAt(ans.createdAt)}
                                                </span>
                                            </div>
                                            <div
                                                className="mt-3 text-sm text-slate-800"
                                                data-color-mode="light"
                                            >
                                                <MarkdownPreview
                                                    source={ans.body ?? ""}
                                                    style={{ padding: 0 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
