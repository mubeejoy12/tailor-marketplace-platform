const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface AdminMetrics {
  totalUsers: number;
  totalTailors: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalReviews: number;
  pendingVerifications: number;
}

export interface AdminOrder {
  id: number;
  userId: number;
  tailorId: number;
  styleChoice: string;
  orderStatus: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      msg = (json.message as string) || (json.error as string) || text || msg;
    } catch { msg = text || msg; }
    throw new Error(msg);
  }
  return JSON.parse(text) as T;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const res = await fetch(`${API_BASE}/api/admin/metrics`, { headers: authHeaders() });
  return parseResponse<AdminMetrics>(res);
}

export async function getAllUsers(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders() });
  return parseResponse<unknown[]>(res);
}

export async function getAllOrders(): Promise<AdminOrder[]> {
  const res = await fetch(`${API_BASE}/api/admin/orders`, { headers: authHeaders() });
  return parseResponse<AdminOrder[]>(res);
}

export async function getPendingVerifications(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/api/admin/verifications/pending`, { headers: authHeaders() });
  return parseResponse<unknown[]>(res);
}

export async function reviewVerification(
  tailorId: number,
  decision: "APPROVE" | "REJECT",
  note: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/admin/tailors/${tailorId}/verify`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ decision, note }),
  });
  return parseResponse<unknown>(res);
}
