---
name: Ordinaly
description: AI automation and training partner — a warm, editorial studio identity in ivory, slate, and clay.
colors:
  ivory-light: "#FAF9F5"
  ivory-medium: "#F0EEE6"
  ivory-dark: "#E8E6DC"
  oat: "#E3DACC"
  cloud-light: "#D1CFC5"
  cloud-medium: "#B0AEA5"
  cloud-dark: "#87867F"
  slate-dark: "#141413"
  slate-medium: "#3D3D3A"
  slate-light: "#5E5D59"
  clay: "#D97757"
  clay-deep: "#C6613F"
  flame: "#E15D31"
  flame-dark: "#C44E24"
  cobalt: "#0255D5"
  cobalt-dark: "#0144AA"
  manilla: "#EBDBBC"
  kraft: "#D4A27F"
  destructive: "#EF4444"
typography:
  display:
    fontFamily: "Lora, 'Playfair Display', Georgia, serif"
    fontSize: "clamp(4rem, calc(3.5rem + 2.5vw), 6rem)"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "0.017em"
  headline:
    fontFamily: "Lora, 'Playfair Display', Georgia, serif"
    fontSize: "clamp(3rem, calc(2.7rem + 1.3vw), 4rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.017em"
  title:
    fontFamily: "Inter, 'DM Sans', Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Inter, 'DM Sans', Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, 'DM Sans', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.017em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "1600px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "2.5rem"
  "8": "3rem"
  "9": "4rem"
  "10": "5rem"
  "11": "6rem"
components:
  button-primary:
    backgroundColor: "{colors.slate-dark}"
    textColor: "{colors.ivory-light}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 2rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.slate-medium}"
    textColor: "{colors.ivory-light}"
  button-accent:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.ivory-light}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 2rem"
    height: "3rem"
  button-accent-hover:
    backgroundColor: "{colors.clay-deep}"
    textColor: "{colors.ivory-light}"
  button-outline:
    backgroundColor: "{colors.ivory-light}"
    textColor: "{colors.slate-dark}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 2rem"
    height: "3rem"
  button-secondary:
    backgroundColor: "{colors.oat}"
    textColor: "{colors.slate-dark}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 2rem"
    height: "3rem"
  button-ghost:
    textColor: "{colors.slate-dark}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 2rem"
    height: "3rem"
  card:
    backgroundColor: "{colors.oat}"
    textColor: "{colors.slate-dark}"
    rounded: "{rounded.sm}"
    padding: "1.5rem"
  card-editorial:
    backgroundColor: "{colors.oat}"
    textColor: "{colors.slate-dark}"
    rounded: "{rounded.lg}"
    padding: "2rem"
  input:
    backgroundColor: "{colors.oat}"
    textColor: "{colors.slate-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
    height: "2.5rem"
  badge:
    backgroundColor: "{colors.slate-dark}"
    textColor: "{colors.ivory-light}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
---

# Design System: Ordinaly

<!-- impeccable:design-schema 1 -->

## Overview

**Creative North Star: "The Andalusian Studio"**

Ordinaly builds AI automation for businesses and trains their teams to run it. The interface should feel like the workspace of a craft-house that happens to work in software: warm, sunlit, unhurried, and exact. The palette is drawn from sevillano light and material — bleached ivory walls, oat linen, the terracotta of a clay tile — with near-black slate as the ink. Regional character is the quiet differentiator: not folklore, but the calm confidence of a studio that has been doing careful work for a long time.

The system is **editorial and disciplined**. Hierarchy is carried by a serif display voice against a clean Inter body, by generous whitespace, by uppercase metadata labels, and by hairline rules — not by color noise or ornament. One accent (clay) does the highlighting work, and it earns its rarity. Surfaces are flat; depth comes from layering the warm neutrals, not from shadow. Motion is short, eased, and functional.

This world explicitly rejects the generic AI-startup look — purple-to-blue gradients, glowing orbs, neon grids, dark-mode hero drama — and it rejects glow and neon effects as a system style. A small number of service landing pages use `glow-*` utilities locally; those are surface-local exceptions, not system doctrine, and no new surface should adopt them.

**Key Characteristics:**
- Warm neutral ground (ivory / oat), near-black slate ink, single clay accent.
- Serif display (Lora) for the big statements; Inter for everything operational.
- Flat surfaces, depth by tonal layering of neutrals.
- Uppercase, wide-tracked labels for metadata and eyebrows.
- Short functional motion (150ms state, ~300ms reveal); no bounce, no pulse.
- Bilingual ES/EN — layouts must absorb ~25% text expansion.

