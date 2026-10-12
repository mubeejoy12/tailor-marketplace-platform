import Link from "next/link";
import { MapPin, ShieldCheck, Shirt, Star } from "lucide-react";
import type { Design } from "@/services/designService";
import { formatNaira } from "@/services/designService";

interface DesignCardProps {
  design: Design;
  /** Hide the tailor footer when the card is already shown on that tailor's page */
  showTailor?: boolean;
}

export default function DesignCard({ design, showTailor = true }: DesignCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-md hover:border-[#0F766E]/40 transition-all">
      <div className="aspect-[4/3] bg-[#F3F4F6] relative">
        {design.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.imageUrl}
            alt={design.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="w-10 h-10 text-[#D1D5DB]" />
          </div>
        )}
        <span className="absolute top-3 left-3 text-xs font-medium text-[#0F766E] bg-white/90 px-2.5 py-1 rounded-full">
          {design.category}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#111111] line-clamp-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            {design.title}
          </h3>
          <p className="text-sm font-bold text-[#0F766E] whitespace-nowrap">{formatNaira(design.price)}</p>
        </div>
        {design.description && (
          <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2">{design.description}</p>
        )}

        {showTailor && (
          <Link
            href={`/tailors/${design.tailorId}`}
            className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between gap-2 text-xs text-[#6B7280] hover:text-[#0F766E]"
          >
            <span className="flex items-center gap-1 font-medium text-[#111111] truncate">
              {design.tailorShopName}
              {design.tailorVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
            </span>
            <span className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {Number(design.tailorRating).toFixed(1)}
              </span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {design.tailorLocation}
              </span>
            </span>
          </Link>
        )}

        <Link
          href={`/orders/place?tailorId=${design.tailorId}&designId=${design.id}`}
          className="mt-auto pt-3"
        >
          <span className="block w-full text-center text-sm font-medium text-white bg-[#0F766E] hover:bg-[#0D6B63] rounded-xl py-2.5 transition-colors">
            Order this design
          </span>
        </Link>
      </div>
    </div>
  );
}
