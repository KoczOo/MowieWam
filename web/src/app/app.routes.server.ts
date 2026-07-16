import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Static marketing pages are pre-rendered at build time for best TTFB / SEO.
 * The wildcard 404 is rendered on-demand by the server so unknown paths return a proper HTML response.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'o-nas', renderMode: RenderMode.Prerender },
  { path: 'oferta', renderMode: RenderMode.Prerender },
  { path: 'pierwsza-wizyta', renderMode: RenderMode.Prerender },
  { path: 'cennik', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'kontakt', renderMode: RenderMode.Prerender },
  { path: 'polityka-prywatnosci', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
