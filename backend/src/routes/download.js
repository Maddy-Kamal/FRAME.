import { Router } from "express";

const router = Router();

// Streaming the file through our own server (instead of sending the raw
// CDN url to the browser) does two things: it dodges Instagram's hotlink
// checks, and it lets us set a real filename so the browser's "Save"
// dialog doesn't show some expiring, unreadable CDN path.
router.get("/", async (req, res) => {
  const { url, filename } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url." });
  }

  let upstream;
  try {
    upstream = await fetch(url);
  } catch {
    return res.status(502).json({ error: "Couldn't reach the media source." });
  }

  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: `Media source returned ${upstream.status}.` });
  }

  const safeName = sanitizeFilename(String(filename || "frame-download"));
  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  if (contentLength) res.setHeader("Content-Length", contentLength);

  const reader = upstream.body.getReader();
  res.on("close", () => reader.cancel().catch(() => {}));

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch {
    res.end();
  }
});

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 150);
}

export default router;
