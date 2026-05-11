"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import {
  MapPin, Star, Clock, CheckCircle, ShieldCheck,
  ArrowRight, Package, MessageCircle, Loader2, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchTailorById } from "@/services/tailorService";
import type { TailorProfile } from "@/services/tailorService";
import { getReviewsByTailor, ReviewResponse } from "@/services/reviewService";
import { getOrCreateConversation } from "@/services/messageService";
import { getUser } from "@/lib/auth";

const PORTFOLIO_COLORS = ["#0F766E", "#7C3AED", "#DC2626", "#D97706", "#1D4ED8", "#059669"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function ReviewCard({ review }: { review: ReviewResponse }) {
  const ini = review.reviewerName
    ? review.reviewerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return (
    <div className="flex gap-4 py-4 border-b border-[#F3F4F6] last:border-0">
      <div className="w-9 h-9 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
        {ini}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-[#111111]">{review.reviewerName}</p>
          <p className="text-xs text-[#9CA3AF]">{timeAgo(review.createdAt)}</p>
        </div>
        <StarRating rating={review.rating} size="sm" />
        {review.comment && (
          <p className="text-sm text-[#6B7280] mt-1.5 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

export default function TailorDetailPage() {
  const params    = useParams();
  const tailorId  = params.id as string;
  const router    = useRouter();

  const [tailor,  setTailor]  = useState<TailorProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (!tailorId) return;
    Promise.all([
      fetchTailorById(tailorId),
      getReviewsByTailor(Number(tailorId)),
    ])
      .then(([t, r]) => { setTailor(t); setReviews(r); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Tailor not found."))
      .finally(() => setLoading(false));
  }, [tailorId]);

  async function handleMessage() {
    const user = getUser();
    if (!user) { router.push("/login"); return; }
    if (!tailor) return;
    setMessaging(true);
    try {
      // tailor.userId is the User account ID of the tailor
      const conv = await getOrCreateConversation(user.id, tailor.id);
      router.push(`/messages?conversationId=${conv.id}`);
    } catch {
      setMessaging(false);
    }
  }

  const isVerified = tailor?.verificationStatus === "APPROVED";
  const portfolioList = tailor?.portfolioUrls
    ? tailor.portfolioUrls.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading tailor profile…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto mt-8">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load profile</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <Link href="/tailors" className="mt-3 inline-block text-xs text-[#0F766E] font-medium hover:underline">
                ← Back to tailors
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && tailor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left — Main content ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile header */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col sm:flex-row gap-6">
                {tailor.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tailor.profileImage}
                    alt={tailor.shopName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#0F766E] bg-[#0F766E]/10 flex-shrink-0"
                    style={{ fontFamily: "Poppins, sans-serif" }}>
                    {initials(tailor.shopName)}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-[#111111]"
                          style={{ fontFamily: "Poppins, sans-serif" }}>
                          {tailor.shopName}
                        </h1>
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      {tailor.specialization && (
                        <span className="inline-block text-xs font-medium text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full mt-1">
                          {tailor.specialization}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-[#111111]">
                        {Number(tailor.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                      <MapPin className="w-4 h-4 text-[#0F766E]" />
                      {tailor.location}
                    </div>
                    {isVerified && (
                      <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                        <CheckCircle className="w-4 h-4 text-[#0F766E]" />
                        Verified professional
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2 className="text-base font-semibold text-[#111111] mb-3"
                  style={{ fontFamily: "Poppins, sans-serif" }}>About</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {tailor.shopName} is {isVerified ? "a verified artisan" : "a tailor"} on TailorHub
                  {tailor.specialization ? `, specialising in ${tailor.specialization}` : ""}.
                  Based in {tailor.location}, they bring craftsmanship and precision to every order.
                </p>
              </div>

              {/* Portfolio */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2 className="text-base font-semibold text-[#111111] mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}>Portfolio</h2>
                {portfolioList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolioList.map((url: string, i: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt={`Portfolio ${i + 1}`}
                        className="aspect-square rounded-xl object-cover w-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PORTFOLIO_COLORS.map((color, i) => (
                      <div key={i}
                        className="aspect-square rounded-xl flex items-center justify-center text-white text-xs font-medium opacity-60"
                        style={{ backgroundColor: color }}>
                        Work {i + 1}
                      </div>
                    ))}
                  </div>
                )}
                {portfolioList.length === 0 && (
                  <p className="text-xs text-[#9CA3AF] mt-3">Portfolio images coming soon</p>
                )}
              </div>

              {/* Reviews — real data */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[#111111]"
                    style={{ fontFamily: "Poppins, sans-serif" }}>
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={Number(tailor.rating)} size="sm" />
                    <span className="text-sm font-semibold text-[#111111] ml-1">
                      {Number(tailor.rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">({reviews.length})</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Star className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                    <p className="text-sm text-[#9CA3AF]">No reviews yet — be the first!</p>
                  </div>
                ) : (
                  <div>
                    {reviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ── Right — Booking sidebar ─────────────────────────────────── */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sticky top-24">
                <div className="mb-5">
                  <p className="text-xs text-[#6B7280] mb-1">Rating</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-[#111111]"
                      style={{ fontFamily: "Poppins, sans-serif" }}>
                      {Number(tailor.rating).toFixed(1)}
                    </p>
                    <span className="text-sm text-[#6B7280]">/ 5.0</span>
                  </div>
                  <StarRating rating={Number(tailor.rating)} size="sm" />
                  <p className="text-xs text-[#9CA3AF] mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: Star,        text: `${Number(tailor.rating).toFixed(1)} star rating` },
                    isVerified
                      ? { icon: ShieldCheck, text: "Verified professional tailor" }
                      : { icon: CheckCircle, text: "Active tailor" },
                    { icon: Clock,       text: "Custom delivery timeline" },
                    { icon: Package,     text: "Accepts custom orders" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                      <Icon className="w-4 h-4 text-[#0F766E] flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Link href={`/orders/place?tailorId=${tailor.id}`}>
                    <Button variant="primary" size="lg" className="w-full">
                      Place Order <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleMessage}
                    disabled={messaging}
                  >
                    {messaging
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><MessageCircle className="w-4 h-4" /> Message Tailor</>
                    }
                  </Button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
