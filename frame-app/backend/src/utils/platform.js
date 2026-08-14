const KNOWN = ["youtube", "twitter", "instagram", "facebook", "reddit", "threads"];

/**
 * yt-dlp tags every result with an extractor name ("Youtube", "TwitterVideo",
 * "InstagramReels", etc). We just need the coarse platform id for the badge,
 * so a loose substring match is enough — falls back to sniffing the hostname
 * if extractor_key is missing, and finally to "other" for anything yt-dlp
 * supports that isn't one of the named platforms.
 */
export function detectPlatform(extractorKey = "", url = "") {
  const key = (extractorKey || "").toLowerCase();
  for (const platform of KNOWN) {
    if (key.includes(platform)) return platform;
  }

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("youtu")) return "youtube";
    if (host === "x.com" || host.includes("twitter")) return "twitter";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("facebook") || host === "fb.watch") return "facebook";
    if (host.includes("reddit") || host === "redd.it") return "reddit";
    if (host.includes("threads")) return "threads";
  } catch {
    // not a valid URL — fall through to "other"
  }

  return "other";
}
