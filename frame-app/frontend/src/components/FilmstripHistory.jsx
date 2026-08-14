import { frameLabel } from "../lib/history";

export default function FilmstripHistory({ items, onClear }) {
  if (!items.length) return null;

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-sm font-medium text-muted">Filmstrip</h2>
        <button
          onClick={onClear}
          className="font-mono text-[11px] text-muted underline decoration-hairline underline-offset-2 hover:text-safelight"
        >
          clear
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {items.map((entry) => (
          <div
            key={`${entry.frame}-${entry.at}`}
            className="w-20 shrink-0 rounded-lg border border-hairline bg-surface p-1"
            title={`${entry.uploader} · ${entry.type}`}
          >
            <div className="relative overflow-hidden rounded bg-hairline/30">
              {entry.thumbnail ? (
                <img src={entry.thumbnail} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="aspect-square w-full" />
              )}
            </div>
            <p className="mt-1 truncate font-mono text-[10px] text-muted">
              {frameLabel(entry.frame)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
