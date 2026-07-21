# Ishmar Expo Limited — Website & Admin Console

**Africa's Leading Halal Exhibition & Empowerment Company**

A premium, fully responsive multipage website (HTML5, CSS3, vanilla JavaScript ES6+, GSAP, Swiper.js, AOS) backed by **Supabase** (PostgreSQL + Auth + Storage + Row Level Security) for content management. Events, gallery, videos, sponsors, partners, testimonials, media/press mentions, event registrations, contact messages, and site settings are all editable from `/admin` without touching HTML or redeploying. See **Roadmap** below for the handful of pages/sections still intentionally static and why.

---

## Project Structure

```
ishmar-expo/
├── index.html, about.html, events.html, gallery.html,   ← Public pages
│   services.html, media.html, contact.html, insights.html
├── insights/                                             ← Blog articles (static)
│
├── admin/                          ← Admin console (Supabase-authenticated), all pages built
│   ├── login.html                  ← Sign in / create account
│   ├── dashboard.html              ← Overview + quick actions
│   ├── events.html                 ← Full event CRUD
│   ├── gallery.html                ← Full gallery CRUD + bulk upload
│   ├── videos.html                 ← YouTube/Instagram links, thumbnail, featured
│   ├── sponsors.html, partners.html ← Logo upload, website, tier/description
│   ├── testimonials.html           ← Photo, name, company, quote, featured
│   ├── media.html                  ← Press mentions: title, image, link
│   ├── registrations.html          ← Search/filter, CSV + Excel export, print
│   ├── messages.html               ← Contact inbox: unread/read/archive, reply-by-email
│   ├── users.html                  ← Role management (Super Admin only writes)
│   ├── settings.html               ← Site-wide settings
│   ├── css/admin.css               ← Admin design system
│   └── js/dashboard-shell.js       ← Shared sidebar/topbar/auth-guard/toasts
│
├── supabase/                       ← Data layer (ES modules, no build step)
│   ├── schema.sql                  ← Run 1st: tables, types, triggers
│   ├── storage-setup.sql           ← Run 2nd: storage buckets
│   ├── policies.sql                ← Run 3rd: Row Level Security
│   ├── config.js                   ← ⚠️ Put your Supabase URL/anon key here
│   ├── client.js                   ← Shared Supabase client singleton
│   ├── auth.js                     ← Sign in/up/out, session + role guards
│   ├── storage.js                  ← Upload/delete/validate helper
│   └── events.js, gallery.js, videos.js, sponsors.js,   ← CRUD + public queries,
│       partners.js, testimonials.js, media.js,             one module per content type
│       registrations.js, messages.js, settings.js
│
├── assets/
│   ├── css/main.css, animations.css
│   ├── js/main.js, animations.js   ← Original site interactivity (unchanged)
│   ├── js/dom-safe.js              ← Shared XSS-escaping helpers
│   ├── js/dynamic-home.js          ← Loads hero text/stats/events into index.html
│   ├── js/dynamic-events.js        ← Loads the events.html grid
│   ├── js/dynamic-gallery.js       ← Loads the gallery.html masonry grid
│   ├── js/dynamic-videos.js        ← Featured-videos grid (index.html + media.html)
│   ├── js/dynamic-partners.js      ← Sponsor/partner logo marquee (index.html)
│   ├── js/dynamic-testimonials.js  ← Homepage testimonial carousel
│   ├── js/dynamic-media.js         ← Press-mentions grid (media.html)
│   ├── js/event-registration.js    ← In-page registration modal (events.html)
│   ├── js/contact-form.js          ← Wires contact.html's form to contact_messages
│   └── images/, videos/
│
├── sitemap.xml, robots.txt
├── SEO-GEO-AUDIT.md                ← SEO/GEO audit from the redesign pass
└── package.json
```

---

## How the dynamic pages work (read this before editing)

