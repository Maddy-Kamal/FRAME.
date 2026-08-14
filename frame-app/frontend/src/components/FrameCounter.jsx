import { frameLabel } from "../lib/history";

export default function FrameCounter({ count }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-safelight" />
      <span className="font-mono text-xs tracking-wider text-muted">
        {frameLabel(count)} <span className="text-hairline">/</span> pulled this session
      </span>
    </div>
  );
}
