export default function EmptyState() {
  const rows = [
    ["Any platform", "YouTube, Instagram, X, Threads, Facebook, Reddit, and more"],
    ["Quality picker", "pick 360p up to the source's best, size shown up front"],
    ["Audio only", "native track (M4A/Opus), no re-encode — just tap ♪ Audio"],
    ["Save location", "Chrome/Edge on desktop ask where to save, before it starts"],
    ["Stories & private posts", "needs your login — see README"],
  ];

  return (
    <div className="mt-10 rounded-2xl border border-dashed border-hairline p-6 text-center">
      <p className="font-display text-lg text-paper">Nothing loaded yet.</p>
      <p className="mt-1 text-sm text-muted">Paste a link above to pull its frame.</p>

      <div className="mx-auto mt-6 max-w-sm divide-y divide-hairline text-left">
        {rows.map(([label, desc]) => (
          <div key={label} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-3">
            <span className="font-mono text-xs text-paper">{label}</span>
            <span className="text-right font-mono text-xs text-muted sm:text-right">{desc}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 font-mono text-[10px] text-muted/70">
        Won't touch DRM-locked streaming (Netflix, Prime, Disney+, etc.) — that's not something
        this can or should get around.
      </p>
    </div>
  );
}
