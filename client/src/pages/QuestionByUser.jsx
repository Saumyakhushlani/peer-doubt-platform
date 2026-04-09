import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import { getQuestionsByAuthor } from "../lib/api/question.js";

export default function QuestionByUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchQuestions = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const data = await getQuestionsByAuthor(id);
            setQuestions(data.questions ?? []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error ?? err.message ?? "Could not fetch questions");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchQuestions();
    }, [id]);

    return (
    <div className="min-h-screen bg-[#f0f7fc] px-6 pb-20 pt-10 font-sans text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-[#0f1419]">Questions by user</h1>
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
          <ul className="flex flex-col gap-4">
            {questions.map((q) => {
              const c = q._count ?? {};
              return (
                <QuestionCard
                  key={q.id}
                  question={q}
                  voteType={null}
                  votesCount={c.votes ?? 0}
                  answersCount={c.answers ?? 0}
                  bookmarksCount={c.bookmarks ?? 0}
                  isBookmarked={false}
                  voting={false}
                  bookmarking={false}
                  onClick={() => navigate(`/question/${q.id}`)}
                  showVoting={false}
                  showBookmark={false}
                  showAddAnswer={false}
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}