import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnswerModal from "../components/questions/AnswerModal.jsx";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import TagFilter from "../components/questions/TagFilter.jsx";
import { getQuestions } from "../lib/api/question.js";
import { getMyVotes, deleteVoteForQuestion, voteQuestion } from "../lib/api/vote.js";
import { getMe } from "../lib/api/user.js";
import { getBookmarksByUser, addBookmark, removeBookmark } from "../lib/api/bookmark.js";
import { PlusCircle, Loader2, Info } from "lucide-react";

const PAGE_SIZE = 15;
const LATEST_TOPICS_LIMIT = 12;

export default function Question() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);

  const [myVotes, setMyVotes] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [votingId, setVotingId] = useState(null);

  const [myBookmarks, setMyBookmarks] = useState({});
  const [bookmarkCounts, setBookmarkCounts] = useState({});
  const [bookmarkingId, setBookmarkingId] = useState(null);

  const [answerCounts, setAnswerCounts] = useState({});
  const [answerModalId, setAnswerModalId] = useState(null);
  const [answerModalTitle, setAnswerModalTitle] = useState("");

  const fetchPage = useCallback(async (cursor) => {
    const append = cursor != null;
    try {
      if (append) setLoadingMore(true);
      else { setLoading(true); setError(null); }

      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const data = await getQuestions({ cursor });
      const batch = data.questions ?? [];
      
      setQuestions((prev) => (append ? [...prev, ...batch] : batch));
      setHasMore(typeof data.hasMore === "boolean" ? data.hasMore : batch.length === PAGE_SIZE);

      const updateCounts = (batch) => {
        setVoteCounts(prev => ({ ...prev, ...Object.fromEntries(batch.map(q => [q.id, q._count?.votes ?? 0])) }));
        setBookmarkCounts(prev => ({ ...prev, ...Object.fromEntries(batch.map(q => [q.id, q._count?.bookmarks ?? 0])) }));
        setAnswerCounts(prev => ({ ...prev, ...Object.fromEntries(batch.map(q => [q.id, q._count?.answers ?? 0])) }));
      };
      updateCounts(batch);

    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? "Could not fetch questions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [navigate]);

  useEffect(() => { fetchPage(null); }, [fetchPage]);

  useEffect(() => {
    async function initUserData() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [votesData, me] = await Promise.all([getMyVotes(), getMe()]);
        
        const voteMap = {};
        (votesData.votes ?? []).forEach(v => { if (v.questionId) voteMap[v.questionId] = v.type; });
        setMyVotes(voteMap);

        if (me?.userId) {
          const bookmarkData = await getBookmarksByUser(me.userId);
          const bookmarkMap = {};
          (bookmarkData.bookmarks ?? []).forEach(b => { if (b.questionId) bookmarkMap[b.questionId] = true; });
          setMyBookmarks(bookmarkMap);
        }
      } catch (e) { /* silent fail */ }
    }
    initUserData();
  }, []);

  async function handleVote(e, questionId, type) {
    e.stopPropagation();
    if (votingId === questionId) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const currentVoteType = myVotes[questionId];
    setVotingId(questionId);

    if (currentVoteType === type) {
      setMyVotes(prev => { const n = { ...prev }; delete n[questionId]; return n; });
      setVoteCounts(prev => ({ ...prev, [questionId]: (prev[questionId] ?? 0) - (type === "UP" ? 1 : -1) }));
      try { await deleteVoteForQuestion(questionId); } catch {
        setMyVotes(prev => ({ ...prev, [questionId]: type }));
        setVoteCounts(prev => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + (type === "UP" ? 1 : -1) }));
      }
    } else {
      let diff = currentVoteType === (type === "UP" ? "DOWN" : "UP") ? (type === "UP" ? 2 : -2) : (type === "UP" ? 1 : -1);
      setMyVotes(prev => ({ ...prev, [questionId]: type }));
      setVoteCounts(prev => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + diff }));
      try { await voteQuestion({ type, questionId }); } catch {
        setMyVotes(prev => currentVoteType ? { ...prev, [questionId]: currentVoteType } : (({ [questionId]: _, ...n }) => n)(prev));
        setVoteCounts(prev => ({ ...prev, [questionId]: (prev[questionId] ?? 0) - diff }));
      }
    }
    setVotingId(null);
  }

  async function handleBookmark(e, questionId, currentCount) {
    e.stopPropagation();
    if (bookmarkingId === questionId) return;
    if (!localStorage.getItem("token")) { navigate("/login"); return; }

    const isOn = !!myBookmarks[questionId];
    setBookmarkingId(questionId);

    setMyBookmarks(prev => isOn ? (({ [questionId]: _, ...n }) => n)(prev) : { ...prev, [questionId]: true });
    setBookmarkCounts(prev => ({ ...prev, [questionId]: (prev[questionId] ?? currentCount) + (isOn ? -1 : 1) }));

    try {
      isOn ? await removeBookmark(questionId) : await addBookmark(questionId);
    } catch {
      setMyBookmarks(prev => isOn ? { ...prev, [questionId]: true } : (({ [questionId]: _, ...n }) => n)(prev));
      setBookmarkCounts(prev => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + (isOn ? 1 : -1) }));
    }
    setBookmarkingId(null);
  }

  function openAnswerModal(e, question) {
    e.stopPropagation();
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    setAnswerModalId(question.id);
    setAnswerModalTitle(question.title ?? "");
  }

  const latestTopicTags = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    for (const q of questions) {
      q.tags?.forEach(qt => {
        const name = qt?.tag?.name?.trim();
        if (name && !seen.has(name)) {
          seen.add(name);
          ordered.push(name);
        }
      });
      if (ordered.length >= LATEST_TOPICS_LIMIT) break;
    }
    return ordered;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (selectedTags.length === 0) return questions;
    return questions.filter(q => q.tags?.some(qt => selectedTags.includes(qt?.tag?.name?.trim())));
  }, [questions, selectedTags]);

  if (loading && questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white py-16 text-slate-400">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Library</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 flex flex-col items-start justify-between gap-6 border-b-2 border-slate-900 pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase md:text-5xl">Explorer</h1>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-400">Browse current batch doubts</p>
          </div>
          <Link
            to="/question/create"
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0.5"
          >
            <PlusCircle size={18} strokeWidth={3} />
            Ask Question
          </Link>
        </header>

        <section className="mb-10">
          <TagFilter
            tags={latestTopicTags}
            selected={selectedTags}
            onToggle={(tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
            onClear={() => setSelectedTags([])}
          />
        </section>

        {error && (
          <div className="mb-8 flex items-center gap-3 border-2 border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            <Info size={18} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              voteType={myVotes[question.id]}
              votesCount={voteCounts[question.id] ?? question._count?.votes ?? 0}
              answersCount={answerCounts[question.id] ?? question._count?.answers ?? 0}
              bookmarksCount={bookmarkCounts[question.id] ?? question._count?.bookmarks ?? 0}
              isBookmarked={!!myBookmarks[question.id]}
              voting={votingId === question.id}
              bookmarking={bookmarkingId === question.id}
              onClick={() => navigate(`/question/${question.id}`)}
              onVote={(e, type) => handleVote(e, question.id, type)}
              onBookmark={(e) => handleBookmark(e, question.id, question._count?.bookmarks ?? 0)}
              onAddAnswer={(e) => openAnswerModal(e, question)}
            />
          ))}
        </div>

        {questions.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-sm">
            <p className="text-lg font-black uppercase text-slate-300 tracking-tighter">No Knowledge Shared Yet</p>
          </div>
        )}

        {hasMore && filteredQuestions.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => fetchPage(questions[questions.length - 1].id)}
              disabled={loadingMore}
              className="group flex items-center gap-3 bg-slate-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              {loadingMore ? <Loader2 className="animate-spin" size={18} /> : "Load More Archives"}
            </button>
          </div>
        )}
      </div>

      <AnswerModal
        open={!!answerModalId}
        title={answerModalTitle}
        questionId={answerModalId}
        onClose={() => { setAnswerModalId(null); setAnswerModalTitle(""); }}
        onSubmitted={() => {
          const qid = answerModalId;
          if (qid) setAnswerCounts(prev => ({ ...prev, [qid]: (prev[qid] ?? 0) + 1 }));
        }}
      />
    </div>
  );
}