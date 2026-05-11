const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface TailorAnalytics {
  tailorId: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  ordersByMonth: Record<string, number>;
  earningsByMonth: Record<string, number>;
  ordersByStatus: Record<string, number>;
  topStyles: Array<{ key: string; value: number }>;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalTailors: number;
  verifiedTailors: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalRevenue: number;
  averagePlatformRating: number;
  totalReviews: number;
  newUsersByMonth: Record<string, number>;
  ordersByMonth: Record<string, number>;
  revenueByMonth: Record<string, number>;
  ordersByStatus: Record<string, number>;
  topTailors: Array<{ tailorId: number; shopName: string; completedOrders: number; rating: number }>;
}

export async function getTailorAnalytics(tailorId: number): Promise<TailorAnalytics> {
  const res = await fetch(`${API_BASE}/api/analytics/tailor/${tailorId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await fetch(`${API_BASE}/api/analytics/admin`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
