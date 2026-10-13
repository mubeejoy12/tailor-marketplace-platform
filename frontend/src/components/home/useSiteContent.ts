"use client";

import { useEffect, useState } from "react";
import { getSiteContent, SiteContent } from "@/services/siteContentService";

// One request per page load, shared by every homepage section
let pending: Promise<SiteContent> | null = null;

/** Admin-managed site content; empty until loaded (sections show their defaults meanwhile). */
export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({});
  useEffect(() => {
    pending ??= getSiteContent().catch(() => ({}));
    let active = true;
    pending.then((c) => { if (active) setContent(c); });
    return () => { active = false; };
  }, []);
  return content;
}
