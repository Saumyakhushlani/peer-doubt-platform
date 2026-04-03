import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownPreview from '@uiw/react-markdown-preview';
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const PAGE_SIZE = 15;

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
            setHasMore(batch.length === PAGE_SIZE);
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
                    {questions.map((question) => (
                        <li
                            key={question.id}
                            className="rounded-2xl border-slate-300 border-b-2 bg-white p-5 shadow-sm"
                        >
                            <h2 className="text-xl font-bold text-[#0f1419]">
                                {question.title}
                            </h2>
                            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600"
                            data-color-mode="light"
                            >
                                <MarkdownPreview
                                    source={question.body}
                                    style={{ padding: 10 }}
                                    rehypeRewrite={(node, parent) => {
                                        if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
                                            parent.children = parent.children.slice(1)
                                        }
                                    }}
                                />
                            </p>
                        </li>
                    ))}
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
