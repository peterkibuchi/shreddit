type SiteConfig = {
  name: string;
  url: string;
  description: string;
  creator: string;
  authors: { name: string; url: string }[];
  keywords: string[];
  ogImage?: string;
  links: {
    github: string;
    twitter?: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "Shreddit",
  url: "https://shreddit.vercel.app",
  description: "A Reddit clone built with Next.js and TypeScript.",
  creator: "Peter Kibuchi",
  authors: [{ name: "Peter Kibuchi", url: "https://www.peterkibuchi.com" }],
  keywords: ["reddit", "clone", "nextjs", "typescript"],
  links: {
    github: "https://github.com/peterkibuchi/shreddit",
  },
};
