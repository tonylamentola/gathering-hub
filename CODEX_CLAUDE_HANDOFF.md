# Gathering Hub Handoff

## Current Status

- Live site: `https://gathering-hub-cms.vercel.app`
- Local dev preview: `http://localhost:3000`
- Current working branch: `codex/gathering-portal-snapshot`
- Latest work is focused on customer-facing polish for launch readiness

## What Was Just Finished

- Homepage now uses a cleaner named image system under `public/images`
- Homepage copy was upgraded for clarity and conversion:
  - stronger hero headline/subtext
  - clearer CTA wording
  - trust chips under hero buttons
  - more specific event/gallery/contact copy
- About section image was switched to `Ribbon.jpg`
- Temporary homepage review overlay was added via `?guide=1`
  - example: `http://localhost:3000/?guide=1`

## What We Are Working On Right Now

- Final homepage photo selection and placement
- Reviewing each visible image section with the user:
  - Hero
  - Upcoming Strip
  - Homepage Grid
  - About
- Fixing small visual polish issues as they come up
  - most recent fix: hero trust-chip text contrast

## Important File Paths

- Homepage: `src/app/page.tsx`
- Homepage styles: `src/app/globals.css`
- Named homepage images: `public/images`
- Raw uploaded images: `public/uploads`
- Photo drop folder from user: `/Users/anthonylamentola/Documents/New project/GatheringHub-photo-drop`

## Notes For Claude

- User wants launch/customer-facing polish prioritized over internal dashboard/security work
- Keep changes token-efficient and scoped
- Prefer small surgical edits over broad redesigns
- When discussing homepage sections with the user, use the `?guide=1` labeled view
- User is actively reviewing visuals and may want photo-by-photo swaps
