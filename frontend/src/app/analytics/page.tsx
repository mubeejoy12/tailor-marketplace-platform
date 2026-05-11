'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountSidebar from '@/components/AccountSidebar';
import { BarChart2, TrendingUp, ShoppingBag, Star, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { getTailorAnalytics, TailorAnalytics } from '@/services/analyticsService';
import { getUser } from '@/lib/auth';
import { fetchTailorByUserId } from '@/services/tailorService';
import { SkeletonMetricCard } from '@/components/ui/Skeleton';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return `₦${Number(n).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function maxVal(map: Record<string, number>) {
  return Math.max(...Object.values(map), 1);
}

// ─── Bar Chart (CSS) ──────────────────────────────────────────────────────────

function BarChart({
  data,
  color = 'bg-teal-500',
  format = (v: number) => String(v),
}: {
  data: Record<string, number>;
  color?: string;
  format?: (v: number) => string;
}) {
  const entries = Object.entries(data);
  const max = maxVal(data);
  return (
    <div className="flex items-end gap-1.5 h-36">
      {entries.map(([label, value]) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center">
            <div
              title={`${label}: ${format(value)}`}
              className={`w-full rounded-t-sm ${color} transition-all cursor-default`}
              style={{ height: `${Math.max((value / max) * 120, 2)}px` }}
            />
          </div>
          <span className="text-[9px] text-gray-400 truncate w-full text-center">
            {label.slice(5)} {/* YYYY-MM → MM */}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (SVG) ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  NEW:         '#6366f1',
  ACCEPTED:    '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  READY:       '#10b981',
  DELIVERED:   '#0f766e',
};

function DonutChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-sm text-gray-400 text-center py-8">No data yet</p>;

  const r = 50;
  const cx = 60;
  const cy = 60;
  let offset = -0.25 * (2 * Math.PI * r); // start at 12 o'clock

  const slices = Object.entries(data).map(([status, count]) => {
    const pct = count / total;
    const len = pct * 2 * Math.PI * r;
    const slice = { status, count, pct, dashArray: `${len} ${2 * Math.PI * r}`, dashOffset: offset };
    offset -= len;
    return slice;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {slices.map((s) => (
          <circle
            key={s.status}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={STATUS_COLORS[s.status] || '#9ca3af'}
            strokeWidth="18"
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-xs" fontSize="14" fontWeight="bold" fill="#111">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9ca3af">
          orders
        </text>
      </svg>
      <ul className="space-y-1.5">
        {slices.map((s) => (
          <li key={s.status} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: STATUS_COLORS[s.status] || '#9ca3af' }}
            />
            <span className="text-gray-700">{s.status.replace('_', ' ')}</span>
            <span className="text-gray-400 ml-auto">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData]     = useState<TailorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) { setError('Please log in.'); setLoading(false); return; }

    fetchTailorByUserId(user.id)
      .then((profile) => getTailorAnalytics(profile.id))
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-8 gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <AccountSidebar />
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-2.5 rounded-xl">
              <BarChart2 className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
              <p className="text-sm text-gray-500">Your shop performance at a glance</p>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 p-4 rounded-xl text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={ShoppingBag}
                  label="Total Orders"
                  value={data.totalOrders}
                  sub={`${data.completedOrders} completed`}
                  color="bg-teal-600"
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Active Orders"
                  value={data.activeOrders}
                  color="bg-blue-500"
                />
                <MetricCard
                  icon={DollarSign}
                  label="Total Earnings"
                  value={formatCurrency(data.totalEarnings)}
                  color="bg-emerald-600"
                />
                <MetricCard
                  icon={Star}
                  label="Average Rating"
                  value={`${data.averageRating.toFixed(1)} / 5`}
                  sub={`${data.totalReviews} reviews`}
                  color="bg-amber-500"
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Orders by month */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Orders per Month</h3>
                  {Object.keys(data.ordersByMonth).length > 0
                    ? <BarChart data={data.ordersByMonth} color="bg-teal-500" />
                    : <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
                  }
                </div>

                {/* Earnings by month */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Earnings per Month (₦)</h3>
                  {Object.keys(data.earningsByMonth).length > 0
                    ? <BarChart
                        data={Object.fromEntries(
                          Object.entries(data.earningsByMonth).map(([k, v]) => [k, Number(v)])
                        )}
                        color="bg-emerald-500"
                        format={formatCurrency}
                      />
                    : <p className="text-sm text-gray-400 text-center py-8">No earnings yet</p>
                  }
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Order status donut */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Orders by Status</h3>
                  <DonutChart data={data.ordersByStatus} />
                </div>

                {/* Top styles */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Top Garment Styles</h3>
                  {data.topStyles && data.topStyles.length > 0 ? (
                    <ul className="space-y-3">
                      {data.topStyles.map((entry: { key: string; value: number }, i) => {
                        const maxStyle = data.topStyles[0]?.value || 1;
                        return (
                          <li key={entry.key} className="flex items-center gap-3">
                            <span className="w-4 text-xs text-gray-400 shrink-0">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700 truncate">{entry.key}</span>
                                <span className="text-xs text-gray-400 ml-2">{entry.value}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full"
                                  style={{ width: `${(entry.value / maxStyle) * 100}%` }}
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">No style data yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
