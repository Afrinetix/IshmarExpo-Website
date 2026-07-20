/**
 * Shared admin chrome: sidebar, topbar, auth guard wiring, toasts, and a
 * confirm-delete modal. Every admin page (except login.html) calls
 * `initShell({ active, title })` once on load — it runs requireAuth(),
 * injects the sidebar/topbar into #sidebar-root / #topbar-root, and
 * returns the signed-in user's profile so the page can render its own
 * role-aware content.
 */
import { requireAuth, signOut } from '../../supabase/auth.js';
import { ROLES, ADMIN_PANEL_ROLES } from '../../supabase/config.js';

/** Every admin section. `allowedRoles` controls nav visibility, matching what each role can actually SELECT under RLS (see policies.sql) — a role never sees a nav item that would just render an empty/forbidden table. `builtIn` pages exist now; the rest are Phase 2 placeholders (see README) but still route correctly rather than 404. */
const NAV_ITEMS = [
  { section: 'Overview', items: [
    { href: 'dashboard.html', icon: 'fa-gauge-high', label: 'Dashboard', allowedRoles: ADMIN_PANEL_ROLES },
  ]},
  { section: 'Content', items: [
    { href: 'events.html', icon: 'fa-calendar-star', label: 'Events', allowedRoles: ADMIN_PANEL_ROLES },
    { href: 'gallery.html', icon: 'fa-images', label: 'Gallery', allowedRoles: ADMIN_PANEL_ROLES },
    { href: 'videos.html', icon: 'fa-film', label: 'Videos', allowedRoles: ADMIN_PANEL_ROLES },
    { href: 'sponsors.html', icon: 'fa-handshake', label: 'Sponsors', allowedRoles: ADMIN_PANEL_ROLES },
    { href: 'partners.html', icon: 'fa-people-group', label: 'Partners', allowedRoles: ADMIN_PANEL_ROLES },
    { href: 'testimonials.html', icon: 'fa-quote-left', label: 'Testimonials', allowedRoles: ADMIN_PANEL_ROLES },
    { href: 'media.html', icon: 'fa-newspaper', label: 'Media & Press', allowedRoles: ADMIN_PANEL_ROLES },
  ]},
  { section: 'Operations', items: [
    { href: 'registrations.html', icon: 'fa-ticket', label: 'Registrations', allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EVENT_MANAGER] },
    { href: 'messages.html', icon: 'fa-envelope', label: 'Messages', allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  ]},
  { section: 'Administration', items: [
    { href: 'users.html', icon: 'fa-users-gear', label: 'Users', allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
    { href: 'settings.html', icon: 'fa-gear', label: 'Settings', allowedRoles: ADMIN_PANEL_ROLES },
  ]},
];

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

/**
 * Escapes a value for safe interpolation into innerHTML — every admin page
 * renders DB-sourced text (titles, captions, names…) this way before
 * injecting it, so a malicious string stored in a field can never execute
 * as markup/script.
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Only allow http(s) URLs through to href/src attributes — blocks javascript: and data: URI XSS. */
export function safeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
}

function renderSidebar(profile, activeHref) {
  const sections = NAV_ITEMS.map(({ section, items }) => {
    const visible = items.filter((item) => item.allowedRoles.includes(profile.role));
    if (!visible.length) return '';
    const links = visible.map((item) => `
      <a href="${item.href}" class="${item.href === activeHref ? 'active' : ''}">
        <i class="fas ${item.icon}"></i> ${item.label}
      </a>`).join('');
    return `<div class="nav-section-label">${section}</div>${links}`;
  }).join('');

  return `
    <div class="sidebar-logo">ISHMAR<span>EXPO</span><small>Admin Console</small></div>
    <nav class="sidebar-nav">${sections}</nav>
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">${escapeHtml(initials(profile.full_name || profile.email))}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${escapeHtml(profile.full_name || profile.email)}</div>
        <div class="sidebar-user-role">${escapeHtml(profile.role.replace('_', ' '))}</div>
      </div>
      <button class="sidebar-logout" id="logout-btn" title="Log out" aria-label="Log out">
        <i class="fas fa-right-from-bracket"></i>
      </button>
    </div>`;
}

function renderTopbar(title) {
  return `
    <button class="sidebar-toggle" id="sidebar-toggle-btn" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
    <div class="topbar-title">${title}</div>
    <div class="topbar-actions">
      <a href="../index.html" target="_blank" class="btn btn-outline btn-sm"><i class="fas fa-arrow-up-right-from-square"></i> View Site</a>
    </div>`;
}

/**
 * Runs the auth guard, then paints the shared shell. Call this once at the
 * top of every admin page's module script.
 * @returns {Promise<object|null>} the signed-in profile, or null if the
 *   guard redirected away (caller should stop executing in that case).
 */
export async function initShell({ active, title, allowedRoles }) {
  const profile = await requireAuth(allowedRoles ? { allowedRoles } : undefined);
  if (!profile) return null;

  document.getElementById('sidebar-root').innerHTML = renderSidebar(profile, active);
  document.getElementById('topbar-root').innerHTML = renderTopbar(title);

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut();
    window.location.href = 'login.html';
  });
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });

  return profile;
}

/* ── Toasts ── */
export function toast(message, type = 'success') {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${escapeHtml(message)}`;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

export function toastError(err) {
  console.error(err);
  toast(err?.message || 'Something went wrong.', 'error');
}

/* ── Confirm modal (used for every delete action) ── */
export function confirmModal({ title, text, confirmLabel = 'Delete', danger = true }) {
  return new Promise((resolve) => {
    let overlay = document.getElementById('confirm-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'confirm-modal-overlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${escapeHtml(title)}</div>
        <div class="modal-text">${escapeHtml(text)}</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${confirmLabel}</button>
        </div>
      </div>`;
    overlay.classList.add('open');

    const close = (result) => {
      overlay.classList.remove('open');
      resolve(result);
    };
    overlay.querySelector('#confirm-cancel').onclick = () => close(false);
    overlay.querySelector('#confirm-ok').onclick = () => close(true);
    overlay.onclick = (e) => { if (e.target === overlay) close(false); };
  });
}
