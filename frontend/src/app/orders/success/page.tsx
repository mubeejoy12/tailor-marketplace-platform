"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import {
  CheckCircle, Package, Clock, ArrowRight, Loader2, CreditCard, AlertCircle,
} from "lucide-react";
import { getOrderById, OrderResponse } from "@/services/orderService";
import { initializePayment } from "@/services/paymentService";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function OrderSuccessPage() {
  const [order, setOrder]         = useState<OrderResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [paying, setPaying]       = useState(false);
  const [payError, setPayError]   = useState("");

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    if (!orderId) { setLoading(false); return; }
    getOrderById(Number(orderId))
      .then(setOrder)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handlePayNow() {
    if (!order) return;
    const user = getUser();
    if (!user) return;

    setPaying(true);
    setPayError("");
    try {
      const result = await initializePayment({
        orderId: order.id,
        email:   user.email,
        amount:  order.amount ?? 20000,
      });
      // Redirect user to Paystack hosted payment page
      window.location.href = result.authorizationUrl;
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : "Payment initialization failed.");
      setPaying(false);
    }
  }

  const alreadyPaid = order?.paymentStatus === "PAID";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-8">
        {loading ? (
          <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
        ) : (
          <div className="text-center max-w-md w-full">
            {/* Success icon */}
            <div className="w-20 h-20 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#0F766E]" />
            </div>

            <h1 className="text-2xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Order Placed!
            </h1>
            <p className="text-sm text-[#6B7280] mb-6">
              Your order has been submitted successfully. Your tailor will review it and confirm shortly.
            </p>

            {/* Order details card */}
            {order && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-[#F3F4F6]">
                  <span className="text-xs text-[#6B7280]">Order ID</span>
                  <span className="text-xs font-semibold text-[#111111]">#{order.id}</span>
                </div>
                {[
                  { label: "Design",   value: order.styleChoice },
                  { label: "Fabric",   value: order.fabricChoice },
                  { label: "Delivery", value: order.deliveryDate ?? "To be confirmed" },
                  { label: "Amount",   value: order.amount != null ? `₦${order.amount.toLocaleString()}` : "TBD" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-[#6B7280]">{label}</span>
                    <span className="text-xs font-medium text-[#111111] text-right max-w-[200px]">{value}</span>
                  </div>
                ))}
                {/* Status pills */}
                <div className="flex justify-between items-center pt-2 border-t border-[#F3F4F6]">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${
                    alreadyPaid
                      ? "text-green-700 bg-green-50 border-green-200"
                      : "text-amber-700 bg-amber-50 border-amber-200"
                  }`}>
                    {alreadyPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {order.paymentStatus}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">{order.orderStatus}</span>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6 text-left">
              <p className="text-xs font-semibold text-[#111111] mb-3">What happens next?</p>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: "Order submitted",           done: true  },
                  { icon: Clock,       text: "Awaiting tailor acceptance", done: false },
                  { icon: CreditCard,  text: "Pay to start production",    done: alreadyPaid },
                  { icon: Package,     text: "Tailor crafts your order",   done: false },
                ].map(({ icon: Icon, text, done }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${done ? "text-[#0F766E]" : "text-[#D1D5DB]"}`} />
                    <span className={`text-xs ${done ? "text-[#111111] font-medium" : "text-[#9CA3AF]"}`}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pay Now — only if not already paid */}
            {order && !alreadyPaid && (
              <div className="mb-4">
                {payError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{payError}</p>
                  </div>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handlePayNow}
                  disabled={paying}
                >
                  {paying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay Now — {order.amount != null ? `₦${order.amount.toLocaleString()}` : "₦20,000"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#9CA3AF] mt-2">Secured by Paystack · Cards, Bank Transfer, USSD</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile">
                <Button variant="outline" size="md" className="w-full sm:w-auto">
                  My Orders
                </Button>
              </Link>
              <Link href="/tailors">
                <Button variant={alreadyPaid ? "primary" : "ghost"} size="md" className="w-full sm:w-auto">
                  Browse More Tailors <ArrowRight className="w-4 h-4" />
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
