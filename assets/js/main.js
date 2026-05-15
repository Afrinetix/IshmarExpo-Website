/* ============================================================
   ISHMAR EXPO LIMITED — Core JavaScript
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════
   PRELOADER
══════════════════════════════════════════ */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const logoEl    = document.querySelector('.preloader-logo');
  const tagEl     = document.querySelector('.preloader-tagline');
  if (!preloader) return;

  // Animate logo in
  if (logoEl) {
    setTimeout(() => {
      logoEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      logoEl.style.opacity = '1';
      logoEl.style.transform = 'translateY(0)';
    }, 100);
  }
  if (tagEl) {
    setTimeout(() => {
      tagEl.style.transition = 'opacity 0.6s ease';
      tagEl.style.opacity = '1';
    }, 400);
  }

  // Hide after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.classList.remove('loading');
      document.body.style.overflow = '';
    }, 2400);
  });

  // Fallback
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.classList.remove('loading');
  }, 4500);
})();

/* ══════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  const hoverEls = document.querySelectorAll('a, button, .btn, .card, .event-card, .video-card, .gallery-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');
  if (!navbar) return;

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile menu
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate links in
      if (isOpen) {
        mobileLinks.forEach((link, i) => {
          link.style.transitionDelay = `${0.05 + i * 0.07}s`;
        });
      } else {
        mobileLinks.forEach(link => { link.style.transitionDelay = '0s'; });
      }
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on overlay click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ══════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop  = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress   = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width  = progress + '%';
  });
})();

/* ══════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2200;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ══════════════════════════════════════════
   AOS INIT
══════════════════════════════════════════ */
(function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 900,
      easing:   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      once:     true,
      offset:   80,
      delay:    50,
    });
  }
})();

/* ══════════════════════════════════════════
   SWIPER — TESTIMONIALS
══════════════════════════════════════════ */
(function initTestimonialsSwiper() {
  if (typeof Swiper === 'undefined') return;
  const el = document.querySelector('.testimonials-swiper');
  if (!el) return;

  new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 28,
    loop: true,
    speed: 800,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });
})();

/* ══════════════════════════════════════════
   SWIPER — EVENTS FEATURED
══════════════════════════════════════════ */
(function initEventsSwiper() {
  if (typeof Swiper === 'undefined') return;
  const el = document.querySelector('.events-swiper');
  if (!el) return;

  new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    speed: 800,
    pagination: { el: '.events-swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.events-swiper-next',
      prevEl: '.events-swiper-prev',
    },
    breakpoints: {
      640:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      1100: { slidesPerView: 3 },
    },
  });
})();

/* ══════════════════════════════════════════
   SWIPER — HERO BANNER
══════════════════════════════════════════ */
(function initHeroSwiper() {
  if (typeof Swiper === 'undefined') return;
  const el = document.querySelector('.hero-swiper');
  if (!el) return;

  new Swiper(el, {
    slidesPerView: 1,
    loop: true,
    speed: 1200,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 6000, disableOnInteraction: false },
    pagination: { el: '.hero-swiper-pagination', clickable: true },
  });
})();

/* ══════════════════════════════════════════
   VIDEO LIGHTBOX
══════════════════════════════════════════ */
(function initVideoLightbox() {
  const lightbox   = document.querySelector('.lightbox');
  const closeBtn   = document.querySelector('.lightbox-close');
  const iframeEl   = document.querySelector('.lightbox-iframe');
  if (!lightbox) return;

  function openLightbox(src) {
    if (iframeEl) iframeEl.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    if (iframeEl) iframeEl.src = '';
    document.body.style.overflow = '';
  }

  // Open triggers
  document.querySelectorAll('[data-video]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const videoId  = trigger.dataset.video;
      const platform = trigger.dataset.platform || 'youtube';
      let src = '';

      if (platform === 'youtube') {
        src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      } else if (platform === 'vimeo') {
        src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      }

      openLightbox(src);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ══════════════════════════════════════════
   IMAGE LIGHTBOX (Gallery)
══════════════════════════════════════════ */
(function initImageLightbox() {
  const lightbox  = document.querySelector('.img-lightbox');
  const imgEl     = document.querySelector('.img-lightbox-img');
  const closeBtn  = document.querySelector('.img-lightbox-close');
  if (!lightbox || !imgEl) return;

  let items  = [];
  let current = 0;

  function openImg(index) {
    current = index;
    const item = items[index];
    if (!item) return;
    imgEl.src = item.src;
    imgEl.alt = item.alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeImg() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Gather gallery items
  document.querySelectorAll('.gallery-item[data-src]').forEach((el, i) => {
    items.push({ src: el.dataset.src, alt: el.dataset.alt || '' });
    el.addEventListener('click', () => openImg(i));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeImg);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target === imgEl.parentElement) closeImg(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeImg();
    if (e.key === 'ArrowRight')  openImg((current + 1) % items.length);
    if (e.key === 'ArrowLeft')   openImg((current - 1 + items.length) % items.length);
  });
})();

/* ══════════════════════════════════════════
   GALLERY FILTER
══════════════════════════════════════════ */
(function initGalleryFilter() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const items = document.querySelectorAll('.gallery-item[data-category]');
  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.filter;

      items.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.style.transition = 'opacity 0.4s, transform 0.4s';

        if (match) {
          item.style.opacity   = '1';
          item.style.transform = 'scale(1)';
          item.style.display   = '';
        } else {
          item.style.opacity   = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            if (item.style.opacity === '0') item.style.display = 'none';
          }, 400);
        }
      });
    });
  });
})();

