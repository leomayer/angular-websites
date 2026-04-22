import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoData {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  set(data: SeoData) {
    if (data.title) this.title.setTitle(data.title);
    if (data.description) this.meta.updateTag({ name: 'description', content: data.description });
    if (data.ogTitle) this.meta.updateTag({ property: 'og:title', content: data.ogTitle });
    if (data.ogDescription) this.meta.updateTag({ property: 'og:description', content: data.ogDescription });
    if (data.ogImage) this.meta.updateTag({ property: 'og:image', content: data.ogImage });
    if (data.canonical) this.setCanonical(data.canonical);
  }

  setRobots(content: string) {
    this.meta.updateTag({ name: 'robots', content });
  }

  setFromYoast(yoast: Record<string, any>) {
    const ogImage = yoast['og_image'];
    this.set({
      title: yoast['title'],
      description: yoast['description'],
      ogTitle: yoast['og_title'],
      ogDescription: yoast['og_description'],
      ogImage: Array.isArray(ogImage) ? ogImage[0]?.url : ogImage?.url,
      canonical: yoast['canonical'],
    });
  }

  private setCanonical(url: string) {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