There is **no build step**. `supabase/*.js` and `assets/js/dynamic-*.js` are plain ES modules loaded via `<script type="module">`; `@supabase/supabase-js` loads from a CDN (`jsdelivr`), the same pattern already used for GSAP/AOS/Swiper.

Each public page keeps its original static HTML as the first paint, and a `dynamic-*.js` module then fetches from Supabase and replaces the relevant section's contents (hero text, stat counters, the events grid, the gallery grid). If Supabase is unreachable, the page simply keeps showing its static fallback content instead of breaking — check the browser console for `[dynamic-*]` log lines if something isn't updating.

**Intentionally still static** (see Roadmap for why and what's planned):
- The hero's animated word-by-word headline ("Where Africa Meets the Halal World") — GSAP captures those spans as fixed references before any async data can arrive, so this specific animation would break if the words became dynamic. The eyebrow line and subtitle above/below it *are* dynamic.
- The "Featured Event Spotlight" narrative section on events.html (hand-written two-column copy, not a simple field mapping) and the "Interviews" section on media.html (has outlet/byline/date fields the `media` table doesn't carry — see Roadmap).
- about.html and services.html — team bios and service descriptions aren't backed by a table in the spec (there's no `team`/`services` table), so these stay hand-authored. contact.html's form now submits live to `contact_messages`; its office/contact info is still hardcoded rather than settings-driven.
- The Insights blog — static by design (SEO/GEO long-form content, not day-to-day admin content).

---

## Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New Project. Note your **Project URL** and **anon/public key** from Project Settings → API — you'll need them in step 3.

### 2. Run the SQL migrations, in this exact order
Open the Supabase Dashboard → SQL Editor, and run each file's contents as a new query:

1. `supabase/schema.sql` — creates all tables, the `user_role` enum, triggers, and seeds default `settings` rows.
2. `supabase/storage-setup.sql` — creates the 7 storage buckets (`gallery`, `videos`, `documents`, `sponsors`, `partners`, `team`, `media`) with size/MIME-type limits.
3. `supabase/policies.sql` — enables Row Level Security and creates every access policy (database + storage).

### 3. Configure the site
Edit `supabase/config.js` and replace the two placeholder values:

```js
export const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-PUBLIC-ANON-KEY';
```

The anon key is safe to ship in client code — it's meaningless without the RLS policies from step 2, which are what actually protect your data. **Never** put your `service_role` key in this file, anywhere in `/admin`, or in any file that ships to the browser.

### 4. Create your first Super Admin
There's no client-safe way to create the first admin (that would let anyone self-promote). One-time setup:

1. Open `admin/login.html` locally (see "Local development" below), click **Create Account**, and sign up with your real email.
2. In the Supabase SQL Editor, run:
   ```sql
   update public.users set role = 'super_admin' where email = 'you@example.com';
   ```
3. Sign in at `admin/login.html`. You now have full access, and can promote every future admin from **Users** in the sidebar — no SQL or service_role key needed again.

### 5. Local development
This is a static site — any static file server works:

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:<port>/index.html` (public site) or `/admin/login.html` (admin console).

### 6. Deploy to Vercel
No build configuration needed — Vercel serves static files out of the box.

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo in the Vercel dashboard and deploy with default settings (no framework preset, no build command).

---

## Roles

| Role | Can do |
|---|---|
| `super_admin` | Everything, including changing other users' roles |
| `admin` | Everything except changing roles |
| `editor` | Create/edit events, gallery, videos, sponsors, partners, testimonials, media |
| `event_manager` | Create/edit/delete events; read/manage registrations |
| `media_manager` | Create/edit/delete gallery images and videos |
| `viewer` | Read-only access to the admin console |
| `pending` | Default for new signups — no admin access until promoted |

The full policy-by-policy breakdown is in `supabase/policies.sql`; the client-side mirror (used only to hide/show UI, never a security boundary) is in `supabase/auth.js`.

---

## Adding admins day-to-day

1. New person signs up at `admin/login.html` → they get `role = 'pending'` automatically (see `handle_new_user()` trigger in `schema.sql`) and cannot access anything yet.
2. A Super Admin opens **Users** in the sidebar and changes their role in the dropdown.
3. They sign in again (or refresh) and now have access matching their new role.

---

## Roadmap

**Phase 1 + Phase 2 are both complete.** Every content type in the original spec (events, gallery, videos, sponsors, partners, testimonials, media/press, registrations, contact messages, settings, users) has a working `supabase/*.js` module, a full admin CRUD page, and public-page wiring. What's left is smaller, lower-priority polish:

- **Dynamic hero headline** — the word-by-word GSAP reveal stays hardcoded (see "Intentionally still static" above); rebuild it to regenerate `.hero-word`/`.hero-word-inner` spans from dynamic text *before* `heroAnimations()` runs (e.g. by inlining the settings fetch as a blocking script instead of a deferred module) if this is ever wanted.
- **media.html "Interviews" section** — intentionally left static; the `media` table only has `title`/`image`/`link`, not the `outlet`/`byline`/`date` fields those cards use. Extending the schema with those columns (or reusing this table more loosely) would be needed to make it dynamic without losing detail.
- **about.html / services.html rewiring** — team bios and service package descriptions aren't backed by any table in the current schema (there's no `team` or `services` table), so they stay hand-authored content. Adding tables for these would follow the exact same module + admin-page + public-wire pattern as everything else, if wanted later.
- **contact.html office/contact info from `settings`** — the form now submits live to `contact_messages`, but the phone/email/address block on the page itself is still hardcoded rather than pulling from the `settings` table the way `index.html`'s footer does.
- **Users page polish** — currently role-only; could add profile editing or an activity log.
- **Realtime subscriptions** — `subscribeToEvents`/`subscribeToGallery`/`subscribeToVideos` exist but aren't wired into any page yet (would let the public site update live without a refresh when an admin publishes something).

---

## Security notes

- Every table has Row Level Security enabled with deny-by-default policies (`supabase/policies.sql`) — nothing in the JS layer is a real security boundary, it's UX only.
- File uploads are validated twice: client-side in `supabase/storage.js` (fast feedback) and server-side via each bucket's `file_size_limit`/`allowed_mime_types` (`supabase/storage-setup.sql`) — the server-side check is what actually matters.
- All DB-sourced text is HTML-escaped before being injected into the page (`assets/js/dom-safe.js` on the public site, `escapeHtml`/`safeUrl` exported from `admin/js/dashboard-shell.js` in the admin console) to prevent stored-XSS via event titles, captions, names, etc. URLs are scheme-checked (`http`/`https` only) before being used in `href`/`src`.
- Postgres constraints (`email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'`, `payment_status`/`contact_messages.status` enums, `end_date >= start_date`) provide defense-in-depth against malformed data regardless of what the client sends — combined with Supabase's parameterized query layer, this is what prevents SQL injection (there is no raw/string-concatenated SQL anywhere in this codebase).

---

## SEO / GEO

Unchanged from the previous redesign pass — see `SEO-GEO-AUDIT.md` for the full audit, the local-SEO keyword map, and the content backlog. Note the trade-off documented there: structured data (JSON-LD) is still static HTML for crawler reliability; only the *visible* content on index/events/gallery is now Supabase-driven.

---

## Design System

### Color Palette (current — white theme)
```css
--white:  #FFFFFF   /* Primary background */
--primary: #F8F9FA  /* Light gray sections */
--ink:    #12141C   /* Primary text */
--gold:   #B8901E   /* Brand accent */
--dark:   #0B1220   /* Intentional dark accent bands: hero, page headers, footer */
```

### Typography
- **Display / Headings**: Playfair Display
- **Navigation / Labels**: Montserrat
- **Body Text**: Inter

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome / Safari | ✅ Full |

`supabase-js` v2 and ES modules require a modern evergreen browser (no IE11 support).

---

## License

Built exclusively for **Ishmar Expo Limited**. © 2026 Ishmar Expo Limited. All rights reserved.
