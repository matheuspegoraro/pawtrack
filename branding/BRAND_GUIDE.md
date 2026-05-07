# PawTrack — Brand Guide

## Brand Essence

**One-liner:** Your pet's health, always with you.

**What it is:** A mobile app that centralizes pet health records — vaccines, medications, vet visits, weight — and reminds owners of important dates so nothing gets missed.

**Who it's for:** US pet parents (25-45, mostly millennials) who treat their pets like family and want peace of mind about their health.

**How it feels:** Warm, trustworthy, caring — like a knowledgeable friend who helps you take care of your pet, not a cold medical app.

---

## Brand Personality

| Trait | Description | NOT this |
|-------|-------------|----------|
| **Warm** | Approachable, comforting, soft | Cold, clinical, sterile |
| **Reliable** | Dependable, organized, precise | Chaotic, playful, silly |
| **Caring** | Empathetic, nurturing, gentle | Aggressive, pushy, corporate |
| **Simple** | Clean, focused, intuitive | Cluttered, overwhelming, techy |

**Voice:** Friendly but not childish. Helpful but not patronizing. Professional but not formal.

**If PawTrack were a person:** A veterinary nurse who remembers your pet's name, sends you a text before their vaccine is due, and always has a treat in their pocket.

---

## Color Palette

### Primary

| Name | Hex | OKLCH | Usage |
|------|-----|-------|-------|
| **Terracotta** | `#B5633B` | `oklch(0.62 0.14 40)` | Primary actions, brand identity, CTA buttons |
| **Terracotta Light** | `#F5E6DB` | `oklch(0.94 0.03 40)` | Backgrounds, selected states, tints |
| **Terracotta Dark** | `#8C4A2B` | `oklch(0.52 0.15 40)` | Text on light, pressed states |

### Secondary

| Name | Hex | Usage |
|------|-----|-------|
| **Amber** | `#C4882A` | Medications, today badges, warnings |
| **Sage** | `#5A9E6F` | Checkups, success states, "all clear" |
| **Plum** | `#8B5A9E` | Vaccines, premium features |
| **Coral** | `#D94F3D` | Overdue alerts, urgent items, destructive actions |

### Neutrals

| Name | Hex | Usage |
|------|-----|-------|
| **Sand** | `#F5F0EB` | Page backgrounds |
| **Cream** | `#FBF8F5` | Subtle backgrounds |
| **Warm White** | `#FDFCFA` | Cards, headers, surfaces |
| **Text Primary** | `#2A2017` | Headings, primary text |
| **Text Secondary** | `#6B5D52` | Body text, descriptions |
| **Text Tertiary** | `#9E9189` | Placeholders, hints |
| **Border** | `#E8E0D8` | Dividers, input borders |

### Color Philosophy

- All neutrals are **warm-tinted** (hue 40° — toward terracotta), never pure gray
- Terracotta evokes **earth, warmth, care** — not the typical blue of health apps
- Each record type has its own color for instant recognition
- Light mode only — this is a daytime app used by pet parents checking on care

---

## Typography

### Font Pairing

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display** | Gabarito | 800-900 | Headings, titles, numbers |
| **Body** | Figtree | 400-600 | Body text, labels, descriptions |

### Type Scale (Mobile)

| Level | Size | Weight | Font |
|-------|------|--------|------|
| H1 | 26-30px | 900 | Gabarito |
| H2 | 22-24px | 800 | Gabarito |
| H3 | 18px | 700 | Gabarito |
| Body | 15px | 400-500 | Figtree |
| Caption | 13px | 500-600 | Figtree |
| Micro | 10-11px | 600-700 | Gabarito |

### Typography Rules

- Headings always use Gabarito (bold, characterful)
- Body text always uses Figtree (clean, warm, readable)
- Numbers in stats/badges use Gabarito for visual weight
- No all-caps except micro labels (badge text, section headers)
- Line height: 1.2 for headings, 1.5 for body

---

## Logo Concept

### Symbol: The Paw Print

The logo is a **stylized paw print** — the app's core visual metaphor. It appears in:
- The center tab bar button (white paw on terracotta circle)
- Decorative backgrounds (subtle, at 4-6% opacity)
- Empty states and onboarding

### Paw Print Geometry

```
Five ellipses forming a paw:
- 2 upper toe pads (angled slightly outward)
- 2 side toe pads (angled more outward)
- 1 large center pad (bottom)
```

