/**
 * Loads the Press Mentions grid on media.html from Supabase. The `media`
 * table only has title/image/link — no outlet, excerpt, or date — so this
 * intentionally renders a simpler card than the static placeholder markup
 * (which has outlet/excerpt/date). The Interviews section below it is left
 * completely untouched.
 */
import { getAllMedia } from '../../supabase/media.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

function cardHTML(item, index) {
  const image = safeUrl(item.image);
  const link = safeUrl(item.link);
  const titleInner = escapeHtml(item.title);

  return `
    <div class="press-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 120}">
      ${image ? `<img src="${escapeHtml(image)}" alt="${titleInner}" loading="lazy" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:20px;" />` : ''}
      <h3 class="press-title">${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener" style="color:inherit; text-decoration:none;">${titleInner}</a>` : titleInner}</h3>
    </div>`;
}

async function init() {
  try {
    const items = await getAllMedia({ limit: 6 });
    if (!items.length) return; // no admin-added mentions yet — keep the editorial placeholder content

    const grid = document.querySelector('.press-grid');
    if (!grid) return;

    grid.innerHTML = items.map(cardHTML).join('');
    if (window.AOS) window.AOS.refresh();
  } catch (err) {
    console.error('[dynamic-media] Failed to load content from Supabase:', err);
  }
}

init();
