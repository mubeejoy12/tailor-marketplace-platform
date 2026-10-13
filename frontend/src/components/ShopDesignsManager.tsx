"use client";

/**
 * Tailor-side catalog management, shown on /profile/shop once the shop exists.
 * Lists the tailor's designs and lets them add, edit, or remove one.
 */

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Modal from "@/components/ui/Modal";
import ImageUpload from "@/components/ui/ImageUpload";
import { AlertCircle, Loader2, Pencil, Plus, Shirt, Trash2 } from "lucide-react";
import {
  getDesignsByTailor,
  createDesign,
  updateDesign,
  deleteDesign,
  formatNaira,
  DESIGN_CATEGORIES,
  Design,
} from "@/services/designService";
import { optimizedImage } from "@/lib/cloudinary";

interface ShopDesignsManagerProps {
  tailorId: number;
}

const EMPTY_FORM = { title: "", description: "", price: "", category: DESIGN_CATEGORIES[0], imageUrl: "" };

export default function ShopDesignsManager({ tailorId }: ShopDesignsManagerProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Modal / form state — editing === null means "create"
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<Design | null>(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getDesignsByTailor(tailorId)
      .then(setDesigns)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load your designs."))
      .finally(() => setLoading(false));
  }, [tailorId]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(design: Design) {
    setEditing(design);
    setForm({
      title:       design.title,
      description: design.description ?? "",
      price:       String(design.price),
      category:    design.category,
      imageUrl:    design.imageUrl ?? "",
    });
    setFormError("");
    setModalOpen(true);
  }

  function validate(): string | null {
    if (!form.title.trim())                  return "Title is required.";
    if (!form.category.trim())               return "Category is required.";
    const price = Number(form.price);
    if (!form.price || !(price > 0))         return "Enter a price greater than zero.";
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) { setFormError(validationError); return; }

    setSaving(true);
    setFormError("");
    const payload = {
      title:       form.title.trim(),
      description: form.description.trim() || undefined,
      price:       Number(form.price),
      category:    form.category,
      imageUrl:    form.imageUrl.trim() || undefined,
    };

    try {
      if (editing) {
        const saved = await updateDesign(editing.id, payload);
        setDesigns((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      } else {
        const saved = await createDesign(payload);
        setDesigns((prev) => [saved, ...prev]);
      }
      setModalOpen(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(design: Design) {
    if (!window.confirm(`Remove "${design.title}" from your catalog?`)) return;
    setDeletingId(design.id);
    setError("");
    try {
      await deleteDesign(design.id);
      setDesigns((prev) => prev.filter((d) => d.id !== design.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not delete design.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
            My Designs
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Designs appear in the catalog and on your shop page with a fixed price customers can order.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} className="whitespace-nowrap flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Design
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[#E5E7EB] rounded-xl">
          <Shirt className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#6B7280]">You haven&apos;t listed any designs yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F3F4F6]">
          {designs.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-3">
              {d.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={optimizedImage(d.imageUrl, { width: 48, height: 48 })} alt={d.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                  <Shirt className="w-5 h-5 text-[#D1D5DB]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111111] truncate">{d.title}</p>
                <p className="text-xs text-[#6B7280]">{d.category} · {formatNaira(d.price)}</p>
              </div>
              <button
                onClick={() => openEdit(d)}
                className="p-2 rounded-lg text-[#6B7280] hover:text-[#0F766E] hover:bg-[#0F766E]/5"
                aria-label={`Edit ${d.title}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(d)}
                disabled={deletingId === d.id}
                className="p-2 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label={`Delete ${d.title}`}
              >
                {deletingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? "Edit Design" : "Add Design"}>
        <div className="p-6 space-y-4">
          <InputField
            label="Title"
            required
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Royal 3-piece Agbada"
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Price (₦)"
              required
              type="number"
              min={1}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="45000"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Category<span className="text-[#0F766E] ml-1">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#0F766E]"
              >
                {/* Keep a legacy category selectable when editing */}
                {!DESIGN_CATEGORIES.includes(form.category) && <option value={form.category}>{form.category}</option>}
                {DESIGN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111111]">
              Description <span className="text-[#9CA3AF] text-xs font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fabric suggestions, embroidery details, turnaround time…"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] resize-none"
            />
          </div>

          <ImageUpload
            label="Photo"
            folder="designs"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            hint="A clear photo of a finished piece sells best"
          />

          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{formError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" size="md" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? "Save Changes" : "Add Design"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
