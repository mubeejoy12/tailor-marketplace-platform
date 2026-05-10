const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface Measurement {
  id: number;
  userId: number;
  chest: number | null;
  waist: number | null;
  sleeve: number | null;
  neck: number | null;
  shoulder: number | null;
  hip: number | null;
  trouserLength: number | null;
  inseam: number | null;
  bodyReferenceImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementRequest {
  userId: number;
  chest?: number | null;
  waist?: number | null;
  sleeve?: number | null;
  neck?: number | null;
  shoulder?: number | null;
  hip?: number | null;
  trouserLength?: number | null;
  inseam?: number | null;
  bodyReferenceImage?: string | null;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      msg = (json.message as string) || (json.error as string) || text || msg;
    } catch {
      msg = text || msg;
    }
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

export async function getMeasurementsByUser(userId: number): Promise<Measurement[]> {
  const res = await fetch(`${API_BASE}/api/measurements/user/${userId}`, {
    headers: authHeaders(),
  });
  return parseResponse<Measurement[]>(res);
}

export async function saveMeasurement(data: MeasurementRequest): Promise<Measurement> {
  const res = await fetch(`${API_BASE}/api/measurements`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return parseResponse<Measurement>(res);
}

export async function updateMeasurement(id: number, data: MeasurementRequest): Promise<Measurement> {
  const res = await fetch(`${API_BASE}/api/measurements/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return parseResponse<Measurement>(res);
}

export async function deleteMeasurement(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/measurements/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed (${res.status})`);
  }
}
