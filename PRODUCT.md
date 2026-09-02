# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences the site must serve in parallel:

- **SMB buyers** — owners and managers of small and mid-sized businesses (primarily Spain, with a Sevilla/Andalucía base) evaluating whether and how to automate parts of their operation. Usually non-technical; the person browsing is also the person who signs off. They arrive with a concrete pain (customer support load, manual invoicing/reporting, disconnected tools) and want to know it can be solved, by whom, and roughly what it takes.
- **Course learners** — individual professionals and team members who buy the paid `formación` courses to learn the tools themselves. They may come through the same company relationship or independently.

## Product Purpose

Ordinaly helps companies streamline and improve their processes with AI. It delivers business automation as a service — conversational chatbots, n8n / workflow automation, Odoo implementation, WhatsApp Business automation, AI phone-call agents, invoice and report automation, social-media automation, and custom web/app development — and runs a training platform (`formación`) with paid courses so client teams can operate what was built. Success is a business that moves work off manual effort and can sustain the automation after handoff.

## Positioning

Automation **and** training from one partner: Ordinaly both implements the automation and teaches the client's team to run it, through the same `formación` platform. A pure implementation agency leaves the client dependent; a pure course vendor never touches the client's systems. The combined delivery-plus-enablement path is the claim a neighboring agency could not truthfully copy.

## Operating Context

- Marketing/service site plus authenticated areas: user profiles, an admin area, and the Sanity Studio at `/studio`.
- Dedicated landing pages per service (Odoo implementation, invoice automation, report automation, custom n8n automation, AI call agent, social-media automation, web/app development, "consultora tecnológica Sevilla").
- `formación` course catalog and course detail pages; course purchases run through Stripe.
- Blog and news sections backed by Sanity CMS, each with its own search.
- Content flows: contact form, lead capture (`/api/leads`), Google reviews pulled via API, WhatsApp contact, reCAPTCHA on auth and forms.
- Auth lifecycle: sign up, sign in, OAuth callback, email verification, change email, reset password, account deletion with confirmation.
- Backend is a separate Django service; this repo's `frontend/` is the Next.js app.

## Capabilities and Constraints

- **Bilingual is required.** Every surface ships Spanish and English via `next-intl` (`messages/es.json`, `messages/en.json`) under a `[locale]` route segment. No English-only or Spanish-only surface.
- Next.js App Router (`src/app/[locale]`), React, Tailwind (class-based dark mode), Sanity for editorial content, Stripe for course payments.
- Light and dark themes both ship; the theme provider renders without a mounted gate (recent change to avoid hydration mismatch).
- Design tokens today are HSL CSS variables (`--background`, `--primary`, `--accent`, …) plus a fixed brand palette and a large `--swatch--*` set in the Tailwind config.
- Undecided / not yet established: a documented visual system (no DESIGN.md yet); whether the `--swatch--*` families are in active use or legacy.

## Brand Commitments

- **Logo is fixed:** `frontend/public/logo.webp`; wordmark "ORDINALY".
- **Bilingual ES/EN is a binding product constraint** (see Capabilities).
- Palette, typography, and tone are **not** locked — open to a refresh. For reference, current conventions (changeable): brand purple `#623CEA`, teal/blue `#46B1C9`, a blue accent scale, and an informal second-person ("tú") Spanish voice.

## Evidence on Hand

- Real service copy and per-service landing pages in the repo and `messages/*.json`.
- Google customer reviews consumed live via `/api/google-reviews`.
- Real course catalog with Stripe-backed checkout.
- Blog/news content managed in Sanity.
- No written case studies, named-client testimonials, benchmarks, or pricing tables are present in the repo — future work must not fabricate them.

## Product Principles

1. **Serve buyer and learner on the same site without blurring them** — a visitor scoping a service and a visitor buying a course need different next steps from the same page.
2. **Lead with the outcome, not the technology** — non-technical buyers care that invoicing/support/reporting gets handled; tool names (n8n, Odoo) are supporting detail.
3. **Show the handoff** — the automation-plus-training combination is the differentiator, so design should make "we build it and your team runs it" legible.
4. **Bilingual parity** — Spanish and English surfaces get equal care; layouts must absorb the length difference.
5. **Proof is real or absent** — use the genuine Google reviews and shipped content; never stand in fabricated clients or numbers.

## Accessibility & Inclusion

No product-specific standard has been established. Baseline: both themes must meet contrast expectations, and bilingual content must remain fully navigable in each locale.
