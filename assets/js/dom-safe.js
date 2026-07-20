/**
 * Tiny XSS-safety helpers shared by the public-page dynamic-content
 * scripts (dynamic-home.js, dynamic-events.js, dynamic-gallery.js).
 * Every piece of Supabase-sourced text gets escaped before it's
 * interpolated into innerHTML; every URL is scheme-checked before being
 * used in an href/src.
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Only allow http(s) URLs through — blocks javascript:/data: URI XSS. */
export function safeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
}
