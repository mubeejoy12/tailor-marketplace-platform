"use client";

/**
 * /admin/content — Site Content (ADMIN only)
 *
 * Lets an admin change the homepage visuals without touching code:
 *  - Homepage hero picture, headline and sub-headline
 *  - Promo banner (picture, title, text, link)
 *  - A picture for each design category
 *  - Review every tailor design photo and remove inappropriate ones
 *
 * Backend endpoints used:
 *  - GET /api/site-content, PUT /api/admin/site-content
 *  - GET /api/designs, DELETE /api/designs/{id}
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import ImageUpload from "@/components/ui/ImageUpload";
import { AlertCircle, CheckCircle, ChevronLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSiteContent, updateSiteContent, categoryImageKey, SiteContent } from "@/services/siteContentService";
import { searchDesigns, deleteDesign, formatNaira, DESIGN_CATEGORIES, Design } from "@/services/designService";
import { isUploadConfigured, optimizedImage } from "@/lib/cloudinary";

/** Every key this page manages — all are sent on save so cleared fields reset to defaults */
const MANAGED_KEYS = [
  "hero.imageUrl", "hero.title", "hero.subtitle",
  "banner.imageUrl", "banner.title", "banner.text", "banner.link",
  ...DESIGN_CATEGORIES.map(categoryImageKey),
];

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h2>
        <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

export default function AdminContentPage() {
  const router   = useRouter();
  const { user } = useAuth();

  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [designs,        setDesigns]        = useState<Design[]>([]);
  const [designsLoading, setDesignsLoading] = useState(true);
  const [designPage,     setDesignPage]     = useState(0);
  const [hasMoreDesigns, setHasMoreDesigns] = useState(false);
  const [removingId,     setRemovingId]     = useState<number | null>(null);

  // Guard: ADMIN only
  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/");
  }, [user, router]);

  useEffect(() => {
    getSiteContent()
      .then(setContent)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load site content."))
      .finally(() => setLoading(false));
  }, []);

  const loadDesigns = useCallback(async (page: number) => {
    setDesignsLoading(true);
    try {
      const result = await searchDesigns({ page, size: 24, sortBy: "newest" });
      setDesigns((prev) => (page === 0 ? result.content : [...prev, ...result.content]));
      setHasMoreDesigns(!result.last);
      setDesignPage(page);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load tailor photos.");
    } finally {
      setDesignsLoading(false);
    }
  }, []);

  useEffect(() => { loadDesigns(0); }, [loadDesigns]);

  const field = (key: string) => content[key] ?? "";
  const setField = (key: string) => (value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const changes = Object.fromEntries(MANAGED_KEYS.map((k) => [k, field(k)]));
      setContent(await updateSiteContent(changes));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDesign(design: Design) {
    if (!window.confirm(`Remove "${design.title}" by ${design.tailorShopName}? This cannot be undone.`)) return;
    setRemovingId(design.id);
    try {
      await deleteDesign(design.id);
      setDesigns((prev) => prev.filter((d) => d.id !== design.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not remove design.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F766E] mb-2">
              <ChevronLeft className="w-3.5 h-3.5" /> Admin Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Site Content
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              Change homepage pictures and text. Changes go live as soon as you save.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save changes</>}
          </Button>
        </div>

        {!isUploadConfigured() && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Photo uploads aren&apos;t switched on yet — add <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to
              the frontend settings. Until then you can paste image links.
            </p>
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">Saved — the homepage is updated.</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
          </div>
        ) : (
          <>
            <Section title="Homepage hero" desc="The big picture and headline at the top of the homepage. Leave text empty to use the default.">
              <ImageUpload label="Hero picture" folder="site" aspect="wide"
                value={field("hero.imageUrl")} onChange={setField("hero.imageUrl")}
                hint="A wide photo works best — at least 1600 × 700 pixels" />
              <InputField label="Headline" value={field("hero.title")} maxLength={120}
                onChange={(e) => setField("hero.title")(e.target.value)}
                placeholder="Wear Clothing Crafted for You." />
              <InputField label="Sub-headline" value={field("hero.subtitle")} maxLength={300}
                onChange={(e) => setField("hero.subtitle")(e.target.value)}
                placeholder="Connect with Africa's finest tailors…" />
            </Section>

            <Section title="Promo banner" desc="Shown on the homepage when it has a picture or a title. Clear both to hide it.">
              <ImageUpload label="Banner picture" folder="site" aspect="wide"
                value={field("banner.imageUrl")} onChange={setField("banner.imageUrl")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Title" value={field("banner.title")} maxLength={80}
                  onChange={(e) => setField("banner.title")(e.target.value)} placeholder="Festive season offers" />
                <InputField label="Button link" value={field("banner.link")} maxLength={300}
                  onChange={(e) => setField("banner.link")(e.target.value)} placeholder="/designs?category=Wedding"
                  hint="A page on this site (starting with /) or a full https:// link" />
              </div>
              <InputField label="Text" value={field("banner.text")} maxLength={200}
                onChange={(e) => setField("banner.text")(e.target.value)}
                placeholder="Book your Christmas outfit before 1 December" />
            </Section>

            <Section title="Category pictures" desc="One picture per style in the homepage “Browse by Style” section.">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {DESIGN_CATEGORIES.map((cat) => (
                  <ImageUpload key={cat} label={cat} folder="categories"
                    value={field(categoryImageKey(cat))} onChange={setField(categoryImageKey(cat))} />
                ))}
              </div>
            </Section>
          </>
        )}

        <Section title="Tailor photos" desc="Every design photo tailors have posted, newest first. Remove anything inappropriate — removing deletes the design from the catalog.">
          {designs.length === 0 && !designsLoading ? (
            <p className="text-sm text-[#9CA3AF] py-6 text-center">No designs have been posted yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((d) => (
                <div key={d.id} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="aspect-square bg-[#F3F4F6]">
                    {d.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={optimizedImage(d.imageUrl, { width: 240, height: 240 })} alt={d.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium text-[#111111] truncate">{d.title}</p>
                    <p className="text-xs text-[#6B7280] truncate">{d.tailorShopName} · {formatNaira(d.price)}</p>
                    <button
                      onClick={() => handleRemoveDesign(d)}
                      disabled={removingId === d.id}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {removingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {designsLoading && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" /></div>}
          {hasMoreDesigns && !designsLoading && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => loadDesigns(designPage + 1)}>Load more</Button>
            </div>
          )}
        </Section>
      </div>

      <Footer />
    </div>
  );
}
