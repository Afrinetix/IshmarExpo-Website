/* ============================================================
   ISHMAR EXPO LIMITED — GSAP Animations
   ============================================================ */

'use strict';

// Wait for GSAP to be available
(function initGSAP() {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded');
    return;
  }

  // Register plugins
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════
     HERO ANIMATIONS
  ══════════════════════════════════════════ */
  function heroAnimations() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const tl = gsap.timeline({ delay: 2.6 });

    // Eyebrow
    tl.to('.hero-eyebrow', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Title words — split manually via spans if present
    const wordInners = hero.querySelectorAll('.hero-word-inner');
    if (wordInners.length) {
      tl.to(wordInners, {
        y: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power4.out'
      }, '-=0.4');
    } else {
      // Fallback: animate whole title
      tl.fromTo('.hero-title', {
        y: 60,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out'
      }, '-=0.4');
    }

    // Description
    tl.to('.hero-desc', {
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out'
    }, '-=0.5');

    // Buttons
    tl.to('.hero-buttons', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');

    // Scroll indicator
    tl.to('.hero-scroll', {
      opacity: 1,
      duration: 0.6
    }, '-=0.3');

    // Stats bar
    tl.fromTo('.hero-stat', {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.3');
  }

  /* ══════════════════════════════════════════
     PAGE HERO ANIMATIONS (inner pages)
  ══════════════════════════════════════════ */
  function pageHeroAnimations() {
    const pageHero = document.querySelector('.page-hero');
    if (!pageHero) return;

    gsap.fromTo('.page-breadcrumb', {
      opacity: 0, y: 20
    }, {
      opacity: 1, y: 0,
      duration: 0.7,
      delay: 2.6,
      ease: 'power3.out'
    });

    gsap.fromTo('.page-hero-title', {
      opacity: 0, y: 50
    }, {
      opacity: 1, y: 0,
      duration: 1,
      delay: 2.8,
      ease: 'power4.out'
    });

    gsap.fromTo('.page-hero-sub', {
      opacity: 0, y: 30
    }, {
      opacity: 1, y: 0,
      duration: 0.8,
      delay: 3,
      ease: 'power3.out'
    });

    gsap.fromTo('.page-hero .btn-group', {
      opacity: 0, y: 20
    }, {
      opacity: 1, y: 0,
      duration: 0.7,
      delay: 3.15,
      ease: 'power3.out'
    });
  }

  /* ══════════════════════════════════════════
     SCROLL TRIGGER REVEALS
  ══════════════════════════════════════════ */
  function scrollReveal() {

    // Generic reveal-up elements
    gsap.utils.toArray('.reveal-up').forEach((el, i) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: i % 3 * 0.1,
        ease: 'power3.out'
      });
    });

    // Staggered children
    gsap.utils.toArray('.stagger-children').forEach(parent => {
      const children = parent.children;
      gsap.to(children, {
        scrollTrigger: {
          trigger: parent,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      });
    });

    // About section
    gsap.fromTo('.about-split .about-image-stack', {
      opacity: 0, x: -60
    }, {
      scrollTrigger: { trigger: '.about-split', start: 'top 80%' },
      opacity: 1, x: 0,
      duration: 1.1,
      ease: 'power4.out'
    });

    gsap.fromTo('.about-split .about-content', {
      opacity: 0, x: 60
    }, {
      scrollTrigger: { trigger: '.about-split', start: 'top 80%' },
      opacity: 1, x: 0,
      duration: 1.1,
      ease: 'power4.out'
    });

    // Section labels
    gsap.utils.toArray('.section-label').forEach(el => {
      gsap.fromTo(el, {
        opacity: 0, x: -30
      }, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        opacity: 1, x: 0,
        duration: 0.7,
        ease: 'power3.out'
      });
    });

    // Section titles
    gsap.utils.toArray('.section-title').forEach(el => {
      gsap.fromTo(el, {
        opacity: 0, y: 40
      }, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power4.out'
      });
    });

    // Cards stagger
    gsap.utils.toArray('.events-grid, .services-grid, .team-grid, .values-grid, .press-grid').forEach(grid => {
      const cards = grid.querySelectorAll(':scope > *');
      gsap.fromTo(cards, {
        opacity: 0, y: 50
      }, {
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%'
        },
        opacity: 1, y: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out'
      });
    });

    // Stats items
    gsap.fromTo('.stat-item', {
      opacity: 0, y: 40
    }, {
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top 85%'
      },
      opacity: 1, y: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Gallery items
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
      gsap.fromTo(item, {
        opacity: 0, scale: 0.92
      }, {
        scrollTrigger: {
          trigger: item,
          start: 'top 90%'
        },
        opacity: 1, scale: 1,
        duration: 0.7,
        delay: (i % 4) * 0.08,
        ease: 'power3.out'
      });
    });

    // Service cards
    gsap.utils.toArray('.service-card').forEach((card, i) => {
      gsap.fromTo(card, {
        opacity: 0, y: 50
      }, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%'
        },
        opacity: 1, y: 0,
        duration: 0.8,
        delay: (i % 3) * 0.12,
        ease: 'power3.out'
      });
    });

    // Timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
      gsap.fromTo(item, {
        opacity: 0, x: 40
      }, {
        scrollTrigger: {
          trigger: item,
          start: 'top 88%'
        },
        opacity: 1, x: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // Video cards
    gsap.utils.toArray('.video-card').forEach((card, i) => {
      gsap.fromTo(card, {
        opacity: 0, scale: 0.9
      }, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%'
        },
        opacity: 1, scale: 1,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power4.out'
      });
    });

    // Partner logos
    gsap.fromTo('.partners-track', {
      opacity: 0
    }, {
      scrollTrigger: {
        trigger: '.partners-track',
        start: 'top 90%'
      },
      opacity: 1,
      duration: 1,
      ease: 'power2.out'
    });

    // CTA section
    gsap.fromTo('.cta-content', {
      opacity: 0, scale: 0.95
    }, {
      scrollTrigger: {
        trigger: '#cta',
        start: 'top 80%'
      },
      opacity: 1, scale: 1,
      duration: 1,
      ease: 'power3.out'
    });

    // Footer columns
    gsap.fromTo('.footer-grid > *', {
      opacity: 0, y: 30
    }, {
      scrollTrigger: {
        trigger: '.footer-grid',
        start: 'top 90%'
      },
      opacity: 1, y: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  /* ══════════════════════════════════════════
     PARALLAX EFFECTS
  ══════════════════════════════════════════ */
  function initParallax() {

    // Hero parallax on scroll
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
          heroContent.style.transform = `translateY(${self.progress * 120}px)`;
          heroContent.style.opacity   = 1 - self.progress * 1.5;
        }
      }
    });

    // Section background parallax
    gsap.utils.toArray('.parallax-bg').forEach(bg => {
      gsap.to(bg, {
        scrollTrigger: {
          trigger: bg.closest('section') || bg,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
        y: '-15%',
        ease: 'none'
      });
    });
  }

  /* ══════════════════════════════════════════
     HORIZONTAL SCROLL (Services page)
  ══════════════════════════════════════════ */
  function initHorizontalScroll() {
    const section = document.querySelector('.services-horizontal');
    if (!section) return;

    const cards = section.querySelector('.services-h-track');
    if (!cards) return;

    const totalWidth = cards.scrollWidth - section.clientWidth;

    gsap.to(cards, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      }
    });
  }

  /* ══════════════════════════════════════════
     ABOUT BADGE ANIMATION
  ══════════════════════════════════════════ */
  function aboutBadgeAnim() {
    gsap.fromTo('.about-badge', {
      scale: 0, rotation: -15
    }, {
      scrollTrigger: {
        trigger: '.about-image-stack',
        start: 'top 80%'
      },
      scale: 1, rotation: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      delay: 0.3
    });
  }

  /* ══════════════════════════════════════════
     GOLD LINE REVEAL
  ══════════════════════════════════════════ */
  function goldLineReveal() {
    gsap.utils.toArray('.gold-line').forEach(line => {
      gsap.fromTo(line, {
        scaleX: 0, transformOrigin: 'left'
      }, {
        scrollTrigger: {
          trigger: line,
          start: 'top 92%'
        },
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out'
      });
    });
  }

  /* ══════════════════════════════════════════
     RUN ALL
  ══════════════════════════════════════════ */
  heroAnimations();
  pageHeroAnimations();

  // Wait for preloader to finish
  setTimeout(() => {
    scrollReveal();
    initParallax();
    initHorizontalScroll();
    aboutBadgeAnim();
    goldLineReveal();

    // Refresh ScrollTrigger after images load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }, 2800);

})();
