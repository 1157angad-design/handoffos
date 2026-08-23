# HandoffOS

HandoffOS is a production-oriented SaaS platform for bidirectional AI and human conversation handoffs. It preserves summaries, messages, customer state, intent, entities, urgency, and recommended actions as work moves from AI to humans or from humans back to AI.

The project includes a complete public website, live interactive handoff demo, developer documentation, authentication, protected workspace dashboard, persistent PostgreSQL data model, secure API keys, handoff API, analytics, integrations, team roles, audit history, support tickets, and Stripe-ready billing.

## Technology

- TanStack Start and React 19
- TypeScript and Tailwind CSS 4
- Netlify Identity via `@netlify/identity`
- Netlify Database (managed PostgreSQL) with Drizzle ORM
- Stripe Checkout and signed webhooks
- Recharts and Framer Motion
- Zod request validation

## Local Setup

Install dependencies:

```bash
pnpm install
```

Start the local application shell:

```bash
pnpm dev
```

Netlify Identity authentication requires a deployed Netlify environment because the Identity backend and `nf_jwt` cookie are not provided by a plain local Vite server. Use a deploy preview to validate email verification, password recovery, Google OAuth, GitHub OAuth, protected SSR routes, and logout end to end.

## Netlify Configuration

Netlify Database provisions automatically and applies the migration in `netlify/database/migrations/` during deployment. Netlify Identity and Netlify Forms are enabled for the project.

Configure Google and GitHub providers under the site's Identity provider settings. Email/password registration is enabled through the same Identity service. Configure allowed callback URLs for the production domain and deploy previews.

Optional Stripe billing requires these server-scoped environment variables:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER
STRIPE_PRICE_PROFESSIONAL
STRIPE_PRICE_BUSINESS
```

No secret values belong in client-side variables or committed files.

## Product Flow

1. Create a workspace account.
2. Create a project.
3. Generate a secret API key and save it once.
4. Install an SDK or use the REST endpoint.
5. Send a handoff through `POST /api/v1/handoffs`.
6. Inspect the conversation, preserved context, usage, analytics, and audit activity in the dashboard.

## Database Changes

Edit `db/schema.ts`, then generate a new migration:

```bash
npx drizzle-kit generate --name add_descriptive_change
```

Migrations must remain in `netlify/database/migrations/` so Netlify can apply them automatically.
