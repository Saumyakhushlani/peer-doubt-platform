import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { Loader2, X, Send, AlertCircle } from "lucide-react";
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
      setError("Please provide an explanation before posting.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required to post answers.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createAnswer({ questionId, body: value });
      await onSubmitted?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? "Failed to broadcast answer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (saving) return;
        onClose?.();
      }}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-2xl flex-col border-2 border-slate-950 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b-2 border-slate-900 bg-white px-6 py-4">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              Response Terminal
            </span>
            <h3 className="mt-1 line-clamp-1 text-lg font-black tracking-tight text-slate-900 uppercase">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="group p-2 transition-colors hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-slate-950 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-center gap-3 border-2 border-red-200 bg-red-50 p-4 text-xs font-bold uppercase tracking-tight text-red-600">
              <AlertCircle size={16} strokeWidth={3} />
              {error}
            </div>
          )}
          
          <div
            data-color-mode="light"
            className="border-2 border-slate-900"
          >
            <MDEditor
              value={value}
              onChange={(v) => setValue(v ?? "")}
              height={320}
              preview="edit"
              visibleDragbar={false}
              className="!shadow-none"
            />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
            Markdown and LaTeX supported
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-4 border-t-2 border-slate-900 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 active:translate-y-1 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send size={14} strokeWidth={3} />
                Post Response
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}