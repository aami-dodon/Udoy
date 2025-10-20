# Udoy Central Theme

The Udoy theme is a shared Tailwind preset (`app/shared/theme/tailwind.preset.js`) that unifies the visual language across the
learning platform. Every client application imports this preset through Tailwind's [`presets`](https://tailwindcss.com/docs/presets)
array (see `app/client/tailwind.config.js`). Once added, you can rely on:

- Consistent design tokens (color, typography, spacing, radius, elevation, transitions, breakpoints).
- Opinionated base styles for HTML elements so text, tables, and media look uniform.
- Ready-to-use component classes (`btn`, `card`, `badge`, `alert`, `course-card`, …) for core LMS journeys.
- Layout utilities (`app-shell`, `page-container`, `stack-md`, `flex-center`, `grid-fit-sm`, …) that encode the product’s rhythm.

> ✅ **Rule of thumb:** reach for the shared classes first. Only fall back to raw utilities when you are arranging layout, not when
you are setting core visual attributes.

---

## 1. Foundations / Design Tokens

| Token family | Highlights | Example utilities |
| ------------ | ---------- | ----------------- |
| `brand-*` | Sapphire primary scale for navigation and key actions. | `bg-brand-500`, `shadow-brand`, `text-brand-200` |
| `accent-*` | Emerald secondary scale for highlights and positive cues. | `bg-accent-500`, `text-accent`, `border-accent-400` |
| `neutral-*` | Cool neutrals for typography and surfaces. Alias available as `clay-*` for backward compatibility. | `text-neutral-200`, `border-neutral-800` |
| `surface.{base, muted, raised, subtle, overlay, inverted}` | Semantic background colors that adapt to depth. | `bg-surface-raised`, `bg-surface-muted`, `text-on-surface` |
| `info-*`, `success-*`, `warning-*`, `danger-*` | Feedback palettes that drive alerts, badges, and progress. | `badge badge--success`, `alert alert--danger` |

### Token visualization helpers

- `bg-token-<group>-<shade>` — maps directly to the raw hex/rgba value of each color token. Helpful for building color swatches without falling back to inline styles.
- `w-spacing-<token>` — exposes spacing tokens as widths (the preset multiplies the value by two and clamps at 100%) for rhythm previews like rulers or padding bars.
- `w-progress-<percent>` — lightweight percentage utilities (`0`–`100`) so progress indicators stay tokenized.

Use these helpers when documenting or testing tokens to stay compliant with the "no inline styles" policy.

### Typography

Custom font stacks power two type layers:

- `font-sans` (default) → `Inter`, `SF Pro Display`, and system fallbacks.
- `font-display` → `Poppins` for expressive headlines.
- `font-mono` → `JetBrains Mono` for code/technical readouts.

Scales map to semantic utilities:

- Displays: `text-display-3xl` → `text-display-lg` for hero statements.
- Headings: `text-heading-2xl` → `text-heading-sm` for application sections.
- Body copy: `text-body-lg`, `text-body-base`, `text-body-sm`, `text-body-xs` for paragraphs, metadata, and captions.
- Eyebrow: `text-eyebrow` for kicker labels.

### Spacing, Radius, Elevation, Motion

- Extended spacing tokens (`2.5`, `3.5`, `4.5`, `7.5`, `11`, `13`, `18`, `22`, `26`, `30`, `34`, `42`, `108`).
- Radii: `border-radius` tokens from `xs` to `3xl` plus `pill` for fully rounded chips.
- Shadows: `shadow-soft`, `shadow-brand`, `shadow-accent`, `shadow-raised`, `shadow-focus`, `shadow-outline`.
- Transition helpers: `duration-fast`, `duration-normal`, `duration-slow`, `ease-emphasized`, `ease-entrance`, `ease-exit`.
- Motion: `animate-pulse-soft`, `animate-slide-up-fade`, `animate-shimmer`, `animate-spin-slow`.

