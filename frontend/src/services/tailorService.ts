const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface TailorProfile {
  id: number;
  userId: number;
  shopName: string;
  location: string;
  specialization: string | null;
  rating: number;
  profileImage: string | null;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store", // always fresh data in dev
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

export function fetchTailors(): Promise<TailorProfile[]> {
  return get<TailorProfile[]>("/api/tailors");
}

export function fetchTailorById(id: number | string): Promise<TailorProfile> {
  return get<TailorProfile>(`/api/tailors/${id}`);
}
