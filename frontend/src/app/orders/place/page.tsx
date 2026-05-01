"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { Check, MapPin, Star, Clock, ChevronRight, Package, Loader2, AlertCircle } from "lucide-react";
import { fetchTailorById, TailorProfile } from "@/services/tailorService";
import { placeOrder } from "@/services/orderService";
import { getUser } from "@/lib/auth";

const FABRICS = [
  { id: "ankara",  label: "Ankara",                desc: "Vibrant printed cotton fabric" },
  { id: "lace",    label: "Lace",                  desc: "Elegant and intricate lace material" },
  { id: "aso-oke", label: "Aso-Oke",               desc: "Traditional handwoven Yoruba fabric" },
  { id: "velvet",  label: "Velvet",                desc: "Luxurious soft velvet material" },
  { id: "own",     label: "I Have My Own Fabric",  desc: "Customer-supplied material" },
];

const DESIGNS = ["Agbada (3-piece)", "Senator Suit", "Dashiki", "Kaftan", "Boubou", "Custom Design"];

export default function PlaceOrderPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);

  const [tailor, setTailor]                 = useState<TailorProfile | null>(null);
  const [tailorLoading, setTailorLoading]   = useState(true);
  const [tailorError, setTailorError]       = useState("");

  const [selectedFabric, setSelectedFabric]   = useState("ankara");
  const [selectedDesign, setSelectedDesign]   = useState("Agbada (3-piece)");
  const [deliveryDate, setDeliveryDate]       = useState("");
  const [notes, setNotes]                     = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("tailorId");
    setTailorId(id);
  }, []);

  useEffect(() => {
    if (tailorId === null) return;
    if (!tailorId) { setTailorError("No tailor selected."); setTailorLoading(false); return; }
    fetchTailorById(tailorId)
      .then(setTailor)
      .catch((e: unknown) => setTailorError(e instanceof Error ? e.message : "Could not load tailor."))
      .finally(() => setTailorLoading(false));
  }, [tailorId]);

  async function handleSubmit() {
    if (!tailor) return;
    const user = getUser();
    if (!user) { router.push("/login?redirect=/orders/place"); return; }

    setSubmitting(true);
    setSubmitError("");
    try {
      const order = await placeOrder({
        userId:      Number(user.id),
        tailorId:    tailor.id,
        styleChoice: selectedDesign,
        fabricChoice: FABRICS.find((f) => f.id === selectedFabric)?.label ?? selectedFabric,
        deliveryDate: deliveryDate || null,
      });
      router.push(`/orders/success?orderId=${order.id}`);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to place order. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Place Your Order</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Review and confirm your custom clothing order</p>
        </div>

        {tailorLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
          </div>
        )}

        {!tailorLoading && tailorError && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Could not load tailor</p>
              <p className="text-xs text-red-600 mt-1">{tailorError}</p>
            </div>
          </div>
        )}

        {!tailorLoading && !tailorError && tailor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Order details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tailor summary */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                <h2 className="text-sm font-semibold text-[#111111] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Selected Tailor</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-sm font-bold text-[#0F766E]">
                    {tailor.shopName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#111111]">{tailor.shopName}</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(tailor.rating).toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <MapPin className="w-3.5 h-3.5" />{tailor.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <Clock className="w-3.5 h-3.5" />Custom timeline
                      </span>
                    </div>
                  </div>
                  {tailor.specialization && (
                    <span className="text-xs font-medium text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full">{tailor.specialization}</span>
                  )}
                </div>
              </div>

              {/* Design */}
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
                    { label: "Tailor",   value: tailor.shopName },
                    { label: "Design",   value: selectedDesign },
                    { label: "Fabric",   value: FABRICS.find((f) => f.id === selectedFabric)?.label ?? "" },
                    { label: "Delivery", value: deliveryDate || "TBD" },
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

                {submitError && (
                  <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{submitError}</p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Package className="w-4 h-4" /> Place Order <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#6B7280] text-center mt-3">No payment taken until tailor confirms</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