/* ══════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════ */
(function initContactForm() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled  = true;

    // Simulate sending (replace with actual form submission)
    await new Promise(resolve => setTimeout(resolve, 2000));

    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #34C759, #30B050)';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
})();

/* ══════════════════════════════════════════
   SPOTLIGHT HOVER (service cards)
══════════════════════════════════════════ */
(function initSpotlight() {
  document.querySelectorAll('.spotlight').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--x', x + '%');
      card.style.setProperty('--y', y + '%');
    });
  });
})();

/* ══════════════════════════════════════════
   HERO PARTICLES
══════════════════════════════════════════ */
(function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 12 : 24;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size    = Math.random() * 4 + 1;
    const left    = Math.random() * 100;
    const delay   = Math.random() * 12;
    const duration = Math.random() * 15 + 12;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -10px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${Math.random() * 0.6 + 0.2};
    `;

    container.appendChild(p);
  }
})();

/* ══════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ══════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════ */
(function initMagnetic() {
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) * 0.25;
      const dy = (e.clientY - centerY) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════════
   PARTNER LOGO SCROLL (Duplicate)
══════════════════════════════════════════ */
(function initPartnersScroll() {
  const scroll = document.querySelector('.partners-scroll');
  if (!scroll) return;
  // Clone children for seamless loop
  const items = scroll.innerHTML;
  scroll.innerHTML = items + items;
})();

/* ══════════════════════════════════════════
   EVENTS PAGE FILTER (Upcoming / Past)
══════════════════════════════════════════ */
(function initEventsFilter() {
  const tabs  = document.querySelectorAll('.events-filter-tab');
  const cards = document.querySelectorAll('.event-card[data-status]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const status = tab.dataset.status;

      cards.forEach(card => {
        const match = status === 'all' || card.dataset.status === status;
        card.style.display = match ? '' : 'none';
      });
    });
  });
})();

/* ══════════════════════════════════════════
   LAZY LOAD IMAGES
══════════════════════════════════════════ */
(function initLazyLoad() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-src]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.classList.add('loaded');
      observer.unobserve(img);
    });
  }, { rootMargin: '200px 0px' });

  images.forEach(img => observer.observe(img));
})();

/* ══════════════════════════════════════════
   MOBILE SWIPER — EVENTS GRID
══════════════════════════════════════════ */
(function initMobileEventsSwiper() {
  if (typeof Swiper === 'undefined') return;
  if (window.innerWidth > 768) return;

  const grid = document.querySelector('.events-grid-swiper');
  if (!grid) return;

  new Swiper(grid, {
    slidesPerView: 1.1,
    spaceBetween: 16,
    centeredSlides: false,
    pagination: { el: '.events-grid-pagination', clickable: true },
  });
})();

/* ══════════════════════════════════════════
   TYPEWRITER EFFECT
══════════════════════════════════════════ */
(function initTypewriter() {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;

  const words  = JSON.parse(el.dataset.typewriter || '[]');
  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;

  function type() {
    const word = words[wordIdx % words.length];

    if (deleting) {
      el.textContent = word.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = word.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = deleting ? 60 : 110;

    if (!deleting && charIdx === word.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      wordIdx++;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 800);
})();

/* ══════════════════════════════════════════
   ACCORDION (FAQ / Why Us)
══════════════════════════════════════════ */
(function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item   = header.closest('.accordion-item');
      const body   = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.accordion-body');
        if (b) b.style.maxHeight = '0';
      });

      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* ══════════════════════════════════════════
   NOTIFICATION TOAST
══════════════════════════════════════════ */
window.showToast = function(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  const styles = `
    position:fixed; bottom:90px; right:24px; z-index:9900;
    display:flex; align-items:center; gap:10px;
    background:rgba(10,21,37,0.97); border:1px solid rgba(201,162,39,0.3);
    backdrop-filter:blur(20px); color:#fff; padding:14px 22px;
    border-radius:10px; font-family:var(--font-heading);
    font-size:13px; letter-spacing:0.5px;
    box-shadow:0 10px 40px rgba(0,0,0,0.4);
    transform:translateX(110%); transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  `;
  toast.style.cssText = styles;

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 10);
  setTimeout(() => {
    toast.style.transform = 'translateX(110%)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};
