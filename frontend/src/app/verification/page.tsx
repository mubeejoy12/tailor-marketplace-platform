"use client";

/**
 * /verification — Tailor Identity Verification Page
 *
 * Allows a TAILOR to submit identity documents for admin review.
 * Shows current status and handles all lifecycle states:
 *   UNVERIFIED → form to submit
 *   PENDING    → waiting state
 *   APPROVED   → verified celebration
 *   REJECTED   → reason + ability to resubmit
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import {
  ShieldCheck, ShieldX, Clock, FileText, Camera,
  CreditCard, CheckCircle, AlertCircle, Loader2,
  Send, Star, Award, Zap,
} from "lucide-react";
import {
  submitVerificationRequest,
  getLatestVerificationRequest,
  VerificationRequestResponse,
} from "@/services/verificationService";
import { fetchTailorByUserId, TailorProfile } from "@/services/tailorService";
import { getUser } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

// ─── Status display map ───────────────────────────────────────────────────────

const STATUS_META = {
  UNVERIFIED: {
    label: "Not submitted",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    icon: FileText,
  },
  PENDING: {
    label: "Under review",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Verified ✓",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    icon: ShieldCheck,
  },
  REJECTED: {
    label: "Not approved",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: ShieldX,
  },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as keyof typeof STATUS_META] ?? STATUS_META.UNVERIFIED;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${meta.color}`}>
      <Icon className="w-3.5 h-3.5" /> {meta.label}
    </span>
  );
}

// ─── Premium eligibility bar ──────────────────────────────────────────────────

function PremiumBar({ tailor }: { tailor: TailorProfile }) {
  const criteria = [
    { label: "Verified identity",       met: tailor.verificationStatus === "APPROVED" },
    { label: "20+ completed orders",    met: (tailor.completedOrders ?? 0) >= 20 },
    { label: "4.5+ average rating",     met: Number(tailor.rating ?? 0) >= 4.5 },
  ];
  const metCount = criteria.filter((c) => c.met).length;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Premium Status
          </h3>
          <p className="text-xs text-[#6B7280]">{metCount}/3 criteria met</p>
        </div>
        {tailor.premium && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" /> PREMIUM
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {criteria.map(({ label, met }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              met ? "bg-[#0F766E] text-white" : "bg-[#F3F4F6] text-[#D1D5DB]"
            }`}>
              <CheckCircle className="w-3 h-3" />
            </div>
            <span className={`text-sm ${met ? "text-[#111111] font-medium" : "text-[#9CA3AF]"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
        <div className="flex justify-between text-xs text-[#9CA3AF] mb-1.5">
          <span>Progress to Premium</span>
          <span>{metCount}/3</span>
        </div>
        <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
            style={{ width: `${(metCount / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerificationPage() {
  const router    = useRouter();
  const { user: authUser } = useAuth();

  const [tailor,       setTailor]       = useState<TailorProfile | null>(null);
  const [latestReq,    setLatestReq]    = useState<VerificationRequestResponse | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  // Form state
  const [nationalId,   setNationalId]   = useState("");
  const [idDocUrl,     setIdDocUrl]     = useState("");
  const [selfieUrl,    setSelfieUrl]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitErr,    setSubmitErr]    = useState("");
  const [success,      setSuccess]      = useState(false);

  // Guard: only TAILORs
  useEffect(() => {
    if (authUser && authUser.role !== "TAILOR") router.replace("/profile");
  }, [authUser, router]);

  useEffect(() => {
    const user = getUser();
    if (!user) { setError("Please log in."); setLoading(false); return; }

    fetchTailorByUserId(user.id)
      .then(async (profile) => {
        setTailor(profile);
        // Try to load latest verification request
        try {
          const req = await getLatestVerificationRequest(profile.id);
          setLatestReq(req);
        } catch {
          // No request yet — fine
        }
      })
      .catch(() => setError("Could not load your tailor profile. Please set up your shop profile first."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!tailor) return;
    if (!nationalId.trim()) { setSubmitErr("National ID number is required."); return; }
    if (!idDocUrl.trim())   { setSubmitErr("ID document URL is required."); return; }

    setSubmitting(true);
    setSubmitErr("");
    try {
      const result = await submitVerificationRequest({
        tailorId:        tailor.id,
        nationalIdNumber: nationalId.trim(),
        idDocumentUrl:   idDocUrl.trim(),
        selfieUrl:       selfieUrl.trim() || undefined,
      });
      setLatestReq(result);
      setTailor((prev) => prev ? { ...prev, verificationStatus: "PENDING" } : prev);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: unknown) {
      setSubmitErr(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const status     = latestReq?.status ?? tailor?.verificationStatus ?? "UNVERIFIED";
  const isApproved = status === "APPROVED";
  const isPending  = status === "PENDING";
  const isRejected = status === "REJECTED";
  const canSubmit  = !isPending && !isApproved;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          <AccountSidebar />

          <div className="flex-1 min-w-0 space-y-5">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Tailor Verification
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Verify your identity to earn a trust badge and unlock Premium features.
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading your profile…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  <button
                    onClick={() => router.push("/profile/shop")}
                    className="mt-2 text-xs text-[#0F766E] font-medium hover:underline"
                  >
                    Set up shop profile →
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && tailor && (
              <>
                {/* Success banner */}
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Verification request submitted!</p>
                      <p className="text-xs text-green-700 mt-0.5">Our team will review within 24–48 hours.</p>
                    </div>
                  </div>
                )}

                {/* ── APPROVED state ── */}
                {isApproved && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-emerald-800 mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}>
                      You&apos;re Verified!
                    </h2>
                    <p className="text-sm text-emerald-700 mb-4">
                      Your profile now shows a verified badge. Customers can trust your shop.
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-300 px-3 py-1.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Tailor
                      </span>
                      {tailor.premium && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-white border border-amber-300 px-3 py-1.5 rounded-full">
                          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Premium Member
                        </span>
                      )}
                    </div>
                    {latestReq?.reviewNote && (
                      <p className="mt-4 text-xs text-emerald-600 italic">
                        Admin note: {latestReq.reviewNote}
                      </p>
                    )}
                  </div>
                )}

                {/* ── PENDING state ── */}
                {isPending && (
                  <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[#111111] mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}>
                      Request Under Review
                    </h2>
                    <p className="text-sm text-[#6B7280]">
                      Our team typically responds within 24–48 hours. You&apos;ll receive a
                      notification once a decision is made.
                    </p>
                    {latestReq?.submittedAt && (
                      <p className="mt-3 text-xs text-[#9CA3AF]">
                        Submitted {new Date(latestReq.submittedAt).toLocaleDateString("en-NG", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                )}

                {/* ── REJECTED state — show reason ── */}
                {isRejected && latestReq?.reviewNote && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <ShieldX className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Request not approved</p>
                        <p className="text-sm text-red-700 mt-1">{latestReq.reviewNote}</p>
                        <p className="text-xs text-red-600 mt-2">
                          You may resubmit below after addressing the issue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Current status card ── */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-2 uppercase tracking-wide font-medium">
                        Verification Status
                      </p>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#111111]">{tailor.completedOrders ?? 0}</p>
                        <p className="text-xs">Orders done</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#111111]">{tailor.totalReviews ?? 0}</p>
                        <p className="text-xs">Reviews</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#111111] flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {Number(tailor.rating ?? 0).toFixed(1)}
                        </p>
                        <p className="text-xs">Rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium eligibility bar */}
                <PremiumBar tailor={tailor} />

                {/* Why verify — shown only when not approved */}
                {!isApproved && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="text-sm font-semibold text-[#111111] mb-4"
                      style={{ fontFamily: "Poppins, sans-serif" }}>
                      Benefits of Verification
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: ShieldCheck, text: "Verified badge on your profile and tailor cards" },
                        { icon: Star,        text: "Higher visibility in customer searches" },
                        { icon: Award,       text: "Eligible for Premium status" },
                        { icon: Zap,         text: "Priority listing in recommendations" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                          <Icon className="w-4 h-4 text-[#0F766E] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#374151]">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Submission form ── */}
                {canSubmit && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                    <div>
                      <h2 className="text-sm font-semibold text-[#111111]"
                        style={{ fontFamily: "Poppins, sans-serif" }}>
                        {isRejected ? "Resubmit Verification Request" : "Submit Verification Request"}
                      </h2>
                      <p className="text-xs text-[#6B7280] mt-1">
                        All information is reviewed only by our admin team and kept confidential.
                      </p>
                    </div>

                    {/* National ID number */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#111111]">
                        <CreditCard className="w-3.5 h-3.5 inline mr-1.5 text-[#9CA3AF]" />
                        National ID Number <span className="text-[#0F766E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={nationalId}
                        onChange={(e) => { setNationalId(e.target.value); setSubmitErr(""); }}
                        placeholder="e.g. NIN-12345678901"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 px-4 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                      />
                    </div>

                    {/* ID document URL */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#111111]">
                        <FileText className="w-3.5 h-3.5 inline mr-1.5 text-[#9CA3AF]" />
                        ID Document URL <span className="text-[#0F766E]">*</span>
                      </label>
                      <input
                        type="url"
                        value={idDocUrl}
                        onChange={(e) => { setIdDocUrl(e.target.value); setSubmitErr(""); }}
                        placeholder="https://drive.google.com/your-id-document"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 px-4 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                      />
                      <p className="text-xs text-[#9CA3AF]">
                        Upload your NIN slip, driver&apos;s licence, or international passport to Google Drive / Dropbox and paste the public link.
                      </p>
                    </div>

                    {/* Selfie URL */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#111111]">
                        <Camera className="w-3.5 h-3.5 inline mr-1.5 text-[#9CA3AF]" />
                        Selfie with ID <span className="text-[#9CA3AF] font-normal text-xs">(optional but recommended)</span>
                      </label>
                      <input
                        type="url"
                        value={selfieUrl}
                        onChange={(e) => setSelfieUrl(e.target.value)}
                        placeholder="https://drive.google.com/your-selfie-with-id"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 px-4 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                      />
                      <p className="text-xs text-[#9CA3AF]">
                        A clear photo of you holding your ID helps speed up verification.
                      </p>
                    </div>

                    {/* Privacy note */}
                    <div className="p-3 bg-[#CCFBF1]/40 border border-[#0F766E]/20 rounded-xl flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#0F766E]">
                        Your documents are only used for identity verification and are never shared with customers.
                      </p>
                    </div>

                    {/* Error */}
                    {submitErr && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">{submitErr}</p>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmit}
                      disabled={submitting || !nationalId.trim() || !idDocUrl.trim()}
                    >
                      {submitting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><Send className="w-4 h-4" /> {isRejected ? "Resubmit for Review" : "Submit for Verification"}</>
                      }
                    </Button>
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
