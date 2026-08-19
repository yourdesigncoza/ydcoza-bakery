# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev            # dev server on :3000
npm run build          # production build (also typechecks)
npm run lint           # eslint
npx tsc --noEmit       # typecheck alone — faster than a full build

vercel env pull        # refresh .env.local from the cloud project
```

There is no test suite. Don't invent one unless asked; verify changes by building and driving the app.

Option tile photography is generated, not hand-made:

```bash
npx tsx scripts/generate-catalogue-images.ts                 # fill in anything missing
npx tsx scripts/generate-catalogue-images.ts --force types   # redraw one section
```

Each tile costs roughly R1.30 against `OPENROUTER_API_KEY`. Existing files are skipped unless `--force` is passed.

## What this is

A demonstration storefront for a fictional bakery (Bloom & Batter). A customer designs a cake from pre-approved options, renders an AI impression of it, pays via PayFast, and tracks the order; the bakery works it from an order board. Deployed at `bakery.yourdesign.co.za`, auto-deploying from `main`.

## Architecture

### The catalogue is the single source of truth

`src/lib/catalogue/index.ts` defines every option the customer can pick, along with its price, lead time, tile image and the phrase used to describe it to the image model. Everything downstream derives from it:

- `pricing.ts` — turns a `CakeConfig` into line items, a total, quote routing and lead times
- `prompt.ts` — assembles the image prompt from each option's `promptFragment`, plus the preview cache key
- `CakeSummary.tsx` — the order brief, rendered identically in the builder, checkout, tracking page and admin board

Adding a menu option is one edit to the catalogue. The builder tile, the price, the brief, the admin board and the render prompt all follow. Resist adding option names or prices anywhere else.

### One deployment, one market

`src/lib/market.ts` holds the currency, locale and tax label for the country
being sold into, chosen at build time by `NEXT_PUBLIC_MARKET` and defaulting to
South Africa. There is no currency switcher and nothing converts: per-market
prices are stated outright in `catalogue/prices.ts` and fall back to the rand
figures. `formatMoney()` builds on `Intl`, then swaps in the market's own
separators — CLDR's en-ZA gives `R 1 290,00`, and South African price lists say
`R1 290.00`.

Currency lives there and nowhere else. It used to be declared on `BRAND` as
well, unread, which is two places to edit and no way to notice they disagree.

The tax fields are recorded but nothing computes or displays tax — prices are
quoted as the customer pays them. Only South Africa carries a rate, because only
South Africa's was already written down. What a cake attracts elsewhere is for
the buyer's accountant, not this repo.

`DEFAULT_CONFIG` (same file) is the cake a visitor starts with. Every default is deliberately the R0 option in its list and `addOnIds` is empty, so the opening price is the honest base cake — do not pre-select chargeable extras.

### State is carried in the URL, not stored

There is no localStorage, cookie or session for the design. `config-codec.ts` encodes a `CakeConfig` into the `?d=` query parameter, which is how checkout receives the cake and how "back to the builder" restores it.

**`config-codec.ts` runs in both the browser and on the server**, so it uses `btoa`/`atob` and `TextEncoder`. Node's `Buffer` is not available in the client bundle — using it here throws `Unknown encoding: base64url` at runtime.

### Previews cost money, so they are cached by design

`POST /api/preview` checks `findPreview()` before spending anything. Previews are filed in Vercel Blob under a SHA-256 of `previewCacheKey(config)`, which covers only the fields that change the picture — so a repeat design is free. Per-caller throttling (`rate-limit.ts`) is a per-instance backstop, not a global guarantee; the cache is the real cost control.

`priceCake()` and the preview prompt are recomputed server-side from the design. Never trust a total or an image URL posted from the client — `placeOrder` recovers the preview from the design hash rather than accepting a URL.

### Orders are deliberately not persisted

`src/lib/orders/store.ts` defines the `OrderStore` interface with an in-memory implementation. **Orders are lost whenever the serverless instance recycles, including every deploy.** This is an accepted demo trade-off, not an oversight — the owner declined a database. If that changes, implement the interface behind `DATABASE_URL`; nothing else should need touching.

Customer PII (name, email, phone, delivery address) must not go in the Blob store — it is public. Blob holds only rendered previews and inspiration photos.

### One payment step at a time

`src/lib/payments.ts` picks the payment step from `PAYMENT_PROVIDER`: PayFast
(the default) or `demo`. Both finish in `confirmPayment()`, which holds the one
rule a completed payment obeys — only an order still at `awaiting_payment`
moves to `confirmed`. Do not re-implement that transition per provider.

`PAYMENT_PROVIDER=demo` renders `/pay/[reference]` as our own simulated
checkout instead of handing over to PayFast, so a demonstration built for a
market PayFast cannot serve still shows the whole flow in the right currency.
Three things about that page are not stylistic and must survive any edit:

- **No third-party branding.** No processor's name, mark or styling. It is the
  bakery's page. Imitating a real processor misrepresents a company the owner
  has no relationship with, and a prospect's screenshot would imply an
  integration that does not exist.
- **No usable card form.** The fields are fixed at `4242 4242 4242 4242`,
  disabled, unnamed and submitted nowhere. Making them typeable turns a public
  URL into a phishing-shaped object regardless of intent.
- **The notice stays above the button and stays large.** "Demonstration only —
  no payment is taken and no card details are stored." Not small print.

`paymentProvider()` refuses to return `demo` when live PayFast credentials
(`isLive()`, the `PAYFAST_*` variables) or any Stripe secret key are present,
throwing rather than rendering. It is re-checked inside the server action as
well as the page, because the action confirms an order for free. A simulated
checkout on a deployment that could take real money is the failure this whole
arrangement exists to prevent.

### PayFast

`src/lib/payfast.ts`. Non-obvious constraints, each of which produces a confusing failure:

- **The sandbox merchant has a passphrase** (`jt7NOE43FZPn`, defaulted in `SANDBOX`). Signing without it fails as *"signature does not match"*, which reads like a broken algorithm rather than a missing credential.
- **`item_name` / `item_description` are sanitised by PayFast** before it regenerates the signature, so em dashes, ampersands and other punctuation break an otherwise-correct signature. `plainText()` strips them; keep free text out of these fields.
- **Field order matters** — the signature is taken over the fields in the order given, which is PayFast's documented order.
- **No `notify_url` is sent from localhost**, since PayFast cannot reach a dev machine. Payments stay at `awaiting_payment` locally and are confirmed by hand from the board.
- **The ITN, not the browser redirect, marks an order paid** (`/api/payfast/notify`). The redirect can be forged and the customer may close the tab. The handler answers 200 even for notifications it rejects, so PayFast stops retrying.

### Builder layout

`CakeBuilder.tsx` holds one `CakeConfig` and five `BuilderColumn`s. Changing cake type can retire the selected size, so `chooseType` re-picks it.

**Do not make the columns their own scroll containers.** They were, with `overscroll-behavior: contain`, and because their content exactly filled them there was nothing to scroll inside — the wheel and touch drags were swallowed over every column and never reached the page. The document scrolls as one; column headings use `column-heading` to stick on desktop instead.

### Admin

`/admin` is gated by `ADMIN_PASSWORD` via an HMAC-signed cookie (`admin-auth.ts`). With no password configured the board stays closed rather than open.

## Environment

`OPENROUTER_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` are set on all three Vercel scopes. `NEXT_PUBLIC_MARKET` is unset, so the demo builds for South Africa; an unrecognised value fails the build rather than quietly shipping rand prices to another country. `PAYFAST_LIVE` and the `PAYFAST_*` credentials are unset, so the app runs against the sandbox. `PAYMENT_PROVIDER` is unset too, so the deployed demo hands over to PayFast; the market builds sold abroad set it to `demo`.

The Vercel CLI cannot set Preview-scope variables — it loops on a git-branch prompt regardless of `--yes`. Use the REST API (`POST /v10/projects/{id}/env` with `target: ["preview"]`) or the dashboard.

## Conventions

`idea/` is gitignored on purpose: it holds a real bakery's photographs and a copyrighted paper, and this repo is public. Keep it out of commits, and use generated imagery rather than those files.

Per the user's global instructions, only perform git operations when explicitly asked, and never attribute commits to Claude.
