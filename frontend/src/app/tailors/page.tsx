"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TailorCard from "@/components/ui/TailorCard";
import FilterChip from "@/components/ui/FilterChip";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  Search, SlidersHorizontal, X, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, ShieldCheck,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface TailorPage {
  content: Array<{
    id: number;
    shopName: string;
    location: string;
    specialization: string | null;
    rating: number;
    profileImage: string | null;
    verificationStatus: string;
  }>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

const SPECIALIZATIONS = [
  "All", "Native Wear", "Bridal & Formal", "Men's Suits",
  "Agbada & Kaftan", "Corporate Wear", "Casual Wear", "Children's Wear",
];

const MIN_RATING_OPTIONS = [
  { label: "Any", value: "" },
  { label: "3+",  value: "3" },
  { label: "4+",  value: "4" },
  { label: "4.5+", value: "4.5" },
];

const PAGE_SIZE = 12;

/** Debounce a value by delayMs */
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function TailorsPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState("");
  const [specialization,setSpecialization]= useState("");
  const [location,      setLocation]      = useState("");
  const [minRating,     setMinRating]     = useState("");
  const [verifiedOnly,  setVerifiedOnly]  = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);
  const [currentPage,   setCurrentPage]   = useState(0);

  // ── Data state ────────────────────────────────────────────────────────────
  const [result,  setResult]  = useState<TailorPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Debounce keyword search only — other filters apply immediately
  const debouncedSearch = useDebounce(search, 350);

  // Active filter count for badge
  const activeFilters = [
    specialization, location, minRating, verifiedOnly ? "v" : ""
  ].filter(Boolean).length;

  const fetchTailors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (debouncedSearch) qs.set("keyword",        debouncedSearch);
      if (specialization)  qs.set("specialization", specialization);
      if (location)        qs.set("location",        location);
      if (minRating)       qs.set("minRating",       minRating);
      if (verifiedOnly)    qs.set("verifiedOnly",    "true");
      qs.set("page", String(currentPage));
      qs.set("size", String(PAGE_SIZE));
      qs.set("sortBy", "rating");

      const res = await fetch(`${API_BASE}/api/tailors/search?${qs}`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data: TailorPage = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tailors.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, specialization, location, minRating, verifiedOnly, currentPage]);

  useEffect(() => {
    fetchTailors();
  }, [fetchTailors]);

  // Reset to page 0 when filters change (but not on page change)
  const prevFilters = useRef({ debouncedSearch, specialization, location, minRating, verifiedOnly });
  useEffect(() => {
    const prev = prevFilters.current;
    const changed =
      prev.debouncedSearch !== debouncedSearch ||
      prev.specialization  !== specialization  ||
      prev.location        !== location        ||
      prev.minRating       !== minRating       ||
      prev.verifiedOnly    !== verifiedOnly;
    if (changed) {
      setCurrentPage(0);
      prevFilters.current = { debouncedSearch, specialization, location, minRating, verifiedOnly };
    }
  }, [debouncedSearch, specialization, location, minRating, verifiedOnly]);

  function clearAll() {
    setSearch(""); setSpecialization(""); setLocation("");
    setMinRating(""); setVerifiedOnly(false); setCurrentPage(0);
  }

  const tailors   = result?.content ?? [];
  const totalPages = result?.totalPages ?? 0;
  const total      = result?.totalElements ?? 0;

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
            {loading
              ? "Searching…"
              : `${total.toLocaleString()} tailor${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Keyword search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, specialization, or city…"
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

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFilters > 0
                ? "border-[#0F766E] text-[#0F766E] bg-[#0F766E]/5"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F766E] hover:text-[#0F766E]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-0.5 text-white bg-[#0F766E] text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Specialization chips */}
        <div className="flex gap-2.5 flex-wrap mb-4 overflow-x-auto pb-1">
          {SPECIALIZATIONS.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={specialization === (s === "All" ? "" : s)}
              onClick={() => setSpecialization(s === "All" ? "" : s)}
            />
          ))}
        </div>

        {/* Advanced filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">City / Region</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Lagos, Abuja"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#0F766E]"
                  />
                  {location && (
                    <button
                      onClick={() => setLocation("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Min rating */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Minimum Rating</label>
                <div className="flex gap-2 flex-wrap">
                  {MIN_RATING_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.label}
                      label={opt.label}
                      active={minRating === opt.value}
                      onClick={() => setMinRating(opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Verified only toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setVerifiedOnly((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${verifiedOnly ? "bg-[#0F766E]" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${verifiedOnly ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="flex items-center gap-1.5 text-sm text-[#374151]">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Verified tailors only
              </span>
            </label>

            {activeFilters > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-[#0F766E] hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto mt-8">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load tailors</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchTailors}
                className="mt-3 text-xs text-[#0F766E] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tailors.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[#111111] font-medium mb-1">No tailors found</p>
            <p className="text-sm text-[#6B7280] mb-4">Try adjusting your search or filters.</p>
            {activeFilters > 0 || search ? (
              <button
                onClick={clearAll}
                className="text-sm text-[#0F766E] font-medium hover:underline"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && tailors.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tailors.map((t) => (
                <TailorCard
                  key={t.id}
                  id={t.id}
                  shopName={t.shopName}
                  specialization={t.specialization ?? "General Tailoring"}
                  location={t.location}
                  rating={Number(t.rating)}
                  reviewCount={t.totalReviews ?? 0}
                  profileImage={t.profileImage ?? undefined}
                  verified={t.verified ?? t.verificationStatus === "APPROVED"}
                  premium={t.premium ?? false}
                  completedOrders={t.completedOrders ?? 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F766E] hover:text-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  // Show first, last, current, and ±1 around current
                  if (
                    i === 0 || i === totalPages - 1 ||
                    Math.abs(i - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                          i === currentPage
                            ? "bg-[#0F766E] text-white border border-[#0F766E]"
                            : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F766E] hover:text-[#0F766E]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  }
                  if (Math.abs(i - currentPage) === 2) {
                    return <span key={i} className="text-[#9CA3AF] text-sm">…</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F766E] hover:text-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
      <Footer />
    </div>
  );
}
