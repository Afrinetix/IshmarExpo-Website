/**
 * Loads the Leadership Team grid on about.html from Supabase, replacing the
 * hardcoded .team-card entries. Fails quietly (console.error only) if
 * Supabase is unreachable, leaving the static fallback team members visible.
 */
import { getActiveTeamMembers } from '../../supabase/team.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

const FALLBACK_PHOTO = 'assets/images/Ishmar_Logo.png';

const PLATFORM_ICON = {
  whatsapp: 'fab fa-whatsapp',
  instagram: 'fab fa-instagram',
  facebook: 'fab fa-facebook-f',
  linkedin: 'fab fa-linkedin-in',
  email: 'fas fa-envelope',
  website: 'fas fa-globe',
};

/** safeUrl() only allows http(s) — correctly blocks javascript:/data: URIs,
 * but a genuine `mailto:` link for the "Email" platform would get stripped
 * too. mailto: can't execute script (it just opens the mail client), so it's
 * safe to allow through as a narrow, explicit exception here. */
function socialHref(member) {
  const raw = member.social_url || '';
  if (member.social_platform === 'email' && raw.startsWith('mailto:')) return raw;
  return safeUrl(raw);
}

function socialOverlayHTML(member) {
  const icon = PLATFORM_ICON[member.social_platform];
  const href = icon ? socialHref(member) : '';
  if (!icon || !href) return '';
  const external = /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener"' : '';
  return `
    <div class="team-socials-overlay">
      <a href="${escapeHtml(href)}" class="team-social-link" aria-label="${escapeHtml(member.social_platform)}"${external}><i class="${icon}"></i></a>
    </div>`;
}

function teamCardHTML(member, index) {
  const photo = safeUrl(member.photo) || FALLBACK_PHOTO;
  return `
    <div class="team-card" data-aos="fade-up" data-aos-delay="${(index % 4) * 120}">
      <div class="team-img-wrap">
        <img src="${escapeHtml(photo)}" alt="${escapeHtml(member.full_name)}, ${escapeHtml(member.role)}" class="team-img" loading="lazy" />
        ${socialOverlayHTML(member)}
      </div>
      <div class="team-info">
        <div class="team-name">${escapeHtml(member.full_name)}</div>
        <div class="team-role">${escapeHtml(member.role)}</div>
      </div>
    </div>`;
}

async function init() {
  const grid = document.querySelector('.team-grid');
  if (!grid) return;

  try {
    const members = await getActiveTeamMembers();
    if (!members.length) return; // leave the static fallback team alone

    grid.innerHTML = members.map(teamCardHTML).join('');
    if (window.AOS) window.AOS.refresh();
  } catch (err) {
    console.error('[dynamic-team] Failed to load team members from Supabase:', err);
  }
}

init();
