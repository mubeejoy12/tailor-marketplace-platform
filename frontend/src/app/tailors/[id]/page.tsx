import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import ReviewCard from "@/components/ui/ReviewCard";
import { MapPin, Star, Clock, CheckCircle, ArrowRight, Package, MessageCircle } from "lucide-react";
import Link from "next/link";

const TAILOR = {
  id: 1,
  shopName: "Mubee Classic Tailors",
  specialization: "Native Wear",
  location: "Lagos, Nigeria",
  rating: 4.9,
  reviewCount: 128,
  priceRange: "₦20,000 – ₦80,000",
  deliveryDays: 5,
  bio: "With over 10 years of crafting premium Nigerian native wear, Mubee Classic Tailors brings unmatched artistry and attention to detail. Specialising in Agbada, Dashiki, Kaftan, and contemporary Ankara designs.",
  completedOrders: 342,
  specializations: ["Agbada", "Kaftan", "Dashiki", "Ankara", "Senator"],
  portfolio: [1, 2, 3, 4, 5, 6],
};

const REVIEWS = [
  { name: "Aisha Bello", rating: 5, comment: "The Agbada set was absolutely stunning. Every stitch was perfect and it arrived 2 days early. Highly recommended!", date: "March 2026" },
  { name: "Emeka Okafor", rating: 5, comment: "Second time ordering and still impressed. The quality keeps getting better. My go-to tailor on TailorHub.", date: "February 2026" },
  { name: "Chioma Nwosu", rating: 4, comment: "Beautiful work on my Ankara gown. Measurements were followed to the letter. Will be ordering for my sister too.", date: "January 2026" },
];

const COLORS = ["#0F766E", "#7C3AED", "#DC2626", "#D97706", "#1D4ED8", "#059669"];

export default function TailorDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile header */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col sm:flex-row gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center text-2xl font-bold text-[#0F766E] flex-shrink-0" style={{ fontFamily: "Poppins, sans-serif" }}>
                MC
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>{TAILOR.shopName}</h1>
                    <span className="inline-block text-xs font-medium text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full mt-1">
                      {TAILOR.specialization}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-[#111111]">{TAILOR.rating}</span>
                    <span className="text-xs text-[#6B7280]">({TAILOR.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <MapPin className="w-4 h-4 text-[#0F766E]" /> {TAILOR.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <Clock className="w-4 h-4 text-[#0F766E]" /> {TAILOR.deliveryDays} days delivery
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <Package className="w-4 h-4 text-[#0F766E]" /> {TAILOR.completedOrders} orders completed
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
              <h2 className="text-base font-semibold text-[#111111] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>About</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">{TAILOR.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {TAILOR.specializations.map((s) => (
                  <span key={s} className="text-xs font-medium bg-[#F3F4F6] text-[#374151] px-3 py-1.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
              <h2 className="text-base font-semibold text-[#111111] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TAILOR.portfolio.map((item, i) => (
                  <div
                    key={item}
                    className="aspect-square rounded-xl flex items-center justify-center text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    Work {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{TAILOR.rating}</span>
                  <span className="text-xs text-[#6B7280]">/ 5.0</span>
                </div>
              </div>
              <div className="space-y-4">
                {REVIEWS.map((r) => <ReviewCard key={r.name} {...r} />)}
              </div>
            </div>
          </div>

          {/* Right — Booking sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sticky top-24">
              <div className="mb-5">
                <p className="text-xs text-[#6B7280] mb-1">Starting from</p>
                <p className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>₦20,000</p>
                <p className="text-xs text-[#6B7280] mt-1">up to ₦80,000 depending on design</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: Clock, text: `${TAILOR.deliveryDays} days estimated delivery` },
                  { icon: CheckCircle, text: "Verified professional tailor" },
                  { icon: Package, text: `${TAILOR.completedOrders} orders completed` },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                    <Icon className="w-4 h-4 text-[#0F766E] flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Link href={`/orders/place?tailorId=${TAILOR.id}`}>
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
      </div>

      <Footer />
    </div>
  );
}
