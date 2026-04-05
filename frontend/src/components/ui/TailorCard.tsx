import Link from "next/link";
import { MapPin, Star, Clock, ArrowRight } from "lucide-react";

interface TailorCardProps {
  id: number;
  shopName: string;
  specialization: string;
  location: string;
  rating: number;
  reviewCount?: number;
  priceRange?: string;
  deliveryDays?: number;
  imagePlaceholder?: string;
}

export default function TailorCard({
  id,
  shopName,
  specialization,
  location,
  rating,
  reviewCount = 0,
  priceRange = "₦15,000 – ₦80,000",
  deliveryDays = 7,
  imagePlaceholder,
}: TailorCardProps) {
  const initials = shopName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const colors = ["#0F766E", "#7C3AED", "#DC2626", "#D97706", "#1D4ED8"];
  const color = colors[id % colors.length];

  return (
    <Link href={`/tailors/${id}`}>
      <div className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-lg hover:border-[#0F766E]/30 transition-all duration-300 cursor-pointer">
        {/* Image area */}
        <div
          className="h-48 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: `${color}15` }}
        >
          {imagePlaceholder ? (
            <img src={imagePlaceholder} alt={shopName} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ backgroundColor: color, fontFamily: "Poppins, sans-serif" }}
            >
              {initials}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-[#111111]">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-[#111111] text-base leading-tight mb-1 group-hover:text-[#0F766E] transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}>
              {shopName}
            </h3>
            <span className="inline-block text-xs font-medium text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full">
              {specialization}
            </span>
          </div>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Delivery in {deliveryDays} days</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
            <div>
              <span className="text-xs text-[#6B7280]">From</span>
              <p className="text-sm font-semibold text-[#111111]">{priceRange}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#0F766E] group-hover:gap-2 transition-all">
              View <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
