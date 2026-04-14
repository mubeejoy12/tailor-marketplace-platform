const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type Role = "CUSTOMER" | "TAILOR";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
  role: Role | "ADMIN";
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Parses an HTTP response.
 * Throws a descriptive Error for non-2xx responses.
 * Returns plain text or parsed JSON for 2xx responses.
 */
async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    // Extract a human-readable message — NEVER throw inside the try block
    let errorMsg = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      errorMsg =
        (json.message as string) ||
        (json.error as string) ||
        text ||
        errorMsg;
    } catch {
      // Response body wasn't JSON — use raw text
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // 2xx — try JSON, fall back to plain text (e.g. JWT string)
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<RegisterResponse>(res);
}

/** Returns raw JWT string on success */
export async function loginUser(payload: LoginPayload): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<string>(res);
}
