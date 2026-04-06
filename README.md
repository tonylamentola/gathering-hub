# Gathering Hub CMS

Customer-facing website and lightweight admin portal for The Gathering Hub in Ithaca, Michigan.

## Quick Start

```bash
npm install
npm run dev
```

Local app:
- `http://localhost:3000`

Important routes:
- `/` public landing page
- `/menu` menu and gallery
- `/events` events page
- `/blog` blog index
- `/admin` customer portal / content admin

## Live Source Of Truth

Read these first before deploying or onboarding:
- [DEPLOY.md](/tmp/gathering-hub/DEPLOY.md)
- [CUSTOMER_ONBOARDING.md](/tmp/gathering-hub/CUSTOMER_ONBOARDING.md)

## How Content Works

- Primary content source: Vercel KV via [src/app/api/content/route.ts](/tmp/gathering-hub/src/app/api/content/route.ts)
- Fallback content source: [data/content.json](/tmp/gathering-hub/data/content.json)
- Admin writes update KV, not the local filesystem
- Build-time JSON is a backup/default, not the normal live editing path

## How Uploads Work

- Upload endpoint: [src/app/api/upload/route.ts](/tmp/gathering-hub/src/app/api/upload/route.ts)
- Uploaded files are written to [public/uploads](/tmp/gathering-hub/public/uploads)
- Uploaded image URLs are served from `/uploads/...`

Important:
- If photos disappear, check the upload flow and deployment target before changing page code
- If content looks stale, check KV/envs before editing `data/content.json`

## Deploy

This repo should stay linked to the live Vercel project named `gathering-hub-cms`.

Typical flow:

```bash
npm run build
npx vercel deploy --prod
```

After deploy:
- open homepage
- open `/menu`
- open `/admin`
- verify one known `/uploads/...` image loads
- verify content edits still save and reload
