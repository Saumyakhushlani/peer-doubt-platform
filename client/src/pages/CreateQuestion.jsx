import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { ArrowLeft, HelpCircle, Loader2, Send } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function parseTags(raw) {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/[,#\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Add a title for your question.");
      return;
    }
    if (!body || !String(body).trim()) {
      setError("Write something in the body.");
      return;
    }

    setIsLoading(true);
    try {
      const tags = parseTags(tagInput);
      const { data } = await axios.post(
        `${BASE_URL}/api/question`,
        { title: trimmedTitle, body, tags },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const q = data?.question;
      if (q?.authorId) {
        navigate(`/profile/${q.authorId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ?? err.message ?? "Could not create question"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f7fc] pb-20 font-sans text-slate-900">
      <div className="mx-auto max-w-4xl px-6">
        <div className="py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition-opacity hover:opacity-85"
          >
            <ArrowLeft size={14} strokeWidth={3} /> BACK TO DASHBOARD
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-sky-50 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-300 bg-sky-100 text-[#1e9df1]">
                <HelpCircle size={22} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-[#0f1419] sm:text-3xl">
                  Ask a question
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Be specific so peers can help quickly. Use markdown for code and
                  formulas.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why does my DFS visit nodes out of order?"
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-[#0f1419] outline-none transition-all focus:border-[#1e9df1] focus:ring-4 focus:ring-sky-200"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Details
              </label>
              <div
                data-color-mode="light"
                className="overflow-hidden rounded-xl border-2 border-slate-300"
              >
                <MDEditor
                  value={body}
                  onChange={(v) => setBody(v ?? "")}
                  height={320}
                  preview="live"
                  visibleDragbar={false}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Tags (optional)
              </label>
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="graphs, algorithms, c++"
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-medium text-[#0f1419] outline-none transition-all focus:border-[#1e9df1] focus:ring-4 focus:ring-sky-200"
              />
              <p className="mt-2 text-xs font-medium text-slate-500">
                Separate with commas. Helps others find your thread.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e9df1] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Posting…
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={2.5} />
                    Post question
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
