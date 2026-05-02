"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import {
  Package, CheckCircle, Scissors, Clock, Truck,
  Loader2, AlertCircle, ChevronRight, User,
} from "lucide-react";
import { getOrdersByTailor, updateOrderStatus, OrderResponse } from "@/services/orderService";
import { fetchTailorByUserId, TailorProfile } from "@/services/tailorService";
import { getUser } from "@/lib/auth";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  NEW:         { label: "New",         color: "text-blue-600 bg-blue-50 border-blue-200",     icon: Package    },
  ACCEPTED:    { label: "Accepted",    color: "text-teal-600 bg-teal-50 border-teal-200",     icon: CheckCircle },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-50 border-amber-200",  icon: Scissors   },
  READY:       { label: "Ready",       color: "text-purple-600 bg-purple-50 border-purple-200", icon: Clock    },
  DELIVERED:   { label: "Delivered",   color: "text-green-600 bg-green-50 border-green-200",  icon: Truck      },
};

/** What action button to show for each status */
const NEXT_ACTION: Record<string, { label: string; nextStatus: string; variant: "primary" | "outline" }> = {
  NEW:         { label: "Accept Order",   nextStatus: "ACCEPTED",    variant: "primary"  },
  ACCEPTED:    { label: "Start Work",     nextStatus: "IN_PROGRESS", variant: "primary"  },
  IN_PROGRESS: { label: "Mark Ready",     nextStatus: "READY",       variant: "primary"  },
  READY:       { label: "Mark Delivered", nextStatus: "DELIVERED",   variant: "primary"  },
};

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onStatusUpdate,
}: {
  order: OrderResponse;
  onStatusUpdate: (orderId: number, newStatus: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const meta   = STATUS_META[order.orderStatus] ?? STATUS_META.NEW;
  const action = NEXT_ACTION[order.orderStatus];
  const Icon   = meta.icon;

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  async function handleAction() {
    if (!action) return;
    setUpdating(true);
    setUpdateError("");
    try {
      const updated = await updateOrderStatus(order.id, action.nextStatus);
      onStatusUpdate(order.id, updated.orderStatus);
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-[#9CA3AF] mb-0.5">Order #{order.id} · {date}</p>
          <p className="text-sm font-semibold text-[#111111]">{order.styleChoice}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Fabric: {order.fabricChoice}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${meta.color}`}>
          <Icon className="w-3.5 h-3.5" />{meta.label}
        </span>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-3 text-xs mb-4">
        <div>
          <p className="text-[#9CA3AF]">Amount</p>
          <p className="font-medium text-[#111111]">
            {order.amount != null ? `₦${order.amount.toLocaleString()}` : "TBD"}
          </p>
        </div>
        <div>
          <p className="text-[#9CA3AF]">Delivery</p>
          <p className="font-medium text-[#111111]">{order.deliveryDate ?? "TBD"}</p>
        </div>
        <div>
          <p className="text-[#9CA3AF]">Payment</p>
          <p className={`font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* Error */}
      {updateError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{updateError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {action && (
          <Button
            variant={action.variant}
            size="sm"
            onClick={handleAction}
            disabled={updating}
            className="flex-1"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : action.label}
          </Button>
        )}
        {order.orderStatus === "DELIVERED" && (
          <span className="flex-1 text-center text-xs text-green-600 font-medium py-2">
            ✓ Order complete
          </span>
        )}
        <Link href={`/orders/${order.id}`}>
          <button className="p-2 rounded-xl border border-[#E5E7EB] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors text-[#6B7280]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TailorDashboardPage() {
  const [tailor,   setTailor]   = useState<TailorProfile | null>(null);
  const [orders,   setOrders]   = useState<OrderResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState<string>("ALL");

  useEffect(() => {
    const user = getUser();
    if (!user) { setError("Please log in to access your dashboard."); setLoading(false); return; }

    fetchTailorByUserId(user.id)
      .then((profile) => {
        setTailor(profile);
        return getOrdersByTailor(profile.id);
      })
      .then(setOrders)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  function handleStatusUpdate(orderId: number, newStatus: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  }

  const STATUS_FILTERS = ["ALL", "NEW", "ACCEPTED", "IN_PROGRESS", "READY", "DELIVERED"];
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.orderStatus === filter);

  const counts = Object.fromEntries(
    STATUS_FILTERS.slice(1).map((s) => [s, orders.filter((o) => o.orderStatus === s).length])
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#0F766E]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                {tailor ? tailor.shopName : "Tailor Dashboard"}
              </h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {loading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Stats bar */}
          {!loading && !error && orders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              {STATUS_FILTERS.slice(1).map((s) => {
                const m = STATUS_META[s];
                return (
                  <div key={s} className="bg-[#FAFAF8] rounded-xl p-3 border border-[#F3F4F6]">
                    <p className="text-lg font-bold text-[#111111]">{counts[s] ?? 0}</p>
                    <p className="text-xs text-[#6B7280]">{m?.label ?? s}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading dashboard…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load dashboard</p>
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
            <p className="text-[#6B7280] text-sm">New orders from customers will appear here.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap mb-6">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === s
                      ? "bg-[#0F766E] text-white border-[#0F766E]"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0F766E]"
                  }`}
                >
                  {s === "ALL" ? `All (${orders.length})` : `${STATUS_META[s]?.label ?? s} (${counts[s] ?? 0})`}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-[#9CA3AF] text-sm">
                No orders with status &quot;{filter}&quot;
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((order) => (
                  <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
