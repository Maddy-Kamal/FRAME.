# FRAME.

Paste an Instagram link. Get the photo, video, or thumbnail. No ads, no
redirects, no "your download is ready in 15 seconds" countdown.

Runs entirely on your own machine — nothing is hosted for you, so there's
nothing for anyone to inject ads into.

**Handles:** posts (photo/video), carousels, reels, story photos/videos
(needs your login — see below), and profile pictures.

---

## How it works

- **Backend** (Node/Express) shells out to [`yt-dlp`](https://github.com/yt-dlp/yt-dlp),
  the open-source extractor that's actively maintained against Instagram's
  frequent changes — much less fragile than hand-rolled scraping.
- **Frontend** (React + Vite + Tailwind) is a PWA: install it to your phone's
  home screen and it behaves like a native app, no app store involved.
- In production the backend serves the built frontend itself, so the whole
  thing is one process, one port, one app.

## 1. Install prerequisites

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

## 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server runs at `http://localhost:8787`. Check `http://localhost:8787/api/health`.

## 3. Set up the frontend (dev mode)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev server
proxies `/api` calls to the backend automatically.

## 4. Stories & private content (optional)

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

## 5. Run it for real (production, single app)

```bash
cd frontend && npm run build && cd ..
cd backend && NODE_ENV=production npm start
```

Now `http://localhost:8787` serves the whole app — UI and API on one origin.
Open it on your phone (same Wi-Fi, use your computer's LAN IP instead of
`localhost`), tap **Add to Home Screen**, and you've got an ad-free
Instagram grabber that looks and feels like a real app.

## Project layout

```
frame-app/
  backend/
    src/
      server.js         Express entrypoint
      routes/resolve.js POST /api/resolve — paste a link, get metadata back
      routes/download.js GET /api/download — streams the file, sets a real filename
      utils/ytdlp.js     spawns yt-dlp, parses its JSON
      utils/normalize.js flattens yt-dlp's output into one predictable shape
  frontend/
    src/
      App.jsx            page shell
      components/        LinkInput, MediaCard, FilmstripHistory, FrameCounter, EmptyState
      lib/api.js          fetch helpers
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
