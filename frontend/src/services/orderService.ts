const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface OrderRequest {
  userId: number;
  tailorId: number;
  measurementId?: number | null;
  styleChoice: string;
  fabricChoice: string;
  amount?: number | null;
  deliveryDate?: string | null; // ISO date "YYYY-MM-DD"
}

export interface OrderResponse {
  id: number;
  userId: number;
  tailorId: number;
  measurementId: number | null;
  styleChoice: string;
  fabricChoice: string;
  amount: number | null;
  paymentStatus: string;
  orderStatus: string;
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
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
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function placeOrder(req: OrderRequest): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  return parseResponse<OrderResponse>(res);
}

export async function getOrdersByUser(userId: number): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE}/api/orders/${userId}`, {
    headers: authHeaders(),
  });
  return parseResponse<OrderResponse[]>(res);
}

export async function getOrderById(orderId: number): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/orders/details/${orderId}`, {
    headers: authHeaders(),
  });
  return parseResponse<OrderResponse>(res);
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return parseResponse<OrderResponse>(res);
}

export async function getOrdersByTailor(tailorId: number): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE}/api/orders/tailor/${tailorId}`, {
    headers: authHeaders(),
  });
  return parseResponse<OrderResponse[]>(res);
}