### Breakpoints & Layout Scales

- Screens: `xs (480px)`, `sm`, `md`, `lg`, `xl`, `2xl`.
- Containers: automatic centering with padded gutters via `container` plus layout helpers `page-container`, `stack-md`, `grid-fit-sm`.
- Max widths: `max-w-content-sm`, `max-w-content-lg`, `max-w-page`, `max-w-dashboard` keep LMS dashboards readable.

---

## 2. Base Elements

The preset injects Tailwind `@layer base` styles so HTML defaults feel on-brand:

- Document shell: `html`, `body`, and `.app-shell` enforce the dark sapphire background and typography smoothing.
- Headings & paragraphs: semantic fonts, weights, and line-height applied automatically.
- Lists, blockquotes, tables, images, code, and scrollbars receive consistent padding, borders, and colors.
- Accessibility: `:focus-visible` outlines, reduced-motion fallbacks, and keyboard-friendly states.

Wrap each app's root element with the `.app-shell` class to inherit the document-level styling.

---

## 3. UI Components

Component classes live in the preset (`@layer components`). Compose them with utility classes for layout only.

### Buttons

| Class | Purpose |
| ----- | ------- |
| `btn` | Base styling (padding, radius, elevation). |
| `btn--primary` | Primary brand CTA. |
| `btn--accent` | Secondary positive CTA. |
| `btn--secondary` | Subtle surface button. |
| `btn--ghost` | Low-emphasis ghost button. |
| `btn--danger` | Destructive action. |
| `btn--icon`, `btn--sm`, `btn--lg` | Size modifiers. |

### Form Elements

- Inputs: `className="input"`, `textarea` via `className="textarea"`, selects via `className="select"`.
- Labels & messaging: wrap fields with `<label className="field">` and add `field__label`, `field__hint`, `field__error` spans.
- Layout: `form-grid` auto-wraps controls, `.toggle[data-state="on"]` supports switch UI, and the preset keeps focus rings aligned.

### Feedback & Tags

- Badges: `badge`, `badge--info`, `badge--success`, `badge--warning`, `badge--danger`, `badge--neutral`.
- Alerts & toasts: `alert` with status modifiers, `toast` for ephemeral notifications.
- Skeletons & spinners: `skeleton`, `spinner`, `empty-state` for loading/empty feedback.

### Cards & Surfaces

- `card` base plus `card--muted`, `card--brand`, `card--inset`, `card__header`, `card__title`, `card__subtitle`, `card__body`.
- LMS-specific shells: `course-card`, `lesson-module`, `dashboard-widget`, `certificate-card`, `discussion-thread`.
- Data display: `table-card`, `progress-bar` + `progress-bar__value`, `timeline`, `calendar-grid`, `accordion`, `rating`.

### Data Tables

- `data-table` wraps interactive datasets with muted chrome and hover affordances.
- `data-table__toolbar` pairs headings (`data-table__title`, `data-table__meta`) with global actions.
- Row-level quick actions share the same visual language via `data-table__action` plus the semantic modifiers `--edit`, `--modify`, and `--delete`.

