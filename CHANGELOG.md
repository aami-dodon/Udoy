## 2025-10-20 09:16 IST
- Removed the redundant `tokens.mjs` re-export now that `tokens.js` ships hybrid module support.
- Updated the shared theme documentation to point to the canonical token catalogue.

## 2025-10-30 10:50 IST
- Retired the client `/theme` showcase route and removed the ThemePage bundle so only production surfaces ship in the SPA.
- Updated theme documentation and route catalog to reflect the removal of the dedicated design reference page.

## 2025-10-30 09:30 IST
- Linked the client container `node_modules` directory at `/usr/src/node_modules` so shared `@components` imports can resolve Radix and class-variance dependencies during Vite dev runs.

## 2025-10-30 09:05 IST
- Copied the shared shadcn component library into the client Docker image so the `@components/ui` alias resolves during dev-server builds inside containers.

## 2025-10-30 08:45 IST
- Restored the client Vite dev server root to the allow list so `/index.html` loads without triggering 403 errors during local development.

## 2025-10-20 07:35 IST
- Extended the client Vite alias map with a direct `@components/ui` entry and allowed the dev server to read from `app/shared/components`, resolving the ThemePage import error for the shared shadcn wrappers.

## 2025-10-30 07:00 IST
- Replaced Heroicons with Lucide React icons across the shared registry and theme showcase, including the `/theme` reference page.
- Updated the shared Tailwind icon utilities and documentation to reflect Lucide stroke weights and component usage.
- Swapped the client dependency from `@heroicons/react` to `lucide-react` for future development.

## 2025-10-20 06:44 IST
- Converted the shared `tokens.js` design token catalog to support both ES modules and CommonJS, preventing the `module is not defined` runtime in the client while keeping Tailwind consumption working.
- Updated the `.mjs` re-export to consume the new hybrid module so React pages can continue to import named token sets without changes.

- Centralized the LMS yellow/grey/red palette inside the shared Tailwind tokens and mapped the values to shadcn CSS variables for light and dark modes.
- Refined button, card, and form primitives so hover, focus, and disabled states rely exclusively on the new brand tokens.
- Introduced the `/theme` design reference route that documents colors, typography, components, layout primitives, interactions, and Heroicons in both themes.

## 2025-10-20 06:03 IST
- Installed shadcn/ui tooling in the client so new components inherit the shared Udoy Tailwind theme.
- Added baseline Button, Input, Label, Textarea, and Card primitives that wrap the theme tokens for consistent UI building blocks.
- Extended the client Tailwind config with design token variables, animations, and a component alias configuration to match shadcn/ui conventions.

## 2025-10-20 05:39 IST
- Installed `@heroicons/react` in the client and exposed centralized helpers under `app/shared/icons` for consistent usage.
- Added theme-level `.icon` component classes to the Tailwind preset so Heroicons inherit Udoy sizing, alignment, and stroke rules.
- Documented the icon system in the shared theme and iconography READMEs to guide developers.

## 2025-10-28 09:15 IST
- Removed the marketing landing, health dashboard, and theme showcase routes from the client.
- Replaced the home experience with a minimal "hello world" placeholder for future development.
- Updated the documented route catalog to reflect the streamlined navigation footprint.


## 2025-10-20 04:19 IST
- Fixed shared button typography by resolving Tailwind font-size tokens so CTA labels render correctly across the site.

## 2025-10-27 10:05 IST
- Reimagined the landing page with a light, airy navigation bar, gradient hero, and refreshed CTA suite that surfaces login, register, sponsor, and volunteer journeys prominently.
- Added thematic pillars, sponsor benefits, FAQs, and footer interactions to reinforce the new earthy-green identity and guide every audience segment to action.
- Polished layout treatments with translucent surfaces, soft gradients, and updated storytelling blocks that align with the redesigned light theme.

## 2025-10-26 09:20 IST
- Rebuilt the Udoy Tailwind preset as a light, earthy-green system with refreshed surface tokens, typography (Fraunces & DM Sans), and uplifted component styles.
- Crafted a navigation-first landing experience with hero storytelling, ecosystem highlights, testimonials, and clear CTAs for login, register, sponsors, and volunteers.
- Updated the favicon and client metadata to match the new palette while keeping social sharing previews aligned with the 2025 narrative.

## 2025-10-25 11:45 IST
- Reimagined the shared Tailwind theme with an earthy green palette, warm neutrals, and Playfair/Manrope typography for the new marketing direction.
- Built an inspiring Udoy landing page with mission storytelling, impact stats, ecosystem highlights, and CTAs while relocating the health dashboard to `/health`.
- Refreshed client metadata with SEO copy, favicon, and Open Graph assets so social previews and discovery feel on-brand.

## 2025-10-24 14:45 IST
- Implemented branded 403, 404, 500, and generic error experiences that follow the shared Udoy theme and link users back to the home dashboard.
- Added a reusable client error boundary that captures unexpected React render failures and surfaces the generic fallback with a retry control.
- Registered the new error routes in the SPA manifest so navigation and documentation stay aligned.

## 2025-10-20 02:34 IST
- Added a shared `data-table` component in the Tailwind preset with edit, modify, and delete action styles for consistent inline controls.
- Updated the theme showcase page to demonstrate the new table along with usage tokens.
- Documented the table API in the centralized theme README for quick copy-and-paste markup.

