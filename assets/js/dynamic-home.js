/**
 * Loads the homepage hero text, stat counters, and featured-events grid
 * from Supabase, replacing what used to be hardcoded HTML.
 *
 * Animation-safety note: the word-by-word hero headline ("Where Africa
 * Meets the Halal World") is intentionally left as static markup — GSAP
 * (assets/js/animations.js) captures those `.hero-word-inner` spans as
 * object references at parse time, so swapping them for a dynamic,
 * variable-word-count string would either break the stagger-reveal
 * animation or require rebuilding it from scratch. The eyebrow/subtitle
 * text and the stat counters ARE safe to update dynamically: GSAP resolves
 * `.hero-eyebrow`/`.hero-desc` by selector at animation time (not a fixed
 * reference), and the counters (assets/js/main.js) read `data-count` off
 * the DOM live, the moment they scroll into view — both updates below
 * finish long before that. See README.md → Roadmap for the Phase 2 plan to
 * make the headline itself dynamic without losing the animation.
 */
import { getAllSettings } from '../../supabase/settings.js';
import { getUpcomingEvents } from '../../supabase/events.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

function applySettings(settings) {
  const hero = settings.hero || {};
  const eyebrow = document.querySelector('.hero-eyebrow');
  if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;
  const desc = document.querySelector('.hero-desc');
  if (desc && hero.subtitle) desc.textContent = hero.subtitle;

  const stats = Array.isArray(settings.stats) ? settings.stats.slice(0, 4) : [];
  if (!stats.length) return;

  const heroStatEls = document.querySelectorAll('.hero-stats-inner .hero-stat');
  const sectionStatEls = document.querySelectorAll('#stats .stat-item');

  stats.forEach((s, i) => {
    const heroNum = heroStatEls[i]?.querySelector('[data-count]');
    const heroLabel = heroStatEls[i]?.querySelector('.hero-stat-label');
    if (heroNum) { heroNum.dataset.count = s.value; heroNum.dataset.suffix = s.suffix || ''; }
    if (heroLabel) heroLabel.textContent = s.label;

    const sectionNum = sectionStatEls[i]?.querySelector('[data-count]');
    const sectionLabel = sectionStatEls[i]?.querySelector('.stat-label');
    if (sectionNum) { sectionNum.dataset.count = s.value; sectionNum.dataset.suffix = s.suffix || ''; }
    if (sectionLabel) sectionLabel.textContent = s.label;
  });
}

function fmtDateRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  if (start.toDateString() === end.toDateString()) return start.toLocaleDateString('en-KE', opts);
  return `${start.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-KE', opts)}`;
}

function eventCardHTML(ev, index) {
  const start = new Date(ev.start_date);
  const day = start.getDate();
  const month = start.toLocaleDateString('en-US', { month: 'short' });
  const image = safeUrl(ev.image) || 'assets/images/Ishmar_Logo.png';
  const regLink = safeUrl(ev.registration_link);
  const ctaHref = regLink || 'contact.html';
  const ctaLabel = regLink ? 'Register' : 'Get Info';
  const ctaIcon = regLink ? 'fa-arrow-up-right-from-square' : 'fa-arrow-right';
  const ctaTarget = regLink ? ' target="_blank" rel="noopener"' : '';

  return `
    <article class="event-card" data-aos="fade-up" data-aos-delay="${index * 120}">
      <div class="event-card-image">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(ev.title)}" loading="lazy" />
        <div class="event-card-overlay"></div>
        <div class="event-date-badge"><div class="event-date-day">${day}</div><div class="event-date-month">${month}</div></div>
        ${ev.featured ? '<div style="position:absolute;top:16px;right:16px;"><span class="badge badge-gold">Featured</span></div>' : ''}
      </div>
      <div class="event-card-body">
        <div class="event-card-cat">${escapeHtml(ev.venue) || 'Ishmar Expo Event'}</div>
        <h3 class="event-card-title">${escapeHtml(ev.title)}</h3>
        <div class="event-card-meta">
          <div class="event-meta-row"><i class="fas fa-calendar"></i> ${fmtDateRange(ev.start_date, ev.end_date)}</div>
          ${ev.venue ? `<div class="event-meta-row"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(ev.venue)}</div>` : ''}
        </div>
        <div class="event-card-footer">
          <span class="badge badge-upcoming"><i class="fas fa-bell"></i> Upcoming</span>
          <a href="${escapeHtml(ctaHref)}" class="btn btn-primary" style="padding:10px 20px; font-size:11px;"${ctaTarget}>${ctaLabel} <i class="fas ${ctaIcon}"></i></a>
        </div>
      </div>
    </article>`;
}

function renderEvents(events) {
  const grid = document.querySelector('#featured-events .events-grid');
  if (!grid) return;

  if (!events.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:48px 24px; color:var(--gray);">
        <i class="fas fa-calendar-days" style="font-size:28px; margin-bottom:12px; display:block; color:var(--border);"></i>
        New events are being finalized — check back soon, or follow us on social media for announcements.
      </div>`;
    return;
  }

  grid.innerHTML = events.slice(0, 3).map(eventCardHTML).join('');
  if (window.AOS) window.AOS.refresh();
}

async function init() {
  try {
    const [settings, events] = await Promise.all([
      getAllSettings(),
      getUpcomingEvents({ limit: 3 }),
    ]);
    applySettings(settings);
    renderEvents(events);
  } catch (err) {
    // Fail quietly on the public site — the static fallback markup already
    // in the page (if any) stays visible rather than showing a broken page.
    console.error('[dynamic-home] Failed to load content from Supabase:', err);
  }
}

init();
