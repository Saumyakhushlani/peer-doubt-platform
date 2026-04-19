import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MessageCircle, Info } from "lucide-react";
import AnswerModal from "../components/questions/AnswerModal.jsx";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import AnswerCard from "../components/questions/AnswerCard.jsx";
import { getQuestionById } from "../lib/api/question.js";
import { getMyVotes, deleteVoteForAnswer, deleteVoteForQuestion, voteAnswer, voteQuestion } from "../lib/api/vote.js";
import { getMe } from "../lib/api/user.js";
import { getBookmarksByUser, addBookmark, removeBookmark } from "../lib/api/bookmark.js";

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

    const [myAnswerVotes, setMyAnswerVotes] = useState({});
    const [answerVoteCounts, setAnswerVoteCounts] = useState({});
    const [votingAnswerId, setVotingAnswerId] = useState(null);

    const answers = useMemo(() => {
        if (!question) return [];
        return Array.isArray(question.answers) ? question.answers.filter(isAnswerRow) : [];
    }, [question]);

    useEffect(() => {
        const next = {};
        answers.forEach((a) => {
            next[a.id] = a?._count?.votes ?? 0;
        });
        setAnswerVoteCounts(next);
    }, [answers]);

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
                setError(err.response?.data?.error ?? err.message ?? "Could not fetch question");
                setQuestion(null);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id, navigate]);

    useEffect(() => {
        async function fetchUserData() {
            const token = localStorage.getItem("token");
            if (!token || !id) return;
            try {
                const [voteData, meData] = await Promise.all([getMyVotes(), getMe()]);
                
                const v = voteData.votes?.find((v) => v.questionId === id);
                if (v) setMyVote(v.type);

                const answerMap = {};
                (voteData.votes ?? []).forEach((vv) => {
                    if (vv.answerId) answerMap[vv.answerId] = vv.type;
                });
                setMyAnswerVotes(answerMap);

                if (meData.userId) {
                    const bookmarkData = await getBookmarksByUser(meData.userId);
                    const map = {};
                    (bookmarkData.bookmarks ?? []).forEach((b) => {
                        if (b.questionId) map[b.questionId] = true;
                    });
                    setIsBookmarked(!!map[id]);
                }
            } catch {}
        }
        fetchUserData();
    }, [id]);

    async function handleVote(type) {
        if (voting) return;
        if (!localStorage.getItem("token")) { navigate("/login"); return; }
        setVoting(true);
        const currentVote = myVote;
        if (currentVote === type) {
            setMyVote(null);
            setVoteCount(prev => prev - (type === "UP" ? 1 : -1));
            try { await deleteVoteForQuestion(id); } catch {
                setMyVote(currentVote);
                setVoteCount(prev => prev + (type === "UP" ? 1 : -1));
            }
        } else {
            let diff = currentVote === (type === "UP" ? "DOWN" : "UP") ? (type === "UP" ? 2 : -2) : (type === "UP" ? 1 : -1);
            setMyVote(type);
            setVoteCount(prev => prev + diff);
            try { await voteQuestion({ type, questionId: id }); } catch {
                setMyVote(currentVote);
                setVoteCount(prev => prev - diff);
            }
        }
        setVoting(false);
    }

    async function toggleBookmark() {
        if (!id || bookmarking) return;
        if (!localStorage.getItem("token")) { navigate("/login"); return; }
        setBookmarking(true);
        const prev = isBookmarked;
        const prevCount = bookmarkCount;
        try {
            setIsBookmarked(!prev);
            setBookmarkCount(prev ? Math.max(0, prevCount - 1) : prevCount + 1);
            prev ? await removeBookmark(id) : await addBookmark(id);
        } catch {
            setIsBookmarked(prev);
            setBookmarkCount(prevCount);
        } finally {
            setBookmarking(false);
        }
    }

    async function handleAnswerVote(e, answerId, type) {
        e.stopPropagation();
        if (votingAnswerId === answerId) return;
        if (!localStorage.getItem("token")) { navigate("/login"); return; }
        setVotingAnswerId(answerId);
        const currentVote = myAnswerVotes[answerId];

        if (currentVote === type) {
            setMyAnswerVotes(prev => { const n = { ...prev }; delete n[answerId]; return n; });
            setAnswerVoteCounts(prev => ({ ...prev, [answerId]: (prev[answerId] ?? 0) - (type === "UP" ? 1 : -1) }));
            try { await deleteVoteForAnswer(answerId); } catch {
                setMyAnswerVotes(prev => ({ ...prev, [answerId]: type }));
                setAnswerVoteCounts(prev => ({ ...prev, [answerId]: (prev[answerId] ?? 0) + (type === "UP" ? 1 : -1) }));
            }
        } else {
            let diff = currentVote === (type === "UP" ? "DOWN" : "UP") ? (type === "UP" ? 2 : -2) : (type === "UP" ? 1 : -1);
            setMyAnswerVotes(prev => ({ ...prev, [answerId]: type }));
            setAnswerVoteCounts(prev => ({ ...prev, [answerId]: (prev[answerId] ?? 0) + diff }));
            try { await voteAnswer({ answerId, type }); } catch {
                setMyAnswerVotes(prev => currentVote ? { ...prev, [answerId]: currentVote } : (({[answerId]: _, ...n}) => n)(prev));
                setAnswerVoteCounts(prev => ({ ...prev, [answerId]: (prev[answerId] ?? 0) - diff }));
            }
        }
        setVotingAnswerId(null);
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <span className="text-xs font-black uppercase tracking-widest">Accessing Archives</span>
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="min-h-screen bg-white px-6 py-16">
                <div className="mx-auto max-w-5xl">
                    <Link to="/question" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={16} strokeWidth={3} /> Back to questions
                    </Link>
                    <div className="flex items-center gap-3 border-2 border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600">
                        <Info size={20} />
                        {error || "Question data is missing from the server."}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
                <Link
                    to="/question"
                    className="mb-10 inline-flex items-center gap-2 bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-blue-600 hover:text-white transition-all rounded-sm"
                >
                    <ArrowLeft size={12} strokeWidth={4} /> Back to explorer
                </Link>

                <ul className="m-0 list-none flex flex-col p-0">
                    <QuestionCard
                        question={question}
                        voteType={myVote}
                        votesCount={voteCount}
                        answersCount={question._count?.answers ?? 0}
                        bookmarksCount={bookmarkCount}
                        isBookmarked={isBookmarked}
                        voting={voting}
                        bookmarking={bookmarking}
                        onClick={() => {}}
                        onVote={(e, type) => { e.stopPropagation(); handleVote(type); }}
                        onBookmark={(e) => { e.stopPropagation(); toggleBookmark(); }}
                        onAddAnswer={(e) => { e.stopPropagation(); setAnswerModalOpen(true); }}
                        showBody={true}
                        clampBody={false}
                    />
                </ul>

                <section className="mt-16">
                    <div className="mb-8 flex items-center justify-between border-b-2 border-slate-900 pb-4">
                        <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter text-slate-900">
                            <MessageCircle size={24} strokeWidth={3} className="text-blue-600" />
                            Solutions ({answers.length})
                        </h2>
                    </div>
                    
                    {answers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-sm bg-slate-50/50">
                            <p className="text-sm font-black uppercase text-slate-400 tracking-widest">Be the first to respond to this thread</p>
                            <button 
                                onClick={() => setAnswerModalOpen(true)}
                                className="mt-6 bg-slate-950 px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 transition-colors rounded-sm"
                            >
                                Submit Solution
                            </button>
                        </div>
                    ) : (
                        <ul className="m-0 list-none flex flex-col gap-6 p-0">
                            {answers.map((ans) => (
                                <AnswerCard
                                    key={ans.id}
                                    answer={ans}
                                    voteType={myAnswerVotes[ans.id]}
                                    votesCount={answerVoteCounts[ans.id] ?? ans?._count?.votes ?? 0}
                                    voting={votingAnswerId === ans.id}
                                    onVote={(e, type) => handleAnswerVote(e, ans.id, type)}
                                />
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <AnswerModal
                open={answerModalOpen}
                title={question?.title ?? ""}
                questionId={id}
                onClose={() => setAnswerModalOpen(false)}
                onSubmitted={async () => {
                    if (!id) return;
                    const data = await getQuestionById(id);
                    setQuestion(data.question ?? null);
                }}
            />
        </div>
    );
}