## Colors

A warm, low-chroma neutral system with one terracotta accent and a small warm-accent reserve for edge cases.

### Primary
- **Clay** (`#D97757`): The single brand accent. Focus rings, primary CTAs that need warmth, active states, the featured-hero eyebrow, link hover. Used sparingly — see The One Voice Rule.
- **Clay Deep** (`#C6613F`): Hover/pressed state for clay surfaces only. Never a resting fill.

### Secondary
- **Slate Dark** (`#141413`): The ink. Body text on light ground, the default (primary) button fill, headings. In dark mode it becomes the page ground.
- **Slate Medium** (`#3D3D3A`): Primary-button hover, dark-mode card ground, secondary text on dark.
- **Slate Light** (`#5E5D59`): Dark-mode muted surfaces and hairlines.

### Tertiary (warm-accent reserve — use only when a second signal is genuinely needed)
- **Flame** (`#E15D31`) / **Flame Dark** (`#C44E24`): High-urgency or WhatsApp-adjacent actions.
- **Cobalt** (`#0255D5`) / **Cobalt Dark** (`#0144AA`): The one cool accent, for links or data emphasis inside otherwise-warm contexts.
- **Manilla** (`#EBDBBC`) / **Kraft** (`#D4A27F`): Warm fills for tags, callouts, and illustration grounds.

### Neutral
- **Ivory Light** (`#FAF9F5`): Default page background (light mode); text color on dark ground.
- **Ivory Medium** (`#F0EEE6`): Secondary background, subtle section banding, `special` button fill.
- **Ivory Dark** (`#E8E6DC`): Borders and dividers on light ground.
- **Oat** (`#E3DACC`): Card and input fill — the workhorse "raised" neutral.
- **Cloud Light / Medium / Dark** (`#D1CFC5` / `#B0AEA5` / `#87867F`): Muted text, disabled states, secondary metadata, hairlines on warm ground.

### Illustrative palette (spot art and diagrams only, never UI chrome)
Olive `#788C5D`, Cactus `#BCD1CA`, Sky `#6A9BCC`, Heather `#CBCADB`, Fig `#C46686`, Coral `#EBCECE`.

### Named Rules
**The One Voice Rule.** Clay covers ≤10% of any screen. It marks the one thing that matters most in view — a primary action, a focus ring, a live eyebrow. Two clay elements competing for attention on the same screen is a defect.

**The Warm Ground Rule.** Every background is a neutral from the ivory/oat/slate ramp. Pure white (`#FFFFFF`) and pure black appear only inside the deliberate `featured-hero` treatment, never as a page or card ground.

**The Legacy Palette Rule.** Purple `#623CEA` and teal `#46B1C9` are removed — the `purple` and `blue` keys are gone from `tailwind.config.ts`, the dead `--color-*-blue` CSS vars are deleted, and every usage was remapped (purple → clay, teal → cobalt). Do not reintroduce them. The `green` Tailwind key still exists but is misnamed: its values are the cobalt ramp (`green.DEFAULT` = `#0255D5`); prefer `var(--swatch--cobalt)` / `--swatch--cobalt-dark` over `green-*` classes in new work.

## Typography

**Display Font:** Lora (with Playfair Display, Georgia, serif) — loaded via `next/font` as `--font-lora`, bound to `--font-serif` and the Tailwind `font-serif` family. Variable weight 400–700 (there is no 300; `font-light` degrades to 400).
**Body / UI Font:** Inter (with DM Sans, Arial, sans-serif) — loaded via `next/font`, applied to `<body>`.

**Character:** A quiet serif for the statements the studio wants remembered, set at its lightest and slightly loose, occasionally uppercase; Inter for every word that does a job. The contrast between the two *is* the hierarchy — the serif is never decorative filler, and Inter is never asked to carry a hero.

**Coverage:** wired on the home hero `<h1>` and the home section openers (`courses-showcase`, `testimonials-section`). Rolling the `font-serif font-normal` treatment onto the remaining landing-page and section headings is outstanding follow-up.

