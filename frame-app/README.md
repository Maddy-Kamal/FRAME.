# FRAME.

Paste a link from pretty much anywhere. Get the photo or video, in the
quality you want, with the file size shown before you commit. No ads, no
redirects, no "your download is ready in 15 seconds" countdown.

Runs entirely on your own machine — nothing is hosted for you, so there's
nothing for anyone to inject ads into.

**Platforms:** YouTube, Instagram, X/Twitter, Threads, Facebook, Reddit, and
anything else [yt-dlp supports](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
(1800+ sites) — badge shows what it detected.
**Handles:** posts, carousels, reels, videos of any length, story
photos/videos (needs your login — see below), and profile pictures.
**Won't handle:** DRM-locked streaming (Netflix, Prime Video, Disney+, etc).
yt-dlp doesn't break DRM, on purpose, and neither does this.

---

## Quickest way to run this

You still need [Node.js](https://nodejs.org) and yt-dlp installed once
(`pip install -U yt-dlp`) — that part can't be skipped, they're what
actually do the downloading. After that:

- **Mac:** double-click `run.command`
- **Windows:** double-click `run.bat`
- **Linux, or Mac/Windows from a terminal:** `./run.sh`

That's it — **one file, one window.** First run installs everything and
builds the app (takes a minute or two, only happens once); every run after
that starts instantly. It opens `http://localhost:8787` in your browser
automatically. To stop it, just close that window.

If you'd rather understand what it's doing step by step (or the launcher
hits an error and you want to debug it), the manual version is below.

---

## How it works

- **Backend** (Node/Express) shells out to [`yt-dlp`](https://github.com/yt-dlp/yt-dlp),
  the open-source extractor that's actively maintained against every one of
  these platforms' frequent changes — much less fragile than hand-rolled
  scraping, and it's why this one app covers all of them at once.
- Every result comes back with **all available qualities**, each tagged
  with its real (or closely estimated) file size — 360p/5MB up through
  whatever the source's best is — so you pick before you download, not after.
- Videos also get a **♪ Audio** chip — the platform's native audio track
  (M4A/Opus/WebA depending on site) grabbed as-is, no ffmpeg or re-encoding,
  so it's instant. (Not a guaranteed MP3 — if you specifically need MP3,
  that requires a local ffmpeg conversion step, which isn't wired up yet.)
- Downloads **stream** straight through (Range-aware, resumable) instead of
  buffering the whole file in memory first — meaningfully more reliable on
  long videos, though actual speed is still capped by your connection and
  the source server, same as any download always is.
- On **desktop Chrome/Edge**, you get a real "Save As" dialog *before* the
  download starts, streaming straight to the file you pick — no
  Downloads-folder guessing. Safari, Firefox, and mobile browsers don't
  expose that API to websites, so those fall back to each browser's normal
  save/share behavior — that's a browser limit, not something this app skips.
- **Frontend** (React + Vite + Tailwind) is a PWA: install it to your phone's
  home screen and it behaves like a native app, no app store involved.
- In production the backend serves the built frontend itself, so the whole
  thing is one process, one port, one app.

## Manual setup (only if you're not using run.sh / run.bat / run.command)

### 1. Install prerequisites

You need **Python 3** and **Node.js 18+** on the machine that runs this.

```bash
pip install -U yt-dlp
# or, if you don't want a system-wide Python install:
# brew install yt-dlp        (macOS)
# winget install yt-dlp      (Windows)
```

Verify it works:

```bash
yt-dlp --version
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server runs at `http://localhost:8787`. Check `http://localhost:8787/api/health`.

### 3. Set up the frontend (dev mode)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev server
proxies `/api` calls to the backend automatically. Use this two-terminal
mode only while actively changing code — for normal use, the single-process
version below (or the launcher scripts) is simpler.

### 4. Stories & private content (optional)

Stories aren't public data — Instagram requires a logged-in session to see
them, same as if you opened the app yourself. To enable this:

1. Install a browser extension like **"Get cookies.txt LOCALLY"** (Chrome/Firefox).
2. Log into instagram.com in that browser.
3. Export cookies for instagram.com as `cookies.txt`.
4. Drop the file at `backend/cookies.txt` (already gitignored).
5. Set `COOKIES_FILE=./cookies.txt` in `backend/.env` (already the default).
6. Restart the backend.

Without this, public posts/reels/profile pictures still work fine — stories
just won't resolve.

**Worth knowing:** this only works for accounts you can already see (people
you follow, or public accounts) — it's your session doing the looking, same
as scrolling the app. Save what you have rights to use; stories in
particular are meant to be ephemeral, so treat other people's the way you'd
want your own treated.

### 5. Single process, no separate terminals (what run.sh does for you)

```bash
npm run build --prefix frontend
node backend/src/server.js
```

The backend now auto-detects the built frontend and serves it itself — one
process, one port (`http://localhost:8787`), UI and API on the same origin.
Open it on your phone (same Wi-Fi, use your computer's LAN IP instead of
`localhost`), tap **Add to Home Screen**, and you've got an ad-free
downloader that looks and feels like a real app.

## 6. Go live 24/7 (open it from any device, anywhere, password-protected)

This is the setup for "type a name into any browser and it's just there" —
a small always-on server, your own login gate, and a real domain with
automatic HTTPS. Nobody else can use it without your password, and your
laptop doesn't need to be on.

**What you need:**
- A cheap VPS — [Hetzner](https://www.hetzner.com/cloud) (~€4/mo) or
  [DigitalOcean](https://www.digitalocean.com/) (~$6/mo), Ubuntu 24.04, smallest size is plenty.
- A name for it. Either a subdomain of a domain you already own (e.g.
  `frame.boldbite.in`), or a free one from [DuckDNS](https://www.duckdns.org/)
  if you don't want to touch DNS on an existing domain — takes two minutes,
  no cost.

**Steps:**

1. **Point the name at the server.** In your domain's DNS (or DuckDNS's
   dashboard), add an A record for your chosen subdomain pointing at the
   VPS's IP address. Wait a few minutes for it to propagate.

2. **SSH into the VPS and install Docker:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

3. **Get the project onto the server** (scp the zip and unzip, or push it
   to a private git repo and clone it) so `docker-compose.yml` sits at
   `~/frame-app/docker-compose.yml`.

4. **Set your config:**
   ```bash
   cd frame-app
   cp .env.example .env
   nano .env   # set DOMAIN, and a real AUTH_USER / AUTH_PASS only you know
   ```

5. **If you want stories too**, scp your `cookies.txt` into this same
   folder (step 4 in section 4 above still applies).

6. **Launch it:**
   ```bash
   docker compose up -d --build
   ```
   First build takes a few minutes (installs yt-dlp + ffmpeg into the
   image). Caddy automatically requests and renews an HTTPS certificate
   for your domain — no manual cert setup.

7. **Open `https://yourname.duckdns.org`** (or your domain) from your
   phone, a friend's laptop, an internet café, anywhere. The browser will
   prompt for the username/password you set in step 4 before showing
   anything — that's the whole gate, no separate login page to maintain.

**Keeping it updated:** when you change code, `docker compose up -d --build`
again to rebuild and restart with zero other setup.

**Note:** I haven't run this Dockerfile/compose stack end-to-end myself —
this sandbox can't reach Docker Hub or run a container. The YAML and
Dockerfile are syntactically valid and follow the standard pattern, but
give it a real run on your VPS and ping me if anything doesn't come up
clean; container build issues are easy to debug once we see the actual
error.

```
frame-app/
  run.sh / run.bat / run.command   the one-file launcher — installs, builds, runs, opens the browser
  Dockerfile           builds the whole app (Node + Python/yt-dlp + ffmpeg) into one image
  docker-compose.yml   runs the app + Caddy (auto-HTTPS reverse proxy) together
  Caddyfile            Caddy's config — just points your domain at the app
  .env.example         DOMAIN + AUTH_USER/AUTH_PASS for the Docker deploy
  backend/
    src/
      server.js          Express entrypoint
      routes/resolve.js  POST /api/resolve — paste a link, get metadata + qualities back
      routes/download.js GET /api/download — Range-aware streaming proxy, real filename
      utils/ytdlp.js      spawns yt-dlp, parses its JSON
      utils/normalize.js  builds the per-quality (+ audio) list with sizes, and platform tag
      utils/platform.js   maps a yt-dlp extractor / hostname to a badge id
      utils/auth.js        HTTP Basic Auth gate, used when AUTH_USER/AUTH_PASS are set
  frontend/
    src/
      App.jsx            page shell
      components/        LinkInput, MediaCard, PlatformBadge, FilmstripHistory, FrameCounter, EmptyState
      lib/api.js          fetch + save-location + progress-tracked download helpers
      lib/format.js        byte/duration formatting for the quality picker
      lib/history.js       localStorage-backed download history
```

## Why not an official API?

Instagram doesn't offer a public API for pulling arbitrary posts/stories —
this is true of every downloader tool that exists, including the ad-stuffed
ones you're trying to escape. That's also why this ships as code you run
yourself rather than a hosted product: a hosted version would hit the same
App Store / Meta ToS walls that keep those other tools ad-funded in the
first place. Running it locally sidesteps all of that — it's just you,
your own login, and your own downloads.
