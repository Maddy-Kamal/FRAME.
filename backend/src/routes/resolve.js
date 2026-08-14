import { Router } from "express";
import { fetchMeta, fetchCollection } from "../utils/ytdlp.js";
import { normalize } from "../utils/normalize.js";

const router = Router();

const IG_URL_RE = /^https?:\/\/(www\.)?instagram\.com\//i;

router.post("/", async (req, res) => {
  const { url, mode } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Paste an Instagram link first." });
  }
  if (!IG_URL_RE.test(url.trim())) {
    return res.status(400).json({ error: "That doesn't look like an instagram.com link." });
  }

  try {
    // mode "profile" is used for grabbing a whole profile grid or story
    // tray at once; everything else (post/reel/photo/story item) resolves
    // as a single entry (or carousel of entries).
    const raw =
      mode === "profile" ? await fetchCollection(url.trim()) : await fetchMeta(url.trim());

    const result = normalize(raw);

    if (!result.items.length) {
      return res.status(404).json({ error: "No downloadable media found on that link." });
    }

    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message || "Couldn't resolve that link." });
  }
});

export default router;
