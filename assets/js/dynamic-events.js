/**
 * Populates the Events page's unified upcoming+past grid from Supabase.
 * The existing status/category filter tabs (inline <script> at the bottom
 * of events.html) work unchanged — they just read data-status/data-category
 * off whatever .event-card elements exist, so this only needs to render
 * cards with the same attributes the static markup used to have.
 *
 * The "Featured Event Spotlight" section further down the page (the
 * two-column editorial write-up with highlight stats) stays static for
 * now — it's hand-written narrative content, not a simple field-for-field
 * mapping of the events table. See README.md → Roadmap.
 */
import { getAllPublishedEvents } from '../../supabase/events.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

function fmtDateRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  if (start.toDateString() === end.toDateString()) return start.toLocaleDateString('en-KE', opts);
  return `${start.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-KE', opts)}`;
}

function eventCardHTML(ev, index) {
  const isPast = new Date(ev.end_date) < new Date();
  const status = isPast ? 'past' : 'upcoming';
  const start = new Date(ev.start_date);
  const image = safeUrl(ev.image) || 'assets/images/Ishmar_Logo.png';
  const regLink = safeUrl(ev.registration_link);

  const footerBadge = isPast
    ? '<span class="badge badge-success"><i class="fas fa-check"></i> Completed</span>'
    : '<span class="badge badge-upcoming"><i class="fas fa-bell"></i> Upcoming</span>';

  let ctaHref, ctaLabel, ctaIcon, ctaTarget = '';
  if (isPast) {
    ctaHref = 'gallery.html'; ctaLabel = 'View Gallery'; ctaIcon = 'fa-images';
  } else if (regLink) {
    ctaHref = regLink; ctaLabel = 'Register'; ctaIcon = 'fa-arrow-up-right-from-square'; ctaTarget = ' target="_blank" rel="noopener"';
  } else {
    ctaHref = 'contact.html'; ctaLabel = 'Get Info'; ctaIcon = 'fa-arrow-right';
  }

  return `
    <article class="event-card" data-status="${status}" data-category="${escapeHtml(ev.category) || 'halal'}" data-aos="fade-up" data-aos-delay="${(index % 3) * 120}">
      <div class="event-card-image">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(ev.title)}" loading="lazy" />
        <div class="event-card-overlay"></div>
        <div class="event-date-badge"><div class="event-date-day">${start.getDate()}</div><div class="event-date-month">${start.toLocaleDateString('en-US', { month: 'short' })}</div></div>
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
          ${footerBadge}
          <a href="${escapeHtml(ctaHref)}" class="btn btn-primary" style="padding:10px 20px; font-size:11px;"${ctaTarget}>${ctaLabel} <i class="fas ${ctaIcon}"></i></a>
        </div>
      </div>
    </article>`;
}

async function init() {
  const grid = document.querySelector('.events-grid');
  if (!grid) return;

  try {
    const events = await getAllPublishedEvents();
    if (!events.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px 24px; color:var(--gray);">
          <i class="fas fa-calendar-days" style="font-size:28px; margin-bottom:12px; display:block; color:var(--border);"></i>
          No events published yet — check back soon.
        </div>`;
      return;
    }
    grid.innerHTML = events.map(eventCardHTML).join('');
    if (window.AOS) window.AOS.refresh();
    // Let the page's own filter-tab script (inline at the bottom of
    // events.html) pick up the freshly rendered cards.
    window.dispatchEvent(new Event('ishmar:events-rendered'));
  } catch (err) {
    console.error('[dynamic-events] Failed to load events from Supabase:', err);
  }
}

init();
