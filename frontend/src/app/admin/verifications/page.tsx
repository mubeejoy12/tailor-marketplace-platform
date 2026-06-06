"use client";

/**
 * /admin/verifications — Admin Verification Review Page
 *
 * Allows ADMIN to:
 *  - View all verification requests (ALL / PENDING / APPROVED / REJECTED tabs)
 *  - Approve a PENDING request (with optional note)
 *  - Reject a PENDING request (with required reason)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck, ShieldX, Clock, FileText, Camera,
  CreditCard, CheckCircle, AlertCircle, Loader2,
  ExternalLink, User, MapPin, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  getAllVerifications,
  approveVerification,
  rejectVerification,
  VerificationRequestResponse,
} from "@/services/verificationService";
import { useAuth } from "@/context/AuthContext";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:  { label: "Pending",  cls: "text-amber-700 bg-amber-50 border-amber-200" },
    APPROVED: { label: "Approved", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    REJECTED: { label: "Rejected", cls: "text-red-600 bg-red-50 border-red-200" },
  };
  const m = map[status] ?? { label: status, cls: "text-gray-600 bg-gray-50 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

// ─── Verification request card ────────────────────────────────────────────────

function VerificationCard({
  req,
  onApprove,
  onReject,
}: {
  req: VerificationRequestResponse;
  onApprove: (id: number, note: string) => Promise<void>;
  onReject:  (id: number, note: string) => Promise<void>;
}) {
  const [expanded,  setExpanded]  = useState(false);
  const [note,      setNote]      = useState("");
  const [acting,    setActing]    = useState<"approve" | "reject" | null>(null);
  const [actionErr, setActionErr] = useState("");

  const isPending = req.status === "PENDING";

  async function handleApprove() {
    setActing("approve");
    setActionErr("");
    try { await onApprove(req.id, note); }
    catch (e: unknown) { setActionErr(e instanceof Error ? e.message : "Failed."); }
    finally { setActing(null); }
  }

  async function handleReject() {
    if (!note.trim()) { setActionErr("Please provide a reason for rejection."); return; }
    setActing("reject");
    setActionErr("");
    try { await onReject(req.id, note); }
    catch (e: unknown) { setActionErr(e instanceof Error ? e.message : "Failed."); }
    finally { setActing(null); }
  }

  return (
    <div className={`bg-white rounded-2xl border transition-colors ${
      isPending ? "border-amber-200 shadow-sm" : "border-[#E5E7EB]"
    }`}>
      {/* Card header */}
      <div
        className="flex items-start justify-between gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#0F766E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111111] truncate">
              {req.tailorShopName ?? `Tailor #${req.tailorId}`}
            </p>
            {req.tailorLocation && (
              <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{req.tailorLocation}
              </p>
            )}
            <p className="text-xs text-[#9CA3AF] mt-1">
              Submitted {new Date(req.submittedAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={req.status} />
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
            : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
          }
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#F3F4F6] pt-4">

          {/* Submitted documents */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DocLink
              icon={CreditCard}
              label="National ID"
              value={req.nationalIdNumber}
              subValue="ID Number"
            />
            <DocLink
              icon={FileText}
              label="ID Document"
              value={req.idDocumentUrl}
              isUrl
            />
            {req.selfieUrl && (
              <DocLink
                icon={Camera}
                label="Selfie with ID"
                value={req.selfieUrl}
                isUrl
              />
            )}
          </div>

          {/* Existing review note (for non-pending) */}
          {!isPending && req.reviewNote && (
            <div className={`p-3 rounded-xl border text-sm ${
              req.status === "APPROVED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <p className="text-xs font-semibold mb-1">Admin note:</p>
              <p>{req.reviewNote}</p>
            </div>
          )}

          {/* Action area — only for PENDING */}
          {isPending && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Note to tailor <span className="text-[#9CA3AF] font-normal">(required for rejection, optional for approval)</span>
                </label>
                <textarea
                  className="w-full text-sm border border-[#E5E7EB] rounded-xl p-3 text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] resize-none transition-colors"
                  rows={2}
                  placeholder="e.g. Documents verified successfully / Please resubmit a clearer image of your ID"
                  value={note}
                  onChange={(e) => { setNote(e.target.value); setActionErr(""); }}
                />
              </div>

              {actionErr && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-700">{actionErr}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={acting !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {acting === "approve"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><CheckCircle className="w-4 h-4" /> Approve</>
                  }
                </button>
                <button
                  onClick={handleReject}
                  disabled={acting !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {acting === "reject"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><ShieldX className="w-4 h-4" /> Reject</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DocLink helper ───────────────────────────────────────────────────────────

function DocLink({
  icon: Icon, label, value, subValue, isUrl = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  isUrl?: boolean;
}) {
  return (
    <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-[#9CA3AF]" />
        <p className="text-xs text-[#9CA3AF] font-medium">{label}</p>
      </div>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#0F766E] font-medium hover:underline flex items-center gap-1 break-all"
        >
          View document <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      ) : (
        <p className="text-xs font-semibold text-[#111111]">{value}</p>
      )}
      {subValue && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{subValue}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabKey = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export default function AdminVerificationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [requests,  setRequests]  = useState<VerificationRequestResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("PENDING");

  // Guard: ADMIN only
  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/");
  }, [user, router]);

  useEffect(() => {
    getAllVerifications()
      .then(setRequests)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load verifications."))
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: number, note: string) {
    const updated = await approveVerification(id, { note: note || undefined });
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  async function handleReject(id: number, note: string) {
    const updated = await rejectVerification(id, { note });
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  const filtered = activeTab === "ALL"
    ? requests
    : requests.filter((r) => r.status === activeTab);

  const counts = {
    ALL:      requests.length,
    PENDING:  requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#0F766E]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Verification Requests
              </h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Review identity documents and approve or reject tailor verifications
              </p>
            </div>
          </div>

          {/* Summary chips */}
          {!loading && !error && (
            <div className="flex gap-3 mt-6 flex-wrap">
              {[
                { label: "Total",    count: counts.ALL,      color: "bg-[#F3F4F6] text-[#6B7280]" },
                { label: "Pending",  count: counts.PENDING,  color: "bg-amber-50 text-amber-700 border border-amber-200" },
                { label: "Approved", count: counts.APPROVED, color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { label: "Rejected", count: counts.REJECTED, color: "bg-red-50 text-red-600 border border-red-200" },
              ].map(({ label, count, color }) => (
                <div key={label} className={`px-4 py-2 rounded-xl text-sm font-semibold ${color}`}>
                  {count} {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-6 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111111]"
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? "bg-[#0F766E]/10 text-[#0F766E]" : "bg-[#E5E7EB] text-[#6B7280]"
                }`}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
            <p className="text-sm text-[#6B7280]">Loading verification requests…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center">
            <div className="w-14 h-14 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[#0F766E]" />
            </div>
            <p className="font-medium text-[#111111] mb-1">
              {activeTab === "PENDING" ? "No pending requests" : `No ${activeTab.toLowerCase()} requests`}
            </p>
            <p className="text-sm text-[#6B7280]">
              {activeTab === "PENDING"
                ? "All requests have been reviewed."
                : "Nothing to show here."}
            </p>
          </div>
        )}

        {/* Request cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((req) => (
              <VerificationCard
                key={req.id}
                req={req}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
