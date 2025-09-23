# Automation & Agents

## Agents

These rules apply to **all aegnts** working on the LMS project. Follow them strictly to maintain consistency, security, and quality.

### 1. Code & Project Structure  
- Follow **feature-based folder structure** (no dumping everything into `/utils`).  
- Always separate **frontend, backend, shared** code.  
- Mirror slices: every `client/src/features/<feature>` must have a matching `server/src/modules/<feature>` (same name, docs, and routes).  
- House cross-cutting adapters (email, storage, external APIs) under `server/src/integrations` and inject them into features.  
- Keep documentation updated in `/docs` after each feature; add a short README inside each feature/module describing owned UI and APIs.  
- Every new feature = new folder under `/modules` (backend) or `/features` (frontend).  


### 2. Languages & Standards  
- **Language:** JavaScript (Node.js for backend, React for frontend).  
- Use **ES Modules** (`import/export`) consistently.  
- Enforce linting & formatting via **ESLint + Prettier**.  
- Write **JSDoc** comments for all functions and APIs. 


### 3. Security  
- Always hash passwords with **bcrypt**.  
- Never log sensitive data (tokens, passwords, emails).  
- Use **JWT** for authentication.  
- Use **RBAC** middleware for role-based access.  
- Configure **CORS** to allow only trusted origins (multiple via `.env`).  
- All file uploads (profile pics, videos) must go to **MinIO via presigned URLs**.  

### 4. API & Logging  
- Every API must be documented in **Swagger (OpenAPI)**.  
- Log all requests/responses with **Winston + Morgan**.  
- Use structured JSON logs only.  
- Export shared request/response shapes from `shared/types` and reference them in controller/service JSDoc.  
- Error handling via central middleware (`/middlewares/errorHandler.js`).  

### 5. Database & Models  
- **Postgres**: Use **Prisma ORM** for relational data (courses, enrollments). Prisma schema lives in `server/prisma/schema.prisma`; run `npm run prisma:migrate` when altering it.  
- **MongoDB**: Use **Mongoose** for flexible data (progress tracking, events).  
- Every schema change must update `/docs/server/models.md` and the relevant entries in `shared/types`.  

### 6. Frontend Guidelines  
- Use **Material UI** for all components.  
- Routes managed in `routes.js`, not hardcoded.  
- No inline CSS — always use theme overrides or styled components.  
- Components must be **reusable and small**.  

### 7. Git & Workflow  
- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`.  
- Pull Requests must include:  
  - What changed  
  - Why it changed  
  - Screenshots (if UI)  
- At least **1 code review approval** before merge.  
- Never commit `.env` files.  

### 8. Environment & Config  
- All config values must come from `.env` (never hardcoded).  
- `.env.example` must be updated whenever a new variable is introduced.  
- Separate configs for **dev, staging, prod**.  

### 9. Testing  
- Every new API must have at least a **basic integration test**.  
- Use **Jest** for backend, **React Testing Library** for frontend.  
- Critical flows (auth, payments, uploads) must be tested end-to-end.  


## 10. Documentation & Communication  
- Update relevant `/docs` files whenever a feature is built (mirror updates in both `docs/client` and `docs/server`).  
- Update `CHANGELOG.md` for every release.  
- Document roles & responsibilities in `AGENTS.md`.  
- If unclear, ask questions in **issues/discussions**, not in code comments.  



## Human Developers
- Own feature development, review automation output, and ensure production readiness.
- Manage environment secrets (JWT, database, MinIO, SMTP), seed roles, configure support email routing, and maintain documentation across phases.

## CI/CD Pipelines
- Validate builds, run automated tests, and deploy the client and server apps.
- Execute auth regression tests to confirm protected routes enforce JWT policies before release, including verification and password-reset flows.

## Monitoring & Alerting (Future)
- Track service health and notify the team about incidents or regressions.

> This document will expand as new automation or human roles are defined.
