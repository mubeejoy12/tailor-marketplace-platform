"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import {
  ShieldCheck, ShieldX, Clock, FileText, Image,
  CheckCircle, AlertCircle, Loader2, Send,
} from "lucide-react";
import { getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface TailorProfileData {
  id: number;
  verificationStatus: string;
  verificationNote: string | null;
  portfolioUrls: string | null;
  shopDocumentUrl: string | null;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    UNVERIFIED: { label: "Not submitted",    color: "text-gray-600 bg-gray-50 border-gray-200",     icon: FileText     },
    PENDING:    { label: "Under review",     color: "text-amber-600 bg-amber-50 border-amber-200",  icon: Clock        },
    APPROVED:   { label: "Verified",         color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: ShieldCheck },
    REJECTED:   { label: "Not approved",     color: "text-red-600 bg-red-50 border-red-200",        icon: ShieldX      },
  };
  const meta = map[status] ?? map.UNVERIFIED;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${meta.color}`}>
      <Icon className="w-3.5 h-3.5" /> {meta.label}
    </span>
  );
}

export default function VerificationPage() {
  const [profile,      setProfile]      = useState<TailorProfileData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [portfolioUrls,setPortfolioUrls]= useState("");
  const [docUrl,       setDocUrl]       = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitErr,    setSubmitErr]    = useState("");
  const [success,      setSuccess]      = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { setError("Please log in."); setLoading(false); return; }

    // Get tailor profile by user ID
    fetch(`${API_BASE}/api/tailors/user/${user.id}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: TailorProfileData) => {
        setProfile(data);
        setPortfolioUrls(data.portfolioUrls ?? "");
        setDocUrl(data.shopDocumentUrl ?? "");
      })
      .catch(() => setError("Could not load your tailor profile."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!profile) return;
    setSubmitting(true);
    setSubmitErr("");
    try {
      const res = await fetch(`${API_BASE}/api/tailors/${profile.id}/verification`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ portfolioUrls: portfolioUrls.trim(), shopDocumentUrl: docUrl.trim() }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = `Error (${res.status})`;
        try { const j = JSON.parse(text); msg = j.message || j.error || text || msg; } catch { msg = text || msg; }
        throw new Error(msg);
      }
      const updated = await res.json() as TailorProfileData;
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: unknown) {
      setSubmitErr(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const isApproved = profile?.verificationStatus === "APPROVED";
  const isPending  = profile?.verificationStatus === "PENDING";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          <AccountSidebar />

          <div className="flex-1 min-w-0 space-y-5">

            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Tailor Verification
              </h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Get verified to earn a badge and build customer trust.
              </p>
            </div>

            {loading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading profile…</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && profile && (
              <>
                {/* Success */}
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-800">
                      Verification request submitted. Our team will review within 24–48 hours.
                    </p>
                  </div>
                )}

                {/* Current status */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-sm font-semibold text-[#111111] mb-1"
                        style={{ fontFamily: "Poppins, sans-serif" }}>
                        Verification Status
                      </h2>
                      <StatusBadge status={profile.verificationStatus} />
                    </div>
                    {isApproved && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                        <ShieldCheck className="w-5 h-5" />
                        Your profile shows a verified badge
                      </div>
                    )}
                  </div>

                  {profile.verificationNote && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700 font-medium">Admin note:</p>
                      <p className="text-sm text-amber-800 mt-0.5">{profile.verificationNote}</p>
                    </div>
                  )}
                </div>

                {/* Why verify */}
                {!isApproved && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="text-sm font-semibold text-[#111111] mb-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}>
                      Why get verified?
                    </h2>
                    <ul className="space-y-2">
                      {[
                        "Verified badge displayed on your profile and tailor cards",
                        "Increased trust — customers prefer verified tailors",
                        "Higher visibility in search results",
                        "Unlock premium platform features",
                      ].map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm text-[#6B7280]">
                          <CheckCircle className="w-4 h-4 text-[#0F766E] flex-shrink-0 mt-0.5" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submission form — only for UNVERIFIED or REJECTED */}
                {!isApproved && !isPending && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                    <h2 className="text-sm font-semibold text-[#111111]"
                      style={{ fontFamily: "Poppins, sans-serif" }}>
                      Submit Verification Request
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#374151] mb-1.5">
                          <Image className="w-3.5 h-3.5 inline mr-1" />
                          Portfolio Image URLs
                        </label>
                        <textarea
                          className="w-full text-sm border border-[#E5E7EB] rounded-xl p-3 text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] resize-none transition-colors"
                          rows={3}
                          placeholder="Enter portfolio image URLs, separated by commas&#10;e.g. https://example.com/work1.jpg, https://example.com/work2.jpg"
                          value={portfolioUrls}
                          onChange={(e) => setPortfolioUrls(e.target.value)}
                        />
                        <p className="text-xs text-[#9CA3AF] mt-1">Show your best work — at least 3 images recommended</p>
                      </div>

                      <InputField
                        label="Shop / Trade Document URL"
                        placeholder="Link to your business certificate or ID document"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                      />
                      <div className="p-3 bg-[#CCFBF1]/40 border border-[#0F766E]/20 rounded-xl">
                        <p className="text-xs text-[#0F766E]">
                          <FileText className="w-3.5 h-3.5 inline mr-1" />
                          Upload documents to a cloud service (Google Drive, Dropbox) and paste the public link here.
                          Documents are reviewed only by our admin team.
                        </p>
                      </div>
                    </div>

                    {submitErr && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-700">{submitErr}</p>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmit}
                      disabled={submitting || (!portfolioUrls.trim() && !docUrl.trim())}
                    >
                      {submitting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><Send className="w-4 h-4" /> Submit for Review</>
                      }
                    </Button>
                  </div>
                )}

                {/* Pending state */}
                {isPending && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 text-center">
                    <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <p className="font-medium text-[#111111] mb-1">Request under review</p>
                    <p className="text-sm text-[#6B7280]">
                      Our team typically responds within 24–48 hours. You will receive a notification once reviewed.
                    </p>
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
