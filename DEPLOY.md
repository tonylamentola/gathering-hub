# Deploy Guide

## Canonical Project

- GitHub repo: `tonylamentola/gathering-hub`
- Vercel project: `gathering-hub-cms`
- Public site: `https://gathering-hub-cms.vercel.app`
- Admin portal: `https://gathering-hub-cms.vercel.app/admin`

Important:
- There is also a separate Vercel project named `gathering-hub`
- Do not deploy customer-facing updates there unless you intentionally mean to create a separate site
- The live customer site currently belongs to `gathering-hub-cms`

## Deployment Truth

The repo-level `.vercel/project.json` should point at `gathering-hub-cms`.

Before deploying, verify:

```bash
cat .vercel/project.json
```

Expected project name:
- `gathering-hub-cms`

If it points somewhere else:

```bash
npx vercel link --project gathering-hub-cms
```

## Production Deploy

```bash
npm install
npx next build --webpack
npx vercel deploy --prod
```

Why `--webpack` locally:
- local sandbox/build environments can fail under Turbopack even when Vercel production succeeds
- webpack is the safer local verification path

## Post-Deploy Checks

Open and verify:
- `https://gathering-hub-cms.vercel.app/`
- `https://gathering-hub-cms.vercel.app/menu`
- `https://gathering-hub-cms.vercel.app/events`
- `https://gathering-hub-cms.vercel.app/blog`
- `https://gathering-hub-cms.vercel.app/admin`

Confirm:
- shared nav renders on public pages
- menu/gallery page loads photos
- admin opens
- a known upload under `/uploads/...` resolves
- content edits still read/write properly

## Storage And Asset Ownership

### Content

- live content reads from Vercel KV first
- fallback content lives in [data/content.json](/tmp/gathering-hub/data/content.json)
- route: [src/app/api/content/route.ts](/tmp/gathering-hub/src/app/api/content/route.ts)

### Photos / Gallery

- uploads are written to [public/uploads](/tmp/gathering-hub/public/uploads)
- upload route: [src/app/api/upload/route.ts](/tmp/gathering-hub/src/app/api/upload/route.ts)
- page URLs look like `/uploads/<filename>`

Important limitation:
- uploads stored inside `public/uploads` are deployment-bound assets
- if you ever move this app to a truly dynamic multi-editor workflow, move uploads to Blob/S3-equivalent storage

## AI Provider Setup

The customer portal blog/update helpers support either OpenAI or OpenRouter.

Recommended envs:

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY=...`

Optional alternative:

- `AI_PROVIDER=openrouter`
- `OPENROUTER_API_KEY=...`

Behavior:
- if a valid AI provider key exists, the portal will use live AI generation
- if no valid key exists, the portal falls back to the built-in seasonal writer
- the customer still sees a generated result either way

Recommendation:
- prefer `openai` with `gpt-4.1-mini` for this portal
- keep monthly limits in the portal for protection even when AI is live

## Fast Triage

If the site looks wrong:

1. Check the Vercel project link
2. Check the production alias
3. Check KV envs and content route
4. Check one `/uploads/...` URL
5. Then inspect page code

## One-Line Reminder For Codex / Claude

If something is broken, verify this first:
- repo `gathering-hub`
- deploy target `gathering-hub-cms`
- live domain `gathering-hub-cms.vercel.app`
- content source `KV first, content.json fallback`
- photos source `public/uploads`