## 2025-10-22 10:20 IST
- Added class name annotations to the `/theme` showcase so developers can copy the exact utility tokens for colors, typography, buttons, and badges.

## 2025-10-20 01:59 IST
- Introduced a `/theme` client route that renders the centralized token and component catalog, replacing the standalone HTML preview.
- Documented the new showcase path in the theme README and updated the route registry for developer discovery.

## 2025-10-20 01:43 IST
- Rebuilt the shared Tailwind preset with expanded design tokens, base resets, component classes, LMS patterns, and layout utilities for the centralized Udoy theme.
- Updated the client health dashboard and root layout to rely on the new theme primitives (`app-shell`, `card`, `badge`, `btn`, `field`, and `alert` classes).
- Documented usage in the theme README and added `theme-preview.html` so designers can review the token and component catalogue.


## 2025-10-21 18:30 IST
- Secured the `/api/email/test` endpoint with JWT authentication and Casbin enforcement using the new `email:test` resource mapping HTTP verbs to RBAC actions.
- Granted the admin role permission to invoke the email testing endpoint and documented the requirement in the Casbin policy file.
- Updated Swagger and `API-SPECS.md` entries to describe the authentication, authorization, and error semantics for the test email route.

## 2025-10-19 23:43 IST
- Removed the client-wide `body` overrides so Tailwind preflight and theme utilities govern fonts and spacing.
- Introduced a shared app root layout utility and applied it in the React entry point for consistent typography/background.
- Verified the Vite client renders correctly with Tailwind-driven styles via the dev server.

## 2025-10-21 15:45 IST
- Extended the MinIO integration with presigned URL helpers, configuration guards, and a dedicated integration index for reuse.
- Added secured `/api/uploads/presign` routing that issues upload/download URLs via JWT + Casbin checks with expiry metadata.
- Created shared editor upload utilities to request presigned URLs and stream assets directly to MinIO from the client.
- Documented the new storage endpoint in `API-SPECS.md` and refreshed health checks to surface MinIO readiness state.

## 2025-10-21 12:30 IST
- Added Swagger JSDoc tooling and UI to the server with a documented `/api/docs` route and JSON schema feed.
- Annotated health and auth routes to auto-generate the OpenAPI spec and aligned `API-SPECS.md` with the schema.
- Installed Swagger dependencies in the server package and introduced configuration helpers under `src/config/swagger.js`.

## 2025-10-19 17:49 IST
- Added a Nodemailer transporter integration configured via central environment settings with Winston error logging.
- Built an email service with templated verification and password reset helpers plus a test endpoint for triggering sends.
- Updated the client home dashboard with a form to send test emails and documented the new API.

## 2025-10-20 00:25 IST
- Refined the server middleware README to document actual token sources, Casbin requirements, and response codes.

## 2025-10-19 17:24 IST
- Added Casbin with a file-backed policy and enforcer singleton under `server/src/integrations/casbin/`.
- Created authorization middleware and an admin overview route gated by JWT + Casbin checks.
- Documented the admin API endpoint, policy structure, and installed the RBAC dependency.

## 2025-10-21 09:45 IST
- Introduced JWT configuration, utilities, and authentication middleware scaffolding on the server.
- Added placeholder auth routes with documentation updates to outline login and refresh flows.
- Installed JWT and hashing dependencies to support future auth implementation work.

## 2025-10-20 12:10 IST
- Expanded the shared Tailwind preset with an earthy blue brand palette, golden accents, typography scale, spacing tokens, and shared shadows.
- Registered `@tailwindcss/forms` across apps and documented how to consume the new design tokens.
- Updated the client health dashboard to showcase the refreshed tokens and ensure the preset is wired through the Vite build.

## 2025-10-19 16:45 IST
- Added shared Tiptap editor configuration (extensions, defaults, styling tokens) under `app/shared/editor/` for reuse across apps.
- Implemented a reusable `RichTextEditor` React component that consumes the shared preset and exposes asset upload callbacks.
- Documented integration guidelines and component usage in the shared editor README.
- Installed Tiptap dependencies and PropTypes in the client package to support the new editor component.

## 2025-10-19 08:11 IST
- Realigned the server code to use module-based routing and dedicated integrations, and added project scaffolding directories to match the prescribed structure guidelines.

## 2025-10-19 05:39 IST
- Initialized project structure with client (React + Vite) and server (Express) applications.
- Added environment template, Docker configuration, and baseline documentation.

## 2025-10-19 06:11 IST
- Integrated Prisma ORM with an initial `HealthCheck` model and generated migrations.
- Updated the health check endpoint to validate database connectivity via Prisma.
- Added graceful shutdown handling to close Prisma connections during server exit.

## 2025-10-19 07:05 IST
- Enhanced the health check endpoint to report database, MinIO, and CORS status along with server uptime.
- Introduced a MinIO client integration and refreshed the client dashboard to surface the detailed health metrics.

## 2025-10-19 07:13 IST
- Updated the Vite client configuration to read the allowed host list and port from environment variables, enabling `CLIENT_ALLOWED_HOSTS` overrides.
