"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Scissors, ShoppingBag, Star, DollarSign,
  ShieldCheck, ShieldX, Clock, TrendingUp, CheckCircle,
  AlertCircle, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  getAdminMetrics, getPendingVerifications, reviewVerification,
  getAllOrders, getAllUsers, AdminMetrics, AdminOrder,
} from "@/services/adminService";
import { getAdminAnalytics, AdminAnalytics } from "@/services/analyticsService";

interface PendingVerification {
  id: number;
  shopName: string;
  location: string;
  specialization: string | null;
  portfolioUrls: string | null;
  shopDocumentUrl: string | null;
  verificationStatus: string;
}

interface AdminUser {
  id: number;
  fullName: string | null;
  email: string;
  role: string;
  createdAt: string | null;
}
import { getUser } from "@/lib/auth";

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, sub, color = "#0F766E",
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
          {value}
        </p>
        {sub && <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW:         "text-blue-600 bg-blue-50 border-blue-200",
    ACCEPTED:    "text-teal-600 bg-teal-50 border-teal-200",
    IN_PROGRESS: "text-amber-600 bg-amber-50 border-amber-200",
    READY:       "text-purple-600 bg-purple-50 border-purple-200",
    DELIVERED:   "text-green-600 bg-green-50 border-green-200",
    PAID:        "text-green-600 bg-green-50 border-green-200",
    PENDING:     "text-amber-600 bg-amber-50 border-amber-200",
    UNVERIFIED:  "text-gray-600 bg-gray-50 border-gray-200",
    APPROVED:    "text-emerald-700 bg-emerald-50 border-emerald-200",
    REJECTED:    "text-red-600 bg-red-50 border-red-200",
    CUSTOMER:    "text-blue-600 bg-blue-50 border-blue-200",
    TAILOR:      "text-teal-600 bg-teal-50 border-teal-200",
    ADMIN:       "text-purple-600 bg-purple-50 border-purple-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status] ?? "text-gray-600 bg-gray-50 border-gray-200"}`}>
      {status}
    </span>
  );
}

// ─── Simple bar chart (CSS) ───────────────────────────────────────────────────

