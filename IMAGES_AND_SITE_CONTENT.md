# Images & Site Content

## Photo uploads (Cloudinary)

Photos are uploaded straight from the browser to Cloudinary (cloud **`vsuogbue`**). The app stores only
the returned `https://res.cloudinary.com/...` link, so the backend never handles image files.

### One-time setup

1. Cloudinary console → **Settings → Upload → Upload presets → Add upload preset**
2. **Signing mode: Unsigned**. Recommended restrictions on the preset:
   - Allowed formats: `jpg, jpeg, png, webp, heic`
   - Max file size: 10 MB
   - Incoming transformation: limit to 2500 × 2500 (keeps storage small)
3. Put the preset name in `frontend/.env.local`:

   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=vsuogbue
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your preset name>
   ```

4. Rebuild/restart the frontend (`NEXT_PUBLIC_*` values are baked in at build time).

Until the preset is set, every upload box falls back to "paste an image link".

### Where photos are uploaded

| Who | Page | What |
|-----|------|------|
| Tailor | `/profile/shop` → Shop Picture | Shop logo / photo |
| Tailor | `/profile/shop` → My Designs → Add/Edit | Design photo |
| Admin | `/admin/content` | Homepage hero, promo banner, category pictures |

Verification ID documents still use links on purpose: Cloudinary's unsigned uploads are publicly
viewable by URL, which isn't appropriate for ID cards. Moving them needs signed, private uploads
through the backend.

Cloudinary folders: `tailorhub/designs`, `tailorhub/shops`, `tailorhub/site`, `tailorhub/categories`.

### Display

`optimizedImage(url, { width, height })` in `frontend/src/lib/cloudinary.ts` rewrites Cloudinary links
to request a cropped, compressed, modern-format (WebP/AVIF) version at 2× the display size.
Links from other sites are shown unchanged.

## Site Content (admin)

`/admin/content` (ADMIN only) edits homepage content without code changes:

- **Hero**: picture, headline, sub-headline (empty text = built-in default)
- **Promo banner**: picture, title, text, link (shown only when it has a picture or title)
- **Category pictures**: one per design category; tiles link to `/designs?category=<name>`
- **Tailor photos**: every design photo, newest first, with **Remove** (deletes the design)

Tailor photos appear immediately; admins moderate after the fact.

### API

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/site-content` | public — returns `{ key: value }` |
| PUT | `/api/admin/site-content` | ADMIN — body `{ key: value }`; empty value resets a key |

Allowed keys: `hero.imageUrl|title|subtitle`, `banner.imageUrl|title|text|link`,
`category.<Name>.imageUrl`. Image fields must be `http(s)://` links; `banner.link` may also be a
site path starting with `/`.

Stored in the `site_content` table (`content_key` unique, `content_value` text). In production
(`ddl-auto=validate`) create it before deploying:

```sql
CREATE TABLE site_content (
  id            BIGSERIAL PRIMARY KEY,
  content_key   VARCHAR(100) NOT NULL UNIQUE,
  content_value TEXT         NOT NULL,
  updated_at    TIMESTAMP
);
```
