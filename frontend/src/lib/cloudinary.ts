/**
 * Cloudinary image uploads and delivery.
 *
 * Uploads go straight from the browser to Cloudinary using an *unsigned upload preset*,
 * so no API secret is ever needed in the app. The returned https URL is what we store.
 *
 * Config (frontend/.env.local):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME     — e.g. vsuogbue
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  — name of an unsigned preset (Settings → Upload)
 */

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "vsuogbue";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB — phone photos fit comfortably

export function isUploadConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Upload one image and return its https URL. `folder` keeps the media library tidy. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!isUploadConfigured()) {
    throw new Error("Image uploads aren't set up yet. Paste an image link instead.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, WebP or HEIC).");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is larger than 10 MB. Please choose a smaller one.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", `tailorhub/${folder}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url) {
    throw new Error(json.error?.message ?? `Upload failed (${res.status}). Please try again.`);
  }
  return json.secure_url;
}

interface ImageOptions {
  width?: number;
  height?: number;
}

/**
 * Returns a resized, compressed, modern-format version of a Cloudinary image
 * (f_auto/q_auto pick WebP/AVIF and a sensible quality). Non-Cloudinary URLs are returned as-is.
 */
export function optimizedImage(url: string | null | undefined, { width, height }: ImageOptions = {}): string {
  if (!url) return "";
  const marker = `res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
  const i = url.indexOf(marker);
  if (i === -1) return url;

  // Ask for 2× the display size so images stay sharp on phone screens
  const parts = ["f_auto", "q_auto"];
  if (width || height) parts.push("c_fill", "g_auto");
  if (width)  parts.push(`w_${width * 2}`);
  if (height) parts.push(`h_${height * 2}`);

  const head = url.slice(0, i + marker.length);
  return `${head}${parts.join(",")}/${url.slice(i + marker.length)}`;
}
