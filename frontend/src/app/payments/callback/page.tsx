"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { verifyPayment, PaymentVerifyResponse } from "@/services/paymentService";
import Link from "next/link";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const [verifying, setVerifying]   = useState(true);
  const [result, setResult]         = useState<PaymentVerifyResponse | null>(null);
  const [error, setError]           = useState("");

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    // Paystack adds "reference" (our ref) and "trxref" to the callback URL
    const reference = params.get("reference") ?? params.get("trxref");
    const orderId   = params.get("orderId");

    if (!reference) {
      setError("No payment reference found. Please check your orders.");
      setVerifying(false);
      return;
    }

    verifyPayment(reference, orderId ? Number(orderId) : null)
      .then((res) => {
        setResult(res);
        // Auto-redirect on success after 3s
        if (res.success && res.orderId) {
          setTimeout(() => router.push("/profile"), 3000);
        }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Verification failed. Please contact support.");
      })
      .finally(() => setVerifying(false));
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md w-full">

          {verifying && (
            <>
              <div className="w-20 h-20 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Verifying Payment…
              </h1>
              <p className="text-sm text-[#6B7280]">Please wait while we confirm your transaction.</p>
            </>
          )}

          {!verifying && error && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Verification Error
              </h1>
              <p className="text-sm text-[#6B7280] mb-6">{error}</p>
              <Link href="/profile">
                <Button variant="primary" size="md">View My Orders</Button>
              </Link>
            </>
          )}

          {!verifying && !error && result && result.success && (
            <>
              <div className="w-20 h-20 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[#0F766E]" />
              </div>
              <h1 className="text-2xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Payment Successful!
              </h1>
              <p className="text-sm text-[#6B7280] mb-6">
                Your payment has been confirmed. Your tailor has been notified and will start working on your order.
              </p>

              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6 text-left space-y-3">
                {[
                  { label: "Reference",     value: result.reference },
                  { label: "Order ID",      value: result.orderId != null ? `#${result.orderId}` : "—" },
                  { label: "Order Status",  value: result.orderStatus ?? "—" },
                  { label: "Payment",       value: result.paymentStatus ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-[#6B7280]">{label}</span>
                    <span className={`text-xs font-medium text-right ${
                      label === "Payment" ? "text-green-600" :
                      label === "Order Status" ? "text-[#0F766E]" : "text-[#111111]"
                    }`}>{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#9CA3AF] mb-4">Redirecting to My Orders in 3 seconds…</p>

              <Link href="/profile">
                <Button variant="primary" size="md" className="w-full">
                  Go to My Orders <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}

          {!verifying && !error && result && !result.success && (
            <>
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Payment {result.status === "abandoned" ? "Cancelled" : "Failed"}
              </h1>
              <p className="text-sm text-[#6B7280] mb-6">
                {result.status === "abandoned"
                  ? "You cancelled the payment. Your order is still saved — you can try again from My Orders."
                  : "Your payment could not be processed. Please try a different card or payment method."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/profile">
                  <Button variant="outline" size="md" className="w-full sm:w-auto">My Orders</Button>
                </Link>
                {result.orderId && (
                  <Link href={`/orders/success?orderId=${result.orderId}`}>
                    <Button variant="primary" size="md" className="w-full sm:w-auto">
                      Try Again
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
