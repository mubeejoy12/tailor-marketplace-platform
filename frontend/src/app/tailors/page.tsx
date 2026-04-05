"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TailorCard from "@/components/ui/TailorCard";
import FilterChip from "@/components/ui/FilterChip";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

const TAILORS = [
  { id: 1, shopName: "Mubee Classic Tailors", specialization: "Native Wear", location: "Lagos, Nigeria", rating: 4.9, priceRange: "₦20,000 – ₦80,000", deliveryDays: 5 },
  { id: 2, shopName: "Elegance Atelier", specialization: "Bridal & Formal", location: "Abuja, Nigeria", rating: 4.8, priceRange: "₦35,000 – ₦150,000", deliveryDays: 7 },
  { id: 3, shopName: "Heritage Stitch Co.", specialization: "Agbada & Kaftan", location: "Ibadan, Nigeria", rating: 4.7, priceRange: "₦15,000 – ₦60,000", deliveryDays: 6 },
  { id: 4, shopName: "Prestige Bespoke", specialization: "Men's Suits", location: "Port Harcourt", rating: 4.9, priceRange: "₦50,000 – ₦200,000", deliveryDays: 10 },
  { id: 5, shopName: "Stitch & Style Studio", specialization: "Corporate Wear", location: "Lagos, Nigeria", rating: 4.6, priceRange: "₦25,000 – ₦90,000", deliveryDays: 8 },
  { id: 6, shopName: "Royal Fabric House", specialization: "Aso-ebi", location: "Kano, Nigeria", rating: 4.8, priceRange: "₦18,000 – ₦70,000", deliveryDays: 7 },
  { id: 7, shopName: "The Couture Room", specialization: "Women's Fashion", location: "Lagos, Nigeria", rating: 4.7, priceRange: "₦30,000 – ₦120,000", deliveryDays: 9 },
  { id: 8, shopName: "CraftedByRemi", specialization: "Casual Wear", location: "Enugu, Nigeria", rating: 4.5, priceRange: "₦10,000 – ₦40,000", deliveryDays: 5 },
];

const SPECIALIZATIONS = ["All", "Native Wear", "Bridal & Formal", "Men's Suits", "Corporate Wear", "Agbada & Kaftan", "Aso-ebi", "Women's Fashion", "Casual Wear"];
const SORT_OPTIONS = ["Most Relevant", "Highest Rated", "Fastest Delivery", "Lowest Price"];

export default function TailorsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filtered = TAILORS.filter((t) => {
    const matchesSearch =
      t.shopName.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || t.specialization === activeFilter;
    const matchesRating = t.rating >= minRating;
    return matchesSearch && matchesFilter && matchesRating;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Browse Tailors</h1>
          <p className="text-sm text-[#6B7280]">{filtered.length} tailors available across Nigeria</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F766E] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#6B7280] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-8 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#6B7280] focus:outline-none focus:border-[#0F766E] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6">
            <h3 className="text-sm font-semibold text-[#111111] mb-3">Minimum Rating</h3>
            <div className="flex gap-2 flex-wrap">
              {[0, 4.0, 4.5, 4.8].map((r) => (
                <FilterChip
                  key={r}
                  label={r === 0 ? "Any" : `${r}+`}
                  active={minRating === r}
                  onClick={() => setMinRating(r)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Specialization chips */}
        <div className="flex gap-3 flex-wrap mb-8 overflow-x-auto pb-1">
          {SPECIALIZATIONS.map((s) => (
            <FilterChip key={s} label={s} active={activeFilter === s} onClick={() => setActiveFilter(s)} />
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B7280] text-sm">No tailors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((t) => <TailorCard key={t.id} {...t} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
