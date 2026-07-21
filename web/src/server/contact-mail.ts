export interface ContactPayload {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly subject: string;
  readonly message: string;
  readonly consent: boolean;
  /** Honeypot — must be empty. */
  readonly website?: string;
}

export type ContactValidationError =
  | 'invalid_body'
  | 'invalid_name'
  | 'invalid_email'
  | 'invalid_phone'
  | 'invalid_subject'
  | 'invalid_message'
  | 'consent_required'
  | 'honeypot';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+\-()]{7,}$/;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;
const MAX_SUBJECT = 120;
const MAX_MESSAGE = 5000;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const rateBuckets = new Map<string, number[]>();

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const IG_URL = 'https://www.instagram.com/mowie.wam/';
const FB_URL = 'https://www.facebook.com/mowiewam';
const SITE_URL = 'https://mowiewam.pl';
const PHONE_DISPLAY = '509 792 650';
const ADDRESS = 'ul. Jurajska 1D/u20a, 25-640 Kielce';
const LOGO_CID = 'mowie-wam-logo';
const LOGO_PUBLIC_URL = `${SITE_URL}/assets/mowie_wam_logo_email.png`;

/** Soft, readable stack — Gowun Dodum where clients allow web fonts. */
const FONT_BODY =
  "'Gowun Dodum', Georgia, 'Palatino Linotype', 'Times New Roman', serif";
const FONT_UI = "Georgia, 'Palatino Linotype', 'Times New Roman', serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function asTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export function parseContactPayload(body: unknown): ContactPayload | ContactValidationError {
  if (!body || typeof body !== 'object') return 'invalid_body';
  const raw = body as Record<string, unknown>;

  if (typeof raw['website'] === 'string' && raw['website'].trim() !== '') {
    return 'honeypot';
  }

  const name = asTrimmedString(raw['name'], MAX_NAME);
  if (!name || name.length < 2) return 'invalid_name';

  const email = asTrimmedString(raw['email'], MAX_EMAIL);
  if (!email || !EMAIL_RE.test(email)) return 'invalid_email';

  let phone: string | undefined;
  if (raw['phone'] != null && String(raw['phone']).trim() !== '') {
    const p = asTrimmedString(raw['phone'], MAX_PHONE);
    if (!p || !PHONE_RE.test(p)) return 'invalid_phone';
    phone = p;
  }

  const subject = asTrimmedString(raw['subject'], MAX_SUBJECT);
  if (!subject) return 'invalid_subject';

  const message = asTrimmedString(raw['message'], MAX_MESSAGE);
  if (!message || message.length < 10) return 'invalid_message';

  if (raw['consent'] !== true) return 'consent_required';

  return { name, email, phone, subject, message, consent: true, website: '' };
}

/** Returns true when the IP is within the allowed window. */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const prev = rateBuckets.get(ip) ?? [];
  const recent = prev.filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return true;
}

export function clientIp(req: {
  headers: Record<string, unknown>;
  socket?: { remoteAddress?: string };
}): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

