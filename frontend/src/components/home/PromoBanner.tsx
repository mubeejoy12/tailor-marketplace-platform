"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { optimizedImage } from "@/lib/cloudinary";
import { useSiteContent } from "./useSiteContent";

/** Admin-managed promo banner; renders nothing until it has a picture or a title. */
export default function PromoBanner() {
  const content  = useSiteContent();
  const imageUrl = content["banner.imageUrl"];
  const title    = content["banner.title"];
  const text     = content["banner.text"];
  const link     = content["banner.link"];

  if (!imageUrl && !title) return null;

  const inner = (
    <div className="relative rounded-3xl overflow-hidden bg-[#0F766E] min-h-[180px] flex items-end">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimizedImage(imageUrl, { width: 1200, height: 360 })}
          alt={title || "Promotion"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {(title || text) && (
        <div className="relative w-full p-6 sm:p-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          {title && <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h2>}
          {text && <p className="text-sm text-white/90 mt-1 max-w-xl">{text}</p>}
          {link && (
            <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-white">
              Learn more <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="pt-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {link ? <Link href={link}>{inner}</Link> : inner}
      </div>
    </section>
  );
}
