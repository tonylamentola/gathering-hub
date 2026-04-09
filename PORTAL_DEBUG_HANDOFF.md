# Portal Debug Handoff

## Current Goal
Make the Gathering Hub admin portal at `/admin` fully reflect real editable content for:
- Blog
- Events
- Amenities
- Upcoming
- Reviews
- Quick Updates
- Menu
- Life at the Hub

The user says this is still **not working** after multiple fixes. They want fresh eyes on why the portal still feels disconnected from the actual site content.

## Current Symptom
From the user's perspective, the portal still does not behave like the source of truth:
- newly added upcoming events did not reliably appear in the portal
- sections like events/upcoming/reviews felt "not connected"
- edit/delete behavior did not seem trustworthy

Most recent user message:
- "write a hand off that still didnt work i need new eyes"

## Repo / Local Runtime
- Repo: `/tmp/gathering-hub`
- Branch in use before this note: `codex/gathering-portal-snapshot`
- Local dev server was restarted and is currently expected on:
  - `http://localhost:3000`

## What Was Already Fixed

### 1. SEO / server rendering
Done locally:
- homepage no longer a client-only shell
- canonical / OG / Twitter metadata added
- LocalBusiness/EventVenue JSON-LD added
- `menu`, `events`, `upcoming` pages cleaned up for SEO/server rendering

Key files:
- `/tmp/gathering-hub/src/app/page.tsx`
- `/tmp/gathering-hub/src/app/layout.tsx`
- `/tmp/gathering-hub/src/app/menu/page.tsx`
- `/tmp/gathering-hub/src/app/events/page.tsx`
- `/tmp/gathering-hub/src/app/upcoming/page.tsx`
- `/tmp/gathering-hub/src/lib/content.ts`

### 2. Reviews restored
Real reviews were added into:
- `/tmp/gathering-hub/data/content.json`

### 3. Upcoming flyer files are present
The uploaded files are on disk in:
- `/tmp/gathering-hub/public/uploads`

Examples:
- `upcoming-cookie-easter.jpeg`
- `upcoming-bingo-night.png`
- `upcoming-cookie-adults-only.jpg`
- `upcoming-cookie-valentine.jpg`
- `upcoming-painting-with-twist.png`
- `upcoming-cookie-thanksgiving.png`

### 4. Portal improvements already made
In `/tmp/gathering-hub/src/app/admin/page.tsx`:
- added clearer `Upcoming` vs `Life at the Hub` wording
- added `Coming Up` / `Past Event` labels for upcoming items
- added `Amenities` tab
- added review editing
- removed hardcoded menu/life fallback injection inside portal normalization

### 5. Content merge logic updated
In `/tmp/gathering-hub/src/lib/content.ts`:
- merge logic now includes:
  - `events`
  - `amenities`
  - `menuItems`
  - `lifeAtHubPhotos`
  - `upcomingItems`
  - `reviews`
  - `announcements`

In `/tmp/gathering-hub/src/app/api/content/route.ts`:
- `GET` merges KV content with local file content
- `POST` was changed back to save the explicit posted body directly, to avoid re-injecting fallback content on write

## Most Important Discovery
The user's complaint may not be purely code logic. There was strong evidence of stale runtime state:

1. The dev server on port `3000` had likely become stale.
2. It was restarted successfully:
   - local output showed `http://localhost:3000`
3. Before restart, behavior the user described did not line up with the current checked-out code.

This means the remaining issue may be one of:
- stale browser/client state
- portal rendering path still loading stale API data
- local KV vs file-based content mismatch
- a runtime issue only visible in the browser

## Current File Data Snapshot
At the time of last check, `/tmp/gathering-hub/data/content.json` contained:
- `events`: 4
- `amenities`: 4
- `menuItems`: 9
- `lifeAtHubPhotos`: 4
- `upcomingItems`: 6
- `reviews`: 5
- `announcements`: 0

So if the portal still does not show/edit these properly, the issue is no longer "missing data in the file."

## Likely Fault Lines To Investigate

### A. `/api/content` response in dev
Need to verify what the browser is actually receiving from:
- `/api/content`

This was not fully confirmed from the sandbox because `curl http://localhost:3000/api/content` failed from here even while the app was running in the user's browser.

Fresh eyes should inspect:
- browser network tab for `/api/content`
- whether response payload actually includes:
  - `events`
  - `amenities`
  - `upcomingItems`
  - `reviews`

### B. Client-side normalization / stale state
Main portal load path:
- `loadContent()` in `/tmp/gathering-hub/src/app/admin/page.tsx`
- fetches `/api/content`
- passes result through `normalizeContent()`

Need to confirm:
- `normalizeContent()` is not dropping fields unexpectedly
- state is not being overwritten after initial load
- edit/save handlers are mutating the expected arrays

### C. KV vs file mismatch
The app is designed to prefer KV when configured.

Need to verify whether local dev has KV envs active through `.env.local`.
If so:
- browser may be loading stale KV content
- site pages and admin may still appear inconsistent even though `data/content.json` is correct

Relevant files:
- `/tmp/gathering-hub/src/lib/kv.ts`
- `/tmp/gathering-hub/src/lib/content.ts`
- `/tmp/gathering-hub/src/app/api/content/route.ts`

### D. Browser-only state issue
Because the user repeatedly reported behavior that did not match current code, fresh eyes should test:
- hard refresh
- private window
- different browser
- inspect React state after `/api/content` returns

## Suggested Next Debug Steps
1. Open `/admin`
2. Open browser devtools network tab
3. Inspect `/api/content` JSON response
4. Confirm whether `events`, `amenities`, `upcomingItems`, and `reviews` are present in that payload
5. If payload is correct, inspect React state after `setContent(normalizeContent(data))`
6. If payload is stale, determine whether it is coming from KV or another cached source
7. Verify edit button path for one known section, preferably `Upcoming`

## Specific User Frustration To Respect
The user does not want more speculative changes piled on top while the portal still feels broken.
They specifically asked for:
- a handoff
- fresh eyes

So the right next move is probably debugging the live portal data path in browser/devtools, not adding more features.
