import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_URL = 'https://mowiewam.pl';
const SITE_NAME = 'Mówię Wam';
const DEFAULT_IMAGE = `${SITE_URL}/assets/mowie_wam_logo.png`;

export interface SeoConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  robots?: string;
  keywords?: string[];
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const JSON_LD_ID = 'app-json-ld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  update(cfg: SeoConfig): void {
    const absoluteUrl = this.absolute(cfg.url);
    const image = cfg.image ?? DEFAULT_IMAGE;
    const fullTitle = cfg.title.includes(SITE_NAME) ? cfg.title : `${cfg.title} | ${SITE_NAME}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: cfg.description });
    this.meta.updateTag({ name: 'robots', content: cfg.robots ?? 'index,follow' });

    if (cfg.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: cfg.keywords.join(', ') });
    }

    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: cfg.type ?? 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: cfg.description });
    this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:locale', content: cfg.locale ?? 'pl_PL' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: cfg.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    if (cfg.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: cfg.publishedTime });
    }
    if (cfg.modifiedTime) {
      this.meta.updateTag({ property: 'article:modified_time', content: cfg.modifiedTime });
    }

    this.setCanonical(absoluteUrl);
  }

  /**
   * Injects (or replaces) a JSON-LD block used by search engines to understand the entity.
   * Safe on SSR — writes into <head> on both server and browser.
   */
  setStructuredData(data: object | object[]): void {
    const head = this.doc.head;
    const previous = this.doc.getElementById(JSON_LD_ID);
    if (previous) {
      previous.remove();
    }
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    script.text = JSON.stringify(data);
    head.appendChild(script);
  }

  /** Returns the canonical LocalBusiness/MedicalBusiness JSON-LD for the whole site. */
  organizationSchema(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}/#organization`,
      name: 'Mówię Wam – Centrum Logopedyczno-Terapeutyczne Dominika Gębska',
      alternateName: 'Mówię Wam',
      url: SITE_URL,
      image: DEFAULT_IMAGE,
      logo: DEFAULT_IMAGE,
      telephone: '+48509792650',
      email: 'mowiewam@gmail.com',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ul. Jurajska 1C/u20A',
        addressLocality: 'Kielce',
        addressRegion: 'świętokrzyskie',
        postalCode: '25-640',
        addressCountry: 'PL',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 50.8863,
        longitude: 20.5791,
      },
      areaServed: { '@type': 'City', name: 'Kielce' },
      medicalSpecialty: ['SpeechPathology', 'Rehabilitation'],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '14:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/mowie.wam/',
        'https://www.facebook.com/mowiewam',
      ],
    };
  }

  breadcrumbSchema(items: ReadonlyArray<{ name: string; url: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: this.absolute(it.url),
      })),
    };
  }

  private absolute(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${SITE_URL}${path === '/' ? '' : path}`;
  }

  private setCanonical(href: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);

    // Ensure <html lang="pl"> at runtime as well (defensive).
    if (isPlatformBrowser(this.platformId)) {
      this.doc.documentElement.lang ||= 'pl';
    }
  }
}
