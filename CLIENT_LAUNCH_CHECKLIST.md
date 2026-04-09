# Client Launch Checklist

Companion handoff note for active build context:
- `CODEX_CLAUDE_HANDOFF.md`

## Current Client

- Client: The Gathering Hub
- Status: pre-launch demo / onboarding

## Immediate Goals

1. Show the current demo before publishing live changes.
2. Confirm hosting/domain situation.
3. Send billing link and simple service agreement.
4. Confirm first-round homepage, menu, upcoming, and photo content.
5. Publish and test the site.
6. Test the client request channel.

## Tomorrow Launch Priority

Keep tomorrow focused on customer-facing items only:

1. Final homepage photo selection.
2. Final review of `Menu`, `Upcoming`, `Blog`, and contact details.
3. Demo review with client.
4. Confirm hosting/domain decision.
5. Send billing link and simple agreement.
6. Publish live.
7. Test one real update request after publish.

## Next Message To Send

Use this as the next message:

```text
Everything is coming together really nicely. Before I publish the updated site, I just want to lock in the last few details so we do it cleanly:

1. Are you already using a website/domain you want this connected to, or do you want me to host it for you?
2. I’m getting your monthly billing link ready. Once I send it over, are you okay if I also send a short simple agreement with the support/hosting expectations?
3. I’d love to show you the updated demo before it goes live. Once you look it over, I can make any final tweaks and publish it.

I’ve also been pulling in your newer Facebook photos so the content is feeling much more current.
```

## Hosting Questions To Resolve

- Does she already own a domain?
- Is there an existing site that should be replaced, redirected, or preserved?
- If she has no existing site, do we:
  - keep her on the current hosted Vercel site temporarily, or
  - connect a new custom domain now?
- Who is paying for hosting long term?

## Billing Setup

- Product name: `The Gathering Hub Website Support`
- Intended plan: `$50/month`
- Intended billing scope:
  - hosting
  - light website support
  - content updates
  - customer portal access

### Stripe details

- Product: `The Gathering Hub Website Support`
- Monthly price: `$50/month`
- Billing link: `https://buy.stripe.com/7sYbJ1adqbLW5BU2CmefC00`

## Demo Review Checklist

- Homepage hero feels current
- Better homepage photos selected
- Menu page looks correct
- Upcoming page shows real events/flyers
- Blog works from portal to live site
- Contact info is correct
- Facebook link is correct

## Publish Checklist

- Deploy to `gathering-hub-cms`
- Open:
  - `/`
  - `/menu`
  - `/events`
  - `/upcoming`
  - `/blog`
  - `/admin`
- Verify one upload shows on the live site
- Verify one portal edit persists live

## Post-Publish Checklist

- Send live link
- Send billing link
- Send simple agreement
- Confirm request line: `(313) 444-3317`
- Confirm how she wants to request changes:
  - text to `(313) 444-3317`
  - portal
  - Facebook message for now

## Request Channel Test

Primary request line:
- Google Voice / update line: `(313) 444-3317`

Short-term fallback:
- keep using Facebook / direct message until Google Voice verification is fully approved

Next best option after text:
- set up a dedicated email like `updates@...`
- route requests into an approval queue
- keep approval required before publish

## After Launch Fixes

These are important, but not launch blockers for the customer-facing demo tomorrow:

- Remove hardcoded secrets from dashboard/SimpleWeb/task-webhook runtime code and rotate them.
- Lock down temporary dashboard no-auth routes after the mobile-safe flow is replaced.
- Add auth checks to client/intake dashboard APIs.
- Move dashboard away from deprecated `middleware` naming to the newer `proxy` approach.
- Separate read-only mobile dashboard views from any project-seeding write path.
- Do one full dashboard cleanup pass for duplicated fetches, fallback behavior, and long-term token hygiene.
