export type Media =
  | { type: "video"; src: string; poster: string }
  | { type: "image"; src: string }
  | { type: "placeholder" };

/**
 * A project-page gallery entry. `span: "full"` = full-bleed cinematic feature
 * (edge to edge); `span: "half"` = sits in a 2-up paired row.
 */
export type GalleryItem = {
  type: "image" | "video";
  src: string;
  span: "full" | "half";
};

export type Project = {
  n: string;
  slug: string;
  title: string;
  industry: string;
  discipline: string;
  year: string;
  aspect: "landscape" | "portrait";
  media: Media;
  /** Shown in the homepage "Selected Work" section (the curated subset). */
  featured?: boolean;
  /** Hero video has no audio → autoplay-loop it instead of the click-to-play player. */
  loopHero?: boolean;
  /** Optional extra media shown on the project page (images/clips of the work). */
  gallery?: GalleryItem[];
};

export const projects: Project[] = [
  { n: "01", slug: "office-assembling", title: "Smart Meeting Room Assembling", industry: "Deep-Tech / AV", discipline: "3D Motion · AI Creative", year: "2026", aspect: "landscape", featured: true, media: { type: "video", src: "/work/office-assembling.mp4", poster: "/work/office-assembling.jpg" } },
  { n: "02", slug: "retractable-screen", title: "Retractable Screen", industry: "Deep-Tech / AV", discipline: "CGI · Product Film", year: "2026", aspect: "portrait", featured: true, media: { type: "video", src: "/work/retractable-screen.mp4", poster: "/work/retractable-screen.jpg" } },
  { n: "03", slug: "audio-zoning", title: "Audio Zoning", industry: "Deep-Tech / AV", discipline: "Motion Graphics · Social", year: "2026", aspect: "landscape", featured: true, media: { type: "video", src: "/work/audio-zoning.mp4", poster: "/work/audio-zoning.jpg" } },
  {
    n: "04", slug: "pricypal", title: "PricyPal", industry: "Technology", discipline: "UI/UX · Web · Brand", year: "2025", aspect: "landscape",
    media: { type: "video", src: "/work/pricypal.mp4", poster: "/work/pricypal.jpg" },
    featured: true,
    loopHero: true,
    gallery: [
      { type: "image", src: "/work/pricypal/ui-ux.jpg", span: "full" },
      { type: "video", src: "/work/pricypal/mobile.mp4", span: "full" },
      { type: "image", src: "/work/pricypal/poster-1.jpg", span: "full" },
      { type: "image", src: "/work/pricypal/poster-2.jpg", span: "full" },
    ],
  },
  {
    n: "05", slug: "triangle", title: "Triangle", industry: "Food & Beverage", discipline: "Brand Identity · Motion", year: "2026", aspect: "landscape",
    media: { type: "video", src: "/work/triangle.mp4", poster: "/work/triangle.jpg" },
    featured: true,
    loopHero: true,
    gallery: [
      { type: "image", src: "/work/triangle/identity.jpg", span: "full" },
      { type: "image", src: "/work/triangle/packaging.jpg", span: "half" },
      { type: "image", src: "/work/triangle/bag.jpg", span: "half" },
      { type: "image", src: "/work/triangle/signage.jpg", span: "full" },
      { type: "image", src: "/work/triangle/menu.jpg", span: "half" },
      { type: "image", src: "/work/triangle/instagram.jpg", span: "half" },
      { type: "video", src: "/work/triangle/ad.mp4", span: "full" },
    ],
  },
  {
    n: "06", slug: "canvas-home", title: "Canvas Home", industry: "Furniture & Interiors", discipline: "Brand Identity · Motion", year: "2025", aspect: "landscape",
    media: { type: "video", src: "/work/canvas-home.mp4", poster: "/work/canvas-home.jpg" },
    featured: true,
    loopHero: true,
    gallery: [
      { type: "image", src: "/work/canvas-home/c1.jpg", span: "full" },
      { type: "image", src: "/work/canvas-home/c3.jpg", span: "half" },
      { type: "image", src: "/work/canvas-home/c5.jpg", span: "half" },
      { type: "video", src: "/work/canvas-home/mockup.mp4", span: "full" },
      { type: "image", src: "/work/canvas-home/c6.jpg", span: "full" },
    ],
  },
  {
    n: "07", slug: "personal-identity", title: "Personal Identity", industry: "Personal · Branding", discipline: "Brand Identity · Logo · Motion", year: "2023", aspect: "landscape",
    media: { type: "image", src: "/work/personal-identity/hero.jpg" },
    gallery: [
      { type: "video", src: "/work/personal-identity/logo-grid.mp4", span: "full" },
      { type: "video", src: "/work/personal-identity/logo-animation.mp4", span: "full" },
      { type: "image", src: "/work/personal-identity/business-card.jpg", span: "half" },
      { type: "image", src: "/work/personal-identity/tshirt.jpg", span: "half" },
      { type: "video", src: "/work/personal-identity/brand-promotion.mp4", span: "full" },
      { type: "image", src: "/work/personal-identity/letter-fs.jpg", span: "full" },
    ],

  },
  {
    n: "08", slug: "nook", title: "Nook", industry: "Tech · Startup", discipline: "Brand Identity · UI/UX · Web", year: "2022", aspect: "landscape",
    media: { type: "image", src: "/work/nook/hero.jpg" },
    gallery: [
      { type: "image", src: "/work/nook/macbook.jpg", span: "full" },
      { type: "image", src: "/work/nook/iphone.jpg", span: "half" },
      { type: "image", src: "/work/nook/hand.jpg", span: "half" },
      { type: "image", src: "/work/nook/typo.jpg", span: "full" },
      { type: "image", src: "/work/nook/social.jpg", span: "full" },
    ],
  },
  {
    n: "09", slug: "hydralyte", title: "Hydralyte", industry: "Health · Beverage", discipline: "Brand · Advertising", year: "2023", aspect: "landscape",
    media: { type: "image", src: "/work/hydralyte/hero.jpg" },
    gallery: [
      { type: "image", src: "/work/hydralyte/poster-1.jpg", span: "full" },
      { type: "image", src: "/work/hydralyte/poster-2.jpg", span: "half" },
      { type: "image", src: "/work/hydralyte/poster-3.jpg", span: "half" },
    ],
  },
  {
    n: "10", slug: "toyota-sequoia", title: "Toyota Sequoia", industry: "Automotive", discipline: "Advertising · Key Visual", year: "2023", aspect: "landscape",
    media: { type: "image", src: "/work/toyota-sequoia/hero.jpg" },
    gallery: [
      { type: "image", src: "/work/toyota-sequoia/portrait.jpg", span: "full" },
    ],
  },
];

/** The curated subset shown in the homepage "Selected Work" section. */
export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** Map a Media into props for <ProjectMedia>. */
export function mediaProps(m: Media, alt: string) {
  return m.type === "video"
    ? { type: "video" as const, src: m.src, poster: m.poster, alt }
    : m.type === "image"
      ? { type: "image" as const, src: m.src, alt }
      : { type: "placeholder" as const, label: alt };
}
