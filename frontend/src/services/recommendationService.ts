const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RecommendationResult {
  tailorId: number;
  shopName: string;
  location: string;
  specialization: string;
  profileImage: string | null;
  rating: number;
  totalOrders: number;
  verified: boolean;
  score: number;
  matchReason: string;
}

export async function getRecommendations(params?: {
  userId?: number;
  specialization?: string;
  location?: string;
  limit?: number;
}): Promise<RecommendationResult[]> {
  const qs = new URLSearchParams();
  if (params?.userId)         qs.set('userId',         String(params.userId));
  if (params?.specialization) qs.set('specialization', params.specialization);
  if (params?.location)       qs.set('location',        params.location);
  if (params?.limit)          qs.set('limit',           String(params.limit));

  const res = await fetch(`${API_BASE}/api/recommendations?${qs}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
