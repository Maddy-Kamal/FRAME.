import { useState } from "react";
import { downloadItem } from "../lib/api";

export default function MediaCard({ result, onDownloaded }) {
  return (
    <div className="fade-in overflow-hidden rounded-2xl border border-hairline bg-card">
      <div className="sprocket-rail h-4" />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
          <span>@{result.uploader}</span>
          <span>{result.isCarousel ? `${result.items.length} frames` : "1 frame"}</span>
        </div>

        {result.caption && (
          <p className="mb-4 line-clamp-2 text-sm text-muted">{result.caption}</p>
        )}

        <div className={result.isCarousel ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : ""}>
          {result.items.map((item) => (
            <MediaItem
              key={item.index}
              item={item}
              uploader={result.uploader}
              solo={!result.isCarousel}
              onDownloaded={onDownloaded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaItem({ item, uploader, solo, onDownloaded }) {
  const [busy, setBusy] = useState(null); // "media" | "thumb" | null
  const [error, setError] = useState(null);

  async function handleDownload(kind) {
    setError(null);
    setBusy(kind);
    try {
      const url = kind === "thumb" ? item.thumbnail : item.mediaUrl;
      const ext = kind === "thumb" ? "jpg" : item.ext;
      const filename = `frame_${uploader}_${item.index + 1}.${ext}`;
      await downloadItem(url, filename);
      onDownloaded?.({ uploader, type: kind === "thumb" ? "thumbnail" : item.type, thumbnail: item.thumbnail });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={solo ? "" : "rounded-xl border border-hairline bg-surface p-2"}>
      <div className="relative overflow-hidden rounded-lg bg-hairline/30">
        {item.thumbnail && (
          <img src={item.thumbnail} alt="" className="aspect-square w-full object-cover" />
        )}
        {item.type === "video" && (
          <span className="absolute bottom-2 right-2 rounded bg-base/80 px-1.5 py-0.5 font-mono text-[10px] text-paper">
            VIDEO
          </span>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => handleDownload("media")}
          disabled={!!busy}
          className="flex-1 rounded-lg bg-safelight py-2 text-xs font-semibold text-base transition hover:bg-safelight-dim disabled:opacity-40"
        >
          {busy === "media" ? "Saving…" : item.type === "video" ? "Video" : "Photo"}
        </button>
        <button
          onClick={() => handleDownload("thumb")}
          disabled={!!busy}
          className="flex-1 rounded-lg border border-hairline py-2 text-xs font-semibold text-muted transition hover:border-lumen hover:text-lumen disabled:opacity-40"
        >
          {busy === "thumb" ? "Saving…" : "Thumbnail"}
        </button>
      </div>

      {error && <p className="mt-1 font-mono text-[11px] text-safelight">{error}</p>}
    </div>
  );
}
