import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import resolveRoute from "./routes/resolve.js";
import downloadRoute from "./routes/download.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resolve", resolveRoute);
app.use("/api/download", downloadRoute);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// In production, serve the built frontend from the same process so the
// whole thing is one deployable app (and installs as one PWA, same origin).
const distDir = path.join(__dirname, "../../frontend/dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distDir));
  app.get("*", (req, res) => res.sendFile(path.join(distDir, "index.html")));
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`FRAME. backend running on http://localhost:${PORT}`);
});
