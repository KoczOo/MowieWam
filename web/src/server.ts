import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { config as loadDotenv } from 'dotenv';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkRateLimit,
  clientIp,
  parseContactPayload,
  sendContactEmails,
} from './server/contact-mail';
import { canonicalHostRedirect, securityHeaders } from './server/security-headers';
import { envSecret } from './server/env-secret';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const webRoot = resolve(serverDistFolder, '../../..');
const projectRoot = resolve(process.cwd());

loadDotenv();
loadDotenv({ path: resolve(process.cwd(), '.env') });
loadDotenv({ path: resolve(webRoot, '.env') });

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(canonicalHostRedirect);
app.use(securityHeaders);
app.use(express.json({ limit: '32kb' }));
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  next(err);
});

interface Review {
  readonly author_name: string;
  readonly text: string;
  readonly relative_time_description: string;
  readonly rating: number;
  readonly time?: number;
}

interface PlaceDetailsResponse {
  readonly result?: {
    readonly name?: string;
    readonly rating?: number;
    readonly user_ratings_total?: number;
    readonly reviews?: ReadonlyArray<Review>;
  };
  readonly status?: string;
}

const SUCCESS_TTL_MS = 6 * 60 * 60 * 1000;
const ERROR_TTL_MS = 60 * 1000;

let cache: { data: PlaceDetailsResponse | null; expiresAt: number } | null = null;
let inflight: Promise<PlaceDetailsResponse | null> | null = null;

type ReviewsSort = 'most_relevant' | 'newest';

async function fetchPlaceDetailsWithSort(
  apiKey: string,
  placeId: string,
  sort: ReviewsSort,
): Promise<PlaceDetailsResponse | null> {
  const fields = 'name,rating,user_ratings_total,reviews';
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&language=pl&fields=${fields}&reviews_sort=${sort}` +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[reviews] Places HTTP ${res.status} (sort=${sort})`);
      return null;
    }
    const body = (await res.json()) as PlaceDetailsResponse;
    if (body.status && body.status !== 'OK') {
      console.warn(`[reviews] Places status=${body.status} (sort=${sort})`);
      return null;
    }
    return body;
  } catch (err) {
    console.warn('[reviews] fetch failed:', err);
    return null;
  }
}

