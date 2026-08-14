export default function EmptyState() {
  const rows = [
    ["Post", "photo or video, single or carousel"],
    ["Reel", "video + thumbnail"],
    ["Story", "photo or video — needs login, see README"],
    ["Profile picture", "paste the profile URL"],
  ];

  return (
    <div className="mt-10 rounded-2xl border border-dashed border-hairline p-6 text-center">
      <p className="font-display text-lg text-paper">Nothing loaded yet.</p>
      <p className="mt-1 text-sm text-muted">Paste a link above to pull its frame.</p>

      <div className="mx-auto mt-6 max-w-xs divide-y divide-hairline text-left">
        {rows.map(([label, desc]) => (
          <div key={label} className="flex justify-between gap-3 py-2 font-mono text-xs">
            <span className="text-paper">{label}</span>
            <span className="text-right text-muted">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
