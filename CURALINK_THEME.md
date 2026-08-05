# CuraLink Design System

This file documents the design tokens **as they actually exist today** in the codebase — extracted from `frontend/src/index.css`, `frontend/tailwind.config.js`, and the Homepage components (`Header.jsx`, `Stats.jsx`, `Home.jsx`). Nothing here is invented; it's the source of truth already running on the Homepage, written down so the Doctor Dashboard and Doctor Profile (in the `admin` app) can match it exactly.

## Colors

| Role | Hex | Used for |
|---|---|---|
| Navy (deepest) | `#0F172A` | Hero gradient start, headings, sidebar |
| Deep Blue | `#1E3A8A` | Hero gradient mid |
| Primary Blue | `#2563EB` | Primary button gradient start, links, icon accents |
| Teal | `#14B8A6` | Primary button gradient end, focus rings, active states |
| Sky | `#0EA5E9` | Secondary gradient partner (slots, secondary CTAs) |
| Emerald / Success | `#22C55E` / `#16A34A` | Success states, "available" badges |
| Danger | `#EF4444` / `#DC2626` | Errors, cancel actions |
| Warning | `#F59E0B` / `#D97706` | Warning/pending badges |
| Slate text (primary) | `#0F172A` | Headings |
| Slate text (secondary) | `#334155` / `#475569` | Body text |
| Slate text (muted) | `#64748B` / `#94A3B8` | Captions, meta text |
| Border | `#E2E8F0` / `#F1F5F9` | Card borders |
| Background | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Card surfaces |

**Never used:** purple, pink, orange, or any color outside this table (except semantic red/amber for error/warning, already listed above).

## Gradients

- **Hero**: `linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)` (navy → blue → teal)
- **Primary button**: `linear-gradient(135deg, #2563EB, #14B8A6)`, hover `linear-gradient(135deg, #1D4ED8, #0D9488)`
- **Teal/CTA accent**: `linear-gradient(135deg, #14B8A6, #0EA5E9)`
- **Card wash**: `linear-gradient(135deg, #F0FDFA 0%, #E0F2FE 100%)`
- **Gradient text**: `linear-gradient(90deg, #5EEAD4, #BAE6FD)` (used on dark backgrounds) or `linear-gradient(135deg, #2563EB, #14B8A6)` (used on light backgrounds)

## Typography

- Font: **Inter** (Google Fonts, weights 300–900)
- Section title: `font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; color: #0F172A;`
- Section subtitle: `font-size: 1.0625rem; color: #64748B; line-height: 1.7;`
- Section tag (eyebrow): teal pill, uppercase, `0.75rem`, `font-weight: 600`, `letter-spacing: .08em`

## Cards

- `border-radius: 18–24px`
- `border: 1px solid #E2E8F0` (or `#F1F5F9` for lighter cards)
- `box-shadow: 0 8px 24px rgba(15,23,42,.06)` idle → `0 14px 34px rgba(37,99,235,.12)` / `translateY(-4px)` on hover
- White background, generous padding (24–32px)

## Buttons

- `.btn-primary`: blue→teal gradient, white text, `box-shadow: 0 6px 18px rgba(37,99,235,.30)`, darkens + lifts on hover
- `.btn-secondary`: white bg, teal border + text, fills teal-light on hover
- `.btn-ghost`: transparent, slate border/text
- Pill radius (`999px`) for small tags/CTAs, `10–12px` radius for standard buttons

## Badges

- `badge-green` (available/success), `badge-red` (unavailable/error), `badge-blue`, `badge-teal` (verified/featured), `badge-amber` (pending), `badge-slate` (neutral) — all pill-shaped, uppercase, `0.72rem`, `font-weight: 600`

## Spacing & Motion

- Page padding: `36px 24px` desktop, generous section spacing (`64–96px` vertical rhythm on Homepage)
- Hover lift: `translateY(-4px)` to `translateY(-8px)` with a deeper shadow — no scale/rotation flourishes
- Transitions: `0.2s–0.35s ease`

## Admin App Alignment Note

`admin/src/index.css` (Tailwind v4, `@theme`) already defines the **same hex values** (`--color-primary: #2563EB`, `--color-secondary: #14B8A6`, `--color-sidebar: #0F172A`) — the palette was already correct. The only real mismatch was the font (`Outfit` instead of `Inter`), fixed as part of this pass.
