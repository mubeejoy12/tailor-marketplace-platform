"use client";

import Link from "next/link";
import { ArrowRight, Shirt } from "lucide-react";
import Button from "@/components/ui/Button";
import { DESIGN_CATEGORIES } from "@/services/designService";
import { categoryImageKey } from "@/services/siteContentService";
import { optimizedImage } from "@/lib/cloudinary";
import { useSiteContent } from "./useSiteContent";

/** "Browse by Style" tiles — each opens the design catalog filtered to that style. */
export default function CategoryShowcase() {
  const content = useSiteContent();

  return (
    <section className="py-16 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Browse by Style</h2>
            <p className="text-sm text-[#6B7280] mt-1">Find the perfect design for every occasion</p>
          </div>
          <Link href="/designs">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {DESIGN_CATEGORIES.map((cat) => {
            const image = content[categoryImageKey(cat)];
            return (
              <Link
                key={cat}
                href={`/designs?category=${encodeURIComponent(cat)}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0F766E]/10"
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={optimizedImage(image, { width: 240, height: 300 })}
                    alt={cat}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Shirt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] w-10 h-10 text-[#0F766E]/40" />
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-sm font-semibold text-white">{cat}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
