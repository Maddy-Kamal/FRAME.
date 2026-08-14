export async function resolveLink(url, mode = "single") {
  const res = await fetch("/api/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, mode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/**
 * Downloads a resolved media item through the backend proxy, reporting
 * live progress, and — on browsers that support it (desktop Chrome/Edge) —
 * asks exactly where to save it *before* a single byte is written, then
 * streams straight to disk instead of buffering the whole file in memory.
 *
 * Browsers without the File System Access API (Safari, Firefox, and every
 * mobile browser) fall back to a normal blob download, which lands wherever
 * that browser's own "Downloads" location is — that's a mobile OS/browser
 * limit, not something a website can override.
 */
export async function downloadWithProgress(mediaUrl, filename, onProgress) {
  const proxied = `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(
    filename
  )}`;

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: filename });
      const res = await fetch(proxied);
      if (!res.ok) throw new Error((await safeError(res)) || "Download failed.");

      const total = Number(res.headers.get("content-length")) || 0;
      const writable = await handle.createWritable();
      const reader = res.body.getReader();
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writable.write(value);
        received += value.length;
        if (total) onProgress?.(Math.min(100, Math.round((received / total) * 100)));
      }
      await writable.close();
      onProgress?.(100);
      return;
    } catch (e) {
      if (e?.name === "AbortError") throw new Error("Save cancelled.");
      // Any other picker failure: fall through to the blob path below
      // rather than leaving the user stuck.
    }
  }

  const res = await fetch(proxied);
  if (!res.ok) throw new Error((await safeError(res)) || "Download failed.");

  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onProgress?.(Math.min(100, Math.round((received / total) * 100)));
  }
  onProgress?.(100);

  const blob = new Blob(chunks);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

async function safeError(res) {
  try {
    return (await res.json()).error;
  } catch {
    return null;
  }
}
