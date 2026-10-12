"use client";

/**
 * /designs — Design catalog
 *
 * Customers browse every design tailors have listed, filter by category / price,
 * and jump straight into an order for the design they like.
 *
 * Backend endpoint used:
 *  - GET /api/designs?keyword&category&minPrice&maxPrice&page&size&sortBy
 */

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DesignCard from "@/components/ui/DesignCard";
import FilterChip from "@/components/ui/FilterChip";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Search, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  searchDesigns,
  DESIGN_CATEGORIES,
  DesignPage,
  DesignSearchParams,
} from "@/services/designService";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { label: string; value: NonNullable<DesignSearchParams["sortBy"]> }[] = [
  { label: "Newest",             value: "newest"    },
  { label: "Price: low to high", value: "priceAsc"  },
  { label: "Price: high to low", value: "priceDesc" },
];

/** Debounce a value by delayMs */
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function DesignsPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [sortBy,      setSortBy]      = useState<NonNullable<DesignSearchParams["sortBy"]>>("newest");
  const [currentPage, setCurrentPage] = useState(0);

  // ── Data state ────────────────────────────────────────────────────────────
  const [result,  setResult]  = useState<DesignPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Debounce free-text inputs so typing doesn't fire a request per keystroke
  const debouncedSearch   = useDebounce(search,   350);
  const debouncedMinPrice = useDebounce(minPrice, 350);
  const debouncedMaxPrice = useDebounce(maxPrice, 350);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await searchDesigns({
        keyword:  debouncedSearch || undefined,
        category: category || undefined,
        minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
        page:     currentPage,
        size:     PAGE_SIZE,
        sortBy,
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load designs.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, debouncedMinPrice, debouncedMaxPrice, sortBy, currentPage]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Any filter change starts again from the first page
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, category, debouncedMinPrice, debouncedMaxPrice, sortBy]);

  const hasFilters = Boolean(search || category || minPrice || maxPrice);

  function clearAll() {
    setSearch(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setCurrentPage(0);
  }

  const designs    = result?.content ?? [];
  const totalPages = result?.totalPages ?? 0;
  const total      = result?.totalElements ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
            Design Catalog
          </h1>
          <p className="text-sm text-[#6B7280]">
            {loading ? "Searching…" : `${total.toLocaleString()} design${total !== 1 ? "s" : ""} from our tailors`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {/* Search + price + sort */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search designs, e.g. agbada, wedding…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F766E] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111111]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              placeholder="Min ₦"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28 px-3 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#0F766E]"
            />
            <input
              type="number"
              min={0}
              placeholder="Max ₦"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 px-3 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#0F766E]"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as NonNullable<DesignSearchParams["sortBy"]>)}
              className="px-3 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#374151] focus:outline-none focus:border-[#0F766E]"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2.5 flex-wrap mb-6">
          <FilterChip label="All" active={category === ""} onClick={() => setCategory("")} />
          {DESIGN_CATEGORIES.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>

        {/* Loading */}
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
              <p className="text-sm font-medium text-red-800">Could not load designs</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button onClick={fetchDesigns} className="mt-3 text-xs text-[#0F766E] font-medium hover:underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && designs.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[#111111] font-medium mb-1">No designs found</p>
            <p className="text-sm text-[#6B7280] mb-4">
              {hasFilters ? "Try adjusting your search or filters." : "Tailors haven't listed any designs yet."}
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="text-sm text-[#0F766E] font-medium hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Grid + pagination */}
        {!loading && !error && designs.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((d) => <DesignCard key={d.id} design={d} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  disabled={result?.first}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#374151] disabled:opacity-40 hover:border-[#0F766E]"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm text-[#6B7280]">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={result?.last}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#374151] disabled:opacity-40 hover:border-[#0F766E]"
                >
                  Next <ChevronRight className="w-4 h-4" />
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
