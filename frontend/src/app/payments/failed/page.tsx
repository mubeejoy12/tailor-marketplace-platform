"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("orderId"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1
            className="text-2xl font-bold text-[#111111] mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Payment Failed
          </h1>
          <p className="text-sm text-[#6B7280] mb-8">
            We couldn&apos;t process your payment. This could be due to insufficient funds, an expired
            card, or a declined transaction. Your order is still saved — you can try again any time.
          </p>

          {/* Possible reasons */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-8 text-left">
            <p className="text-xs font-semibold text-[#111111] mb-3">Possible reasons</p>
            <ul className="space-y-2">
              {[
                "Insufficient account balance",
                "Card not enabled for online payments",
                "Transaction declined by your bank",
                "Incorrect card details entered",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-[#6B7280]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" /> My Orders
              </Button>
            </Link>
            {orderId && (
              <Link href={`/orders/success?orderId=${orderId}`}>
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4" /> Try Again
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
