const PLACEHOLDER_RE = /^(your_|re_x+|changeme|placeholder|todo)/i;

/** Reads a server secret, treating empty and example placeholders as missing. */
export function envSecret(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value || PLACEHOLDER_RE.test(value)) return undefined;
  return value;
}
