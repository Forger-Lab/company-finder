# CompanyNameCheck.uk

The UK company-name availability checker built on the official Companies House
**Schedule 3 "same as" rules**. Type a name (or describe your business) and find
out in under a second whether it's free to register — without paying £50 for a
rejected incorporation.

Powered by [SolvoLab](https://www.solvolab.com).

## What it does

- **Same-as engine** — implements Schedule 3 of the Company, LLP and Business
  (Names and Trading Disclosures) Regulations 2015: disregarded suffixes, word
  and symbol equivalents (`&` ↔ `and`, `4` ↔ `four`, `£` ↔ `pound`, …), accent
  folding, plural collapsing, dotted abbreviations (`L.P.` → `LP`), and the
  60-character cap.
- **Live Companies House data** — hits both the Advanced Search and Basic Search
  APIs in parallel, including dissolved and removed companies.
- **AI name brainstormer** — Gemini-powered suggestions generated from a plain-
  English business description, with built-in self-correction on malformed
  responses.
- **Batch availability** — bulk-check a shortlist in one click.
- **Clear verdicts** — green for "register it", amber for "this match is
  dissolved, may still be claimable", red for "taken".
- **One-click registration** — links straight to the official Companies House
  registration flow when a name is free.

## Tech stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router + Turbopack)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Postgres](https://www.postgresql.org/) with
  [Drizzle ORM](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/) (subscriptions + Customer Portal)
- **Auth**: Email/password with JWT session cookies
- **AI**: Google Gemini (`gemini-2.5-flash`) for name generation
- **Companies data**: Companies House public API

## Getting started

```bash
git clone <this-repo-url>
cd companyfinder
pnpm install
```

You will need keys for:

- A **Postgres** instance (a local Docker one is set up for you by `db:setup`)
- A **Companies House** API key — free, https://developer.company-information.service.gov.uk/
- A **Google Gemini** API key — free tier available, https://ai.google.dev/
- A **Stripe** account if you want to test billing locally

## Running locally

[Install](https://docs.stripe.com/stripe-cli) and log in to your Stripe
account (only needed for payment flows):

```bash
stripe login
```

Bootstrap the local environment (creates `docker-compose.yml`, `.env`, and the
Postgres container):

```bash
pnpm db:setup
```

Add your Companies House and Gemini keys to `.env`:

```env
COMPANY_HOUSE_KEY=...
GEMINI_API_KEY=...
```

Run migrations and seed the database:

```bash
pnpm db:migrate
pnpm db:seed
```

The seed creates a test user:

- email: `test@test.com`
- password: `admin123`

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing payments

Use Stripe's test card:

- Card: `4242 4242 4242 4242`
- Expiration: any future date
- CVC: any 3-digit number

## Deploying

Set the following environment variables on your host (Vercel works out of the
box):

- `BASE_URL` — your production URL
- `POSTGRES_URL` — production Postgres connection string
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `COMPANY_HOUSE_KEY`
- `GEMINI_API_KEY`

For Stripe production webhooks, point them at
`yourdomain.com/api/stripe/webhook` and configure the
`checkout.session.completed` and `customer.subscription.updated` events.

## Independence

CompanyNameCheck.uk is **not** affiliated with Companies House or HM
Government. We consume their public API and apply the published regulations
locally; every result links back to the official record so you can verify it
yourself.

---

Built and operated by **[SolvoLab](https://www.solvolab.com)**.