### Hierarchy
- **Display** (Lora, 300, `clamp(4rem, calc(3.5rem + 2.5vw), 6rem)`, line-height 0.85, tracking 0.017em, often uppercase): Page-defining hero statements only. One per view.
- **Headline** (Lora, 300, `clamp(3rem, calc(2.7rem + 1.3vw), 4rem)`, line-height 1.1): Major section openers.
- **Title** (Inter, 600, 1.5rem, line-height 1.1, tracking -0.005em): Card titles, subsection headings, dialog titles.
- **Body** (Inter, 400, 1.25rem, line-height 1.6): Default reading text. Target 65–75ch measure.
- **Label** (Inter, 500, 0.875rem, tracking 0.017em, uppercase): Eyebrows, metadata rows, category tags, table headers.

### Named Rules
**The Serif-For-Statements Rule.** Serif is reserved for Display and Headline. A serif sub-head, serif body copy, or serif button label is off-system.

**The Uppercase-Label Rule.** Metadata (dates, categories, "read time", section eyebrows) is uppercase Inter at label size with 0.017em tracking. Sentence-case metadata is a drift.

## Layout

A single centered column model. The container (`.u-container`) is `max-width: 1280px` with fluid inline padding `clamp(1.5rem, 4vw, 4rem)`; the shadcn container caps at 1400px with 2rem padding. Content grids are 3-up on desktop (`.cards-grid`, `gap` = 4rem) collapsing to 1-up at ≤768px. Hero and editorial sections use a 1fr/1fr two-column split that stacks on mobile.

Vertical rhythm runs on a 4pt spacing scale (`--space-1`…`--space-11`, 0.25rem→6rem) with dedicated section spacers: small `clamp(3rem, …, 4rem)`, main `clamp(6rem, …, 10rem)`, large `clamp(8rem, …, 14rem)`. Prefer the section spacers between major bands and the raw scale within components.

Breakpoints: 640 / 768 / 1024 / 1280 / 1400. Density is comfortable, not compact — this is a Persuade/Read surface set, not a dashboard.

## Elevation & Depth

**Flat by default; depth by tonal layering.** The system does not use shadow as structure. A raised surface reads as raised because it is a step warmer/darker in the neutral ramp: `ivory-light` page → `ivory-medium` band → `oat` card/input → `slate-dark` inverted panel. Borders are hairlines (`ivory-dark` or a 10% slate wash), never heavy strokes.

Shadow is allowed only as a **response to state or true overlay**: the soft inset on a focused input, a small `shadow-sm` on an open dropdown/modal, a hover lift on an interactive card. A surface that carries a drop shadow at rest, with no state to justify it, is off-system.

### Shadow Vocabulary
- **Ambient sm** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Open overlays (dropdown, popover, modal), and the `special` button variant.
- **Input inset** (`shadow-input`; observed value `0 2px 3px -1px rgba(0,0,0,0.1), 0 1px 0 0 rgba(25,28,33,0.02), 0 0 0 1px rgba(25,28,33,0.08)`): Text fields at rest; removed on group hover.

### Named Rules
**The Flat-At-Rest Rule.** Cards, sections, and buttons are flat until the user touches them. Shadow is feedback, not decoration.

**The No-Glow Rule.** No `filter: drop-shadow()` glows, no radial-gradient halos, no `box-shadow` used as a light source. The `glow-3d` / `glow-border-n8n` utilities are quarantined to specific service landing pages and must not spread.

## Shapes

