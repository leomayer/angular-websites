import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { WpPost } from '../models/wp-post.model';

@Injectable({ providedIn: 'root' })
export class WordpressService {
  private apiUrl = environment.wpApiUrl;

  postResource(id: number | (() => number)) {
    return httpResource<WpPost>(
      () => `${this.apiUrl}/posts/${typeof id === 'function' ? id() : id}`
    );
  }

  postsResource() {
    return httpResource<WpPost[]>(() => `${this.apiUrl}/posts`);
  }

  pageResource(id: number | (() => number)) {
    return httpResource<WpPost>(
      () => `${this.apiUrl}/pages/${typeof id === 'function' ? id() : id}`
    );
  }

  /** Returns non-empty array when the 'maintenance-mode' page is published in WP. */
  maintenanceModeResource() {
    return httpResource<WpPost[]>(
      () => `${this.apiUrl}/pages?slug=maintenance-mode&_fields=id,slug`
    );
  }
}
