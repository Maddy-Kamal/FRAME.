import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import resolveRoute from "./routes/resolve.js";
import downloadRoute from "./routes/download.js";
import { basicAuth } from "./utils/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use(basicAuth);

app.use("/api/resolve", resolveRoute);
app.use("/api/download", downloadRoute);

// Whenever a built frontend exists (you ran `npm run build` in frontend/,
// or used run.sh / run.bat which does it for you), serve it right
// from this same process — one server, one port, one thing to run.
const distDir = path.join(__dirname, "../../frontend/dist");
const distIndex = path.join(distDir, "index.html");
if (fs.existsSync(distIndex)) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => res.sendFile(distIndex));
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`FRAME. running on http://localhost:${PORT}`);
});
