const KEY = "frame.history";

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function pushHistory(entry) {
  const history = loadHistory();
  const nextFrame = (history[0]?.frame || 0) + 1;
  const record = { ...entry, frame: nextFrame, at: Date.now() };
  const updated = [record, ...history].slice(0, 60);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function frameLabel(n) {
  return `F${String(n).padStart(3, "0")}`;
}
