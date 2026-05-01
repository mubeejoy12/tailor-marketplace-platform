const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface PaymentInitRequest {
  orderId: number;
  email: string;
  amount: number; // Naira — backend converts to kobo
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  reference: string;
  orderId: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: string;
  reference: string;
  orderId: number | null;
  orderStatus: string | null;
  paymentStatus: string | null;
  message: string;
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

/** Initialize Paystack transaction — returns authorization URL to redirect to */
export async function initializePayment(req: PaymentInitRequest): Promise<PaymentInitResponse> {
  const res = await fetch(`${API_BASE}/api/payments/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  return parseResponse<PaymentInitResponse>(res);
}

/** Verify transaction after Paystack redirects back */
export async function verifyPayment(
  reference: string,
  orderId?: number | null
): Promise<PaymentVerifyResponse> {
  const params = new URLSearchParams({ reference });
  if (orderId != null) params.set("orderId", String(orderId));
  const res = await fetch(`${API_BASE}/api/payments/verify?${params.toString()}`, {
    headers: authHeaders(),
  });
  return parseResponse<PaymentVerifyResponse>(res);
}
