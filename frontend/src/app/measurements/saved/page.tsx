"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { Ruler, Edit2, Trash2, RefreshCw, Plus, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const SAVED_MEASUREMENTS = [
  {
    id: 1,
    label: "Daily Wear Set",
    date: "March 28, 2026",
    measurements: { chest: 96, shoulder: 44, sleeve: 64, neck: 38, waist: 80, hip: 98, trouserLength: 106, inseam: 78 },
  },
  {
    id: 2,
    label: "Suit Measurements",
    date: "February 14, 2026",
    measurements: { chest: 98, shoulder: 45, sleeve: 65, neck: 39, waist: 82, hip: 100, trouserLength: 108, inseam: 79 },
  },
  {
    id: 3,
    label: "Wedding Agbada",
    date: "January 5, 2026",
    measurements: { chest: 100, shoulder: 46, sleeve: 66, neck: 40, waist: 84, hip: 102, trouserLength: 110, inseam: 80 },
  },
];

const FIELD_LABELS: Record<string, string> = {
  chest: "Chest", shoulder: "Shoulder", sleeve: "Sleeve", neck: "Neck",
  waist: "Waist", hip: "Hip", trouserLength: "Trouser Length", inseam: "Inseam",
};

export default function SavedMeasurementsPage() {
  const [expanded, setExpanded] = useState<number | null>(1);
  const [items, setItems] = useState(SAVED_MEASUREMENTS);

  const deleteItem = (id: number) => setItems((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Saved Measurements</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{items.length} measurement set{items.length !== 1 ? "s" : ""} saved</p>
          </div>
          <Link href="/measurements">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add New
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
            <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-7 h-7 text-[#9CA3AF]" />
            </div>
            <p className="text-sm font-medium text-[#111111] mb-2">No saved measurements yet</p>
            <p className="text-sm text-[#6B7280] mb-6">Add your body measurements to get started placing orders</p>
            <Link href="/measurements">
              <Button variant="primary" size="md">Add Measurements</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#0F766E]/30 transition-colors">
                {/* Card header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0F766E]/10 rounded-xl flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-[#0F766E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{item.label}</p>
                      <p className="text-xs text-[#6B7280]">Saved {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 text-[#6B7280] hover:text-[#0F766E] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expanded === item.id
                      ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                      : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                    }
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === item.id && (
                  <div className="border-t border-[#E5E7EB] p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {Object.entries(item.measurements).map(([key, val]) => (
                        <div key={key} className="bg-[#FAFAF8] rounded-xl p-3 border border-[#E5E7EB]">
                          <p className="text-xs text-[#6B7280] mb-1">{FIELD_LABELS[key] ?? key}</p>
                          <p className="text-sm font-semibold text-[#111111]">{val} cm</p>
                        </div>
                      ))}
                    </div>
                    <Link href={`/tailors?measurementId=${item.id}`}>
                      <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" /> Use for Order
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
