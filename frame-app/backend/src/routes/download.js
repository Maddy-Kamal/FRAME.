import { Router } from "express";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const router = Router();

// Streams the resolved media URL through our own server instead of handing
// the browser a raw (often expiring, hotlink-protected) CDN url. Forwards
// Range headers both ways so large files are resumable and the browser can
// scrub/retry instead of restarting from zero on a dropped connection.
router.get("/", async (req, res) => {
  const { url, filename } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url." });
  }

  const range = req.headers.range;

  let upstream;
  try {
    upstream = await fetch(url, range ? { headers: { Range: range } } : undefined);
  } catch {
    return res.status(502).json({ error: "Couldn't reach the media source." });
  }

  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: `Media source returned ${upstream.status}.` });
  }

  const safeName = sanitizeFilename(String(filename || "frame-download"));
  res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  res.setHeader("Accept-Ranges", "bytes");

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) {
    res.status(206);
    res.setHeader("Content-Range", contentRange);
  }
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) res.setHeader("Content-Length", contentLength);

  try {
    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch {
    res.end();
  }
});

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 150);
}

export default router;
