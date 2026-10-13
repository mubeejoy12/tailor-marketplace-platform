import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TailorCard from "@/components/ui/TailorCard";
import Button from "@/components/ui/Button";
import ReviewCard from "@/components/ui/ReviewCard";
import RecommendedTailors from "@/components/RecommendedTailors";
import HomeHero from "@/components/home/HomeHero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import PromoBanner from "@/components/home/PromoBanner";
import { Search, ArrowRight, CheckCircle, Sparkles, Shield, Clock } from "lucide-react";
import Link from "next/link";

const FEATURED_TAILORS = [
  { id: 1, shopName: "Mubee Classic Tailors", specialization: "Native Wear", location: "Lagos, Nigeria", rating: 4.9, reviewCount: 128, priceRange: "₦20,000 – ₦80,000", deliveryDays: 5 },
  { id: 2, shopName: "Elegance Atelier", specialization: "Bridal & Formal", location: "Abuja, Nigeria", rating: 4.8, reviewCount: 94, priceRange: "₦35,000 – ₦150,000", deliveryDays: 7 },
  { id: 3, shopName: "Heritage Stitch Co.", specialization: "Agbada & Kaftan", location: "Ibadan, Nigeria", rating: 4.7, reviewCount: 72, priceRange: "₦15,000 – ₦60,000", deliveryDays: 6 },
  { id: 4, shopName: "Prestige Bespoke", specialization: "Men&apos;s Suits", location: "Port Harcourt", rating: 4.9, reviewCount: 56, priceRange: "₦50,000 – ₦200,000", deliveryDays: 10 },
];

const REVIEWS = [
  { name: "Aisha Bello", rating: 5, comment: "Absolutely stunning work. My Ankara outfit was crafted with such precision and care. Will definitely be ordering again for my next event.", date: "March 2026" },
  { name: "Emeka Okafor", rating: 5, comment: "Found my go-to tailor on TailorHub. The whole process from measurements to delivery was seamless. Premium quality at fair pricing.", date: "February 2026" },
  { name: "Fatima Al-Hassan", rating: 5, comment: "As someone who is particular about fit, I was blown away. They followed my measurements exactly and the result was perfection.", date: "March 2026" },
];

const STATS = [
  { value: "2,400+", label: "Professional Tailors" },
  { value: "18,000+", label: "Orders Completed" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "32+", label: "Cities Covered" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <HomeHero />

      {/* Stats */}
      <section className="bg-[#111111] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{s.value}</p>
                <p className="text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategoryShowcase />

      <PromoBanner />

      {/* Featured Tailors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Featured Tailors</h2>
              <p className="text-sm text-[#6B7280] mt-1">Handpicked professionals with verified reviews</p>
            </div>
            <Link href="/tailors">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
                See all <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_TAILORS.map((tailor) => (
              <TailorCard key={tailor.id} {...tailor} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Tailors — personalised, client-rendered */}
      <RecommendedTailors />

      {/* How it works */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-semibold text-[#111111] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>How TailorHub Works</h2>
            <p className="text-sm text-[#6B7280] max-w-md mx-auto">Three simple steps to get perfectly tailored clothing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Search, title: "Browse & Choose", desc: "Explore profiles, portfolios, and reviews from verified professional tailors across Nigeria." },
              { step: "02", icon: CheckCircle, title: "Share Measurements", desc: "Use our guided measurement wizard to capture your exact body measurements securely." },
              { step: "03", icon: Sparkles, title: "Receive Your Order", desc: "Your tailor crafts your clothing with precision. Delivered to your door within the agreed timeline." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative bg-white rounded-2xl p-8 border border-[#E5E7EB] hover:shadow-md transition-shadow">
                <span className="text-5xl font-bold text-[#0F766E]/10 absolute top-6 right-6" style={{ fontFamily: "Poppins, sans-serif" }}>{step}</span>
                <div className="w-12 h-12 bg-[#0F766E]/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#0F766E]" />
                </div>
                <h3 className="font-semibold text-[#111111] text-base mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[#111111] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>What Customers Say</h2>
            <p className="text-sm text-[#6B7280]">Trusted by thousands of satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <ReviewCard key={r.name} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0F766E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Ready to Wear Clothing Made for You?
            </h2>
            <p className="text-teal-100 mb-8 text-base leading-relaxed">
              Join thousands of customers already experiencing the joy of perfectly fitted, custom-made clothing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tailors">
                <Button variant="secondary" size="lg">Browse Tailors</Button>
              </Link>
              <Link href="/register">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-medium text-white border border-white/40 hover:bg-white/10 transition-colors">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {[
                { icon: Shield, text: "Secure Payments" },
                { icon: Clock, text: "On-time Delivery" },
                { icon: CheckCircle, text: "Verified Tailors" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-teal-100">
                  <Icon className="w-4 h-4" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
