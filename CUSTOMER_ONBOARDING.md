# Customer Onboarding

This file is the human-readable handoff for future client work, customer portal edits, and support.

## Current Customer

- Customer: The Gathering Hub
- Business type: event venue / cafe / community gathering space
- Location: Ithaca, Michigan
- Live website: `https://gathering-hub-cms.vercel.app`
- Admin portal: `https://gathering-hub-cms.vercel.app/admin`

## What This Project Includes

- marketing site
- menu and gallery page
- events page
- blog
- lightweight admin/customer portal for content updates

## Where Things Live

### Customer-facing pages

- homepage: [src/app/page.tsx](/tmp/gathering-hub/src/app/page.tsx)
- menu/gallery: [src/app/menu/page.tsx](/tmp/gathering-hub/src/app/menu/page.tsx)
- events: [src/app/events/page.tsx](/tmp/gathering-hub/src/app/events/page.tsx)
- blog: [src/app/blog/page.tsx](/tmp/gathering-hub/src/app/blog/page.tsx)

### Customer portal

- admin UI: [src/app/admin/page.tsx](/tmp/gathering-hub/src/app/admin/page.tsx)
- content API: [src/app/api/content/route.ts](/tmp/gathering-hub/src/app/api/content/route.ts)
- upload API: [src/app/api/upload/route.ts](/tmp/gathering-hub/src/app/api/upload/route.ts)

## Onboarding Checklist

When bringing on a similar customer, collect:
- business name
- location
- phone
- email
- address
- brand colors or aesthetic direction
- main services / offerings
- photos they own and approve for use
- social links
- booking/contact preference
- blog/news expectations
- who will update content

## AI Content Guardrails

Before enabling AI help for a customer portal, collect or confirm:
- the real services they offer
- the event types or offerings they actually want promoted
- any amenities or features that are safe to mention publicly
- what they do not want promised on the site
- seasonal priorities for the current quarter
- preferred tone: warm, premium, family-friendly, formal, playful, etc.
- the character the site should sound like in plain English
  - example: calm local owner, polished service professional, upbeat family business, practical shop owner
- what the writing should do
  - example: reassure, explain simply, help people plan, sound local
- what the writing should avoid
  - example: sounding like an ad, hype, trendy slang, overpromising

After conversion, create the site voice profile before relying on AI generation:
- open the customer portal
- go to `Overview`
- click `Build Voice From Site`
- review and save:
  - tone
  - audience
  - approved facts
  - avoid claims
  - seasonal focus
  - voice character
  - writing should do
  - writing should avoid

Use these rules in the portal and future prompts:
- never invent pricing
- never invent availability
- never invent packages, capacities, timelines, or service commitments
- never imply catering, staffing, rentals, or features unless confirmed
- use seasonal ideas only when they fit the real business
- prefer helpful local topics over generic SEO filler
- do not make every blog post sound like a commercial
- one gentle call to action is enough
- helpful first, promotion second

For blog and announcement suggestions, the safest inputs are:
- current month/season
- confirmed event types
- confirmed amenities
- active announcements already on the site
- real customer questions the business gets often

If those facts are missing, onboarding should capture them first instead of letting AI guess.

## Portal Setup Checklist

- confirm admin login path
- confirm content saves correctly
- confirm uploads work
- confirm uploaded photos render on public pages
- confirm one edit round with the customer before handoff
- confirm AI suggestion buttons only use verified business facts
- confirm one generated topic and one generated update read as believable and on-brand

## Billing / Support Questions To Clarify

- who owns the domain
- who pays for hosting
- who pays for email/inbox tools if used
- whether monthly updates are included
- turnaround expectation for edits
- who supplies new photos / menus / announcements

## Safe Contract / Handoff Topics

Use these as standard expectations:
- one clear monthly support scope
- response time for edits
- number of included update rounds
- hosting responsibility
- content responsibility
- photo ownership / permission
- what counts as out-of-scope work

## Notes For Codex / Claude

- treat `gathering-hub-cms.vercel.app` as the live customer site
- do not assume the similarly named `gathering-hub` Vercel project is the live target
- if photos appear missing, inspect the upload path before changing templates
- if content appears stale, inspect KV before editing the static JSON

## Suggested Future Improvement

For more durable customer operations, add:
- a dedicated `OPS.md` with passwords/env ownership stored safely outside git
- blob/object storage for uploads
- a tiny client record with:
  - billing status
  - domain owner
  - hosting owner
  - update cadence
  - next actions
