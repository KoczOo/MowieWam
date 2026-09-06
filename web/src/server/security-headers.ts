import type { NextFunction, Request, Response } from 'express';

const CANONICAL_HOST = 'mowiewam.pl';

const PRODUCTION_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' https://cdn.jsdelivr.net https://kit.fontawesome.com https://ka-f.fontawesome.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://ka-f.fontawesome.com",
  "font-src 'self' data: https://fonts.gstatic.com https://ka-f.fontawesome.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://ka-f.fontawesome.com https://kit.fontawesome.com",
  "frame-src https://www.google.com https://maps.google.com",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

function isLocalHost(host: string): boolean {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.startsWith('127.') ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.endsWith('.local')
  );
}

export function isProductionRuntime(): boolean {
  return process.env['NODE_ENV'] !== 'development';
}

/** Hostinger (and any reverse proxy) terminates TLS; Express must trust X-Forwarded-*. */
export function forwardedProto(req: Request): string | undefined {
  const raw = req.headers['x-forwarded-proto'];
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(',')[0].trim();
  }
  if (Array.isArray(raw) && raw[0]) {
    return String(raw[0]).split(',')[0].trim();
  }
  return req.protocol;
}

export function canonicalHostRedirect(req: Request, res: Response, next: NextFunction): void {
  const host = req.hostname || '';
  if (isLocalHost(host)) {
    next();
    return;
  }

  const isApex = host === CANONICAL_HOST;
  const isWww = host === `www.${CANONICAL_HOST}`;
  if (!isApex && !isWww) {
    next();
    return;
  }

  const needsHttps = forwardedProto(req) === 'http';
  if (needsHttps || isWww) {
    res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
    return;
  }

  next();
}

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  );
  res.removeHeader('X-Powered-By');

  if (isProductionRuntime()) {
    res.setHeader('Content-Security-Policy', PRODUCTION_CSP);
  }

  if (forwardedProto(req) === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
