"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TailorCard from "@/components/ui/TailorCard";
import FilterChip from "@/components/ui/FilterChip";
import { Search, SlidersHorizontal, ChevronDown, X, Loader2, AlertCircle } from "lucide-react";
import { fetchTailors } from "@/services/tailorService";
import type { TailorProfile } from "@/services/tailorService";

const SORT_OPTIONS = ["Most Relevant", "Highest Rated", "Lowest Rating"];

export default function TailorsPage() {
  const [tailors, setTailors]       = useState<TailorProfile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy]         = useState("Most Relevant");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating]   = useState(0);

  useEffect(() => {
    fetchTailors()
      .then(setTailors)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load tailors.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Build dynamic specialization list from real data
  const specializations = [
    "All",
    ...Array.from(
      new Set(tailors.map((t) => t.specialization).filter(Boolean) as string[])
    ),
  ];

  const filtered = tailors
    .filter((t) => {
      const term = search.toLowerCase();
      const matchesSearch =
        t.shopName.toLowerCase().includes(term) ||
        t.location.toLowerCase().includes(term);
      const matchesFilter =
        activeFilter === "All" || t.specialization === activeFilter;
      const matchesRating = t.rating >= minRating;
      return matchesSearch && matchesFilter && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "Highest Rated") return b.rating - a.rating;
      if (sortBy === "Lowest Rating") return a.rating - b.rating;
      return 0; // Most Relevant — preserve API order
    });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1
            className="text-2xl font-bold text-[#111111] mb-1"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Browse Tailors
          </h1>
          <p className="text-sm text-[#6B7280]">
            {loading ? "Loading…" : `${filtered.length} tailor${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F766E] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111111]"
              >
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

        {/* Specialization chips — built from real API data */}
        <div className="flex gap-3 flex-wrap mb-8 overflow-x-auto pb-1">
          {specializations.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={activeFilter === s}
              onClick={() => setActiveFilter(s)}
            />
          ))}
        </div>

        {/* ── States ── */}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading tailors…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto mt-8">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load tailors</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError("");
                  fetchTailors()
                    .then(setTailors)
                    .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
                    .finally(() => setLoading(false));
                }}
                className="mt-3 text-xs text-[#0F766E] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty state — database has tailors but none match filters */}
        {!loading && !error && tailors.length > 0 && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6B7280] text-sm">No tailors match your search or filters.</p>
            <button
              onClick={() => { setSearch(""); setActiveFilter("All"); setMinRating(0); }}
              className="mt-3 text-sm text-[#0F766E] font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Empty state — no tailors in the database yet */}
        {!loading && !error && tailors.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#111111] font-medium mb-1">No tailors registered yet</p>
            <p className="text-[#6B7280] text-sm">
              Tailors can create profiles through the API. Check back soon.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((t) => (
              <TailorCard
                key={t.id}
                id={t.id}
                shopName={t.shopName}
                specialization={t.specialization ?? "General Tailoring"}
                location={t.location}
                rating={Number(t.rating)}
              />
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
