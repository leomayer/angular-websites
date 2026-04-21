import { Component, computed, effect, inject } from '@angular/core';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { WordpressService } from '../core/services/wordpress.service';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss',
})
export class MaintenanceComponent {
  private wp = inject(WordpressService);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);
  private meta = inject(Meta);

  private maintenanceStatus = this.wp.maintenanceModeResource();
  readonly page = this.wp.pageResource(12);

  readonly pageTitle = computed(() => this.page.value()?.title.rendered ?? '');
  readonly pageContent = computed(() => {
    const html = this.page.value()?.content.rendered ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    effect(() => {
      const yoast = this.page.value()?.yoast_head_json;
      if (yoast) this.seo.setFromYoast(yoast);
    });

    effect(() => {
      if (this.maintenanceStatus.isLoading()) return;
      const active = (this.maintenanceStatus.value()?.length ?? 0) > 0;
      console.log(`[Maintenance] Wartungsmodus: ${active ? 'aktiv' : 'inaktiv'}`);
    });
  }
}
