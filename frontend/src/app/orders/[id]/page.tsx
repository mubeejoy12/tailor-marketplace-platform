"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import {
  CheckCircle, Circle, Clock, Package, Scissors,
  Truck, CreditCard, MapPin, Star, ArrowLeft, Loader2,
  AlertCircle, MessageSquare, Send,
} from "lucide-react";
import { getOrderById, OrderResponse } from "@/services/orderService";
import { submitReview, hasReviewed } from "@/services/reviewService";
import { getUser } from "@/lib/auth";
import Link from "next/link";

// ─── Timeline steps ───────────────────────────────────────────────────────────

interface Step { key: string; label: string; description: string; icon: React.ElementType; }

const STEPS: Step[] = [
  { key: "ORDER_PLACED",      label: "Order Placed",       description: "Your order was submitted",          icon: Package     },
  { key: "PAYMENT_CONFIRMED", label: "Payment Confirmed",  description: "Payment received by platform",      icon: CreditCard  },
  { key: "ACCEPTED",          label: "Accepted by Tailor", description: "Tailor confirmed your order",       icon: CheckCircle },
  { key: "IN_PROGRESS",       label: "In Progress",        description: "Tailor is crafting your outfit",    icon: Scissors    },
  { key: "READY",             label: "Ready",              description: "Your outfit is ready for pickup",   icon: Clock       },
  { key: "DELIVERED",         label: "Delivered",          description: "Order successfully delivered",      icon: Truck       },
];

function resolveCompletedSteps(order: OrderResponse): number {
  const rank: Record<string, number> = { NEW: 1, ACCEPTED: 3, IN_PROGRESS: 4, READY: 5, DELIVERED: 6 };
  let steps = rank[order.orderStatus] ?? 1;
  if (order.paymentStatus === "PAID" && steps >= 1) steps = Math.max(steps, 2);
  return steps;
}

// ─── StepItem ─────────────────────────────────────────────────────────────────

function StepItem({ step, index, completedSteps, isLast }: {
  step: Step; index: number; completedSteps: number; isLast: boolean;
}) {
  const n         = index + 1;
  const isComplete = n <= completedSteps;
  const isCurrent  = n === completedSteps + 1;
  const Icon       = step.icon;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
          isComplete ? "bg-[#0F766E] border-[#0F766E] text-white" :
          isCurrent  ? "bg-white border-[#0F766E] text-[#0F766E]" :
                       "bg-white border-[#E5E7EB] text-[#D1D5DB]"
        }`}>
          {isComplete ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 mt-1 ${isComplete ? "bg-[#0F766E]" : "bg-[#E5E7EB]"}`} style={{ minHeight: "32px" }} />}
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-semibold ${isComplete ? "text-[#111111]" : isCurrent ? "text-[#0F766E]" : "text-[#9CA3AF]"}`}>
            {step.label}
          </p>
          {isCurrent && <span className="text-[10px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded-full">Current</span>}
        </div>
        <p className={`text-xs ${isComplete || isCurrent ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>{step.description}</p>
      </div>
    </div>
  );
}

// ─── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({ order, onDone }: { order: OrderResponse; onDone: () => void }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  async function handleSubmit() {
    if (rating === 0) { setErr("Please select a star rating."); return; }
    const user = getUser();
    if (!user) return;
    setSaving(true);
    setErr("");
    try {
      await submitReview({
        userId: user.id,
        tailorId: order.tailorId,
        orderId: order.id,
        rating,
        comment: comment.trim() || undefined,
      });
      onDone();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to submit review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#0F766E]/30 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#0F766E]" />
        <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Leave a Review
        </h3>
      </div>
      <p className="text-xs text-[#6B7280]">How was your experience with {order.tailorShopName}?</p>

      <div>
        <p className="text-xs text-[#9CA3AF] mb-2">Your rating</p>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <textarea
        className="w-full text-sm border border-[#E5E7EB] rounded-xl p-3 text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] resize-none transition-colors"
        rows={3}
        placeholder="Share your experience (optional)…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {err && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{err}</p>
        </div>
      )}

      <Button variant="primary" size="md" onClick={handleSubmit} disabled={saving || rating === 0}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Review</>}
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;

  const [order,       setOrder]       = useState<OrderResponse | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [reviewed,    setReviewed]    = useState(false);
  const [reviewDone,  setReviewDone]  = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(Number(orderId))
      .then(async (o) => {
        setOrder(o);
        if (o.orderStatus === "DELIVERED") {
          const already = await hasReviewed(o.id).catch(() => false);
          setReviewed(already);
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load order."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const completedSteps = order ? resolveCompletedSteps(order) : 0;
  const isDelivered    = order?.orderStatus === "DELIVERED";
  const showReviewForm = isDelivered && !reviewed && !reviewDone;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F3F4F6] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Order Tracking
            </h1>
            {order && <p className="text-sm text-[#6B7280] mt-0.5">Order #{order.id}</p>}
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

            {/* Left — Timeline + review */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm font-semibold text-[#111111] mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Order Progress
                </h2>
                {STEPS.map((step, i) => (
                  <StepItem key={step.key} step={step} index={i} completedSteps={completedSteps} isLast={i === STEPS.length - 1} />
                ))}
              </div>

              {/* Review section */}
              {isDelivered && !showReviewForm && (reviewed || reviewDone) && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-800">Review submitted — thank you!</p>
                </div>
              )}

              {showReviewForm && (
                <ReviewForm order={order} onDone={() => { setReviewDone(true); setReviewed(true); }} />
              )}
            </div>

            {/* Right — Summary */}
            <div className="space-y-4">

              {/* Tailor card */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">Your Tailor</h2>
                {order.tailorShopName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-xs font-bold text-[#0F766E]">
                      {order.tailorShopName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
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
                  <span className={`text-xs font-semibold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {order.paymentStatus !== "PAID" && (
                <Link href={`/orders/success?orderId=${order.id}`}>
                  <Button variant="primary" size="md" className="w-full">
                    <CreditCard className="w-4 h-4" /> Complete Payment
                  </Button>
                </Link>
              )}
              <Link href="/orders">
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
