import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_URL = 'https://mowiewam.pl';
const SITE_NAME = 'Mówię Wam';
const DEFAULT_IMAGE = `${SITE_URL}/assets/mowie_wam_logo.png`;
const JSON_LD_ID = 'app-json-ld';

export interface SeoConfig {
  title: string;
  description: string;
  /** Absolute or site-relative URL. Omit on noindex pages (e.g. 404) to skip canonical. */
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  robots?: string;
  keywords?: string[];
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private pageSchemas: object[] = [];
  private aggregateRating: { ratingValue: number; reviewCount: number } | null = null;

  update(cfg: SeoConfig): void {
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

    if (cfg.url) {
      const absoluteUrl = this.absolute(cfg.url);
      this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
      this.setCanonical(absoluteUrl);
    } else {
      this.removeCanonical();
      this.meta.removeTag('property="og:url"');
    }
  }

  /**
   * Replaces page-specific JSON-LD nodes and emits a single `@graph`
   * that always includes the organization entity (and AggregateRating when set).
   */
  setPageSchemas(...schemas: object[]): void {
    this.pageSchemas = schemas.map((s) => this.stripContext(s));
    this.emitGraph();
  }

  /** Attaches Google Places rating to the organization node and re-emits the graph. */
  setAggregateRating(ratingValue: number, reviewCount: number): void {
    if (!Number.isFinite(ratingValue) || !Number.isFinite(reviewCount) || reviewCount < 1) {
      return;
    }
    this.aggregateRating = {
      ratingValue: Math.round(ratingValue * 10) / 10,
      reviewCount: Math.floor(reviewCount),
    };
    this.emitGraph();
  }

  /** Seeds the organization graph (call once from AppComponent). */
  initOrganizationGraph(): void {
    this.emitGraph();
  }

  faqSchema(faqs: ReadonlyArray<FaqItem>): object {
    return {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
  }

  breadcrumbSchema(items: ReadonlyArray<{ name: string; url: string }>): object {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: this.absolute(it.url),
      })),
    };
  }

  private emitGraph(): void {
    this.writeJsonLd({
      '@context': 'https://schema.org',
      '@graph': [this.organizationEntity(), ...this.pageSchemas],
    });
  }

  private organizationEntity(): object {
    const org: Record<string, unknown> = {
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}/#organization`,
      name: 'Mówię Wam – Centrum Logopedyczno-Terapeutyczne Dominika Gębska',
      alternateName: 'Mówię Wam',
      url: SITE_URL,
      image: DEFAULT_IMAGE,
      logo: DEFAULT_IMAGE,
      telephone: '+48509792650',
      email: 'mowiewam.logopeda@gmail.com',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ul. Jurajska 1D/u20a (klatka C/D)',
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
      areaServed: [
        { '@type': 'City', name: 'Kielce' },
        { '@type': 'AdministrativeArea', name: 'województwo świętokrzyskie' },
      ],
      medicalSpecialty: ['SpeechPathology', 'Rehabilitation'],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '08:00',
          closes: '14:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/mowie.wam/',
        'https://www.facebook.com/mowiewam',
      ],
    };

    if (this.aggregateRating) {
      org['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: this.aggregateRating.ratingValue,
        reviewCount: this.aggregateRating.reviewCount,
        bestRating: 5,
        worstRating: 1,
      };
    }

    return org;
  }

  private writeJsonLd(data: object): void {
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

  private stripContext(data: object): object {
    if (!data || typeof data !== 'object') return data;
    const { ['@context']: _ctx, ...rest } = data as Record<string, unknown>;
    return rest;
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

    if (isPlatformBrowser(this.platformId)) {
      this.doc.documentElement.lang ||= 'pl';
    }
  }

  private removeCanonical(): void {
    this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.remove();
  }
}
