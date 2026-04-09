import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { Loader2, X } from "lucide-react";
import { createAnswer } from "../../lib/api/answer.js";

export default function AnswerModal({
  open,
  title,
  questionId,
  onClose,
  onSubmitted,
}) {
  if (!open) return null;

  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setValue("");
    setError(null);
  }, [open, questionId]);

  async function handleSubmit() {
    if (!questionId || saving) return;
    const body = String(value ?? "").trim();
    if (!body) {
      setError("Write your answer in the editor.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in to post an answer.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createAnswer({ questionId, body: value });
      await onSubmitted?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? "Could not post answer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="answer-modal-title"
      onClick={() => {
        if (saving) return;
        onClose?.();
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Your answer
            </p>
            <h3
              id="answer-modal-title"
              className="mt-1 line-clamp-2 text-base font-bold text-[#0f1419]"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div
            data-color-mode="light"
            className="overflow-hidden rounded-xl border-2 border-slate-300"
          >
            <MDEditor
              value={value}
              onChange={(v) => setValue(v ?? "")}
              height={300}
              preview="edit"
              visibleDragbar={false}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e9df1] px-4 py-2 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting…
              </>
            ) : (
              "Post answer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

