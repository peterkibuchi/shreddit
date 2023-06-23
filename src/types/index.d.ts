export type SiteConfig = {
  name: string;
  url: string;
  description: string;
  ogImage?: string;
  links: {
    github: string;
    twitter?: string;
  };
};
