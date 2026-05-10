const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  profileImage: string | null;
  role: string;
  createdAt: string | null;
}

export interface UserProfileUpdateRequest {
  fullName: string;
  phone?: string;
  location?: string;
  profileImage?: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      errorMsg = (json.message as string) || (json.error as string) || text || errorMsg;
    } catch {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return JSON.parse(text) as T;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/profile`, {
    headers: authHeaders(),
  });
  return parseResponse<UserProfile>(res);
}

export async function updateUserProfile(
  userId: number,
  data: UserProfileUpdateRequest
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return parseResponse<UserProfile>(res);
}
