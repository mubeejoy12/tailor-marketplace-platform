"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { Check, MapPin, Star, Clock, ChevronRight, Package } from "lucide-react";

const TAILOR = {
  shopName: "Mubee Classic Tailors",
  specialization: "Native Wear",
  location: "Lagos, Nigeria",
  rating: 4.9,
  deliveryDays: 5,
};

const FABRICS = [
  { id: "ankara", label: "Ankara", desc: "Vibrant printed cotton fabric" },
  { id: "lace", label: "Lace", desc: "Elegant and intricate lace material" },
  { id: "aso-oke", label: "Aso-Oke", desc: "Traditional handwoven Yoruba fabric" },
  { id: "velvet", label: "Velvet", desc: "Luxurious soft velvet material" },
  { id: "own", label: "I Have My Own Fabric", desc: "Customer-supplied material" },
];

const DESIGNS = ["Agbada (3-piece)", "Senator Suit", "Dashiki", "Kaftan", "Boubou", "Custom Design"];

const MEASUREMENT_SETS = [
  { id: 1, label: "Daily Wear Set", date: "March 28, 2026" },
  { id: 2, label: "Suit Measurements", date: "February 14, 2026" },
];

export default function PlaceOrderPage() {
  const [selectedFabric, setSelectedFabric] = useState("ankara");
  const [selectedDesign, setSelectedDesign] = useState("Agbada (3-piece)");
  const [selectedMeasurement, setSelectedMeasurement] = useState(1);
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#0F766E]" />
            </div>
            <h2 className="text-2xl font-bold text-[#111111] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Order Placed!</h2>
            <p className="text-sm text-[#6B7280] mb-2">Your order has been sent to <span className="font-semibold text-[#111111]">{TAILOR.shopName}</span>.</p>
            <p className="text-sm text-[#6B7280] mb-8">You will receive a confirmation within 24 hours. Expected delivery in <strong>{TAILOR.deliveryDays} days</strong>.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="md">View Orders</Button>
              <Button variant="primary" size="md">Browse More Tailors</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Place Your Order</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Review and confirm your custom clothing order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Order details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tailor summary */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-semibold text-[#111111] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Selected Tailor</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-sm font-bold text-[#0F766E]">MC</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#111111]">{TAILOR.shopName}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{TAILOR.rating}</span>
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]"><MapPin className="w-3.5 h-3.5" />{TAILOR.location}</span>
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]"><Clock className="w-3.5 h-3.5" />{TAILOR.deliveryDays} days</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full">{TAILOR.specialization}</span>
              </div>
            </div>

            {/* Design selection */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-semibold text-[#111111] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Select Design</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DESIGNS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDesign(d)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                      selectedDesign === d
                        ? "bg-[#0F766E] text-white border-[#0F766E]"
                        : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0F766E]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-semibold text-[#111111] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Fabric Choice</h2>
              <div className="space-y-2">
                {FABRICS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFabric(f.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      selectedFabric === f.id
                        ? "border-[#0F766E] bg-[#CCFBF1]/20"
                        : "border-[#E5E7EB] hover:border-[#0F766E]/50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedFabric === f.id ? "border-[#0F766E] bg-[#0F766E]" : "border-[#D1D5DB]"
                    }`}>
                      {selectedFabric === f.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111111]">{f.label}</p>
                      <p className="text-xs text-[#6B7280]">{f.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Measurement */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-semibold text-[#111111] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Measurements</h2>
              <div className="space-y-2">
                {MEASUREMENT_SETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMeasurement(m.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      selectedMeasurement === m.id
                        ? "border-[#0F766E] bg-[#CCFBF1]/20"
                        : "border-[#E5E7EB] hover:border-[#0F766E]/50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedMeasurement === m.id ? "border-[#0F766E] bg-[#0F766E]" : "border-[#D1D5DB]"
                    }`}>
                      {selectedMeasurement === m.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111111]">{m.label}</p>
                      <p className="text-xs text-[#6B7280]">Saved {m.date}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery & notes */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-5">
              <h2 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Delivery & Notes</h2>
              <InputField
                label="Preferred Delivery Date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                hint="Your tailor will confirm if this date is achievable"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#111111]">Additional Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Collar style preference, colour of embroidery, special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sticky top-24">
              <h2 className="text-sm font-semibold text-[#111111] mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>Order Summary</h2>

              <div className="space-y-3 mb-5">
                {[
                  { label: "Tailor", value: TAILOR.shopName },
                  { label: "Design", value: selectedDesign },
                  { label: "Fabric", value: FABRICS.find((f) => f.id === selectedFabric)?.label ?? "" },
                  { label: "Measurements", value: MEASUREMENT_SETS.find((m) => m.id === selectedMeasurement)?.label ?? "" },
                  { label: "Est. Delivery", value: `${TAILOR.deliveryDays} days` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-[#6B7280]">{label}</span>
                    <span className="text-xs font-medium text-[#111111] text-right max-w-[150px]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E5E7EB] pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#111111]">Starting Price</span>
                  <span className="text-lg font-bold text-[#0F766E]" style={{ fontFamily: "Poppins, sans-serif" }}>₦20,000</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Final price confirmed after tailor review</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setOrdered(true)}
              >
                <Package className="w-4 h-4" /> Place Order <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-[#6B7280] text-center mt-3">No payment taken until tailor confirms</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
