"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import ReviewCard from "@/components/ui/ReviewCard";
import { MapPin, Star, Clock, CheckCircle, ArrowRight, Package, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchTailorById } from "@/services/tailorService";
import type { TailorProfile } from "@/services/tailorService";

const PORTFOLIO_COLORS = ["#0F766E", "#7C3AED", "#DC2626", "#D97706", "#1D4ED8", "#059669"];

// Placeholder reviews until the reviews API is built in Phase 2
const PLACEHOLDER_REVIEWS = [
  { name: "Aisha Bello",  rating: 5, comment: "Beautiful craftsmanship. Every stitch was perfect and it arrived ahead of schedule!", date: "March 2026" },
  { name: "Emeka Okafor", rating: 5, comment: "Second order and still impressed. My go-to tailor on TailorHub.", date: "February 2026" },
  { name: "Chioma Nwosu", rating: 4, comment: "Measurements followed to the letter. Will be ordering again for sure.", date: "January 2026" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TailorDetailPage() {
  const params  = useParams();
  const tailorId = params.id as string;

  const [tailor, setTailor]   = useState<TailorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!tailorId) return;
    fetchTailorById(tailorId)
      .then(setTailor)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Tailor not found.");
      })
      .finally(() => setLoading(false));
  }, [tailorId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading tailor profile…</p>
          </div>
        )}

        {/* Error */}
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

        {/* Content */}
        {!loading && !error && tailor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — Main content */}
            <div className="lg:col-span-2 space-y-8">

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
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#0F766E] bg-[#0F766E]/10 flex-shrink-0"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {initials(tailor.shopName)}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1
                        className="text-xl font-bold text-[#111111]"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {tailor.shopName}
                      </h1>
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
                    <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                      <CheckCircle className="w-4 h-4 text-[#0F766E]" />
                      Verified professional
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2
                  className="text-base font-semibold text-[#111111] mb-3"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  About
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {tailor.shopName} is a verified artisan on TailorHub
                  {tailor.specialization ? `, specialising in ${tailor.specialization}` : ""}.
                  Based in {tailor.location}, they bring craftsmanship and precision to every order.
                </p>
              </div>

              {/* Portfolio — placeholder until portfolio API is built */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2
                  className="text-base font-semibold text-[#111111] mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((item, i) => (
                    <div
                      key={item}
                      className="aspect-square rounded-xl flex items-center justify-center text-white text-sm font-medium opacity-70"
                      style={{ backgroundColor: PORTFOLIO_COLORS[i % PORTFOLIO_COLORS.length] }}
                    >
                      Work {item}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9CA3AF] mt-3">Portfolio images coming soon</p>
              </div>

              {/* Reviews — placeholder until reviews API is built */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-base font-semibold text-[#111111]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">
                      {Number(tailor.rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-[#6B7280]">/ 5.0</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {PLACEHOLDER_REVIEWS.map((r) => (
                    <ReviewCard key={r.name} {...r} />
                  ))}
                </div>
              </div>

            </div>

            {/* Right — Booking sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sticky top-24">
                <div className="mb-5">
                  <p className="text-xs text-[#6B7280] mb-1">Rated</p>
                  <div className="flex items-baseline gap-1">
                    <p
                      className="text-3xl font-bold text-[#111111]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {Number(tailor.rating).toFixed(1)}
                    </p>
                    <span className="text-sm text-[#6B7280]">/ 5.0</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: Star,         text: `${Number(tailor.rating).toFixed(1)} star rating` },
                    { icon: CheckCircle,  text: "Verified professional tailor" },
                    { icon: Clock,        text: "Custom delivery timeline" },
                    { icon: Package,      text: "Accepts custom orders" },
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
                  <Button variant="outline" size="lg" className="w-full">
                    <MessageCircle className="w-4 h-4" /> Message Tailor
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
