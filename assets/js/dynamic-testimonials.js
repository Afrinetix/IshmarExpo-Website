/**
 * Loads the homepage testimonials carousel from Supabase, replacing the
 * hardcoded slides in #testimonials .testimonials-swiper.
 *
 * Timing hazard: this is a `type="module"` script, so it is always deferred
 * — it only runs after the whole document has finished parsing, i.e.
 * strictly after assets/js/main.js's synchronous `new Swiper(...)` call has
 * already initialized on the static slides (see initTestimonialsSwiper in
 * main.js). That instance uses `loop: true`, which means Swiper has cloned
 * the static slides internally for the loop illusion. Simply overwriting
 * `.swiper-wrapper`'s innerHTML would NOT update Swiper's cached slide
 * list — the clones and internal indices would still point at stale/removed
 * DOM. The documented fix for changing slides on a loop-mode instance is:
 * call `swiper.loopDestroy()` BEFORE mutating the DOM (removes the clones),
 * replace the innerHTML, then call `swiper.loopCreate()` followed by
 * `swiper.update()` to rebuild the clones and re-measure everything.
 */
import { getFeaturedTestimonials, getAllTestimonials } from '../../supabase/testimonials.js';
import { escapeHtml, safeUrl } from './dom-safe.js';

const FALLBACK_AVATAR = 'assets/images/Ishmar_Logo.png';
const MIN_TO_SWAP = 3;

function slideHTML(t) {
  const avatar = safeUrl(t.photo) || FALLBACK_AVATAR;
  return `
    <div class="swiper-slide">
      <div class="testimonial-card">
        <div class="testimonial-quote-icon"><i class="fas fa-quote-left"></i></div>
        <p class="testimonial-text">"${escapeHtml(t.testimonial)}"</p>
        <div class="testimonial-stars">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
        </div>
        <div class="testimonial-author">
          <img src="${escapeHtml(avatar)}" alt="${escapeHtml(t.client_name)}" class="testimonial-avatar" loading="lazy" />
          <div>
            <div class="testimonial-name">${escapeHtml(t.client_name)}</div>
            ${t.company ? `<div class="testimonial-role">${escapeHtml(t.company)}</div>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

function renderSlides(testimonials) {
  const container = document.querySelector('.testimonials-swiper');
  const wrapper = container?.querySelector('.swiper-wrapper');
  if (!container || !wrapper) return;

  const swiper = container.swiper;
  const html = testimonials.map(slideHTML).join('');

  if (swiper) {
    // Loop-mode instance already initialized by main.js on the static
    // slides — tear down the cloned loop slides before touching the DOM,
    // then rebuild them against the new content.
    swiper.loopDestroy();
    wrapper.innerHTML = html;
    swiper.loopCreate();
    swiper.update();
  } else {
    // Shouldn't happen given module-script defer semantics, but don't
    // throw if main.js hasn't run yet for some reason — the static
    // fallback content is still better than a broken page.
    wrapper.innerHTML = html;
  }
}

async function init() {
  try {
    let testimonials = await getFeaturedTestimonials({ limit: 6 });
    if (testimonials.length < MIN_TO_SWAP) {
      testimonials = await getAllTestimonials({ limit: 6 });
    }
    if (testimonials.length < MIN_TO_SWAP) return; // leave the static fallback alone

    renderSlides(testimonials);
  } catch (err) {
    console.error('[dynamic-testimonials] Failed to load content from Supabase:', err);
  }
}

init();
