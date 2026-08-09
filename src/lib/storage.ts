// Shared storage helpers (pure — no server-only imports, safe for client + server use).

/**
 * Extract the storage object path from a public cover URL, e.g.
 *   https://<ref>.supabase.co/storage/v1/object/public/blog-covers/<path>
 * Returns null when the URL isn't a public blog-covers object (e.g. an external image).
 */
export function blobPathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/blog-covers/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split("?")[0] ?? "";
  return decodeURIComponent(path) || null;
}
