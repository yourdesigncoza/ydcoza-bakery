# Bloom & Batter — Build Your Cake

A custom cake ordering system for a small bakery. Customers design a cake from
pre-approved options, see an AI-rendered impression of it, pay online, and track
the order through to collection. The bakery gets a complete production brief
instead of a WhatsApp thread.

Built as a demonstration piece. Bloom & Batter is a fictional studio.

## How it fits together

```
src/lib/catalogue/     the menu — every option, price, lead time and render prompt
  index.ts             the catalogue itself; the single source of truth
  pricing.ts           derives line items, totals, quote routing and lead times
  prices.ts            per-market price tables; the rand figures are the fallback
  prompt.ts            builds the image prompt and the preview cache key
src/lib/market.ts      currency, locale and tax for the market being sold into
src/lib/orders/        order shapes and the storage interface
src/lib/payments.ts    which payment step runs, and the transition a payment causes
src/lib/payfast.ts     payment initiation and notification verification
src/lib/openrouter.ts  image rendering
src/app/               builder, checkout, payment handover, tracking, order board
```

Adding an option to the menu is a single edit to `src/lib/catalogue/index.ts`.
The builder tile, the price, the order brief, the admin board and the wording
sent to the image model all follow from it.

## Selling into another market

One deployment serves one country. `NEXT_PUBLIC_MARKET` picks it at build time,
which settles the currency, the number and date formatting, and what the tax is
called — see `src/lib/market.ts`. Prices are not converted: a market that sells
at its own prices lists them in `src/lib/catalogue/prices.ts`, and anything it
leaves out keeps the rand figure.

Payments are the exception. PayFast is South African and settles in rand only,
so a deployment outside South Africa needs its own gateway before it can take
money. Until one is wired up, `PAYMENT_PROVIDER=demo` puts a simulated checkout
in its place so the flow can still be shown end to end in the market's own
currency.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Environment

| Variable | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_MARKET` | Currency, locale and tax | `za`, `gb`, `ie`, `au`, `nz` or `ca`. Defaults to `za` |
| `OPENROUTER_API_KEY` | Cake previews | Required for the preview button and the tile generator |
| `BLOB_READ_WRITE_TOKEN` | Preview cache, photo uploads | Set automatically by `vercel env pull` |
| `ADMIN_PASSWORD` | The order board | Without it `/admin` stays closed |
| `ADMIN_SESSION_SECRET` | The order board | Defaults to `ADMIN_PASSWORD` if unset |
| `DATABASE_URL` | Order persistence | Without it orders are held in memory and lost on restart |
| `PAYMENT_PROVIDER` | Which payment step runs | `payfast` (default) or `demo` |
| `PAYFAST_LIVE` | Real payments | Defaults to PayFast's sandbox |
| `PAYFAST_MERCHANT_ID` / `_KEY` / `_PASSPHRASE` | Real payments | Only needed when `PAYFAST_LIVE=true` |

Pull the cloud values into `.env.local` with `vercel env pull`.

### Payments

The demo runs against the PayFast sandbox using PayFast's published test
merchant, so no real money moves. Note that the sandbox merchant has a
passphrase set — signing without it is rejected as a signature mismatch, which
is a confusing way to discover a missing credential.

PayFast cannot reach a development machine, so no `notify_url` is sent when
running on localhost. Payments therefore stay at *Awaiting payment* locally and
are confirmed by hand from the order board; on a deployed URL the notification
confirms them automatically.

#### The demonstration provider

`PAYMENT_PROVIDER=demo` replaces the PayFast handover with a simulated checkout
of our own. It exists because PayFast serves South Africa only: a prospect in
Cork or Brisbane clicking *pay* would land on a South African gateway quoting
rands, which is not a demonstration of anything. The demo page prices the order
with `formatMoney`, so it reads in the market's currency, and its button walks
the order into *Confirmed* through the same transition PayFast's notification
uses — the rest of the flow, tracking page and order board included, is real.

What it deliberately is not:

- **Not a payment page.** No money moves and no gateway is contacted. A
  deployment that sells needs a real integration; this is a placeholder for the
  demonstration period, not a substitute for building one.
- **Not dressed as a processor.** It carries no third-party name, logo or
  styling. It is the bakery's own page, so a screenshot of it cannot imply an
  integration that does not exist.
- **Not a card form.** The card fields are fixed at the published test number,
  disabled, and submitted nowhere. A typeable card form on a public demo URL is
  phishing-shaped whatever it was meant for.

It refuses to run where real money could move: setting `PAYMENT_PROVIDER=demo`
alongside `PAYFAST_LIVE=true`, any `PAYFAST_MERCHANT_*`/`PAYFAST_PASSPHRASE`
value, or any Stripe secret key raises an error naming the variable instead of
rendering the page.

## Option photography

The 34 option tiles are generated once and committed:

```bash
npx tsx scripts/generate-catalogue-images.ts           # fill in anything missing
npx tsx scripts/generate-catalogue-images.ts --force types   # redraw one section
```

Each tile costs roughly R1.30 to draw. Live previews are cached in Blob under a
hash of the design, so building the same cake twice costs nothing.
