import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { config as loadDotenv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

loadDotenv();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

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
    if (!res.ok) return null;
    const body = (await res.json()) as PlaceDetailsResponse;
    if (body.status && body.status !== 'OK') return null;
    return body;
  } catch {
    return null;
  }
}

// Places `Details` returns max 5 reviews per call. Fetching both sortings
// in parallel and dedup'ing by `time` yields up to ~10 unique reviews.
async function fetchPlaceDetails(): Promise<PlaceDetailsResponse | null> {
  const apiKey = process.env['GOOGLE_API_KEY'];
  const placeId = process.env['PLACE_ID'];

  if (!apiKey || !placeId) return null;

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
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
