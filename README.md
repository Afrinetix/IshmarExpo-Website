# Ishmar Expo Limited — Premium Website

**East Africa's Premier International Expo & Events Company**

A fully responsive, premium multipage website built with HTML5, CSS3, JavaScript, GSAP animations, Swiper.js, and AOS scroll animations.

---

## Project Structure

```
ishmar-expo/
├── index.html          ← Home page
├── about.html          ← About Us
├── events.html         ← Events Calendar
├── gallery.html        ← Photo & Video Gallery
├── services.html       ← Services & Packages
├── media.html          ← Media / Press Center
├── contact.html        ← Contact & Offices
├── sitemap.xml         ← SEO sitemap
├── robots.txt          ← Search engine rules
├── README.md           ← This file
└── assets/
    ├── css/
    │   ├── main.css        ← Complete design system
    │   └── animations.css  ← Animation styles & keyframes
    ├── js/
    │   ├── main.js         ← Core functionality
    │   └── animations.js   ← GSAP ScrollTrigger animations
    ├── images/         ← Replace placeholders with actual brand images
    ├── videos/         ← Local video assets
    └── social/         ← Downloaded social media assets
```

---

## Technologies Used

| Library       | Version | Purpose                          |
|---------------|---------|----------------------------------|
| GSAP          | 3.12.5  | Premium animations & ScrollTrigger |
| Swiper.js     | 11.x    | Touch-friendly carousels         |
| AOS           | 2.3.1   | Scroll-triggered reveal effects  |
| Font Awesome  | 6.5.0   | Icons throughout the site        |
| Google Fonts  | —       | Playfair Display, Montserrat, Inter |

---

## Design System

### Color Palette
```css
--dark:       #070B16   /* Primary dark background */
--primary:    #0A1525   /* Section backgrounds */
--secondary:  #142240   /* Card/panel backgrounds */
--gold:       #C9A227   /* Brand accent — gold */
--gold-light: #E8C84A   /* Lighter gold highlights */
--gold-dark:  #9B7D1A   /* Deeper gold shadows */
--white:      #FFFFFF   /* Text, icons */
--gray:       #8A94A6   /* Muted text */
```

### Typography
- **Display / Headings**: Playfair Display (serif — luxury, cinematic)
- **Navigation / Labels**: Montserrat (modern, corporate)
- **Body Text**: Inter (clean, readable)

### Key Features
- Cinematic preloader with animated logo
- Custom gold cursor with magnetic effect
- Fullscreen YouTube video hero with fallback gradient
- GSAP ScrollTrigger scroll-based animations
- Swiper.js carousels (testimonials, events, partners)
- AOS reveal animations
- Masonry photo gallery with lightbox
- Video lightbox (YouTube embed)
- Gallery category filter
- Events filter (status + category)
- Animated stat counters
- Typewriter text effect
- Floating particle system on hero
- WhatsApp floating CTA
- Back to top button
- Scroll progress indicator
- Mobile-first responsive design
- Sticky translucent navbar
- Accordion FAQ
- Sponsorship packages table
- Contact form with inquiry types
- Google Maps embed
- Press downloads section
- Social media connect cards
- Partner logo marquee scroll

---

## Setup Instructions

### Local Development

1. **Clone / Download** the project folder to your computer

2. **Open with Live Server** (VS Code extension recommended):
   - Install "Live Server" extension in VS Code
   - Right-click `index.html` → "Open with Live Server"
   - Site opens at `http://localhost:5500`

3. **Or simply open** `index.html` directly in any modern browser
   - Note: Some features (Google Fonts, CDN libraries) require internet connection

---

## Deployment Instructions

### Option 1: Netlify (Recommended — Free)
1. Go to [netlify.com](https://netlify.com) and create account
2. Drag the entire `ishmar-expo` folder into Netlify's deploy dropzone
3. Site is live instantly at a `.netlify.app` URL
4. Connect custom domain in Netlify settings

### Option 2: GitHub Pages (Free)
```bash
git init
git add .
git commit -m "Initial Ishmar Expo website"
git branch -M main
git remote add origin https://github.com/yourusername/ishmar-expo.git
git push -u origin main
```
- Enable GitHub Pages in repo Settings → Pages → Deploy from `main` branch

### Option 3: cPanel / Traditional Hosting
1. Compress the `ishmar-expo` folder as a ZIP
2. Upload via cPanel File Manager to `public_html/`
3. Extract and ensure `index.html` is at the root

---

## Customization Guide

### Replacing Placeholder Images
All images use Unsplash placeholders. Replace with actual Ishmar Expo photos:
1. Add images to `/assets/images/`
2. Update `src=""` attributes in each HTML file
3. Recommended sizes:
   - Hero: 1920×1080px minimum
   - Event cards: 800×500px
   - Gallery: Mixed heights (masonry)
   - Team photos: 400×500px (portrait)

### Adding Local Images from Desktop
Copy images from `C:\Users\paul\Desktop\ISHMAR EXPO\` to `/assets/images/` and update image references:
```html
<!-- Change from: -->
<img src="https://images.unsplash.com/..." />
<!-- To: -->
<img src="assets/images/your-photo.jpg" />
```

### Updating Contact Information
Search and replace in all HTML files:
- `+254 700 000 000` → actual phone number
- `info@ishmarexpo.com` → actual email
- `Westlands Business Centre, 5th Floor` → actual address
- `https://wa.me/254700000000` → actual WhatsApp number

### Adding Real Social Media Links
Update all social links from placeholder URLs to actual profiles:
```html
href="https://www.instagram.com/ishmarexpo"
href="https://www.facebook.com/ishmarexpo"
href="https://www.youtube.com/@ishmarexpo"
href="https://www.linkedin.com/company/ishmarexpo"
href="https://www.tiktok.com/@ishmarexpo"
```

### Updating YouTube Videos
The hero video and featured videos use YouTube embed ID `WT8jMjQo_to`.
To use different videos, update the `data-video` attribute:
```html
<div class="video-card" data-video="YOUR_VIDEO_ID" data-platform="youtube">
```

### Google Maps
Update the Maps iframe `src` in `contact.html` with your actual office coordinates.

---

## SEO Configuration

Update these in every HTML page `<head>`:
```html
<meta name="description" content="Your actual description" />
<meta property="og:url" content="https://youractualdomain.com/" />
<meta property="og:image" content="assets/images/og-home.jpg" />
```

Update `sitemap.xml` with your actual domain:
```xml
<loc>https://youractualdomain.com/</loc>
```

---

## Performance Tips

1. **Compress images** before uploading using [TinyPNG](https://tinypng.com/)
2. **Convert images to WebP** format for ~30% smaller files
3. **Host locally** (copy CDN scripts to `/assets/js/vendor/`) for offline use
4. **Enable GZIP** compression on your hosting server
5. **Set cache headers** for static assets (images, CSS, JS)

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Full |

---

## License

This website was built exclusively for **Ishmar Expo Limited**.
All design, code, and content © 2026 Ishmar Expo Limited. All rights reserved.

---

*Built with precision and passion for Ishmar Expo Limited.*
