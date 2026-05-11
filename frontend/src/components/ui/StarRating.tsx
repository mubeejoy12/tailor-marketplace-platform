"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;         // current value
  max?: number;           // default 5
  size?: "sm" | "md" | "lg";
  interactive?: boolean;  // true = clickable picker
  onChange?: (rating: number) => void;
}

const SIZE_MAP = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const cls = SIZE_MAP[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"}`}
            aria-label={interactive ? `Rate ${i + 1} star${i !== 0 ? "s" : ""}` : undefined}
          >
            <Star
              className={`${cls} transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-[#D1D5DB]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
