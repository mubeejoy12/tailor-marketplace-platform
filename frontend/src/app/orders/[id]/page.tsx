"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import {
  CheckCircle, Circle, Clock, Package, Scissors,
  Truck, CreditCard, MapPin, Star, ArrowLeft, Loader2, AlertCircle,
} from "lucide-react";
import { getOrderById, OrderResponse } from "@/services/orderService";
import Link from "next/link";

// ─── Timeline step definitions ────────────────────────────────────────────────

interface Step {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { key: "ORDER_PLACED",       label: "Order Placed",        description: "Your order was submitted",           icon: Package     },
  { key: "PAYMENT_CONFIRMED",  label: "Payment Confirmed",   description: "Payment received by platform",       icon: CreditCard  },
  { key: "ACCEPTED",           label: "Accepted by Tailor",  description: "Tailor confirmed your order",        icon: CheckCircle },
  { key: "IN_PROGRESS",        label: "In Progress",         description: "Tailor is crafting your outfit",     icon: Scissors    },
  { key: "READY",              label: "Ready",               description: "Your outfit is ready for pickup",    icon: Clock       },
  { key: "DELIVERED",          label: "Delivered",           description: "Order successfully delivered",       icon: Truck       },
];

/** Map orderStatus + paymentStatus → how many steps are complete */
function resolveCompletedSteps(order: OrderResponse): number {
  const statusRank: Record<string, number> = {
    NEW: 1, ACCEPTED: 3, IN_PROGRESS: 4, READY: 5, DELIVERED: 6,
  };
  let steps = statusRank[order.orderStatus] ?? 1;
  // Step 2 (Payment Confirmed) requires PAID regardless of orderStatus
  if (order.paymentStatus === "PAID" && steps >= 1) steps = Math.max(steps, 2);
  return steps;
}

// ─── Components ───────────────────────────────────────────────────────────────

function StepItem({
  step, index, completedSteps, isLast,
}: {
  step: Step; index: number; completedSteps: number; isLast: boolean;
}) {
  const stepNumber  = index + 1;
  const isComplete  = stepNumber <= completedSteps;
  const isCurrent   = stepNumber === completedSteps + 1;
  const Icon        = step.icon;

  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
          isComplete
            ? "bg-[#0F766E] border-[#0F766E] text-white"
            : isCurrent
            ? "bg-white border-[#0F766E] text-[#0F766E]"
            : "bg-white border-[#E5E7EB] text-[#D1D5DB]"
        }`}>
          {isComplete ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 ${isComplete ? "bg-[#0F766E]" : "bg-[#E5E7EB]"}`} style={{ minHeight: "32px" }} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? "" : ""}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-semibold ${
            isComplete ? "text-[#111111]" : isCurrent ? "text-[#0F766E]" : "text-[#9CA3AF]"
          }`}>
            {step.label}
          </p>
          {isCurrent && (
            <span className="text-[10px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded-full">
              Current
            </span>
          )}
        </div>
        <p className={`text-xs ${isComplete || isCurrent ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const params   = useParams();
  const router   = useRouter();
  const orderId  = params.id as string;

  const [order,   setOrder]   = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!orderId) return;
    getOrderById(Number(orderId))
      .then(setOrder)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load order."))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F3F4F6] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Order Tracking
            </h1>
            {order && (
              <p className="text-sm text-[#6B7280] mt-0.5">Order #{order.id}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading order details…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load order</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — Timeline */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm font-semibold text-[#111111] mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Order Progress
                </h2>
                <div>
                  {STEPS.map((step, i) => (
                    <StepItem
                      key={step.key}
                      step={step}
                      index={i}
                      completedSteps={resolveCompletedSteps(order)}
                      isLast={i === STEPS.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Summary */}
            <div className="space-y-4">

              {/* Tailor card */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">Your Tailor</h2>
                {order.tailorShopName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-xs font-bold text-[#0F766E]">
                      {order.tailorShopName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{order.tailorShopName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {order.tailorLocation && (
                          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <MapPin className="w-3 h-3" />{order.tailorLocation}
                          </span>
                        )}
                        {order.tailorRating != null && Number(order.tailorRating) > 0 && (
                          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {Number(order.tailorRating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">Tailor info unavailable</p>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-3">
                <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Order Summary</h2>
                {[
                  { label: "Design",   value: order.styleChoice },
                  { label: "Fabric",   value: order.fabricChoice },
                  { label: "Amount",   value: order.amount != null ? `₦${order.amount.toLocaleString()}` : "TBD" },
                  { label: "Delivery", value: order.deliveryDate ?? "To be confirmed" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-[#9CA3AF]">{label}</span>
                    <span className="text-xs font-medium text-[#111111] text-right">{value}</span>
                  </div>
                ))}

                <div className="border-t border-[#F3F4F6] pt-3 flex justify-between gap-2">
                  <span className="text-xs text-[#9CA3AF]">Payment</span>
                  <span className={`text-xs font-semibold ${
                    order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"
                  }`}>{order.paymentStatus}</span>
                </div>
              </div>

              {/* CTA */}
              {order.paymentStatus !== "PAID" && (
                <Link href={`/orders/success?orderId=${order.id}`}>
                  <Button variant="primary" size="md" className="w-full">
                    <CreditCard className="w-4 h-4" /> Complete Payment
                  </Button>
                </Link>
              )}

              <Link href="/profile">
                <Button variant="outline" size="md" className="w-full">
                  All My Orders
                </Button>
              </Link>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
