import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import { getBookmarksByUser } from "../lib/api/bookmark.js";

export default function BookmarksByUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const data = await getBookmarksByUser(id);
            setBookmarks(data.bookmarks ?? []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error ?? err.message ?? "Could not fetch bookmarks");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchBookmarks();
    }, [id]);
    return (
        <div className="min-h-screen bg-[#f0f7fc] px-6 pb-20 pt-10 font-sans text-slate-900">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-[#0f1419]">Bookmarks</h1>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-full py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <ul className="m-0 list-none flex flex-col gap-4 p-0">
                        {(bookmarks ?? []).map((b) => {
                            const q = b.question;
                            if (!q) return null;
                            const c = q._count ?? {};
                            return (
                                <QuestionCard
                                    key={b.id ?? q.id}
                                    question={q}
                                    voteType={null}
                                    votesCount={c.votes ?? 0}
                                    answersCount={c.answers ?? 0}
                                    bookmarksCount={c.bookmarks ?? 0}
                                    isBookmarked={true}
                                    voting={false}
                                    bookmarking={false}
                                    onClick={() => navigate(`/question/${q.id}`)}
                                    onBookmark={(e) => {
                                        e.stopPropagation();
                                        navigate(`/question/${q.id}`);
                                    }}
                                    showVoting={false}
                                    showAddAnswer={false}
                                />
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}