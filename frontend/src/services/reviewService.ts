const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ReviewRequest {
  userId: number;
  tailorId: number;
  orderId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  userId: number;
  reviewerName: string;
  tailorId: number;
  orderId: number;
  rating: number;
  comment: string | null;
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

export async function submitReview(data: ReviewRequest): Promise<ReviewResponse> {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return parseResponse<ReviewResponse>(res);
}

export async function getReviewsByTailor(tailorId: number): Promise<ReviewResponse[]> {
  const res = await fetch(`${API_BASE}/api/reviews/tailor/${tailorId}`, {
    headers: authHeaders(),
  });
  return parseResponse<ReviewResponse[]>(res);
}

export async function hasReviewed(orderId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/reviews/order/${orderId}/exists`, {
    headers: authHeaders(),
  });
  const data = await parseResponse<{ reviewed: boolean }>(res);
  return data.reviewed;
}
