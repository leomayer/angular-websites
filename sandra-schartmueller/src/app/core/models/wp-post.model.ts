export interface WpPost {
  id: number;
  slug: string;
  status: string;
  date: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  featured_media: number;
  yoast_head_json?: Record<string, any>;
}
