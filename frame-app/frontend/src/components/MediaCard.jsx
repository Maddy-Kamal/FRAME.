import { useState } from "react";
import { downloadWithProgress } from "../lib/api";
import { formatBytes, formatDuration } from "../lib/format";
import PlatformBadge from "./PlatformBadge";

export default function MediaCard({ result, onDownloaded }) {
  return (
    <div className="fade-in overflow-hidden rounded-2xl border border-hairline bg-card shadow-xl shadow-black/20">
      <div className="sprocket-rail h-4" />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={result.platform} />
            <span className="font-mono text-xs text-muted">@{result.uploader}</span>
          </div>
          <span className="font-mono text-xs text-muted">
            {result.isCarousel ? `${result.items.length} frames` : "1 frame"}
          </span>
        </div>

        {result.caption && <p className="mb-4 line-clamp-2 text-sm text-muted">{result.caption}</p>}

        <div className={result.isCarousel ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : ""}>
          {result.items.map((item) => (
            <MediaItem key={item.index} item={item} uploader={result.uploader} onDownloaded={onDownloaded} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaItem({ item, uploader, onDownloaded }) {
  const options = [
    ...item.qualities,
    ...(item.audio ? [{ ...item.audio, isAudio: true }] : []),
    ...(item.type === "video" && item.thumbnail
      ? [{ id: "thumb", label: "Thumbnail", ext: "jpg", mediaUrl: item.thumbnail, sizeBytes: null }]
      : []),
  ];

  const [state, setState] = useState({});
  const [error, setError] = useState(null);

  async function handleDownload(opt) {
    setError(null);
    setState((s) => ({ ...s, [opt.id]: { status: "downloading", progress: 0 } }));
    try {
      const filename = `frame_${uploader}_${item.index + 1}_${opt.label.replace(/\s+/g, "")}.${opt.ext}`;
      await downloadWithProgress(opt.mediaUrl, filename, (progress) =>
        setState((s) => ({ ...s, [opt.id]: { status: "downloading", progress } }))
      );
      setState((s) => ({ ...s, [opt.id]: { status: "done", progress: 100 } }));
      onDownloaded?.({ uploader, type: item.type, thumbnail: item.thumbnail });
      setTimeout(() => {
        setState((s) => ({ ...s, [opt.id]: { status: "idle", progress: 0 } }));
      }, 2200);
    } catch (e) {
      setError(e.message);
      setState((s) => ({ ...s, [opt.id]: { status: "error", progress: 0 } }));
    }
  }

  return (
    <div className="group rounded-xl border border-hairline bg-surface p-3 transition-colors duration-200 hover:border-safelight-dim">
      <div className="relative overflow-hidden rounded-lg bg-hairline/30">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt=""
            className={`w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] ${
              item.type === "video" ? "aspect-video" : "aspect-square"
            }`}
          />
        )}
        {item.type === "video" && (
          <>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-base/70 text-paper backdrop-blur-sm">
                ▶
              </span>
            </span>
            {item.durationSec && (
              <span className="absolute bottom-2 right-2 rounded bg-base/80 px-1.5 py-0.5 font-mono text-[10px] text-paper">
                {formatDuration(item.durationSec)}
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const s = state[opt.id] || { status: "idle", progress: 0 };
          const busy = s.status === "downloading";
          return (
            <button
              key={opt.id}
              onClick={() => handleDownload(opt)}
              disabled={busy}
              className={`relative overflow-hidden rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors duration-150 disabled:cursor-wait ${
                opt.isAudio
                  ? "border-hairline text-lumen hover:border-lumen"
                  : "border-hairline text-paper hover:border-safelight hover:text-safelight"
              }`}
            >
              {busy && (
                <span
                  className={`absolute inset-y-0 left-0 transition-[width] duration-150 ${
                    opt.isAudio ? "bg-lumen/25" : "bg-safelight/25"
                  }`}
                  style={{ width: `${s.progress}%` }}
                />
              )}
              <span className="relative">
                {busy
                  ? `${s.progress}%`
                  : s.status === "done"
                  ? "Saved ✓"
                  : `${opt.isAudio ? "♪ " : ""}${opt.label}${
                      opt.sizeBytes ? ` · ${formatBytes(opt.sizeBytes)}` : ""
                    }${opt.needsMux ? " (no audio)" : ""}`}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 font-mono text-[11px] text-safelight">{error}</p>}
    </div>
  );
}
