import { spawn } from "node:child_process";

const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

/**
 * Runs yt-dlp against a URL and returns the parsed metadata.
 * Uses -J (dump single JSON) which works for a single post/reel/photo,
 * and for multi-item posts (carousels) returns an `entries` array.
 */
export function fetchMeta(url) {
  const args = ["-J", "--no-warnings", "--no-playlist-reverse", url];

  const cookiesFile = process.env.COOKIES_FILE;
  if (cookiesFile) {
    args.unshift("--cookies", cookiesFile);
  }

  return runJson(args);
}

/**
 * Same as fetchMeta but allows a full "collection" resolve (profile grid,
 * story tray, highlight reel) by dropping --no-playlist and capping how
 * many entries come back so a profile scrape doesn't run forever.
 */
export function fetchCollection(url, limit = 30) {
  const args = [
    "-J",
    "--no-warnings",
    "--flat-playlist",
    "--playlist-end",
    String(limit),
    url,
  ];

  const cookiesFile = process.env.COOKIES_FILE;
  if (cookiesFile) {
    args.unshift("--cookies", cookiesFile);
  }

  return runJson(args);
}

function runJson(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(YTDLP_PATH, args);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));

    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(
          new Error(
            "yt-dlp isn't installed or isn't on your PATH. See the README setup steps."
          )
        );
      } else {
        reject(err);
      }
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(cleanStderr(stderr) || `yt-dlp exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Couldn't parse yt-dlp output for this link."));
      }
    });
  });
}

// yt-dlp stderr is verbose; surface just the useful line.
function cleanStderr(stderr) {
  const line = stderr
    .split("\n")
    .find((l) => l.startsWith("ERROR:")) || stderr.split("\n")[0];
  return line?.replace(/^ERROR:\s*/, "").trim();
}