Soft, consistent rounding on a five-step radius scale: **8px** (`sm` — buttons, small cards, inputs' inner field), **12px** (`md` — input wrapper, medium containers), **16px** (`lg` — editorial/release cards, featured hero), **24px** (`xl` — large feature panels), and **1600px** (`full` — pills, badges, avatars). The shadcn `--radius` primitive is 8px and drives `rounded-lg`/`-md`/`-sm` utilities as 8/6/4px.

Corners are always rounded — no sharp-cornered cards or buttons. Geometry is rectilinear and calm; the only recurring motif is the animated flow-line (dashed stroke, `dash-move`) used in workflow/automation diagrams. Borders are hairline and low-contrast.

## Components

### Buttons
Character: **editorial and disciplined** — rectangular with an 8px radius, semibold Inter, generous horizontal padding, a flat 150ms color transition and a 2px clay focus ring. No scale-on-hover, no shadow-on-hover.
- **Shape:** 8px radius (`rounded-a-s`); large size steps to 12px.
- **Sizes:** default `h-12` / `px-8`; sm `h-9` / `px-5` / 14px; lg `h-14` / `px-10` / 18px; icon `40×40`.
- **Primary (`default`):** `slate-dark` fill, `ivory-light` text; hover `slate-medium`. Inverts in dark mode (ivory fill, slate text, hover oat).
- **Accent:** `clay` fill, `ivory-light` text; hover `clay-deep`. Same in both themes. Use for the single most important action per view.
- **Outline:** transparent fill, 25%-opacity `slate-dark` border, slate text; hover fills `oat`.
- **Ghost:** no border/fill; hover fills `oat`.
- **Secondary:** `oat` fill, slate text; hover `cloud-light`.
- **Focus:** `focus-visible` → 2px `ring` (clay) at 2px offset. Always visible, never removed.
- **Reserve variants:** `flame`, `cobalt`, `whatsapp`, `special`, `link`, `destructive` exist for specific contexts; don't reach for them as general styling.

### Cards / Containers
Character: quiet raised neutral, hairline-bordered, flat at rest.
- **Corner style:** 8px (`Card` primitive) or 16px (`card-editorial` / `.release-card`).
- **Background:** `oat` on light ground; `slate-medium` in dark mode.
- **Border:** 1px hairline (`ivory-dark` / 10% slate wash).
- **Shadow strategy:** none at rest (see Elevation). Optional `shadow-sm` only on hover for interactive cards.
- **Internal padding:** 1.5rem (`Card`, via `p-6`) to 2rem (editorial), fluid on large breakpoints.
- **Editorial card detail:** meta row separated by a top hairline, uppercase label text, `space-between` layout.

### Inputs / Fields
Character: soft, low-contrast, with a warm clay wash on interaction.
- **Style:** `oat` fill, no border, 6px inner radius inside a 12px wrapper, `shadow-input` inset at rest, 0.875rem text.
- **Interaction:** a clay radial-gradient (`rgba(217,119,87,0.18)` light / `0.34` dark) tracks the cursor across the 2px wrapper; inner field border shifts to clay on hover.
- **Focus:** 2px `clay` `focus-visible` ring; inset shadow removed.
- **Disabled:** `opacity: 0.5`, `not-allowed` cursor.

### Badges / Chips
- **Style:** fully rounded (`rounded-full`), 0.75rem semibold, 0.625rem horizontal padding, hairline border.
- **Default:** `slate-dark` fill, `ivory-light` text. **Secondary:** `ivory-medium` fill. **Outline:** text-only on transparent.
- **Off-system:** the `accented` variant (`animate-pulse`, `shadow-lg`, `#FFB800`, uppercase, extra-bold) contradicts this system — do not use it in new work.

### Navigation
- Sticky top bar, Inter, slate ink on ivory; links use label-weight text with a clay hover.
- Portalled dropdowns with viewport-aware positioning and `shadow-sm`.
- Mobile: full-height slide-in menu, `no-scroll` lock on the body while open.

### Signature: Flow-line diagram
Dashed SVG strokes (`stroke-dasharray: 10`) animated via `dash-move` (0.5s linear infinite) to depict automation/workflow steps. The one sanctioned decorative motif; keep strokes hairline and monochrome (slate on ivory, or ivory on the dark featured panel).

## Do's and Don'ts

### Do:
- **Do** ground every surface in the ivory/oat/slate ramp and reserve `clay` for the single most important element in view (The One Voice Rule).
- **Do** use Lora for Display and Headline only, and Inter for everything else.
- **Do** set metadata as uppercase Inter at 0.875rem with 0.017em tracking.
- **Do** convey elevation by stepping the neutral (ivory → oat → slate), keeping surfaces flat at rest.
- **Do** keep motion short and eased: ~150ms for state changes, ~300ms for reveals, standard `cubic-bezier` easing.
- **Do** build layouts that survive ES→EN expansion without truncation or reflow breakage.
- **Do** keep buttons and cards on the 8px radius; step to 12–16px only for large editorial containers.

### Don't:
- **Don't** use the generic AI-startup kit: purple/blue gradients, glowing orbs, neon grids, dark hero drama.
- **Don't** introduce glow, halo, or `drop-shadow` light effects as system styling; the existing `glow-*` utilities stay confined to their current landing pages.
- **Don't** use `animate-pulse`, bounce easing, or attention-grabbing badge styling (the `accented` badge variant).
- **Don't** put a drop shadow on a resting surface, or use pure white / pure black as a page or card ground.
- **Don't** use the deprecated purple `#623CEA`, teal `#46B1C9`, or the `green`/`blue` Tailwind scales in new work.
- **Don't** let two `clay` elements compete on one screen.
- **Don't** set body copy or sub-heads in the serif.