// Places `Details` returns max 5 reviews per call. Fetching both sortings
// in parallel and dedup'ing by `time` yields up to ~10 unique reviews.
async function fetchPlaceDetails(): Promise<PlaceDetailsResponse | null> {
  const apiKey = envSecret('GOOGLE_API_KEY');
  const placeId = envSecret('PLACE_ID');

  if (!apiKey) {
    console.warn('[reviews] missing GOOGLE_API_KEY in .env');
    return null;
  }
  if (!placeId) {
    console.warn('[reviews] missing PLACE_ID in .env');
    return null;
  }

  const [byRelevance, byNewest] = await Promise.all([
    fetchPlaceDetailsWithSort(apiKey, placeId, 'most_relevant'),
    fetchPlaceDetailsWithSort(apiKey, placeId, 'newest'),
  ]);

  const primary = byRelevance ?? byNewest;
  if (!primary) return null;

  const seen = new Set<string>();
  const merged: Review[] = [];
  const push = (reviews?: ReadonlyArray<Review>): void => {
    if (!reviews) return;
    for (const r of reviews) {
      const key =
        typeof r.time === 'number'
          ? `t:${r.time}`
          : `a:${r.author_name}|${(r.text ?? '').slice(0, 60)}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    }
  };
  push(byRelevance?.result?.reviews);
  push(byNewest?.result?.reviews);

  return {
    status: 'OK',
    result: {
      name: primary.result?.name,
      rating: primary.result?.rating,
      user_ratings_total: primary.result?.user_ratings_total,
      reviews: merged,
    },
  };
}

async function getReviews(): Promise<PlaceDetailsResponse | null> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.data;
  if (inflight) return inflight;
  inflight = fetchPlaceDetails()
    .then((data) => {
      cache = {
        data,
        expiresAt: Date.now() + (data ? SUCCESS_TTL_MS : ERROR_TTL_MS),
      };
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

app.get('/api/reviews', async (_req, res) => {
  const data = await getReviews();
  if (!data) {
    res.status(503).json({ error: 'reviews_unavailable' });
    return;
  }
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800');
  res.json(data);
});

// ---------------------------------------------------------------------------
// Instagram Graph API
// ---------------------------------------------------------------------------
// Long-lived tokens live 60 days. We refresh proactively when >= 30 days old
// and persist the fresh token to disk so restarts don't lose progress.

type IgMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

interface IgPost {
  readonly id: string;
  readonly caption?: string;
  readonly media_type: IgMediaType;
  readonly media_url: string;
  readonly thumbnail_url?: string;
  readonly permalink: string;
  readonly timestamp: string;
}

interface IgTokenFile {
  readonly token: string;
  readonly refreshedAt: number;
}

const IG_POSTS_TTL_MS = 60 * 60 * 1000; // 1h – posts more dynamic than reviews
const IG_ERROR_TTL_MS = 5 * 60 * 1000;
const IG_TOKEN_REFRESH_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const IG_TOKEN_FILE = resolve(projectRoot, '.instagram-token.json');

let igCache: { data: ReadonlyArray<IgPost> | null; expiresAt: number } | null = null;
let igInflight: Promise<ReadonlyArray<IgPost> | null> | null = null;
let igTokenCache: IgTokenFile | null = null;

async function readTokenFile(): Promise<IgTokenFile | null> {
  try {
    const raw = await readFile(IG_TOKEN_FILE, 'utf8');
    return JSON.parse(raw) as IgTokenFile;
  } catch {
    return null;
  }
}

async function writeTokenFile(entry: IgTokenFile): Promise<void> {
  try {
    await writeFile(IG_TOKEN_FILE, JSON.stringify(entry, null, 2), 'utf8');
  } catch {
    // File write is best-effort – token still works in memory until restart.
  }
}

async function getActiveToken(): Promise<string | null> {
  const envToken = envSecret('IG_ACCESS_TOKEN');
  if (!envToken) return null;

  if (!igTokenCache) {
    const persisted = await readTokenFile();
    igTokenCache = persisted ?? { token: envToken, refreshedAt: Date.now() };
  }

  const age = Date.now() - igTokenCache.refreshedAt;
  if (age < IG_TOKEN_REFRESH_AGE_MS) {
    return igTokenCache.token;
  }

  const refreshed = await refreshLongLivedToken(igTokenCache.token);
  if (refreshed) {
    igTokenCache = { token: refreshed, refreshedAt: Date.now() };
    await writeTokenFile(igTokenCache);
    return refreshed;
  }
  return igTokenCache.token;
}

async function refreshLongLivedToken(current: string): Promise<string | null> {
  const url =
    `https://graph.instagram.com/refresh_access_token` +
    `?grant_type=ig_refresh_token&access_token=${encodeURIComponent(current)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = (await res.json()) as { access_token?: string };
    return body.access_token ?? null;
  } catch {
    return null;
  }
}

async function fetchInstagramPosts(): Promise<ReadonlyArray<IgPost> | null> {
  const userId = envSecret('IG_USER_ID');
  const token = await getActiveToken();
  if (!userId) {
    console.warn('[ig] missing IG_USER_ID in .env');
    return null;
  }
  if (!token) {
    console.warn('[ig] missing IG_ACCESS_TOKEN in .env');
    return null;
  }

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url =
    `https://graph.facebook.com/v21.0/${encodeURIComponent(userId)}/media` +
    `?fields=${fields}&limit=12&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errBody = await res.text();
      console.warn(`[ig] Graph API HTTP ${res.status}: ${errBody.slice(0, 400)}`);
      return null;
    }
    const body = (await res.json()) as { data?: IgPost[] };
    console.log(`[ig] fetched ${body.data?.length ?? 0} posts`);
    return body.data ?? [];
  } catch (err) {
    console.warn('[ig] fetch failed:', err);
    return null;
  }
}

async function getInstagramPosts(): Promise<ReadonlyArray<IgPost> | null> {
  const now = Date.now();
  if (igCache && igCache.expiresAt > now) return igCache.data;
  if (igInflight) return igInflight;
  igInflight = fetchInstagramPosts()
    .then((data) => {
      igCache = {
        data,
        expiresAt: Date.now() + (data ? IG_POSTS_TTL_MS : IG_ERROR_TTL_MS),
      };
      return data;
    })
    .finally(() => {
      igInflight = null;
    });
  return igInflight;
}

app.get('/api/instagram-posts', async (_req, res) => {
  const posts = await getInstagramPosts();
  if (!posts) {
    res.status(503).json({ error: 'instagram_unavailable' });
    return;
  }
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800');
  res.json({ posts });
});

// ---------------------------------------------------------------------------
// Contact form — notify clinic + auto-reply via Resend
// ---------------------------------------------------------------------------

app.post('/api/contact', async (req, res) => {
  const ip = clientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }

  const parsed = parseContactPayload(req.body);
  if (typeof parsed === 'string') {
    if (parsed === 'honeypot') {
      res.status(204).end();
      return;
    }
    res.status(400).json({ error: parsed });
    return;
  }

  const result = await sendContactEmails(parsed);
  if (result.ok === false) {
    const status = result.reason === 'mailer_unconfigured' ? 503 : 500;
    res.status(status).json({ error: result.reason });
    return;
  }

  res.status(204).end();
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  process.env['NODE_ENV'] ??= 'production';
  const port = Number(process.env['PORT'] || 4000);
  const host = process.env['HOST'] || '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
    for (const key of [
      'GOOGLE_API_KEY',
      'PLACE_ID',
      'IG_ACCESS_TOKEN',
      'IG_USER_ID',
      'RESEND_API_KEY',
      'CONTACT_TO',
      'CONTACT_FROM',
    ] as const) {
      console.log(`[env] ${key}: ${envSecret(key) ? 'set' : 'MISSING'}`);
    }
  });
}

export const reqHandler = createNodeRequestHandler(app);
