"use client";

/**
 * /profile/shop — Tailor Shop Profile Setup & Edit
 *
 * TAILOR-only page. Allows a tailor to:
 *  - Create their shop profile (first-time setup)
 *  - Edit shop name, location, specialization, and profile image URL
 *
 * Backend endpoints used:
 *  - GET  /api/tailors/user/{userId}  → fetch existing profile
 *  - POST /api/tailors                → create profile (first time)
 *  - PUT  /api/tailors/{id}           → update existing profile
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import {
  Scissors, MapPin, Image, Star, AlertCircle,
  CheckCircle, Loader2, ShieldCheck, Save,
} from "lucide-react";
import {
  fetchTailorByUserId,
  createTailorProfile,
  updateTailorProfile,
  TailorProfile,
} from "@/services/tailorService";
import { getUser } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

// ─── Specialization options ────────────────────────────────────────────────────
const SPECIALIZATIONS = [
  "Native Wear",
  "Senator Wear",
  "Agbada / Boubou",
  "Ankara Styles",
  "Wedding Attire",
  "Corporate Wear",
  "Children's Wear",
  "Custom Design",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  // Existing profile (null = not created yet)
  const [profile,  setProfile]  = useState<TailorProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  // Form fields
  const [shopName,        setShopName]        = useState("");
  const [location,        setLocation]        = useState("");
  const [specialization,  setSpecialization]  = useState("");
  const [profileImage,    setProfileImage]    = useState("");

  // Save state
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");
  const [success,    setSuccess]    = useState(false);

  // ─── Guard: only TAILORs can see this page ─────────────────────────────────
  useEffect(() => {
    if (authUser && authUser.role !== "TAILOR") {
      router.replace("/profile");
    }
  }, [authUser, router]);

  // ─── Load existing shop profile ────────────────────────────────────────────
  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace("/login"); return; }

    fetchTailorByUserId(user.id)
      .then((p) => {
        setProfile(p);
        setShopName(p.shopName ?? "");
        setLocation(p.location ?? "");
        setSpecialization(p.specialization ?? "");
        setProfileImage(p.profileImage ?? "");
      })
      .catch(() => {
        // 404 = no profile yet — that's fine, show creation form
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!shopName.trim())  return "Shop name is required.";
    if (!location.trim())  return "Location is required.";
    return null;
  }

  // ─── Save handler ───────────────────────────────────────────────────────────
  async function handleSave() {
    const validationError = validate();
    if (validationError) { setSaveError(validationError); return; }

    const user = getUser();
    if (!user) return;

    setSaving(true);
    setSaveError("");
    setSuccess(false);

    const payload = {
      userId:        user.id,
      shopName:      shopName.trim(),
      location:      location.trim(),
      specialization: specialization || undefined,
      profileImage:  profileImage.trim() || undefined,
    };

    try {
      let saved: TailorProfile;
      if (profile) {
        // Update existing profile
        saved = await updateTailorProfile(profile.id, payload);
      } else {
        // Create new profile
        saved = await createTailorProfile(payload);
      }
      setProfile(saved);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <AccountSidebar />

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading shop profile…</p>
              </div>
            )}

            {!loading && (
              <>
                {/* Success banner */}
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-800">
                      {profile ? "Shop profile updated!" : "Shop profile created!"} Customers can now find you.
                    </p>
                  </div>
                )}

                {/* First-time setup banner */}
                {!profile && !success && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Complete your shop setup</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Customers can&apos;t find you until you set up your shop profile.
                        Fill in the details below to go live.
                      </p>
                    </div>
                  </div>
                )}

                {/* Page header */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center flex-shrink-0">
                      <Scissors className="w-6 h-6 text-[#0F766E]" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {profile ? "Edit Shop Profile" : "Set Up Your Shop"}
                      </h1>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        This is what customers see when they browse for tailors.
                      </p>
                    </div>
                  </div>

                  {/* Verification badge */}
                  {profile && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        profile.verificationStatus === "APPROVED"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : profile.verificationStatus === "PENDING"
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : "text-gray-600 bg-gray-50 border-gray-200"
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {profile.verificationStatus === "APPROVED" ? "Verified"
                          : profile.verificationStatus === "PENDING" ? "Verification Pending"
                          : "Unverified"}
                      </span>
                      {profile.rating != null && Number(profile.rating) > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {Number(profile.rating).toFixed(1)} rating
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                  <h2 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Shop Details
                  </h2>

                  {/* Shop name */}
                  <InputField
                    label="Shop Name *"
                    value={shopName}
                    onChange={(e) => { setShopName(e.target.value); setSaveError(""); }}
                    placeholder="e.g. Mubee Classic Tailors"
                  />

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#111111]">
                      Location <span className="text-[#0F766E]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => { setLocation(e.target.value); setSaveError(""); }}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                        style={{ paddingLeft: "2.5rem" }}
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#111111]">
                      Specialization <span className="text-[#9CA3AF] text-xs font-normal">(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSpecialization(specialization === s ? "" : s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            specialization === s
                              ? "bg-[#0F766E] text-white border-[#0F766E]"
                              : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0F766E]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {specialization && (
                      <p className="text-xs text-[#6B7280]">Selected: <strong>{specialization}</strong></p>
                    )}
                  </div>

                  {/* Profile image URL */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#111111]">
                      Profile / Shop Image URL <span className="text-[#9CA3AF] text-xs font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input
                        type="url"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        placeholder="https://example.com/my-shop.jpg"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                        style={{ paddingLeft: "2.5rem" }}
                      />
                    </div>
                    {profileImage && (
                      // Preview
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImage}
                        alt="Preview"
                        className="mt-2 w-20 h-20 rounded-xl object-cover border border-[#E5E7EB]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                  </div>

                  {/* Error */}
                  {(saveError || error) && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{saveError || error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSave}
                      disabled={saving || !shopName.trim() || !location.trim()}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Save className="w-4 h-4" /> {profile ? "Save Changes" : "Create Shop Profile"}</>
                      )}
                    </Button>
                    {profile && (
                      <Button variant="ghost" size="md" onClick={() => router.push("/dashboard")}>
                        Back to Dashboard
                      </Button>
                    )}
                  </div>
                </div>

                {/* Verification CTA — only shown if profile exists and not verified */}
                {profile && profile.verificationStatus !== "APPROVED" && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                          Get Verified
                        </h3>
                        <p className="text-xs text-[#6B7280] mt-1">
                          Verified tailors get a trust badge and rank higher in search results.
                          Submit your documents for review.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/verification")}
                      >
                        Apply →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
