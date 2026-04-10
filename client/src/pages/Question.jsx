import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnswerModal from "../components/questions/AnswerModal.jsx";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import TagFilter from "../components/questions/TagFilter.jsx";
import { getQuestions } from "../lib/api/question.js";
import { getMyVotes, deleteVoteForQuestion, voteQuestion } from "../lib/api/vote.js";
import { getMe } from "../lib/api/user.js";
import { getBookmarksByUser, addBookmark, removeBookmark } from "../lib/api/bookmark.js";

const PAGE_SIZE = 15;
/** Unique tags from newest questions first; cap chips at the top of the list. */
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

      setVoteCounts((prev) => {
        const next = { ...prev };
        batch.forEach((q) => {
          next[q.id] = q._count?.votes ?? 0;
        });
        return next;
      });
      setBookmarkCounts((prev) => {
        const next = { ...prev };
        batch.forEach((q) => {
          next[q.id] = q._count?.bookmarks ?? 0;
        });
        return next;
      });
      setAnswerCounts((prev) => {
        const next = { ...prev };
        batch.forEach((q) => {
          next[q.id] = q._count?.answers ?? 0;
        });
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? "Could not fetch questions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [navigate]);

  useEffect(() => { fetchPage(null); }, [fetchPage]);

  useEffect(() => {
    async function fetchMyVotes() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getMyVotes();
        const voteMap = {};
        (data.votes ?? []).forEach((v) => {
          if (v.questionId) voteMap[v.questionId] = v.type;
        });
        setMyVotes(voteMap);
      } catch {
      }
    }
    fetchMyVotes();
  }, []);

  useEffect(() => {
    async function loadBookmarks() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const me = await getMe();
        const uid = me.userId;
        if (!uid) return;
        const data = await getBookmarksByUser(uid);
        const map = {};
        (data.bookmarks ?? []).forEach((b) => {
          if (b.questionId) map[b.questionId] = true;
        });
        setMyBookmarks(map);
      } catch {
        
      }
    }
    loadBookmarks();
  }, []);

  async function handleVote(e, questionId, type) {
    e.stopPropagation();
    if (votingId === questionId) return;

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const currentVoteType = myVotes[questionId];
    setVotingId(questionId);

    if (currentVoteType === type) {
      setMyVotes((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
      setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) - (type === "UP" ? 1 : -1) }));

      try {
        await deleteVoteForQuestion(questionId);
      } catch {
        setMyVotes((prev) => ({ ...prev, [questionId]: type }));
        setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + (type === "UP" ? 1 : -1) }));
      }
    } else {
      let diff = 0;
      if (currentVoteType === "UP" && type === "DOWN") diff = -2;
      else if (currentVoteType === "DOWN" && type === "UP") diff = 2;
      else if (!currentVoteType && type === "UP") diff = 1;
      else if (!currentVoteType && type === "DOWN") diff = -1;

      setMyVotes((prev) => ({ ...prev, [questionId]: type }));
      setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + diff }));

      try {
        await voteQuestion({ type, questionId });
      } catch {
        if (currentVoteType) {
          setMyVotes((prev) => ({ ...prev, [questionId]: currentVoteType }));
        } else {
          setMyVotes((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
        }
        setVoteCounts((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) - diff }));
      }
    }

    setVotingId(null);
  }

  function openAnswerModal(e, question) {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setAnswerModalId(question.id);
    setAnswerModalTitle(question.title ?? "");
  }

  function closeAnswerModal() {
    setAnswerModalId(null);
    setAnswerModalTitle("");
  }

  async function handleBookmark(e, questionId, currentCount) {
    e.stopPropagation();
    if (bookmarkingId === questionId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const isOn = !!myBookmarks[questionId];
    setBookmarkingId(questionId);

    if (isOn) {
      setMyBookmarks((prev) => {
        const n = { ...prev };
        delete n[questionId];
        return n;
      });
      setBookmarkCounts((prev) => ({
        ...prev,
        [questionId]: Math.max(0, (prev[questionId] ?? currentCount) - 1),
      }));
      try {
        await removeBookmark(questionId);
      } catch {
        setMyBookmarks((prev) => ({ ...prev, [questionId]: true }));
        setBookmarkCounts((prev) => ({
          ...prev,
          [questionId]: (prev[questionId] ?? 0) + 1,
        }));
      }
    } else {
      setMyBookmarks((prev) => ({ ...prev, [questionId]: true }));
      setBookmarkCounts((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] ?? currentCount) + 1,
      }));
      try {
        await addBookmark(questionId);
      } catch {
        setMyBookmarks((prev) => {
          const n = { ...prev };
          delete n[questionId];
          return n;
        });
        setBookmarkCounts((prev) => ({
          ...prev,
          [questionId]: currentCount,
        }));
      }
    }

    setBookmarkingId(null);
  }
  function loadMore() {
    if (!hasMore || loadingMore || questions.length === 0) return;
    fetchPage(questions[questions.length - 1].id);
  }

  const latestTopicTags = useMemo(() => {
    const ordered = [];
    const seen = new Set();
    for (const q of questions) {
      if (!Array.isArray(q.tags)) continue;
      for (const qt of q.tags) {
        const name =
          typeof qt?.tag?.name === "string" ? qt.tag.name.trim() : "";
        if (!name || seen.has(name)) continue;
        seen.add(name);
        ordered.push(name);
        if (ordered.length >= LATEST_TOPICS_LIMIT) return ordered;
      }
    }
    return ordered;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (selectedTags.length === 0) return questions;
    return questions.filter((q) => {
      if (!Array.isArray(q.tags)) return false;
      const names = q.tags.map((qt) => qt?.tag?.name?.trim()).filter(Boolean);
      return selectedTags.some((t) => names.includes(t));
    });
  }, [questions, selectedTags]);

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

        <TagFilter
          tags={latestTopicTags}
          selected={selectedTags}
          onToggle={(tag) =>
            setSelectedTags((prev) =>
              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
            )
          }
          onClear={() => setSelectedTags([])}
        />

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {filteredQuestions.map((question) => {
            const c = question._count ?? {};
            const qid = question.id;
            return (
              <QuestionCard
                key={qid}
                question={question}
                voteType={myVotes[qid]}
                votesCount={voteCounts[qid] ?? c.votes ?? 0}
                answersCount={answerCounts[qid] ?? c.answers ?? 0}
                bookmarksCount={bookmarkCounts[qid] ?? c.bookmarks ?? 0}
                isBookmarked={!!myBookmarks[qid]}
                voting={votingId === qid}
                bookmarking={bookmarkingId === qid}
                onClick={() => navigate(`/question/${qid}`)}
                onVote={(e, type) => handleVote(e, qid, type)}
                onBookmark={(e) => handleBookmark(e, qid, c.bookmarks ?? 0)}
                onAddAnswer={(e) => openAnswerModal(e, question)}
              />
            );
          })}
        </ul>

        {questions.length === 0 && !error && (
          <p className="text-center text-slate-500">No questions yet.</p>
        )}
        {questions.length > 0 && filteredQuestions.length === 0 && (
          <p className="text-center text-slate-500">No questions match the selected tags.</p>
        )}

        {hasMore && filteredQuestions.length > 0 && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mx-auto rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#0f1419] shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}

        <AnswerModal
          open={!!answerModalId}
          title={answerModalTitle}
          questionId={answerModalId}
          onClose={closeAnswerModal}
          onSubmitted={() => {
            const qid = answerModalId;
            if (!qid) return;
            setAnswerCounts((prev) => ({
              ...prev,
              [qid]: (prev[qid] ?? 0) + 1,
            }));
          }}
        />
      </div>
    </div>
  );
}