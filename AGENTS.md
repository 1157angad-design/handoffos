# HandoffOS Architecture Guide

HandoffOS is an enterprise conversation-continuity platform built with TanStack Start, React 19, TypeScript, Netlify Identity, Netlify Database, Drizzle ORM, Stripe, Recharts, Framer Motion, and Tailwind CSS 4.

## Key Directories

- `src/routes/` contains public pages, authentication pages, protected dashboard routes, and server API routes.
- `src/components/` contains the marketing shell, authentication UI, dashboard application, and logo wrapper.
- `src/server/` contains authenticated server functions used by the dashboard.
- `src/lib/auth.tsx` owns browser session hydration, callback handling, and the server user lookup.
- `db/schema.ts` is the authoritative relational schema.
- `db/index.ts` initializes the Netlify Database Drizzle adapter.
- `netlify/database/migrations/` contains generated database migrations applied by Netlify.
- `public/assets/` contains the original supplied HandoffOS logo and dashboard reference.

## Security Model

- Netlify Identity provides email/password, Google, and GitHub authentication through `@netlify/identity`.
- The `nf_jwt` session cookie is validated by protected route guards and every server operation.
- Workspace access is checked through `organization_members` before project, credential, integration, usage, or support data is returned or changed.
- API keys are generated server-side, displayed once, and stored only as SHA-256 hashes with a non-secret prefix.
- Stripe and webhook secrets are read only from server environment variables.
- Never return secret environment values or stored key hashes to the browser.

## Data Model

The schema includes organizations, users, memberships, projects, API keys, conversations, messages, handoffs, analytics events, integrations, plans, subscriptions, usage records, notifications, audit logs, and support tickets. Schema changes require a new migration generated with `npx drizzle-kit generate --name <imperative_name>`.

## Routing

- `/` and `/$page` serve the public marketing and developer experience.
- `/login`, `/signup`, `/forgot-password`, and `/reset-password` implement authentication flows.
- `/dashboard` and `/dashboard/$section` are protected by a server-side Identity check.
- `/api/v1/handoffs` accepts hashed bearer credentials and persists real handoff events.
- `/api/billing` creates Stripe Checkout sessions when price IDs are configured.
- `/api/webhooks/stripe` verifies Stripe signatures before accepting events.

## Conventions

- Use strict TypeScript and Zod validation at all server boundaries.
- Keep database access in server functions or server API handlers.
- Use `@/` imports for files below `src/`.
- Preserve the supplied logo asset; do not redraw or replace it.
- Use the CSS design tokens in `src/styles.css` for all visual additions.
- Provide loading, error, empty, hover, focus, and mobile states for new UI.
- Do not add hardcoded production metrics; derive dashboard values from persisted records.

## Non-Obvious Decisions

- Netlify platform primitives are used for persistence and identity so database branching, migrations, sessions, and deployment remain native to the hosting platform.
- Default billing plans are inserted into the database when the first workspace is created. They are defaults, not UI-only constants, and can be changed in the database.
- Authentication cannot be fully exercised on a plain localhost server because Netlify Identity requires a deployed Identity backend. Use a Netlify deploy preview or production deployment for end-to-end auth validation.
