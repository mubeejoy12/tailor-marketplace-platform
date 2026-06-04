const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface TailorProfile {
  id: number;
  userId: number;
  shopName: string;
  location: string;
  specialization: string | null;
  rating: number;
  profileImage: string | null;
  // Verification fields (Phase 3)
  verificationStatus: string;   // UNVERIFIED | PENDING | APPROVED | REJECTED
  portfolioUrls: string | null;
  shopDocumentUrl: string | null;
  verificationNote: string | null;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      msg = (json.message as string) || (json.error as string) || msg;
    } catch {
      msg = text || msg;
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Shape sent when creating or updating a tailor profile */
export interface TailorProfilePayload {
  userId?: number;
  shopName: string;
  location: string;
  specialization?: string;
  profileImage?: string;
  portfolioUrls?: string;
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `Request failed (${res.status})`;
    try { const j = JSON.parse(text) as Record<string, unknown>; msg = (j.error as string) || msg; } catch { msg = text || msg; }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

async function authPut<T>(path: string, body: unknown): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `Request failed (${res.status})`;
    try { const j = JSON.parse(text) as Record<string, unknown>; msg = (j.error as string) || msg; } catch { msg = text || msg; }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export function fetchTailors(): Promise<TailorProfile[]> {
  return get<TailorProfile[]>("/api/tailors");
}

/** POST /api/tailors — create a new tailor shop profile */
export function createTailorProfile(payload: TailorProfilePayload): Promise<TailorProfile> {
  return authPost<TailorProfile>("/api/tailors", payload);
}

/** PUT /api/tailors/{id} — update an existing tailor shop profile */
export function updateTailorProfile(id: number, payload: TailorProfilePayload): Promise<TailorProfile> {
  return authPut<TailorProfile>(`/api/tailors/${id}`, payload);
}

export function fetchTailorById(id: number | string): Promise<TailorProfile> {
  return get<TailorProfile>(`/api/tailors/${id}`);
}

/** Fetch a tailor's profile by their user account ID (used in dashboard) */
export function fetchTailorByUserId(userId: number | string): Promise<TailorProfile> {
  return get<TailorProfile>(`/api/tailors/user/${userId}`);
}
