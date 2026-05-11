const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ConversationResponse {
  id: number;
  customerId: number;
  customerName: string;
  tailorId: number;
  tailorName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
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

export async function getOrCreateConversation(
  customerId: number,
  tailorId: number
): Promise<ConversationResponse> {
  const res = await fetch(`${API_BASE}/api/messages/conversations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ customerId, tailorId }),
  });
  return parseResponse<ConversationResponse>(res);
}

export async function getConversations(userId: number): Promise<ConversationResponse[]> {
  const res = await fetch(`${API_BASE}/api/messages/conversations/${userId}`, {
    headers: authHeaders(),
  });
  return parseResponse<ConversationResponse[]>(res);
}

export async function getMessages(
  conversationId: number,
  readerId: number
): Promise<MessageResponse[]> {
  const res = await fetch(
    `${API_BASE}/api/messages/conversation/${conversationId}?readerId=${readerId}`,
    { headers: authHeaders() }
  );
  return parseResponse<MessageResponse[]>(res);
}

export async function sendMessage(
  conversationId: number,
  senderId: number,
  content: string
): Promise<MessageResponse> {
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ conversationId, senderId, content }),
  });
  return parseResponse<MessageResponse>(res);
}