function AdminBarChart({
  data,
  color = "bg-teal-500",
  format = (v: number) => String(v),
}: {
  data: Record<string, number>;
  color?: string;
  format?: (v: number) => string;
}) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="flex items-end gap-1 h-28 mt-2">
      {entries.map(([label, value]) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            title={`${label}: ${format(value)}`}
            className={`w-full rounded-t-sm ${color} cursor-default`}
            style={{ height: `${Math.max((value / max) * 100, 2)}px` }}
          />
          <span className="text-[8px] text-gray-400 truncate w-full text-center">
            {label.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title, count, children,
}: {
  title: string; count?: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-xs bg-[#0F766E] text-white px-2 py-0.5 rounded-full font-medium">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [metrics,      setMetrics]      = useState<AdminMetrics | null>(null);
  const [analytics,    setAnalytics]    = useState<AdminAnalytics | null>(null);
  const [verifications,setVerifications]= useState<PendingVerification[]>([]);
  const [orders,       setOrders]       = useState<AdminOrder[]>([]);
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [verifNotes,   setVerifNotes]   = useState<Record<number, string>>({});
  const [actingOn,     setActingOn]     = useState<number | null>(null);

  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      setError("Access denied. Admin role required.");
      setLoading(false);
      return;
    }
    Promise.all([
      getAdminMetrics(),
      getPendingVerifications(),
      getAllOrders(),
      getAllUsers(),
      getAdminAnalytics().catch(() => null),
    ])
      .then(([m, v, o, u, a]) => {
        setMetrics(m);
        setVerifications(v as PendingVerification[]);
        setOrders(o.slice(0, 50));
        setUsers(u as AdminUser[]);
        if (a) setAnalytics(a as AdminAnalytics);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load admin data."))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerify(tailorId: number, decision: "APPROVE" | "REJECT") {
    setActingOn(tailorId);
    try {
      await reviewVerification(tailorId, decision, verifNotes[tailorId] ?? "");
      setVerifications((prev) => prev.filter((v) => v.id !== tailorId));
      setMetrics((m) => m ? { ...m, pendingVerifications: m.pendingVerifications - 1 } : m);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActingOn(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Platform management and analytics</p>
        </div>

        {/* Metrics grid */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={Users}       label="Total Users"         value={metrics.totalUsers}        />
            <MetricCard icon={Scissors}    label="Total Tailors"       value={metrics.totalTailors}      color="#7C3AED" />
            <MetricCard icon={ShoppingBag} label="Total Orders"        value={metrics.totalOrders}       color="#D97706" />
            <MetricCard
              icon={DollarSign}
              label="Total Revenue"
              value={`₦${metrics.totalRevenue.toLocaleString()}`}
              sub="from paid orders"
              color="#059669"
            />
            <MetricCard icon={TrendingUp}  label="Active Orders"       value={metrics.activeOrders}      color="#1D4ED8" />
            <MetricCard icon={CheckCircle} label="Completed Orders"    value={metrics.completedOrders}   color="#059669" />
            <MetricCard icon={Star}        label="Total Reviews"       value={metrics.totalReviews}       color="#D97706" />
            <MetricCard
              icon={ShieldCheck}
              label="Pending Verifications"
              value={metrics.pendingVerifications}
              color={metrics.pendingVerifications > 0 ? "#DC2626" : "#059669"}
            />
          </div>
        )}

        {/* Analytics charts */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Orders / Month</p>
              <AdminBarChart data={analytics.ordersByMonth} color="bg-teal-500" />
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Revenue / Month (₦)</p>
              <AdminBarChart
                data={Object.fromEntries(Object.entries(analytics.revenueByMonth).map(([k, v]) => [k, Number(v)]))}
                color="bg-emerald-500"
                format={(v) => `₦${v.toLocaleString()}`}
              />
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">New Users / Month</p>
              <AdminBarChart data={analytics.newUsersByMonth} color="bg-purple-400" />
            </div>

            {/* Top tailors */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 md:col-span-2">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Top Tailors by Completed Orders</p>
              {analytics.topTailors.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                : (
                  <ul className="space-y-3">
                    {analytics.topTailors.map((t, i) => {
                      const maxOrders = analytics.topTailors[0]?.completedOrders || 1;
                      return (
                        <li key={t.tailorId} className="flex items-center gap-3">
                          <span className="w-5 text-xs text-gray-400 shrink-0 text-right">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-800">{t.shopName}</span>
                              <span className="text-xs text-gray-400">{t.completedOrders} orders</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${(t.completedOrders / maxOrders) * 100}%` }}
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              }
            </div>

            {/* Order status breakdown */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Order Status Breakdown</p>
              <ul className="space-y-2">
                {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{status.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Pending verifications */}
        <Section title="Pending Verifications" count={(verifications as unknown[]).length}>
          {(verifications as unknown[]).length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-[#9CA3AF]">No pending verifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {verifications.map((v) => (
                <div key={v.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#111111]">{v.shopName}</p>
                      <Badge status="PENDING" />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">{v.location} · {v.specialization ?? "General"}</p>
                    {v.portfolioUrls && (
                      <p className="text-xs text-[#0F766E] mt-1 truncate">Portfolio: {v.portfolioUrls}</p>
                    )}
                    {v.shopDocumentUrl && (
                      <a href={v.shopDocumentUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-[#0F766E] hover:underline mt-0.5 block">
                        View document ↗
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      className="text-xs border border-[#E5E7EB] rounded-lg px-3 py-1.5 w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      value={verifNotes[v.id] ?? ""}
                      onChange={(e) => setVerifNotes((n) => ({ ...n, [v.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(v.id, "APPROVE")}
                        disabled={actingOn === v.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {actingOn === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(v.id, "REJECT")}
                        disabled={actingOn === v.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        <ShieldX className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Recent orders */}
        <Section title="Recent Orders" count={orders.length}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3F4F6] bg-[#FAFAF8]">
                  {["Order #", "User ID", "Tailor ID", "Style", "Order Status", "Payment", "Amount", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[#9CA3AF] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#111111]">#{o.id}</td>
                    <td className="px-5 py-3 text-[#6B7280]">{o.userId}</td>
                    <td className="px-5 py-3 text-[#6B7280]">{o.tailorId}</td>
                    <td className="px-5 py-3 text-[#6B7280] max-w-[120px] truncate">{o.styleChoice}</td>
                    <td className="px-5 py-3"><Badge status={o.orderStatus} /></td>
                    <td className="px-5 py-3"><Badge status={o.paymentStatus} /></td>
                    <td className="px-5 py-3 font-medium text-[#111111]">
                      {o.amount ? `₦${o.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#9CA3AF]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Users */}
        <Section title="All Users" count={users.length}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3F4F6] bg-[#FAFAF8]">
                  {["ID", "Name", "Email", "Role", "Joined"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[#9CA3AF] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3 text-[#6B7280]">{u.id}</td>
                    <td className="px-5 py-3 font-medium text-[#111111]">{u.fullName || "—"}</td>
                    <td className="px-5 py-3 text-[#6B7280]">{u.email}</td>
                    <td className="px-5 py-3"><Badge status={u.role ?? "CUSTOMER"} /></td>
                    <td className="px-5 py-3 text-[#9CA3AF]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>

      <Footer />
    </div>
  );
}
