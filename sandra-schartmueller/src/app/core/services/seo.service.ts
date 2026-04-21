import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoData {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  set(data: SeoData) {
    if (data.title) this.title.setTitle(data.title);
    if (data.description) this.meta.updateTag({ name: 'description', content: data.description });
    if (data.ogTitle) this.meta.updateTag({ property: 'og:title', content: data.ogTitle });
    if (data.ogDescription) this.meta.updateTag({ property: 'og:description', content: data.ogDescription });
    if (data.ogImage) this.meta.updateTag({ property: 'og:image', content: data.ogImage });
  }

  setFromYoast(yoast: Record<string, any>) {
    this.set({
      title: yoast['title'],
      description: yoast['description'],
      ogTitle: yoast['og_title'],
      ogDescription: yoast['og_description'],
      ogImage: yoast['og_image']?.[0]?.url,
    });
  }
}
