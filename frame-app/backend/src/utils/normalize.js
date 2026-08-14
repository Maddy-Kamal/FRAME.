import { detectPlatform } from "./platform.js";

/**
 * yt-dlp's JSON shape differs depending on what it hit: a single video, a
 * single photo, or a carousel/story tray (which comes back with an `entries`
 * array). This flattens all of those into one predictable shape, and — new
 * in this pass — expands each video into a list of downloadable qualities
 * with real (or estimated) file sizes instead of just "the best one".
 */
export function normalize(raw, sourceUrl) {
  const rawEntries = Array.isArray(raw.entries) ? raw.entries : [raw];
  const items = rawEntries.map((entry, i) => normalizeEntry(entry, i));

  return {
    sourceUrl: raw.webpage_url || raw.original_url || sourceUrl || null,
    platform: detectPlatform(raw.extractor_key || raw.extractor, raw.webpage_url || sourceUrl),
    uploader: raw.uploader || raw.channel || raw.uploader_id || "unknown",
    caption: (raw.description || raw.title || "").trim(),
    postedAt: raw.timestamp ? raw.timestamp * 1000 : null,
    isCarousel: rawEntries.length > 1,
    items,
  };
}

function normalizeEntry(entry, index) {
  const thumbnail = entry.thumbnail || entry.thumbnails?.at(-1)?.url || null;
  const isVideo = Boolean(entry.formats?.some((f) => f.vcodec && f.vcodec !== "none"));

  if (!isVideo) {
    return {
      index,
      type: "photo",
      thumbnail,
      durationSec: null,
      qualities: [
        {
          id: "original",
          label: "Original",
          ext: entry.ext || "jpg",
          mediaUrl: entry.url || entry.formats?.[0]?.url || null,
          sizeBytes: entry.filesize || entry.filesize_approx || null,
        },
      ],
    };
  }

  return {
    index,
    type: "video",
    thumbnail,
    durationSec: entry.duration || null,
    qualities: buildQualities(entry.formats, entry.duration),
    audio: buildAudioOption(entry.formats, entry.duration),
  };
}

// The platform's native audio-only stream (M4A/Opus/WebA depending on
// site), used as-is with no re-encoding — that's why this is instant and
// doesn't need ffmpeg. Returns null when a site doesn't expose one
// separately (some platforms only ever hand out muxed video+audio).
function buildAudioOption(formats, durationSec) {
  if (!formats?.length) return null;

  const audioOnly = formats.filter(
    (f) => f.url && f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
  );
  if (!audioOnly.length) return null;

  const best = [...audioOnly].sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

  return {
    id: "audio",
    label: "Audio",
    ext: best.ext || "m4a",
    mediaUrl: best.url,
    sizeBytes: best.filesize || best.filesize_approx || estimateSize(best.abr, durationSec),
  };
}

// One quality entry per resolution tier, preferring formats that already
// have audio+video muxed together so the download works instantly with no
// extra merge step on your end.
function buildQualities(formats, durationSec) {
  if (!formats?.length) return [];

  const muxed = formats.filter(
    (f) => f.url && f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none"
  );
  const pool = muxed.length ? muxed : formats.filter((f) => f.url && f.vcodec && f.vcodec !== "none");

  const bestPerHeight = new Map();
  for (const f of pool) {
    const height = f.height || 0;
    const current = bestPerHeight.get(height);
    if (!current || (f.tbr || 0) > (current.tbr || 0)) bestPerHeight.set(height, f);
  }

  return [...bestPerHeight.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([height, f]) => ({
      id: `${height || "auto"}p`,
      label: height ? `${height}p` : f.format_note || "auto",
      ext: f.ext || "mp4",
      mediaUrl: f.url,
      sizeBytes: f.filesize || f.filesize_approx || estimateSize(f.tbr, durationSec),
      needsMux: !(f.acodec && f.acodec !== "none"),
    }));
}

function estimateSize(tbrKbps, durationSec) {
  if (!tbrKbps || !durationSec) return null;
  return Math.round(((tbrKbps * 1000) / 8) * durationSec);
}
