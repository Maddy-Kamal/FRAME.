import { useState } from "react";

const PLATFORMS = ["YouTube", "Instagram", "X", "Threads", "Facebook", "Reddit"];

export default function LinkInput({ onSubmit, loading }) {
  const [value, setValue] = useState("");

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setValue(text.trim());
    } catch {
      // Clipboard permission denied — user can still type/paste manually.
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value.trim());
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-stretch gap-2 rounded-xl border border-hairline bg-surface p-2 transition-colors duration-200 focus-within:border-lumen">
          <input
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Paste a link — YouTube, Instagram, X, Threads, Facebook, Reddit…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-paper placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="shrink-0 rounded-lg border border-hairline px-3 text-xs text-muted transition-colors duration-150 hover:border-lumen hover:text-lumen"
          >
            Paste
          </button>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="shrink-0 rounded-lg bg-safelight px-5 text-sm font-semibold text-base transition-all duration-150 hover:bg-safelight-dim hover:shadow-lg hover:shadow-safelight/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? "Pulling…" : "Grab"}
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {PLATFORMS.map((p) => (
          <span
            key={p}
            className="font-mono text-[10px] uppercase tracking-wider text-muted/70 transition-colors duration-150 hover:text-lumen"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
