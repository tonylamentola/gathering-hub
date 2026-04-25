## Gathering Hub Handoff

Repo:
- `/tmp/gathering-hub`

Current local review URL:
- `http://localhost:3000`

Current state:
- This is not live-only work. The user is reviewing localhost and has repeatedly hit stale dev-server behavior.
- `next dev` / Turbopack has been flaky in this repo. We had to clear `.next` and restart multiple times because browser output was lagging behind actual source changes.
- Do not trust “it should be updated” unless you verify either in the browser the user is looking at or from a fresh server/build path.

## What Was Fixed

### Content API bug
`src/app/api/content/route.ts`

Two important bugs were fixed in the GET handler:
- local dev no longer calls `kv.get()` unconditionally when KV env vars are missing
- KV data is now authoritative when present; GET no longer merges KV + file and re-injects deleted items

Desired behavior now:
- local dev with no KV: read/write file
- production with KV: read/write KV
- file is seed only

### Homepage upcoming strip
`src/app/page.tsx`
`src/app/globals.css`

Changes made:
- strip now sorts `upcomingItems` newest to oldest before taking top 4
- section title is `What’s Happening at The Hub`
- earlier forced flyer-style `4:3` crop was replaced with a smaller event-card row:
  - thumbnail on the left
  - date / title / copy on the right

Important:
- User said the earlier flyer crop “looked the same” even after changes
- that was likely stale localhost behavior, but do not assume it is resolved until visually confirmed

### Upcoming page status labels
`src/app/upcoming/page.tsx`

Changes made:
- public `/upcoming` items no longer all show `Upcoming`
- status now resolves to:
  - `Coming Up`
  - `Past Event`
  - `Date To Be Announced`
- dates are formatted more cleanly

### Life at the Hub section on `/upcoming`
`src/app/upcoming/page.tsx`

Changes made:
- `Life at the Hub` now includes saved `lifeAtHubPhotos`
- plus past upcoming items with images are folded in as `Past Highlight`
- this was done because the user said relevant photos were not showing there

## Current Open Questions / User Feedback

The user’s latest concerns before this handoff:
- “Upcoming page is still showing upcoming on events that passed.”
- “I dont like the crop on the front page now, come up with a different idea.”
- “Life of the hub isnt showing up on all relevant photos of that section.”

I implemented code changes intended to address all 3, and `npm run build` passes, but I have not gotten a clean user-confirmed visual pass after the latest changes.

## Likely Next Steps

1. Visually confirm localhost after a hard refresh:
- `http://localhost:3000`
- `http://localhost:3000/upcoming`

2. Specifically verify:
- homepage strip now reads as event cards, not cropped flyers
- `/upcoming` past items say `Past Event`
- `Life at the Hub` includes both dedicated life photos and past event highlights

3. If the homepage strip still feels wrong:
- next fallback idea should be even simpler:
  - remove flyer thumbnails entirely from the homepage strip
  - use compact text cards with date + title + one short line
  - keep full flyer visuals only on `/upcoming`

That is probably the safest UX if mixed aspect ratios keep fighting the homepage.

## Other Relevant Notes

- Reviews were added to `data/content.json`
- New event flyers were loaded into `upcomingItems`
- `Line Dancing` should live in `Upcoming`, not `Life at the Hub`
- User wants this very customer-facing and intuitive
- User is sensitive to changes not appearing; prefer clear visible diffs and minimal guesswork

## Files Most Relevant Right Now

- `/tmp/gathering-hub/src/app/page.tsx`
- `/tmp/gathering-hub/src/app/upcoming/page.tsx`
- `/tmp/gathering-hub/src/app/globals.css`
- `/tmp/gathering-hub/src/app/api/content/route.ts`
- `/tmp/gathering-hub/data/content.json`
