/**
 * Populates the Gallery page's masonry grid from Supabase. The existing
 * category filter tabs and image lightbox (assets/js/main.js) already
 * query .gallery-item elements live rather than capturing them once, so
 * they work automatically once this replaces the grid's contents — no
 * further wiring needed beyond the 'ishmar:gallery-rendered' event dispatch
 * below (lets the filter script re-apply whichever tab is currently active).
 */
import { getGalleryImages } from '../../supabase/gallery.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

function categoryLabel(category) {
  const known = { halal: 'Halal Expo', empowerment: 'Empowerment', networking: 'Networking', speakers: 'Speakers', certification: 'Certification' };
  return known[category] || category || 'Gallery';
}

function itemHTML(img) {
  const src = safeUrl(img.image_url);
  if (!src) return '';
  const caption = img.caption || categoryLabel(img.category);
  return `
    <div class="masonry-item gallery-item" data-category="${escapeHtml(img.category) || 'halal'}" data-src="${escapeHtml(src)}" data-alt="${escapeHtml(caption)}">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy" />
      <div class="masonry-overlay">
        <div class="masonry-overlay-cat">${escapeHtml(categoryLabel(img.category))}</div>
        <div class="masonry-overlay-title">${escapeHtml(caption)}</div>
      </div>
      <div class="masonry-zoom"><i class="fas fa-expand-alt"></i></div>
    </div>`;
}

async function init() {
  const grid = document.getElementById('masonry-gallery');
  if (!grid) return;

  try {
    const images = await getGalleryImages();
    if (!images.length) {
      grid.innerHTML = `
        <div style="break-inside:avoid; text-align:center; padding:48px 24px; color:var(--gray);">
          <i class="fas fa-images" style="font-size:28px; margin-bottom:12px; display:block; color:var(--border);"></i>
          Photos from our events are being added — check back soon.
        </div>`;
      return;
    }
    grid.innerHTML = images.map(itemHTML).join('');
    window.dispatchEvent(new Event('ishmar:gallery-rendered'));
  } catch (err) {
    console.error('[dynamic-gallery] Failed to load gallery from Supabase:', err);
  }
}

init();
