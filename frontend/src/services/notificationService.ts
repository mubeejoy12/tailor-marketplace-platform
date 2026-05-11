const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface NotificationItem {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
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

export async function getNotifications(userId: number): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/api/notifications/${userId}`, {
    headers: authHeaders(),
  });
  return parseResponse<NotificationItem[]>(res);
}

export async function getUnreadCount(userId: number): Promise<number> {
  const res = await fetch(`${API_BASE}/api/notifications/${userId}/unread-count`, {
    headers: authHeaders(),
  });
  const data = await parseResponse<{ count: number }>(res);
  return data.count;
}

export async function markRead(notificationId: number): Promise<NotificationItem> {
  const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return parseResponse<NotificationItem>(res);
}

export async function markAllRead(userId: number): Promise<void> {
  await fetch(`${API_BASE}/api/notifications/${userId}/read-all`, {
    method: "PUT",
    headers: authHeaders(),
  });
}
