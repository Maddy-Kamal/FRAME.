import { Router } from "express";
import { fetchMeta, fetchCollection } from "../utils/ytdlp.js";
import { normalize } from "../utils/normalize.js";

const router = Router();

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+/i;

router.post("/", async (req, res) => {
  const { url, mode } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Paste a link first." });
  }
  if (!URL_RE.test(url.trim())) {
    return res.status(400).json({ error: "That doesn't look like a valid link." });
  }

  try {
    // mode "profile" grabs a whole profile grid / channel / story tray at
    // once; everything else resolves as a single post (or carousel of
    // entries within that one post).
    const raw =
      mode === "profile" ? await fetchCollection(url.trim()) : await fetchMeta(url.trim());

    const result = normalize(raw, url.trim());

    if (!result.items.length) {
      return res.status(404).json({ error: "No downloadable media found on that link." });
    }

    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message || "Couldn't resolve that link." });
  }
});

export default router;
