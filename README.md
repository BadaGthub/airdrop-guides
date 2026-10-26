# Airdrop Guides Board

Public board of your X/Airdrop guide posts. Visitors can view, filter, paginate and open links. Only the owner (your GitHub account) can add, edit and delete.

**Stack:** Next.js 14 (App Router, TypeScript) · Tailwind CSS · Vercel Postgres (`@vercel/postgres`) · NextAuth.js (GitHub) · Zod

## Assumptions
- Auth: NextAuth + GitHub, single owner. The email on your GitHub account must equal `OWNER_EMAIL`; every other account is rejected at sign-in, and every server action re-checks the session.
- Env vars: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `OWNER_EMAIL`, plus the `POSTGRES_*` vars Vercel injects.
- Mutations use Server Actions (not REST routes) that return `{ ok, error, fieldErrors }`; they call `revalidatePath("/")`.
- `id` is a UUID; timestamps are `timestamptz`; `updated_at` is set by a DB trigger. `cost` is stored as `''` when empty.
- Filter matches project name or status (case-insensitive, substring). `PAGE_SIZE = 25` lives in `lib/config.ts`.
- Edit UX: a modal per row. Delete uses a browser confirm prompt.
- Node 20.6+ is required (the migration script uses `--env-file`).

## Environment variables
See `.env.example`. `OWNER_EMAIL` must be the primary (or a verified) email on your GitHub account.

## 1. Create Vercel Postgres
1. Push this repo to GitHub and import it at vercel.com/new (or run `vercel link`).
2. In the project: **Storage → Create Database → Postgres** (Neon) → connect it to the project. Vercel adds the `POSTGRES_*` env vars.

## 2. Create the GitHub OAuth app
GitHub → Settings → Developer settings → OAuth Apps → New:
- Homepage URL: `http://localhost:3000` (add a second app for production)
- Callback URL: `http://localhost:3000/api/auth/callback/github`

Copy the Client ID to `GITHUB_ID` and a generated secret to `GITHUB_SECRET`. For production create another OAuth app with `https://YOUR-DOMAIN/api/auth/callback/github`.

## 3. Run locally
```bash
npm install
npx vercel link
npx vercel env pull .env.local     # pulls POSTGRES_* vars
# append to .env.local: NEXTAUTH_URL, NEXTAUTH_SECRET (openssl rand -base64 32), GITHUB_ID, GITHUB_SECRET, OWNER_EMAIL
npm run db:migrate                 # creates the guides table
npm run dev                        # http://localhost:3000
```

## 4. Migrate the database
`npm run db:migrate` runs `sql/schema.sql` (safe to re-run). Alternatively paste that file into the Vercel Postgres **Query** tab.

## 5. Deploy to Vercel
1. In Vercel → Settings → Environment Variables add: `NEXTAUTH_URL` (`https://YOUR-DOMAIN`), `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` (production OAuth app), `OWNER_EMAIL`.
2. Run the migration once against the production database (`npm run db:migrate` with the production vars pulled, or use the Query tab).
3. `git push` (or `vercel --prod`).

## How to use
- Click **Owner login** (top right) → sign in with GitHub. If your email does not match `OWNER_EMAIL`, sign-in is refused.
- **Add new guide** opens a form; pasting `x.com/you/status/123` is auto-prefixed with `https://`. After saving you land on page 1 with the new row on top.
- **Edit** and **Delete** appear on every row while you are signed in. Delete asks for confirmation.
- Visitors see the board without any controls. Filtering and page number live in the URL (`/?q=layerzero&page=2`).
