# Design Tokens Reference

Udoy uses a centralized Tailwind preset located at `app/shared/theme/tailwind.preset.js`. Every application loads this preset (see `app/client/tailwind.config.js`), so the utility classes described below are available anywhere you author styles.

## Color palette

| Token | Description | Example usage |
|-------|-------------|---------------|
| `brand-*` | Earthy blue foundation for backgrounds, surfaces, and headlines. | `bg-brand-950`, `text-brand-200`, `border-brand-700` |
| `accent-*` | Warm golden highlight used for keylines, badges, or subtle emphasis. | `text-accent-300`, `bg-accent-500` |
| `clay-*` | Neutral companion scale for text and subdued surfaces. | `text-clay-200`, `bg-clay-900` |
| `success-*` | Positive state feedback. | `bg-success-500/15`, `text-success-100` |
| `warning-*` | Cautionary state feedback. | `border-warning-400`, `text-warning-700` |
| `danger-*` | Error and destructive actions. | `bg-danger-950`, `text-danger-400` |

> ℹ️ Each palette follows Tailwind's `50–950` shade naming convention, so you can pick lighter or darker tones with predictable increments.

## Typography scale

| Utility | Purpose | Notes |
|---------|---------|-------|
| `text-display-2xl`, `text-display-xl`, `text-display-lg` | Hero and marketing headings. | Pair with `font-semibold` or `font-bold` for additional weight. |
| `text-heading-xl` → `text-heading-sm` | Application headings. | Ideal for page titles (`xl`/`lg`) and card headings (`md`/`sm`). |
| `text-body-lg`, `text-body-base`, `text-body-sm` | Primary, base, and secondary body copy. | Already include comfortable line-height (`1.65–1.7`). |
| `text-eyebrow` | Eyebrow / kicker text. | Automatically applies wide letter-spacing; add `uppercase` where needed. |

## Spacing scale

Additional spacing tokens provide more granular rhythm between components:

- `4.5` → `1.125rem`
- `13` → `3.25rem`
- `18` → `4.5rem`
- `22` → `5.5rem`
- `26` → `6.5rem`
- `30` → `7.5rem`
- `34` → `8.5rem`
- `42` → `10.5rem`
- `108` → `27rem`

Use them with standard spacing utilities such as `p-18`, `px-22`, `gap-30`, or `space-y-34`.

## Forms plugin

The preset registers `@tailwindcss/forms` with `strategy: 'class'`. Add the `form-input`, `form-select`, or `form-textarea` classes to opt into the styled controls while keeping the default utilities untouched.

## Practical example

The health dashboard (`app/client/src/features/home/HomePage.jsx`) showcases the new tokens:

- Layout background: `bg-brand-950`
- Card surface: `bg-brand-900/70` with `border-brand-800`
- Eyebrow heading: `text-eyebrow text-accent-300`
- Status badges: `bg-success-500/15` and `bg-danger-500/15`

Use this file as a reference when introducing the tokens to new features.
