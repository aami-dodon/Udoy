# 1. Agent Guidelines

These guidelines apply to **all contributors and agents** working on the project.  
Follow them strictly to maintain **quality**, **consistency**, **security**, and **scalability** across all environments.

> 📝 **TL;DR**:  
> The `.env.local` file is preconfigured with working public database, SMTP, and other settings, so you can run and test the project without extra setup.  
> If you change any environment variables, update both `.env.local` (for your local tests) and `.env.example` (as a template for others).  
> After making changes, **test with `.env.local`** as and when required to ensure everything works and no errors occur.

---

## 2. Tech Stack Overview

| Technology              | Purpose                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------|
| Postgres                 | Primary relational database **hosted externally** (connected via `.env` connection string). |
| Express.js               | Server framework for REST APIs.                                                            |
| React.js (JavaScript)    | Client framework for the user interface — built entirely with JavaScript (no TypeScript).  |
| Vite                     | Lightweight build tool and dev server for fast frontend development (used instead of Next.js). |
| React Router DOM         | Client-side routing for single-page application (SPA) navigation.                          |
| Axios                    | HTTP client for communication between frontend and backend.                                |
| Node.js                  | Server runtime environment.                                                                |
| TailwindCSS + shadcn/ui  | Utility-first CSS framework + prebuilt, accessible React component library with Tailwind-based design system. |
| Lucide React Icons       | Modern icon library used with shadcn/ui components (replacing Heroicons).                  |
| Tiptap Editor            | Headless WYSIWYG editor with React integration and theme control. Extended with custom video support for **direct uploads to MinIO** (used for all media: video, images, docs). |
| Prisma ORM               | Schema and database management for Postgres.                                               |
| JWT                      | Authentication strategy using JWT tokens to secure API routes and sessions.                |
| Casbin (RBAC)            | Policy-based role and permission control integrated with Express.js.                       |
| dotenv                   | Environment variable management for configuration across frontend and backend.             |
| CORS Middleware          | Enables secure cross-origin communication between Vite frontend and Express backend.       |
| Nodemailer               | Server-side email sending.                                                                 |
| Winston + Morgan         | Structured JSON logging for server monitoring and debugging.                               |
| Swagger (OpenAPI)        | API documentation for all backend routes.                                                  |
| MinIO                    | **Externally hosted** object storage for **all file uploads including video**, using presigned URLs. |
| Socket.io                | Real-time communication layer between client and server.                                   |
| Meilisearch              | Search engine used for content indexing and retrieval.                                     |

---

## 3. Code and Project Structure

- All apps live in `app/`.
- Product Requirement Documents (PRD), Features, and User Stories live in `docs/`.
- Feature-based organization is required:
  - Client features under `client/src/features/<feature>`
  - Server modules under `server/src/modules/<feature>`
- Shared integrations (Nodemailer, MinIO, Casbin) are in `server/src/integrations`.
- Shared logic lives in `shared/`.
- Single `.env` for all services; template in `.env.example`.
- `.env.local` is used for local development and must **not** be committed.

---

## 4. Server Guidelines

- All APIs must be documented in **Swagger (OpenAPI)**.  
- Use **Winston + Morgan** for structured JSON logging.  
- Centralized error handling is located in `server/src/middlewares/errorHandler.js`.  
- RBAC is enforced via **Casbin middleware**.  
- Socket.io should be used for all real-time communication.

---

## 5. Database and Models

- **Single source of truth:** Postgres.  
- **ORM:** Prisma.  
- Prisma schema is located in `app/server/prisma/schema.prisma`.  
- Run database migrations using `npm run prisma:migrate`.  
- When the `DEMO` variable in `.env` is set (e.g., `DEMO=true`), demo data is seeded automatically.

---

## 6. Client Guidelines

- Use **TailwindCSS with centralized theme configuration** (`app/shared/theme`).  
  - No local overrides are allowed for colors, spacing, or typography.  
  - All styling must reference theme tokens or Tailwind utility classes.

- Use **shadcn/ui components** as the **primary building blocks** of the UI.  
  - Extend components only when necessary and in a reusable, documented way.  
  - Avoid duplicating components that already exist in the library.

- Use **Lucide Icons** consistently through a shared icon component.  
  - Do not embed raw SVGs or import icons inconsistently.  
  - Follow sizing and styling conventions defined in the theme.

- Use Tailwind utility classes for layout and minor styling adjustments only.  
  - Do not use inline styles.  
  - Extract repeating patterns into shared components.

- Define all routes in a single route configuration file (`routes.js`) for SPA navigation.  
  - Use **React Router DOM** for client-side routing.  
  - Prefer lazy loading for route-level components.

- **Tiptap** is the single WYSIWYG editor:  
  - Videos and other assets (PDFs, images, documents) are uploaded directly to **MinIO** using presigned URLs and embedded in content.

---

## 7. Environment and Configuration

- Centralized `.env` file at the root.  
- `.env.example` is the **only** template reference.  
- `.env.local` comes preconfigured with external Postgres and MinIO credentials for local development.  
- All external services are connected using `.env` variables.  
- No need to **containerize MinIO and Postgres**, as they are hosted externally.

---

## 8. Documentation and Communication

- All project-wide changes must be recorded in `CHANGELOG.md`. Include a **Date–Time Stamp (IST)** with every entry.  
- All server APIs must be recorded in `API-SPECS.md`.  
- All client routes must be recorded in `ROUTES.md`.  
- Swagger Docs should be kept up-to-date with actual backend implementation.