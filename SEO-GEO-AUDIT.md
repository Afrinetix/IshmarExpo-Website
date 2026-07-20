# Ishmar Expo — SEO & GEO Audit Report

**Date:** 2026-07-20
**Scope:** Full visual redesign to a premium white theme + SEO/GEO overhaul across all 7 existing pages, plus a new Insights knowledge center.

---

## 1. What changed — design

The site moved from a dark navy (#070B16) + gold luxury theme to a premium white theme, built as a **token-level change** in `assets/css/main.css` rather than a page-by-page rebuild, so the existing GSAP/AOS/Swiper interactions, layout, and content structure were preserved:

- New base palette: white (`#FFFFFF`) primary background, light gray (`#F8F9FA` / `#F1F3F6`) alternating sections, deepened gold (`#B8901E`) as the accent (the original `#C9A227` was too low-contrast for text use on white), darkened grays for AA-compliant body text on white.
- **Intentional dark accent bands kept** (mirroring how Stripe/Apple/AWS use white pages with a dark hero/footer): the video hero, inner-page hero banners, the "Ishmar In Action" video showcase section, the footer, the mobile navigation overlay, and the video/image lightboxes. Every other section — About, Services, Events, Stats, Testimonials, Team, Values, Timeline, Gallery, Media, Contact, FAQ — is now white or light gray.
- Sticky nav: transparent/dark over the hero, switching to a frosted white glassmorphism bar (`backdrop-filter: blur`) once scrolled, with matching dark text/logo.
- Cards, buttons, shadows, and borders were re-tuned for a light surface (soft shadows instead of heavy black ones, neutral hairline borders instead of permanent gold overlays).
- Fixed several artifacts left over from the dark theme: the Google Map on the Contact page was being color-inverted with a CSS `filter` to fake a dark map — this hack is removed so the map now renders normally; several hardcoded `rgba(255,255,255,…)` text/background values that would have been invisible on the new white background were corrected (partner-logo marquee, media "coverage logo" wall, preloader, form fields, package/process cards, social-connect cards, etc.).

**Design follow-up recommended:** the current build keeps a handful of deliberate dark sections for visual rhythm and premium feel. If a fully all-white page (zero dark sections anywhere) is preferred instead, that's a small follow-up change to `main.css` (change `--dark` usages in `#hero`, `.page-hero-bg`, `#featured-videos`, `#footer` to light equivalents).

## 2. What changed — technical SEO

| Area | Before | After |
|---|---|---|
| Open Graph / Twitter Cards | Only on the homepage | Added to all 7 pages, each with a page-specific title/description/image |
| JSON-LD structured data | One `Organization` block on the homepage only | `Organization` + `LocalBusiness` (homepage, with address, sameAs social profiles, two `ContactPoint`s), `BreadcrumbList` on every page, `Service`/`ItemList` schema for all 6 services, `FAQPage` schema on Services and Contact, `Event` schema for the 3 events with confirmed dates, `Person` schema for all 4 leadership/team members |
| Navigation | 7 items, no Insights section | 8 items — "Insights" added to desktop nav, mobile nav, and footer links on every page |
| Canonical URLs | Present on all pages | Unchanged (already correct) |
| Sitemap | 7 URLs | 14 URLs (added `insights.html` + 6 article pages), `lastmod` refreshed |
| robots.txt | Correct (`Allow: /`, sitemap referenced) | No change needed |
| Heading hierarchy | One H1 per page, logical H2/H3 nesting | Unchanged — was already correct; new Insights pages follow the same pattern |
| Alt text | Descriptive on nearly all images | Unchanged — already good practice |
| Lazy loading | `loading="lazy"` used on most below-the-fold images | Unchanged — already good practice |

## 3. What changed — GEO (Generative Engine Optimization)

AI answer engines (ChatGPT, Gemini, Claude, Perplexity, Copilot) lean heavily on structured data and clearly-labeled Q&A content to extract and cite facts about a business. This build adds:

- **FAQPage schema** on Services and Contact, mirroring the visible accordion FAQs — lets AI engines lift exact, attributable answers to "How do I exhibit at Ishmar Expo?" / "Does Ishmar Expo help with Halal certification?" type queries.
- **Service schema** for each of the 6 services with explicit `serviceType`, `areaServed`, and `description` — makes "what does Ishmar Expo do" answerable directly from structured data instead of requiring the model to parse marketing copy.
- **Event schema** for the 3 events with confirmed dates — enables accurate "what Halal events are happening in Kenya" answers with correct dates/locations.
- **Person + Organization schema** for leadership — supports "who runs Ishmar Expo" queries and reinforces E-E-A-T signals.
- **Six full Insights articles** written in a direct, question-answering style (each with its own `Article` + `FAQPage` schema) so the site has genuine long-form expertise content for AI engines to draw from, rather than only short marketing pages.

## 4. New: Insights Knowledge Center

Live now at `/insights.html`, with 6 full articles in `/insights/`:

1. Halal Certification in Kenya: A Practical Guide for SMEs
2. How to Exhibit at a Trade Fair in Kenya: A First-Time Exhibitor's Guide
3. The Halal Economy in Africa: Opportunities for SMEs
4. Women in Business: Navigating Kenya's Halal Entrepreneurship Ecosystem
5. Planning a Corporate Event in Kenya: What to Expect from an Events Partner
6. Halal Expo vs. Trade Fair: What's the Difference (and Which Is Right for Your Business)?

### Content backlog — 14 more article ideas (title, URL slug, target keyword)

| # | Title | URL | Primary keyword |
|---|---|---|---|
| 7 | How to Choose an Exhibition Stand Design That Converts Visitors into Buyers | `/insights/exhibition-stand-design-tips-kenya.html` | exhibition stand services Kenya |
| 8 | SME Growth in Kenya: 7 Practical Steps to Scale Your Small Business | `/insights/sme-growth-strategies-kenya.html` | SME growth Kenya |
| 9 | Business Networking Events in Kenya: How to Make the Most of Every Introduction | `/insights/business-networking-events-kenya.html` | business networking events Kenya |
| 10 | Youth Entrepreneurship in Kenya: Turning a Side Hustle into a Registered Business | `/insights/youth-entrepreneurship-kenya.html` | youth empowerment Kenya |
| 11 | Exhibition Marketing 101: Promoting Your Booth Before, During, and After the Expo | `/insights/exhibition-marketing-guide.html` | exhibition marketing |
| 12 | What Is Halal Business Certification and Why It Matters Beyond Food | `/insights/what-is-halal-business-certification.html` | halal business certification |
| 13 | Choosing Between a Trade Show and a Conference for Your Product Launch | `/insights/trade-show-vs-conference-product-launch.html` | corporate event organizers Kenya |
| 14 | Event Branding in Kenya: How to Make Your Corporate Event Memorable | `/insights/event-branding-kenya.html` | event branding Kenya |
| 15 | A Guide to Sponsorship Packages: Silver, Gold, and Platinum Explained | `/insights/event-sponsorship-packages-guide.html` | exhibition sponsorship Kenya |
| 16 | How SMEs Can Access Investors and Buyers Through Trade Fairs | `/insights/sme-investor-access-trade-fairs.html` | trade fair organizers Kenya |
| 17 | Halal Tourism and Hospitality: A Growing Opportunity for Kenyan SMEs | `/insights/halal-tourism-hospitality-kenya.html` | halal expo Kenya |
| 18 | Event Planning Checklist: 12 Steps to a Successful Corporate Conference | `/insights/event-planning-checklist-kenya.html` | event planning Kenya |
| 19 | Women Enterprise Fund and Other Financing Options for Women-Led Businesses in Kenya | `/insights/women-enterprise-financing-kenya.html` | women entrepreneurship Kenya |
| 20 | Cross-Border Trade in East Africa: What SMEs Need to Know Before Exporting | `/insights/cross-border-trade-east-africa-smes.html` | business exhibition services Kenya |

Each should follow the same template as the 6 published articles: ~1,200–1,800 words, H2/H3 structure, a 3-4 question FAQ block with matching `FAQPage` schema, `Article` schema, and 2-3 internal links to Services/Events/Contact/other articles.

## 5. Local SEO — keyword-to-page mapping

| Target keyword | Primary page |
|---|---|
| Exhibition company in Kenya / Halal Expo Kenya | Homepage, About |
| Expo organizers in Nairobi | Homepage, Events |
| Trade fair organizers Kenya | Services, `insights/how-to-exhibit-trade-fair-kenya.html` |
| Corporate event organizers Kenya / Corporate conferences Nairobi | Services, `insights/corporate-event-planning-guide-kenya.html` |
| Business exhibition services Kenya | Services |
| Exhibition stand services Kenya | Services (backlog article #7) |
| SME exhibition Kenya | Services, `insights/halal-economy-africa-opportunities-smes.html` |
| Halal certification Kenya | Services, `insights/halal-certification-kenya-guide.html` |
| Business networking events Kenya | Services (backlog article #9) |
| Event branding Kenya | Services (backlog article #14) |

Kenya's three founding/operating cities (Malindi, Nairobi, Mombasa) are represented in the homepage/About/Contact copy and in Event schema `address` fields. Dedicated location landing pages (e.g. `/nairobi.html`) were intentionally scoped out of this pass — see Follow-ups.

## 6. Performance & Core Web Vitals recommendations

- All third-party libraries (GSAP, AOS, Swiper, Font Awesome, Google Fonts) load from CDNs with no `defer`/`async` or self-hosting — self-hosting the CSS/JS and adding `defer` to non-critical scripts (AOS, Swiper) would materially cut Largest Contentful Paint on a first visit.
- The homepage hero embeds a YouTube iframe as the background video — this is a common LCP/INP cost center. Consider lazy-initializing the iframe (only load YouTube's player after the page is interactive) or replacing it with a self-hosted, compressed `<video>` (the site already has local `.mp4` assets in `assets/videos/`).
- Images are largely unoptimized phone photos (`WhatsApp Image …`, `IMG-2025…`) served at full resolution with no responsive `srcset` and no WebP/AVIF variants — compressing and converting the ~30 images actually referenced in the HTML would be the single biggest Core Web Vitals win available.
- `loading="lazy"` is already applied to most below-the-fold images — good practice, no change needed.

## 7. Accessibility notes

- Color contrast: the new palette was chosen for WCAG AA body-text contrast on white (darkened grays, deepened gold). Recommend a final automated pass (e.g. Lighthouse or axe) once real content/images are in place, since accent decorative text (e.g. the giant faded numerals, marquee text) is intentionally low-contrast and should stay decorative/`aria-hidden` only.
- Interactive elements (accordions, filter tabs, hamburger menu) already use semantic `<button>`s and `aria-label`s in most places — good foundation.

## 8. Flagged for follow-up (not auto-changed)

1. **Domain confirmation** — all canonical URLs, Open Graph tags, and JSON-LD use `https://ishmarexpo.com`, matching what was already in the codebase. Confirm this is the live production domain before go-live, or update all `og:url`/canonical/schema URLs to match the real one.
2. **Image filenames** — most images are named `WhatsApp Image 2025-06-02…jpg` / `IMG-20250814-WA0409.jpg`. Renaming the ~30 actually-referenced files to descriptive, keyword-relevant names (e.g. `nairobi-halal-expo-2024-exhibitor-floor.jpg`) is a real SEO win but was not done automatically in this pass, since it touches many files and a single missed reference would silently break an image — safer as a deliberate, verified follow-up.
3. **Testimonial photos** — the 5 testimonials on the homepage use generic `pravatar.cc` stock avatar images attributed to named individuals. This predates this engagement but is worth flagging: presenting stock photos as real people's likenesses is a trust/EEAT risk if discovered. Recommend either sourcing real client photos or switching to initials-based avatars.
4. **OG images** — pages now point at existing event/team photos rather than purpose-built 1200×630 Open Graph images, since no dedicated OG images exist yet. Purpose-designed OG images (with logo + headline text baked in) would look more polished when shared on social/WhatsApp.
5. **Location landing pages** — Nairobi/Mombasa/Malindi-specific landing pages were scoped out of this pass in favor of folding that targeting into existing page copy and Event `address` schema. Worth revisiting once the events calendar is more geographically settled.
6. **Per-event dedicated pages** — the events calendar remains a single `events.html` page with strengthened `Event` schema rather than one URL per event. This is simpler to maintain now but caps how well an individual event can rank on its own; revisit if event volume grows.
7. ~~**Favicon missing**~~ — **Resolved (2026-07-20).** Generated `favicon.ico` (16/32/48px), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180px), and `icon-192.png`/`icon-512.png` from the circular "IH" mark cropped out of `Logo.png`, and linked them on all 27 pages (14 public pages + 13 admin pages).
8. **Several "TBA" events** (Nairobi Halal Traders Expo 2026, Halal Business Empowerment Forum 2026, Halal Certification & Market Access Summit, Corporate Halal Business Summit 2026) do not yet have `Event` schema, since Google's guidelines require a real `startDate` — add schema for each once dates are confirmed.

## 9. What was intentionally *not* claimed

No new statistics, testimonials, client names, certifications, or awards were invented for this pass. All numbers used (43+ events, 10,000+ attendees, 60% women-owned exhibitors, 50+ Halal-certified businesses, 1,000+ youth/entrepreneurs trained) are the figures already present in the existing site content.