```html
<div class="data-table">
  <div class="data-table__toolbar">
    <div class="data-table__heading">
      <h3 class="data-table__title">Courses</h3>
      <p class="data-table__meta">3 active cohorts</p>
    </div>
    <button class="btn btn--primary btn--sm">Add</button>
  </div>
  <table class="data-table__table">
    <thead>
      <tr>
        <th>Course</th>
        <th>Mentor</th>
        <th>Updated</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Design Systems</td>
        <td class="data-table__cell--muted">Anita Rao</td>
        <td class="data-table__cell--muted">Today</td>
        <td><span class="badge badge--success">Active</span></td>
        <td>
          <div class="data-table__actions">
            <button class="data-table__action data-table__action--edit">Edit</button>
            <button class="data-table__action data-table__action--modify">Modify</button>
            <button class="data-table__action data-table__action--delete">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Navigation & Layout Helpers

- Top level: `navbar`, `navbar__brand`, `navbar__menu`.
- Sidebars: `sidebar`, `sidebar__section`, `sidebar__item`, `sidebar__item--active`.
- Wayfinding: `breadcrumbs`, `tabs` + `tab--active`, `pagination` + `pagination__item`/`--active`.
- Utilities: `flex-center`, `flex-between`, `grid-fit-sm`, `grid-fit-md`, `grid-fit-lg`, `stack-sm` → `stack-xl`, `page-section`.

### Overlays & Popovers

- Modals: `.modal` + `.modal__panel`.
- Drawers: `.drawer`.
- Tooltips & popovers: `.tooltip`, `.tooltip__content`.

### Iconography

- `.icon` enforces alignment, color inheritance, and flex behavior for all SVGs.
- Size modifiers (`.icon--xs`, `.icon--sm`, `.icon--base`, `.icon--md`, `.icon--lg`, `.icon--xl`) map to the shared spacing scale.
- Stroke modifiers (`.icon--thin`, `.icon--regular`, `.icon--bold`) tune the Lucide stroke widths used across the experience.
- Consume icons via `<LucideIcon />` from `app/shared/icons` to automatically wire accessibility helpers and theme sizing.

---

## 4. LMS Essentials

The preset targets Udoy’s core scenarios:

- Course discovery: `course-card`, `badge`, `progress-bar`, `rating`.
- Lesson delivery: `lesson-module`, `accordion`, `timeline`, `calendar-grid`.
- Assessment: `quiz-option`, `quiz-option--correct`, `quiz-option--incorrect`.
- Learner engagement: `dashboard-widget`, `discussion-thread`, `profile-avatar`, `certificate-card`.

Combine them with foundational utilities to build dashboards, course outlines, quizzes, and discussion threads without re-inventing
styles.

---

## 5. Using the Theme in a Client App

1. **Consume the preset** in `tailwind.config.js`:
   ```js
   const sharedPreset = require('../shared/theme/tailwind.preset');

   module.exports = {
     presets: [sharedPreset],
     content: ['./index.html', './src/**/*.{js,jsx}'],
   };
   ```
2. **Wrap your root** component with the shared layout class:
   ```jsx
   export default function App() {
     return <div className="app-shell">{/* routes */}</div>;
   }
   ```
3. **Compose UI** using the shared classes. Example card with CTA:
   ```jsx
   <article className="card stack-md">
     <header className="card__header">
       <span className="badge badge--info">New lesson</span>
       <h2 className="card__title">Design Systems 101</h2>
       <p className="card__subtitle">15 lessons • Updated yesterday</p>
     </header>
     <div className="progress-bar">
       <div className="progress-bar__value" style={{ width: '60%' }} />
     </div>
     <div className="flex flex-wrap gap-3">
       <button className="btn btn--primary">Continue learning</button>
       <button className="btn btn--ghost">View syllabus</button>
     </div>
   </article>
   ```

4. **Add feature-specific layout** with utilities (`grid-fit-sm`, `stack-lg`, `flex-between`) while letting components handle
   typography, colors, states, and depth.

---

## 6. Theme Documentation & Visual Regression

The `/theme` route in the client app renders a living catalog of every token and component. Launch the Vite dev server and open the
page locally to validate new additions:

```bash
# from app/client
npm run dev
```

Then visit `http://localhost:5173/theme` (or the port shown in the terminal). The page lives at
`app/client/src/features/theme/ThemeShowcasePage.jsx` and consumes the same shared utilities used across the product.

---

## 7. Changelog Expectations

Whenever the preset changes:

1. Update this README with any new tokens or components.
2. Review `/theme` to ensure designers can visually inspect updates.
3. Note the change in `CHANGELOG.md` with an IST timestamp (see repository root instructions).

Following this flow keeps Udoy’s learning experience coherent while allowing rapid feature delivery.
