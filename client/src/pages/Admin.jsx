import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import {
  adminLogin,
  clearAdminToken,
  deleteAdminQuestion,
  getAdminQuestions,
  saveAdminToken,
} from "../lib/api/admin.js";

const FILTER_OPTIONS = [
  { value: "all", label: "All questions" },
  { value: "true", label: "Anonymous only" },
  { value: "false", label: "Non-anonymous only" },
];

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-IN");
  } catch {
    return "";
  }
}

function getFilterValue(filter) {
  if (filter === "true") return true;
  if (filter === "false") return false;
  return undefined;
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("adminToken"))
  );
  const [filter, setFilter] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadQuestions(selectedFilter = filter) {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminQuestions({
        isAnonymous: getFilterValue(selectedFilter),
      });
      setQuestions(data.questions ?? []);
    } catch (err) {
      const apiError =
        err?.response?.data?.error ?? err?.message ?? "Failed to load questions";
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearAdminToken();
        setIsAuthenticated(false);
      }
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const data = await adminLogin(password);
      saveAdminToken(data.token);
      setIsAuthenticated(true);
      setPassword("");
      setMessage("Admin login successful");
      await loadQuestions(filter);
    } catch (err) {
      setError(
        err?.response?.data?.error ?? err?.message ?? "Admin login failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    clearAdminToken();
    setIsAuthenticated(false);
    setQuestions([]);
    setMessage("");
    setError("");
  }

  async function handleDelete(questionId) {
    if (deleteId) return;
    setDeleteId(questionId);
    setError("");
    setMessage("");
    try {
      await deleteAdminQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setMessage("Question deleted successfully");
    } catch (err) {
      setError(
        err?.response?.data?.error ?? err?.message ?? "Failed to delete question"
      );
    } finally {
      setDeleteId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blue-700" />
            <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
          </div>
          <p className="mb-6 text-sm text-slate-600">
            Enter the admin password configured in server environment.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="adminPassword"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Admin Password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login as Admin"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Admin Questions
          </h1>
          <p className="text-sm text-slate-500">
            Manage all questions and filter by anonymous status.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Logout Admin
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label htmlFor="anonymousFilter" className="text-sm font-medium text-slate-700">
          Filter:
        </label>
        <select
          id="anonymousFilter"
          value={filter}
          onChange={async (e) => {
            const value = e.target.value;
            setFilter(value);
            await loadQuestions(value);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading questions...
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <article
              key={question.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {question.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {question.isAnonymous ? "Anonymous" : "Not anonymous"} •{" "}
                    {question.author?.name ?? "Unknown"} • {formatDate(question.createdAt)}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-700">{question.body}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Answers: {question._count?.answers ?? 0} | Votes:{" "}
                    {question._count?.votes ?? 0} | Bookmarks:{" "}
                    {question._count?.bookmarks ?? 0}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(question.id)}
                  disabled={deleteId === question.id}
                  className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deleteId === question.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </article>
          ))}

          {questions.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              No questions found for selected filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
