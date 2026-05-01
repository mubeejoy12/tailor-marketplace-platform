"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Clock, CheckCircle, Truck, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { getOrdersByUser, OrderResponse } from "@/services/orderService";
import { getUser } from "@/lib/auth";
import Link from "next/link";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  NEW:         { label: "New",         color: "text-blue-600 bg-blue-50 border-blue-200",   icon: Package      },
  ACCEPTED:    { label: "Accepted",    color: "text-teal-600 bg-teal-50 border-teal-200",   icon: CheckCircle  },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock        },
  READY:       { label: "Ready",       color: "text-purple-600 bg-purple-50 border-purple-200", icon: CheckCircle },
  DELIVERED:   { label: "Delivered",   color: "text-green-600 bg-green-50 border-green-200",  icon: Truck        },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: "text-gray-600 bg-gray-50 border-gray-200", icon: Package };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

function OrderCard({ order }: { order: OrderResponse }) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-[#9CA3AF] mb-0.5">Order #{order.id}</p>
          <p className="text-sm font-semibold text-[#111111]">{order.styleChoice}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Fabric: {order.fabricChoice}</p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-[#6B7280] mb-4">
        <div>
          <span className="block text-[#9CA3AF]">Placed</span>
          <span className="font-medium text-[#111111]">{date}</span>
        </div>
        <div>
          <span className="block text-[#9CA3AF]">Delivery</span>
          <span className="font-medium text-[#111111]">{order.deliveryDate ?? "TBD"}</span>
        </div>
        <div>
          <span className="block text-[#9CA3AF]">Payment</span>
          <span className={`font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
            {order.paymentStatus}
          </span>
        </div>
        <div>
          <span className="block text-[#9CA3AF]">Amount</span>
          <span className="font-medium text-[#111111]">
            {order.amount != null ? `₦${order.amount.toLocaleString()}` : "TBD"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1.5">
          {["NEW", "ACCEPTED", "IN_PROGRESS", "READY", "DELIVERED"].map((s) => (
            <span key={s} className={order.orderStatus === s ? "text-[#0F766E] font-semibold" : ""}>
              {STATUS_META[s]?.label ?? s}
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F766E] rounded-full transition-all"
            style={{
              width: `${(["NEW", "ACCEPTED", "IN_PROGRESS", "READY", "DELIVERED"].indexOf(order.orderStatus) + 1) * 20}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [orders, setOrders]   = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) { setError("Please log in to view your orders."); setLoading(false); return; }
    getOrdersByUser(Number(user.id))
      .then(setOrders)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
            My Orders
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading your orders…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto mt-8">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load orders</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[#0F766E]" />
            </div>
            <p className="text-[#111111] font-medium mb-1">No orders yet</p>
            <p className="text-[#6B7280] text-sm mb-6">Browse tailors and place your first custom order.</p>
            <Link href="/tailors">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#0F766E] hover:underline">
                Browse Tailors <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
