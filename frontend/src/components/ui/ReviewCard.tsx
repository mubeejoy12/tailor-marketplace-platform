import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatarInitials?: string;
}

export default function ReviewCard({ name, rating, comment, date, avatarInitials }: ReviewCardProps) {
  const initials = avatarInitials ?? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-sm font-semibold text-[#0F766E]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">{name}</p>
            <p className="text-xs text-[#6B7280]">{date}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-[#6B7280] leading-relaxed">{comment}</p>
    </div>
  );
}
