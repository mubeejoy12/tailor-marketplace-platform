"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import {
  Ruler, Plus, Edit3, Trash2, X, Check,
  AlertCircle, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  getMeasurementsByUser,
  saveMeasurement,
  updateMeasurement,
  deleteMeasurement,
  Measurement,
  MeasurementRequest,
} from "@/services/measurementService";
import { getUser } from "@/lib/auth";

// ─── Field definitions ─────────────────────────────────────────────────────────

const FIELDS: { key: keyof MeasurementRequest; label: string; hint: string }[] = [
  { key: "chest",         label: "Chest",          hint: "Around the fullest part of your chest" },
  { key: "shoulder",      label: "Shoulder Width",  hint: "Across the back from shoulder to shoulder" },
  { key: "sleeve",        label: "Sleeve Length",   hint: "From shoulder point to wrist" },
  { key: "neck",          label: "Neck",            hint: "Around the base of your neck" },
  { key: "waist",         label: "Waist",           hint: "Around your natural waistline" },
  { key: "hip",           label: "Hip",             hint: "Around the fullest part of your hips" },
  { key: "trouserLength", label: "Trouser Length",  hint: "From waist to ankle" },
  { key: "inseam",        label: "Inseam",          hint: "From crotch to ankle" },
];

// ─── Blank form state ──────────────────────────────────────────────────────────

function blankForm(): Record<string, string> {
  return Object.fromEntries(FIELDS.map((f) => [f.key, ""]));
}

function formToRequest(userId: number, form: Record<string, string>): MeasurementRequest {
  const req: MeasurementRequest = { userId };
  for (const f of FIELDS) {
    const v = parseFloat(form[f.key]);
    if (!isNaN(v) && v > 0) (req as Record<string, unknown>)[f.key] = v;
  }
  return req;
}

// ─── Measurement card ──────────────────────────────────────────────────────────

function MeasurementCard({
  m,
  onEdit,
  onDelete,
}: {
  m: Measurement;
  onEdit: (m: Measurement) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const date = m.updatedAt
    ? new Date(m.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : m.createdAt
    ? new Date(m.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const filled = FIELDS.filter((f) => m[f.key as keyof Measurement] != null).length;

  async function handleDelete() {
    if (!confirm("Delete this measurement set? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteMeasurement(m.id);
      onDelete(m.id);
    } catch {
      alert("Failed to delete. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center flex-shrink-0">
            <Ruler className="w-5 h-5 text-[#0F766E]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">Measurement Set #{m.id}</p>
            <p className="text-xs text-[#9CA3AF]">
              {filled} of {FIELDS.length} fields · Updated {date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(m)}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl text-[#6B7280] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
            title="Delete"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick preview — always visible, first 4 fields */}
      <div className="grid grid-cols-4 gap-px bg-[#F3F4F6] border-t border-[#F3F4F6]">
        {FIELDS.slice(0, 4).map((f) => {
          const val = m[f.key as keyof Measurement];
          return (
            <div key={f.key} className="bg-white px-4 py-3 text-center">
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">{f.label}</p>
              <p className="text-sm font-semibold text-[#111111]">
                {val != null ? `${val} cm` : <span className="text-[#D1D5DB] font-normal text-xs">—</span>}
              </p>
            </div>
          );
        })}
      </div>

      {/* Expanded — all fields */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-t border-[#F3F4F6] bg-[#FAFAF8]">
          {FIELDS.slice(4).map((f) => {
            const val = m[f.key as keyof Measurement];
            return (
              <div key={f.key} className="bg-white rounded-xl border border-[#E5E7EB] p-3 text-center">
                <p className="text-[10px] text-[#9CA3AF] mb-0.5">{f.label}</p>
                <p className="text-sm font-semibold text-[#111111]">
                  {val != null ? `${val} cm` : <span className="text-[#D1D5DB] font-normal text-xs">—</span>}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit form ───────────────────────────────────────────────────────────

function MeasurementForm({
  userId,
  editing,
  onSaved,
  onCancel,
}: {
  userId: number;
  editing: Measurement | null;
  onSaved: (m: Measurement) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    if (!editing) return blankForm();
    return Object.fromEntries(
      FIELDS.map((f) => {
        const v = editing[f.key as keyof Measurement];
        return [f.key, v != null ? String(v) : ""];
      })
    );
  });
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const update = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  async function handleSubmit() {
    setSaving(true);
    setSaveErr("");
    try {
      const req = formToRequest(userId, form);
      const result = editing
        ? await updateMeasurement(editing.id, req)
        : await saveMeasurement(req);
      onSaved(result);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : "Failed to save measurements.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#0F766E]/30 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {editing ? "Edit Measurements" : "Add New Measurements"}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Enter values in centimetres (cm)</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111111] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Upper body */}
      <div>
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">Upper Body</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.slice(0, 4).map((f) => (
            <InputField
              key={f.key}
              label={f.label}
              hint={f.hint}
              type="number"
              placeholder="e.g. 96"
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Lower body */}
      <div>
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">Lower Body</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.slice(4).map((f) => (
            <InputField
              key={f.key}
              label={f.label}
              hint={f.hint}
              type="number"
              placeholder="e.g. 80"
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="p-3 bg-[#CCFBF1]/40 rounded-xl border border-[#0F766E]/20">
        <p className="text-xs text-[#0F766E]">
          Your measurements are stored securely and only shared with tailors you choose to work with.
        </p>
      </div>

      {saveErr && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{saveErr}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save Measurements</>}
        </Button>
        <Button variant="ghost" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState<Measurement | null>(null);
  const [userId,       setUserId]       = useState<number | null>(null);
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { setError("Please log in to view your measurements."); setLoading(false); return; }
    setUserId(user.id);
    getMeasurementsByUser(user.id)
      .then(setMeasurements)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load measurements."))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(m: Measurement) {
    setMeasurements((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = m;
        return next;
      }
      return [m, ...prev];
    });
    setShowForm(false);
    setEditing(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  }

  function handleDelete(id: number) {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }

  function openEdit(m: Measurement) {
    setEditing(m);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          <AccountSidebar />

          <div className="flex-1 min-w-0 space-y-5">

            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Measurements
                </h1>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  {loading ? "Loading…" : `${measurements.length} saved set${measurements.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {!loading && !error && !showForm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setEditing(null); setShowForm(true); }}
                >
                  <Plus className="w-4 h-4" /> Add New
                </Button>
              )}
            </div>

            {/* Success banner */}
            {saveSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">Measurements saved successfully.</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading measurements…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Add / Edit form */}
            {!loading && !error && showForm && userId != null && (
              <MeasurementForm
                userId={userId}
                editing={editing}
                onSaved={handleSaved}
                onCancel={handleCancel}
              />
            )}

            {/* Empty state */}
            {!loading && !error && measurements.length === 0 && !showForm && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center">
                <div className="w-14 h-14 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="w-7 h-7 text-[#0F766E]" />
                </div>
                <p className="font-medium text-[#111111] mb-1">No measurements saved</p>
                <p className="text-sm text-[#6B7280] mb-5">
                  Add your body measurements so tailors can create a perfect fit.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => { setEditing(null); setShowForm(true); }}
                >
                  <Plus className="w-4 h-4" /> Add Measurements
                </Button>
              </div>
            )}

            {/* Measurement cards */}
            {!loading && !error && measurements.length > 0 && (
              <div className="space-y-4">
                {measurements.map((m) => (
                  <MeasurementCard
                    key={m.id}
                    m={m}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
