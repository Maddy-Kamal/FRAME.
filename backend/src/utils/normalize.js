/**
 * yt-dlp's JSON shape differs depending on what it hit: a single video,
 * a single photo, or a carousel/story tray (which comes back with an
 * `entries` array). This flattens all of those into one predictable
 * shape our frontend renders without caring which case it is.
 */
export function normalize(raw) {
  const rawEntries = Array.isArray(raw.entries) ? raw.entries : [raw];

  const items = rawEntries.map((entry, i) => normalizeEntry(entry, i));

  return {
    sourceUrl: raw.webpage_url || raw.original_url || null,
    uploader: raw.uploader || raw.channel || raw.uploader_id || "unknown",
    caption: (raw.description || raw.title || "").trim(),
    postedAt: raw.timestamp ? raw.timestamp * 1000 : null,
    isCarousel: rawEntries.length > 1,
    items,
  };
}

function normalizeEntry(entry, index) {
  const isVideo = Boolean(entry.formats?.length || entry.vcodec !== "none");

  // Prefer the best direct progressive URL yt-dlp already resolved.
  const bestFormat = pickBestFormat(entry.formats);

  return {
    index,
    type: isVideo ? "video" : "photo",
    thumbnail: entry.thumbnail || bestFormat?.thumbnail || null,
    mediaUrl: bestFormat?.url || entry.url || null,
    width: bestFormat?.width || entry.width || null,
    height: bestFormat?.height || entry.height || null,
    durationSec: entry.duration || null,
    ext: bestFormat?.ext || entry.ext || (isVideo ? "mp4" : "jpg"),
  };
}

function pickBestFormat(formats) {
  if (!formats?.length) return null;
  // yt-dlp already sorts formats worst -> best in most cases; be defensive
  // and pick the highest resolution progressive (has both audio+video, or
  // is image) format available.
  return [...formats]
    .filter((f) => f.url)
    .sort((a, b) => (b.height || 0) - (a.height || 0))[0];
}
