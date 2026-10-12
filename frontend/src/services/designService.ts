const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface Design {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Owning tailor summary
  tailorId: number;
  tailorShopName: string;
  tailorLocation: string;
  tailorRating: number;
  tailorVerified: boolean;
}

/** Shape sent when creating or updating a design — the owner comes from the JWT */
export interface DesignPayload {
  title: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface DesignPage {
  content: Design[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface DesignSearchParams {
  keyword?: string;
  category?: string;
  tailorId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: "newest" | "priceAsc" | "priceDesc";
}

/** Categories offered in the catalog filters and the tailor's design form */
export const DESIGN_CATEGORIES = [
  "Agbada",
  "Senator",
  "Kaftan",
  "Dashiki",
  "Boubou",
  "Iro & Buba",
  "Wedding",
  "Corporate",
  "Children",
  "Other",
];

export function formatNaira(amount: number): string {
  return `₦${Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      const fields = json.fields as Record<string, string> | undefined;
      msg = (fields && Object.values(fields)[0]) || (json.error as string) || (json.message as string) || msg;
    } catch {
      msg = text || msg;
    }
    throw new Error(msg);
  }
  return (text ? JSON.parse(text) : undefined) as T;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function searchDesigns(params: DesignSearchParams = {}): Promise<DesignPage> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
  });
  const res = await fetch(`${API_BASE}/api/designs?${qs}`, { cache: "no-store" });
  return parseResponse<DesignPage>(res);
}

export async function getDesign(id: number | string): Promise<Design> {
  const res = await fetch(`${API_BASE}/api/designs/${id}`, { cache: "no-store" });
  return parseResponse<Design>(res);
}

export async function getDesignsByTailor(tailorId: number | string): Promise<Design[]> {
  const res = await fetch(`${API_BASE}/api/designs/tailor/${tailorId}`, { cache: "no-store" });
  return parseResponse<Design[]>(res);
}

export async function createDesign(payload: DesignPayload): Promise<Design> {
  const res = await fetch(`${API_BASE}/api/designs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse<Design>(res);
}

export async function updateDesign(id: number, payload: DesignPayload): Promise<Design> {
  const res = await fetch(`${API_BASE}/api/designs/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse<Design>(res);
}

export async function deleteDesign(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/designs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseResponse<void>(res);
}
