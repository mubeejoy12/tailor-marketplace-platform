const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface AIMeasurementRequest {
  userId: number;
  heightCm: number;
  weightKg: number;
  bodyShape: 'SLIM' | 'REGULAR' | 'ATHLETIC' | 'PLUS';
  bodyReferenceImageBase64?: string;
}

export interface AIMeasurementResponse {
  userId: number;
  chest: number;
  waist: number;
  hip: number;
  sleeve: number;
  neck: number;
  shoulder: number;
  trouserLength: number;
  inseam: number;
  confidenceScore: number;
  reasoning: string;
  bodyShape: string;
  aiPowered: boolean;
}

export async function getAISuggestions(
  req: AIMeasurementRequest
): Promise<AIMeasurementResponse> {
  const res = await fetch(`${API_BASE}/api/measurements/ai-suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
