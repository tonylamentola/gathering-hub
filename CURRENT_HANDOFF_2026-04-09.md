## Gathering Hub Handoff

Repo:
- `/tmp/gathering-hub`

Current local review URL:
- `http://localhost:3000`

Current focus:
- customer-facing polish
- localhost review only
- not live/deploy-first work

## What Was Completed

### Homepage
- Homepage is server-rendered now, not a `use client` shell.
- Canonical, Open Graph, and Twitter metadata are in `src/app/layout.tsx`.
- LocalBusiness/EventVenue JSON-LD is in `src/app/page.tsx`.
- Hero/event/photos/about/amenities/reviews/contact structure is in place.
- Review stat was softened from a hard `100% 5-Star Reviews` claim to a safer trust signal.
- Broken Facebook link behavior was removed; if Facebook URL is blank, the site hides that link instead of linking to `#`.
- Maps URL now has a real Google Maps fallback in saved settings.
- Added `Request a Quote` next to `Check Availability`.

### Upcoming / Life at the Hub
- `/upcoming` has real status logic:
  - `Coming Up`
  - `Past Event`
  - `Date To Be Announced`
- `What’s Coming Up` was changed to `What’s Happening at the Hub`.
- Upcoming items sort newest to oldest.
- Past highlight duplication was removed from `Life at the Hub`.
- `Life at the Hub` is back to only showing actual gallery/life photos.

### Menu
- Menu was upgraded from one flat grid into grouped sections:
  - `Featured Food`
  - `Cafe Favorites`
  - `Sweet Treats`
- Existing menu items are auto-grouped heuristically if they do not yet have a category saved.
- Portal now has a `Menu section` dropdown for menu items so new edits can tag them explicitly.
- Bottom menu CTA text was centered more cleanly.
- Menu intro copy was rewritten to be customer-facing, not internal/product-language.

### Blog
- Blog now supports an uploaded photo in the admin portal.
- Blog list page and blog post page render the uploaded image.
- The public blog post image was reduced so it behaves like a calmer article header rather than a giant zoomed portrait block.

### Trust polish
- Added favicon metadata and a static SVG favicon at:
  - `/tmp/gathering-hub/public/favicon.svg`

## Important Known Friction

### Dev server / stale localhost
This repo has repeatedly had stale local dev behavior.

Symptoms:
- source files are updated correctly
- browser still shows old output
- restarting `next dev` or even clearing `.next` has sometimes been required

So:
- do not assume the browser is showing the latest code unless refreshed after a clean restart
- if something “still looks old,” verify whether localhost is stale before changing more code

### Facebook URL
- The real Facebook page URL is still not stored in repo content/settings.
- Current behavior hides Facebook links when blank.
- This is safer than linking to `#`, but the real URL still needs to be filled in later.

## Files Most Relevant Right Now

- `/tmp/gathering-hub/src/app/page.tsx`
- `/tmp/gathering-hub/src/app/upcoming/page.tsx`
- `/tmp/gathering-hub/src/app/menu/page.tsx`
- `/tmp/gathering-hub/src/app/blog/page.tsx`
- `/tmp/gathering-hub/src/app/blog/[slug]/page.tsx`
- `/tmp/gathering-hub/src/app/admin/page.tsx`
- `/tmp/gathering-hub/src/app/layout.tsx`
- `/tmp/gathering-hub/src/lib/content.ts`
- `/tmp/gathering-hub/data/content.json`

## Best Next Checks

1. Hard refresh:
- `http://localhost:3000`
- `http://localhost:3000/menu`
- `http://localhost:3000/upcoming`
- `http://localhost:3000/blog`

2. Verify:
- menu intro is centered properly
- menu sections feel intentional
- upcoming cards show correct status labels
- life gallery no longer feels redundant
- blog post page no longer feels like “just a zoomed picture”

3. If localhost still looks stale:
- restart `npm run dev`
- if necessary clear `.next`

## Current Product Judgment

The site is in much better shape than the earlier “empty shell” critiques suggested. The main remaining customer-facing gaps are:
- real Facebook URL
- final content/photo choices
- possible quote/pricing refinement
- continued localhost sanity checks because the dev loop has been unreliable

## Latest UX Pass

Latest committed UX batch on `codex/gathering-portal-snapshot`:
- commit: `3dfef85`
- message: `Refine Gathering Hub customer-facing UX`

This pass includes:
- shared header logo on public pages
- real logo favicon
- active nav highlighting and mobile nav auto-close
- cleaner decorative line icons on homepage sections
- updated homepage event labels including `Reunions & Game Nights`
- `Upcoming` flyer generation flow with review states
- OpenRouter flyer route using the provided logo reference
- mobile quote-form sizing cleanup

Intentionally not included in that commit:
- generated test flyer files under `public/uploads`
- `.claude/`
- unrelated local content state
