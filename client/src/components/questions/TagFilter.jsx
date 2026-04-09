export default function TagFilter({ tags, selected, onToggle, onClear }) {
  if (!Array.isArray(tags) || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Topics:
      </span>
      {tags.map((tag) => {
        const isActive = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ${
              isActive
                ? "bg-[#1e9df1] text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:border-[#1e9df1] hover:text-[#1e9df1]"
            }`}
          >
            #{tag}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="ml-1 text-xs font-semibold text-slate-400 transition-colors hover:text-red-400"
        >
          Clear
        </button>
      )}
    </div>
  );
}