```svg
<svg viewBox="0 0 100 100">
  <ellipse cx="35" cy="22" rx="13" ry="15" transform="rotate(-12 35 22)"/>
  <ellipse cx="65" cy="22" rx="13" ry="15" transform="rotate(12 65 22)"/>
  <ellipse cx="20" cy="50" rx="11" ry="13" transform="rotate(-25 20 50)"/>
  <ellipse cx="80" cy="50" rx="11" ry="13" transform="rotate(25 80 50)"/>
  <ellipse cx="50" cy="68" rx="24" ry="21"/>
</svg>
```

### Logo Variants

| Variant | Description | Usage |
|---------|-------------|-------|
| **Icon** | Paw print only, terracotta on white | App icon, favicon |
| **Wordmark** | "PawTrack" in Gabarito 900 | Splash screen, marketing |
| **Combo** | Paw + wordmark horizontal | Website header, social |
| **Reversed** | White paw on terracotta | Dark backgrounds, tab bar |

### Logo Specifications

- **App Icon:** Paw print centered on warm white (`#FDFCFA`) background with subtle terracotta gradient
- **Shape:** iOS requires rounded square — paw should have ~20% padding from edges
- **Minimum size:** 16px for favicon, 24px for in-app, 48px for tab bar
- **Clear space:** At least 25% of the logo width on all sides

### Wordmark Typography

- Font: **Gabarito Black (900)**
- "Paw" in terracotta (`#B5633B`)
- "Track" in text primary (`#2A2017`)
- Letter spacing: -0.5px (tight)
- No period, no subtitle

---

## Iconography

- **Icon set:** Lucide React Native (consistent stroke-based icons)
- **Stroke width:** 1.8-2.2px (thinner = inactive, thicker = active)
- **Icon sizes:** 16px (inline), 18-20px (list items), 22px (tab bar), 24px (headers)
- **Icon color:** Inherits from context (terracotta for active, text-tertiary for inactive)

### Record Type Icons

| Type | Icon | Color |
|------|------|-------|
| Vaccine | `Syringe` | Plum |
| Medication | `Pill` | Amber |
| Vet Visit | `Stethoscope` | Sage |
| Weight | `Weight` | Terracotta |
| Symptom | `HeartPulse` | Coral |

---

## Visual Language

### Rounded Corners

| Element | Radius |
|---------|--------|
| Page headers | 28px bottom |
| Cards | 16px |
| Buttons | 16px (primary), 100px (pills) |
| Input fields | 10px |
| Icons backgrounds | 10-12px |
| Avatars | 50% (circle) |

### Shadows

All shadows are warm-tinted (using text-primary color, not pure black):

| Level | Usage | Values |
|-------|-------|--------|
| **Subtle** | Cards, rows | `0 1px 3px rgba(42,32,23, 0.03)` |
| **Medium** | Elevated cards | `0 4px 16px rgba(42,32,23, 0.08)` |
| **Header** | Overlapping headers | `0 4px 16px rgba(42,32,23, 0.06)` |
| **CTA** | Primary buttons | `0 4px 12px rgba(181,99,59, 0.25)` |

### Spacing System

Based on 4px grid: `4, 8, 12, 16, 24, 32, 48`

### Decorative Elements

- **Paw prints at low opacity** (4-6%) in headers and hero sections
- **No gradients on text** — solid colors only
- **No glass/blur effects** — clean, opaque surfaces
- **Organic feel** — rounded shapes, warm tones, soft shadows

---

## App Icon Design Brief

### For a designer or AI tool:

**Create an app icon for "PawTrack" — a pet health tracking app.**

**Requirements:**
- Central element: A stylized paw print (5 pads — 4 toes + 1 main pad)
- Primary color: Terracotta `#B5633B`
- Background: Warm white `#FDFCFA` with a very subtle radial gradient toward terracotta-light at the center
- Style: Clean, minimal, friendly — NOT cartoonish or overly detailed
- The paw should feel premium and modern, not clip-art
- Optional: A very subtle "+" or heart shape integrated into the main pad to suggest health/tracking
- No text in the icon
- Must work at 1024x1024 and scale down to 16x16 clearly

**Mood references:**
- Apple Health app (clean, minimal)
- Calm app (warm, soft)
- Headspace (friendly, approachable)

**Anti-references (do NOT look like):**
- Generic pet store logos (too playful/cartoonish)
- Medical/hospital apps (too clinical/blue)
- Stock photo pawprint (too generic)

---

## Marketing Copy

**Tagline options:**
1. "Your pet's health, always with you."
2. "Never miss a vaccine again."
3. "The health app your pet deserves."

**App Store description (short):**
Track your pet's vaccines, medications, and vet visits in one beautiful app. Get smart reminders so you never miss an important health date.

**Keywords:** pet health, vaccine tracker, pet records, vet visits, medication reminder, dog health, cat health, pet care app