function clinicNotificationHtml(payload: ContactPayload): string {
  const phone = payload.phone ? escapeHtml(payload.phone) : '—';
  return `
<!DOCTYPE html>
<html lang="pl">
<body style="margin:0;padding:24px;font-family:Georgia,serif;background:#faf6f1;color:#2c2826;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="background:#8b5563;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold;">
        Nowe zgłoszenie — Mówię Wam
      </td>
    </tr>
    <tr>
      <td style="padding:24px;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 12px;"><strong>Temat:</strong> ${escapeHtml(payload.subject)}</p>
        <p style="margin:0 0 12px;"><strong>Imię:</strong> ${escapeHtml(payload.name)}</p>
        <p style="margin:0 0 12px;"><strong>E-mail:</strong> ${escapeHtml(payload.email)}</p>
        <p style="margin:0 0 12px;"><strong>Telefon:</strong> ${phone}</p>
        <p style="margin:16px 0 8px;"><strong>Wiadomość:</strong></p>
        <p style="margin:0;padding:16px;background:#f7efe9;border-radius:8px;white-space:pre-wrap;">${escapeHtml(payload.message)}</p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function autoReplyHtml(payload: ContactPayload, logoSrc: string): string {
  const firstName = escapeHtml(payload.name.split(/\s+/)[0] || payload.name);
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#faf6f1;font-family:${FONT_BODY};color:#2c2826;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f1;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #edd8d0;">
          <tr>
            <td style="background:linear-gradient(180deg,#f7efe9 0%,#ffffff 100%);padding:28px 32px 12px;text-align:center;">
              <img src="${logoSrc}" width="96" height="96" alt="Mówię Wam"
                   style="display:block;margin:0 auto 14px;border:0;border-radius:50%;"/>
              <p style="margin:0;font-family:${FONT_UI};font-size:22px;font-weight:normal;color:#8b5563;letter-spacing:0.03em;">
                Mówię Wam
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#756c68;">
                Gabinet logopedyczny · Kielce ✨
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;">
              <p style="margin:0 0 18px;font-size:18px;line-height:1.5;color:#4a3038;">
                Cześć ${firstName}&nbsp;🌸
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#2c2826;">
                dziękujemy za Twoją wiadomość. Sam fakt, że szukasz wsparcia —
                dla siebie albo dla kogoś bliskiego — to już piękny, odważny pierwszy krok.
                Jesteśmy naprawdę wdzięczni, że trafiliście właśnie do nas.
              </p>
              <p style="margin:0 0 20px;padding:16px 18px;background:#f7efe9;border-radius:12px;font-size:15px;line-height:1.7;color:#4a3038;border-left:3px solid #c49aa5;">
                💛 <em>Mała myśl na dziś:</em> każde dziecko (i każdy rodzic) zasługuje
                na spokojne tempo i życzliwe ucho. Jesteśmy po Waszej stronie —
                bez pośpiechu i bez oceniania.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#2c2826;">
                Twoja wiadomość już do nas dotarła. <strong>Odezwiemy się w ciągu 2 tygodni</strong> —
                oddzwonimy albo odpiszemy, żeby spokojnie ustalić dalsze kroki.
              </p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#756c68;">
                A do tego czasu zaglądnij do nas na social media 🌱 — wrzucamy tam proste
                wskazówki, materiały i ciepłe inspiracje, które mogą pomóc już teraz:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="${IG_URL}" style="display:inline-block;padding:12px 20px;background:#8b5563;color:#ffffff;text-decoration:none;border-radius:999px;font-family:${FONT_UI};font-size:14px;">
                      Instagram 📷
                    </a>
                  </td>
                  <td>
                    <a href="${FB_URL}" style="display:inline-block;padding:12px 20px;background:#8b5563;color:#ffffff;text-decoration:none;border-radius:999px;font-family:${FONT_UI};font-size:14px;">
                      Facebook 👋
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#2c2826;">
                Do usłyszenia wkrótce,<br/>
                <strong style="color:#8b5563;">Zespół Mówię Wam</strong> 🤗
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 26px;background:#f7efe9;font-size:12px;line-height:1.65;color:#756c68;text-align:center;font-family:${FONT_UI};">
              <p style="margin:0 0 4px;">📞 ${PHONE_DISPLAY}</p>
              <p style="margin:0 0 4px;">📍 ${ADDRESS}</p>
              <p style="margin:0;"><a href="${SITE_URL}" style="color:#8b5563;text-decoration:none;">mowiewam.pl</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function autoReplyText(payload: ContactPayload): string {
  const firstName = payload.name.split(/\s+/)[0] || payload.name;
  return (
    `Cześć ${firstName} 🌸\n\n` +
    `dziękujemy za Twoją wiadomość. Sam fakt, że szukasz wsparcia — ` +
    `dla siebie albo dla kogoś bliskiego — to już piękny, odważny pierwszy krok. ` +
    `Jesteśmy naprawdę wdzięczni, że trafiliście właśnie do nas.\n\n` +
    `💛 Mała myśl na dziś: każde dziecko (i każdy rodzic) zasługuje na spokojne tempo ` +
    `i życzliwe ucho. Jesteśmy po Waszej stronie — bez pośpiechu i bez oceniania.\n\n` +
    `Twoja wiadomość już do nas dotarła. Odezwiemy się w ciągu 2 tygodni.\n\n` +
    `Do tego czasu zaglądnij na Instagram i Facebook:\n` +
    `${IG_URL}\n${FB_URL}\n\n` +
    `Do usłyszenia wkrótce,\n` +
    `Zespół Mówię Wam 🤗\n\n` +
    `tel. ${PHONE_DISPLAY}\n${ADDRESS}\n${SITE_URL}`
  );
}

interface ResendAttachment {
  readonly content: string;
  readonly filename: string;
  readonly content_id?: string;
  readonly content_type?: string;
}

interface ResendEmailRequest {
  readonly from: string;
  readonly to: readonly string[];
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly reply_to?: string;
  readonly attachments?: readonly ResendAttachment[];
}

async function loadEmailLogoAttachment(): Promise<ResendAttachment | null> {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), 'src/assets/mowie_wam_logo_email.png'),
    resolve(process.cwd(), 'assets/mowie_wam_logo_email.png'),
    resolve(here, '../browser/assets/mowie_wam_logo_email.png'),
    resolve(here, '../../src/assets/mowie_wam_logo_email.png'),
  ];

  for (const path of candidates) {
    try {
      const content = (await readFile(path)).toString('base64');
      return {
        content,
        filename: 'mowie_wam_logo_email.png',
        content_id: LOGO_CID,
        content_type: 'image/png',
      };
    } catch {
      // try next path
    }
  }
  console.warn('[contact] email logo not found — falling back to public URL');
  return null;
}

async function resendSend(
  apiKey: string,
  body: ResendEmailRequest,
): Promise<{ ok: true } | { ok: false }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.warn(`[contact] Resend HTTP ${res.status}: ${errBody.slice(0, 400)}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.warn('[contact] Resend fetch failed:', err);
    return { ok: false };
  }
}

