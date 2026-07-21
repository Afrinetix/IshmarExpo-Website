/**
 * Renders the featured-videos grid (index.html's #featured-videos and
 * media.html's "Featured Coverage" section both use the same `.videos-grid`
 * markup) from Supabase, replacing the hardcoded placeholder cards.
 *
 * Timing note: this file is a `<script type="module">`, so it always runs
 * AFTER assets/js/main.js's synchronous `initVideoLightbox` IIFE has already
 * taken its one-time `document.querySelectorAll('[data-video]')` snapshot —
 * cards we inject here are invisible to that binding. Do NOT modify main.js.
 * Instead we replicate its `openLightbox()` behavior ourselves below, wiring
 * click listeners directly onto the freshly-rendered cards. Instagram-only
 * videos (no youtube_url) skip the lightbox entirely — main.js's lightbox
 * only knows how to embed youtube/vimeo — and link out to Instagram instead.
 */
import { getFeaturedVideos, getAllVideos } from '../../supabase/videos.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

const FALLBACK_IMAGE = 'assets/images/Ishmar_Logo.png';

function labelFor(video) {
  if (video.featured) return 'Featured Video';
  if (video.youtube_url) return 'YouTube';
  if (video.instagram_url) return 'Instagram';
  return 'Video';
}

function videoCardHTML(video, index) {
  const image = safeUrl(video.thumbnail) || FALLBACK_IMAGE;
  const title = escapeHtml(video.title);
  const label = escapeHtml(labelFor(video));
  const cardClass = index === 0 ? 'video-card featured' : 'video-card';

  if (video.youtube_url) {
    return `
      <div class="${cardClass}" data-video="${escapeHtml(video.youtube_url)}" data-platform="youtube" style="cursor:pointer;">
        <img src="${image}" alt="${title}" class="video-thumb" loading="lazy" />
        <div class="video-overlay"></div>
        <div class="video-play" aria-label="Play video"><i class="fas fa-play"></i></div>
        <div class="video-info">
          <div class="video-label">${label}</div>
          <div class="video-title">${title}</div>
        </div>
      </div>`;
  }

  // Instagram-only: no lightbox support in main.js, so link out instead.
  const igHref = safeUrl(video.instagram_url);
  return `
    <a class="${cardClass}" href="${igHref || '#'}" target="_blank" rel="noopener" style="cursor:pointer; display:block; text-decoration:none;">
      <img src="${image}" alt="${title}" class="video-thumb" loading="lazy" />
      <div class="video-overlay"></div>
      <div class="video-play" aria-label="Open on Instagram"><i class="fab fa-instagram"></i></div>
      <div class="video-info">
        <div class="video-label">${label}</div>
        <div class="video-title">${title}</div>
      </div>
    </a>`;
}

/** Replicates main.js's openLightbox() so our own click handlers can drive the same persistent `.lightbox` element. */
function openYoutubeLightbox(videoId) {
  const lightbox = document.querySelector('.lightbox');
  const iframeEl = document.querySelector('.lightbox-iframe');
  if (!lightbox) return;
  if (iframeEl) iframeEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function bindCards(grid) {
  grid.querySelectorAll('[data-video][data-platform="youtube"]').forEach((card) => {
    card.addEventListener('click', () => openYoutubeLightbox(card.dataset.video));
  });
}

/** Renders featured videos into every `.videos-grid` found on the current page. Safe to call on pages with none. */
export async function renderVideos() {
  const grids = document.querySelectorAll('.videos-grid');
  if (!grids.length) return;

  let videos = await getFeaturedVideos({ limit: 3 });
  if (videos.length < 3) {
    const fallback = await getAllVideos({ limit: 3 });
    // Merge, preferring featured first, without duplicates.
    const seen = new Set(videos.map((v) => v.id));
    for (const v of fallback) {
      if (!seen.has(v.id)) {
        videos.push(v);
        seen.add(v.id);
      }
      if (videos.length >= 3) break;
    }
  }
  if (!videos.length) return;

  grids.forEach((grid) => {
    grid.innerHTML = videos.slice(0, 3).map(videoCardHTML).join('');
    bindCards(grid);
  });
  if (window.AOS) window.AOS.refresh();
}

async function init() {
  try {
    await renderVideos();
  } catch (err) {
    // Fail quietly on the public site — the static fallback markup already
    // in the page stays visible rather than showing a broken page.
    console.error('[dynamic-videos] Failed to load videos from Supabase:', err);
  }
}

init();
