"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { optimizedImage } from "@/lib/cloudinary";
import { useSiteContent } from "./useSiteContent";

const DEFAULT_SUBTITLE =
  "Connect with Africa's finest tailors. Share your measurements, choose your style, and receive perfectly fitted clothing — delivered to your door.";

/** Homepage hero — picture and text come from the admin Site Content page when set. */
export default function HomeHero() {
  const content  = useSiteContent();
  const imageUrl = content["hero.imageUrl"];
  const title    = content["hero.title"];
  const subtitle = content["hero.subtitle"] || DEFAULT_SUBTITLE;

  return (
    <section className="relative bg-[#FAFAF8] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0F766E]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0F766E]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 ${
        imageUrl ? "grid lg:grid-cols-2 gap-12 items-center" : ""
      }`}>
        <div className={imageUrl ? "text-center lg:text-left" : "max-w-3xl mx-auto text-center"}>
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0F766E] text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            Africa&apos;s #1 Premium Tailor Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            {title ? title : <>Wear Clothing{" "}<span className="text-[#0F766E]">Crafted for You.</span></>}
          </h1>
          <p className={`text-lg text-[#6B7280] mb-10 max-w-xl leading-relaxed ${imageUrl ? "mx-auto lg:mx-0" : "mx-auto"}`}>
            {subtitle}
          </p>

          {/* Search bar */}
          <div className={`bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-2 flex flex-col sm:flex-row gap-2 max-w-xl mb-6 ${imageUrl ? "mx-auto lg:mx-0" : "mx-auto"}`}>
            <div className="flex items-center gap-3 flex-1 px-3">
              <Search className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search tailors by name or location..."
                className="flex-1 text-sm text-[#111111] placeholder-[#9CA3AF] bg-transparent outline-none py-2"
              />
            </div>
            <Link href="/tailors">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Find Tailors
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[#6B7280]">
            Trusted by <span className="font-semibold text-[#111111]">18,000+</span> customers across Nigeria
          </p>
        </div>

        {imageUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizedImage(imageUrl, { width: 640, height: 560 })}
              alt="Tailored clothing"
              className="w-full aspect-[8/7] object-cover rounded-3xl shadow-xl"
            />
          </div>
        )}
      </div>
    </section>
  );
}