export async function sendContactEmails(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const apiKey = process.env['RESEND_API_KEY'];
  const to = process.env['CONTACT_TO'] ?? 'mowiewam.logopeda@gmail.com';
  const from = process.env['CONTACT_FROM'];

  if (!apiKey || !from) {
    console.warn('[contact] missing RESEND_API_KEY or CONTACT_FROM');
    return { ok: false, reason: 'mailer_unconfigured' };
  }

  const clinicSubject = `[Mówię Wam] ${payload.subject} — ${payload.name}`;

  // Clinic notification is required. Auto-reply is best-effort: on Resend's
  // free/test sender you can only deliver to the account owner's address, so
  // replies to arbitrary form emails fail until a domain is verified.
  const clinic = await resendSend(apiKey, {
    from,
    to: [to],
    reply_to: payload.email,
    subject: clinicSubject,
    html: clinicNotificationHtml(payload),
    text:
      `Temat: ${payload.subject}\n` +
      `Imię: ${payload.name}\n` +
      `E-mail: ${payload.email}\n` +
      `Telefon: ${payload.phone || '—'}\n\n` +
      payload.message,
  });

  if (!clinic.ok) {
    return { ok: false, reason: 'send_failed' };
  }

  const logoAttachment = await loadEmailLogoAttachment();
  const logoSrc = logoAttachment ? `cid:${LOGO_CID}` : LOGO_PUBLIC_URL;

  const reply = await resendSend(apiKey, {
    from,
    to: [payload.email],
    subject: 'Dziękujemy za wiadomość — Mówię Wam 🌸',
    html: autoReplyHtml(payload, logoSrc),
    text: autoReplyText(payload),
    attachments: logoAttachment ? [logoAttachment] : undefined,
  });

  if (!reply.ok) {
    console.warn(
      `[contact] auto-reply failed for ${payload.email} (clinic mail was sent). ` +
        'Verify a domain at resend.com/domains to send to arbitrary recipients.',
    );
  }

  return { ok: true };
}
