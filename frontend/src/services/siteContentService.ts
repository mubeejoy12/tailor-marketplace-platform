const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * Admin-editable homepage content, stored as flat keys:
 *   hero.imageUrl, hero.title, hero.subtitle
 *   banner.imageUrl, banner.title, banner.text, banner.link
 *   category.<Category>.imageUrl
 */
export type SiteContent = Record<string, string>;

export const categoryImageKey = (category: string) => `category.${category}.imageUrl`;

export async function getSiteContent(): Promise<SiteContent> {
  const res = await fetch(`${API_BASE}/api/site-content`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load site content (${res.status})`);
  return res.json() as Promise<SiteContent>;
}

/** Saves the given keys; an empty string resets a key to the built-in default. */
export async function updateSiteContent(changes: SiteContent): Promise<SiteContent> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  const res = await fetch(`${API_BASE}/api/admin/site-content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(changes),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Save failed (${res.status})`;
    try { msg = (JSON.parse(text) as { error?: string }).error ?? msg; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return JSON.parse(text) as SiteContent;
}
