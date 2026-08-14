import { useState } from "react";
import LinkInput from "./components/LinkInput";
import MediaCard from "./components/MediaCard";
import EmptyState from "./components/EmptyState";
import FilmstripHistory from "./components/FilmstripHistory";
import FrameCounter from "./components/FrameCounter";
import { resolveLink } from "./lib/api";
import { loadHistory, pushHistory, clearHistory } from "./lib/history";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const [pulledCount, setPulledCount] = useState(0);

  async function handleSubmit(url) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await resolveLink(url);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloaded(entry) {
    setHistory(pushHistory(entry));
    setPulledCount((c) => c + 1);
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-16 pt-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">FRAME.</h1>
          <p className="text-xs text-muted">Paste a link. Pull the frame. No ads, ever.</p>
        </div>
        <FrameCounter count={pulledCount} />
      </header>

      <LinkInput onSubmit={handleSubmit} loading={loading} />

      {error && (
        <p className="mt-4 rounded-lg border border-safelight-dim bg-safelight/10 px-3 py-2 font-mono text-xs text-safelight">
          {error}
        </p>
      )}

      {result ? (
        <div className="mt-6">
          <MediaCard result={result} onDownloaded={handleDownloaded} />
        </div>
      ) : (
        !loading && !error && <EmptyState />
      )}

      <FilmstripHistory items={history} onClear={handleClearHistory} />

      <footer className="mt-12 text-center font-mono text-[11px] text-muted">
        built by you, for you — runs on your own machine
      </footer>
    </div>
  );
}
