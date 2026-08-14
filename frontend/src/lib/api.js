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
 * Downloads a resolved media item through the backend proxy and triggers
 * a real browser save (works for the installed PWA too, not just tabs).
 */
export async function downloadItem(mediaUrl, filename) {
  const proxied = `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(
    filename
  )}`;
  const res = await fetch(proxied);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Download failed.");
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
