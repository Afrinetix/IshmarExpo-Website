/**
 * Loads sponsor + partner logos from Supabase into the homepage "Our
 * Network" marquee (#partners .partners-scroll), replacing the hardcoded
 * text-span placeholder list once real logos exist.
 *
 * Marquee duplication note: .partners-scroll has a CSS animation
 * (partnersScroll, in assets/css/main.css) that translates the track from
 * 0% to -50% to create a seamless infinite loop. That only works if the
 * rendered content is the full logo set duplicated twice back-to-back — at
 * -50% you're exactly at the start of the second copy, which is identical
 * to the first, so the loop is invisible. Rendering the set once would jump
 * to blank space at the halfway point instead. We render [...logos, ...logos].
 */
import { getAllSponsors } from '../../supabase/sponsors.js';
import { getAllPartners } from '../../supabase/partners.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

function logoHTML(item) {
  const img = `<img class="partner-logo" src="${escapeHtml(safeUrl(item.logo))}" alt="${escapeHtml(item.name)}" loading="lazy" />`;
  const href = safeUrl(item.website);
  return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${img}</a>` : img;
}

function renderPartners(items) {
  if (!items.length) return; // leave the existing static placeholder markup alone

  const scroll = document.querySelector('#partners .partners-scroll');
  if (!scroll) return;

  // Duplicated twice — required by the partnersScroll 0%→-50% keyframe (see file header).
  scroll.innerHTML = [...items, ...items].map(logoHTML).join('');
}

async function init() {
  try {
    const [sponsors, partners] = await Promise.all([
      getAllSponsors(),
      getAllPartners(),
    ]);

    const combined = [...sponsors, ...partners]
      .filter((row) => row.logo)
      .map((row) => ({ name: row.company_name, logo: row.logo, website: row.website }));

    renderPartners(combined);
  } catch (err) {
    // Fail quietly on the public site — the static placeholder markup
    // already in the page stays visible rather than showing a broken page.
    console.error('[dynamic-partners] Failed to load content from Supabase:', err);
  }
}

init();
