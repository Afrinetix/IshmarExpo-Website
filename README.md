# Ishmar Expo Limited — Website & Admin Console

**Africa's Leading Halal Exhibition & Empowerment Company**

A premium, fully responsive multipage website (HTML5, CSS3, vanilla JavaScript ES6+, GSAP, Swiper.js, AOS) now backed by **Supabase** (PostgreSQL + Auth + Storage + Row Level Security) for content management — events, gallery, and site settings are editable from `/admin` without touching HTML or redeploying. See **Roadmap** below for what's still static and planned next.

---

## Project Structure

```
ishmar-expo/
├── index.html, about.html, events.html, gallery.html,   ← Public pages
│   services.html, media.html, contact.html, insights.html
├── insights/                                             ← Blog articles (static)
│
├── admin/                          ← Admin console (Supabase-authenticated)
│   ├── login.html                  ← Sign in / create account
│   ├── dashboard.html              ← Overview + quick actions
│   ├── events.html                 ← Full event CRUD (built)
│   ├── gallery.html                ← Full gallery CRUD + bulk upload (built)
│   ├── settings.html               ← Site-wide settings (built)
│   ├── users.html                  ← Role management (built — Super Admin only writes)
│   ├── videos.html, sponsors.html, partners.html,        ← Phase 2 (shell + nav
│   │   testimonials.html, media.html, registrations.html,   built, CRUD not yet —
│   │   messages.html                                        see Roadmap)
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
│   ├── events.js, gallery.js,      ← CRUD + public queries per content type
│   │   settings.js
│
├── assets/
│   ├── css/main.css, animations.css
│   ├── js/main.js, animations.js   ← Original site interactivity (unchanged)
│   ├── js/dom-safe.js              ← Shared XSS-escaping helpers
│   ├── js/dynamic-home.js          ← Loads hero text/stats/events into index.html
│   ├── js/dynamic-events.js        ← Loads the events.html grid
│   ├── js/dynamic-gallery.js       ← Loads the gallery.html masonry grid
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

**Intentionally still static in Phase 1** (see Roadmap for why and what's planned):
- The hero's animated word-by-word headline ("Where Africa Meets the Halal World") — GSAP captures those spans as fixed references before any async data can arrive, so this specific animation would break if the words became dynamic. The eyebrow line and subtitle above/below it *are* dynamic.
- The "Featured Event Spotlight" narrative section on events.html (hand-written two-column copy, not a simple field mapping).
- about.html, services.html, media.html, contact.html, and the Insights blog — not wired to Supabase yet.
- Videos, Sponsors, Partners, Testimonials, Media, Registrations, and the Contact form — tables/RLS/storage exist, admin CRUD UI doesn't yet.

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

## Roadmap (Phase 2)

Same proven pattern as Events/Gallery (a `supabase/*.js` module + an admin CRUD page + a public-page rewire) applied to the remaining content types. Their tables, RLS policies, and storage buckets already exist — only the admin UI and public-page wiring are left:

- **Videos** — YouTube/Instagram links, thumbnails, featured toggle → wires into `index.html`'s video showcase and `media.html`.
- **Sponsors / Partners** — logo upload, website, tier/description → wires into the homepage partner marquee.
- **Testimonials** — photo, name, company, quote, featured toggle → wires into the homepage testimonial carousel.
- **Media & Press** — press mentions (title, image, link) → wires into `media.html`.
- **Registrations** — public registration form embedded on `events.html` (insert-only, RLS already enforces this), plus the admin Registrations page: search, filter by event, CSV export (native `Blob`, no dependency), Excel export (SheetJS via CDN), print attendee list.
- **Messages** — wire `contact.html`'s form to `contact_messages` (insert-only), plus the admin inbox: unread/read/archive, search, reply-by-email (`mailto:` link).
- **Users page polish** — currently role-only; could add profile editing, activity log.
- **Dynamic hero headline** — if wanted, rebuild the GSAP word-reveal to regenerate `.hero-word`/`.hero-word-inner` spans from dynamic text *before* `heroAnimations()` runs (e.g. by inlining the settings fetch as a blocking script instead of a deferred module) rather than after.
- **Rewire remaining pages** — about.html (team bios, stats), services.html (already rich static content — lower priority), contact.html (office list, socials from `settings`).

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
