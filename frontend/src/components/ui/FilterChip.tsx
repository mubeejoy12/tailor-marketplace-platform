"use client";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
        active
          ? "bg-[#0F766E] text-white border-[#0F766E] shadow-sm"
          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0F766E] hover:text-[#0F766E]"
      }`}
    >
      {label}
    </button>
  );
}
