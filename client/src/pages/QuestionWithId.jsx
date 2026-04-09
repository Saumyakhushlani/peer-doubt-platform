import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { ArrowLeft, Loader2 } from "lucide-react";
import AnswerModal from "../components/questions/AnswerModal.jsx";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import { getQuestionById } from "../lib/api/question.js";
import { getMyVotes, deleteVoteForQuestion, voteQuestion } from "../lib/api/vote.js";
import { getMe } from "../lib/api/user.js";
import { getBookmarksByUser, addBookmark, removeBookmark } from "../lib/api/bookmark.js";
import { createAnswer } from "../lib/api/answer.js";

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

    const [bookmarking, setBookmarking] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkCount, setBookmarkCount] = useState(0);

    const [answerModalOpen, setAnswerModalOpen] = useState(false);
    const [answerDraft, setAnswerDraft] = useState("");
    const [answerSaving, setAnswerSaving] = useState(false);
    const [answerError, setAnswerError] = useState(null);

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
                const data = await getQuestionById(id);
                setQuestion(data.question ?? null);
                setVoteCount(data.question?._count?.votes ?? 0);
                setBookmarkCount(data.question?._count?.bookmarks ?? 0);
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
                const data = await getMyVotes();
                const v = data.votes?.find(v => v.questionId === id);
                if (v) setMyVote(v.type);
            } catch {}
        }
        fetchMyVote();
    }, [id]);

    useEffect(() => {
        async function fetchMyBookmark() {
            const token = localStorage.getItem("token");
            if (!token || !id) return;
            try {
                const me = await getMe();
                const uid = me.userId;
                if (!uid) return;
                const data = await getBookmarksByUser(uid);
                const map = {};
                (data.bookmarks ?? []).forEach((b) => {
                    if (b.questionId) map[b.questionId] = true;
                });
                setIsBookmarked(!!map[id]);
            } catch {}
        }
        fetchMyBookmark();
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
                await deleteVoteForQuestion(id);
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
                await voteQuestion({ type, questionId: id });
            } catch {
                setMyVote(currentVote);
                setVoteCount(prev => prev - diff);
            }
        }
        setVoting(false);
    }

    function openAnswer() {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        setAnswerDraft("");
        setAnswerError(null);
        setAnswerModalOpen(true);
    }

    function closeAnswer() {
        if (answerSaving) return;
        setAnswerModalOpen(false);
        setAnswerDraft("");
        setAnswerError(null);
    }

    async function submitAnswer() {
        if (!id || answerSaving) return;
        const body = String(answerDraft ?? "").trim();
        if (!body) {
            setAnswerError("Write your answer in the editor.");
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        setAnswerSaving(true);
        setAnswerError(null);
        try {
            await createAnswer({ questionId: id, body: answerDraft });
            // refresh question so answers list updates
            const data = await getQuestionById(id);
            setQuestion(data.question ?? null);
            setAnswerModalOpen(false);
            setAnswerDraft("");
        } catch (err) {
            setAnswerError(err.response?.data?.error ?? err.message ?? "Could not post answer");
        } finally {
            setAnswerSaving(false);
        }
    }

    async function toggleBookmark() {
        if (!id || bookmarking) return;
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        setBookmarking(true);
        const prev = isBookmarked;
        const prevCount = bookmarkCount;
        try {
            if (prev) {
                setIsBookmarked(false);
                setBookmarkCount(Math.max(0, prevCount - 1));
                await removeBookmark(id);
            } else {
                setIsBookmarked(true);
                setBookmarkCount(prevCount + 1);
                await addBookmark(id);
            }
        } catch {
            setIsBookmarked(prev);
            setBookmarkCount(prevCount);
        } finally {
            setBookmarking(false);
        }
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

                <ul className="flex flex-col gap-4">
                    <QuestionCard
                        question={question}
                        voteType={myVote}
                        votesCount={voteCount}
                        answersCount={count.answers ?? 0}
                        bookmarksCount={bookmarkCount}
                        isBookmarked={isBookmarked}
                        voting={voting}
                        bookmarking={bookmarking}
                        onClick={() => {}}
                        onVote={(e, type) => { e.stopPropagation(); handleVote(type); }}
                        onBookmark={(e) => { e.stopPropagation(); toggleBookmark(); }}
                        onAddAnswer={(e) => { e.stopPropagation(); openAnswer(); }}
                        showBody={true}
                        showAddAnswer={true}
                    />
                </ul>


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

            <AnswerModal
                open={answerModalOpen}
                title={question?.title ?? ""}
                value={answerDraft}
                setValue={setAnswerDraft}
                saving={answerSaving}
                error={answerError}
                onClose={closeAnswer}
                onSubmit={submitAnswer}
            />
        </div>
    );
}
