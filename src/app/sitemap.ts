import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/work", "/about"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
  }));
  const work = projects.map((p) => ({
    url: `${SITE_URL}/work/${p.slug}`,
    lastModified: now,
  }));
  return [...pages, ...work];
}
