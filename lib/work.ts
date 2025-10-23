export type WorkCategory = "Websites" | "Apps" | "Agents";

export type Project = {
  slug: string;
  title: string;
  category: WorkCategory;
  outcome: string; // one-liner
  timeline: string;
  stack: string;
  result: string;
  thumbnail: string; // image or poster
  video?: string; // optional video src
  images: string[]; // 3-5 images
};

// Helper to slugify titles (kept inline here if needed elsewhere later)
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const projects: Project[] = [
  {
    slug: slugify("Convention Center Wayfinding"),
    title: "Convention Center Wayfinding",
    category: "Apps",
    outcome: "4× faster decisions with realtime indoor maps.",
    timeline: "10 weeks",
    stack: "Next.js, Mapbox, Firebase",
    result: "50% faster navigation, fewer support calls.",
    thumbnail: "/placeholders/cc-wayfinding/thumb.svg",
    images: [
      "/placeholders/cc-wayfinding/1.svg",
      "/placeholders/cc-wayfinding/2.svg",
      "/placeholders/cc-wayfinding/3.svg",
    ],
  },
  {
    slug: slugify("Barndominium Configurator"),
    title: "Barndominium Configurator",
    category: "Apps",
    outcome: "Bookings up 32% with visual build configurator.",
    timeline: "8 weeks",
    stack: "Next.js, Three.js, Stripe",
    result: "Higher conversion and shorter sales cycles.",
    thumbnail: "/placeholders/barndo-config/thumb.svg",
    images: [
      "/placeholders/barndo-config/1.svg",
      "/placeholders/barndo-config/2.svg",
      "/placeholders/barndo-config/3.svg",
    ],
  },
  {
    slug: slugify("Social Butterflie"),
    title: "Social Butterflie",
    category: "Agents",
    outcome: "Content creation time cut 70% with AI agent.",
    timeline: "6 weeks",
    stack: "Next.js, OpenAI, Supabase",
    result: "Consistent posts with brand-safe tone.",
    thumbnail: "/placeholders/social-butterflie/thumb.svg",
    images: [
      "/placeholders/social-butterflie/1.svg",
      "/placeholders/social-butterflie/2.svg",
      "/placeholders/social-butterflie/3.svg",
    ],
  },
  {
    slug: slugify("Campus POI"),
    title: "Campus POI",
    category: "Apps",
    outcome: "Campus engagement up 45% with AR explorer.",
    timeline: "7 weeks",
    stack: "Expo, Next.js, Firebase",
    result: "Better campus tours and engagement.",
    thumbnail: "/placeholders/campus-poi/thumb.svg",
    images: [
      "/placeholders/campus-poi/1.svg",
      "/placeholders/campus-poi/2.svg",
      "/placeholders/campus-poi/3.svg",
    ],
  },
  {
    slug: slugify("Builder Portal"),
    title: "Builder Portal",
    category: "Websites",
    outcome: "Support tickets down 60% with self-serve portal.",
    timeline: "5 weeks",
    stack: "Next.js, Auth.js, Postgres",
    result: "Reduced support tickets and faster onboarding.",
    thumbnail: "/placeholders/builder-portal/thumb.svg",
    images: [
      "/placeholders/builder-portal/1.svg",
      "/placeholders/builder-portal/2.svg",
      "/placeholders/builder-portal/3.svg",
    ],
  },
  {
    slug: slugify("Med Spa CMS"),
    title: "Med Spa CMS",
    category: "Websites",
    outcome: "Bookings up 38% with high-converting CMS pages.",
    timeline: "4 weeks",
    stack: "Next.js, Sanity, Vercel",
    result: "More bookings with less friction.",
    thumbnail: "/placeholders/med-spa-cms/thumb.svg",
    images: [
      "/placeholders/med-spa-cms/1.svg",
      "/placeholders/med-spa-cms/2.svg",
      "/placeholders/med-spa-cms/3.svg",
    ],
  },
];
