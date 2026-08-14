const LABELS = {
  youtube: "YT",
  twitter: "X",
  instagram: "IG",
  facebook: "FB",
  reddit: "RD",
  threads: "TH",
  other: "WEB",
};

export default function PlatformBadge({ platform }) {
  const label = LABELS[platform] || LABELS.other;
  return (
    <span className="flex items-center gap-1.5 rounded border border-hairline bg-base px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-lumen" />
      {label}
    </span>
  );
}
