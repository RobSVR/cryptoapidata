# Crypto API Directory

A single-page directory of cryptocurrency APIs with a static, machine-readable catalogue. The initial providers were collected from integrations used by `perpsmania`.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Configuration

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_BUILDER_X_URL` — builder's Twitter / X profile;
- `NEXT_PUBLIC_DONATION_ADDRESS` — donation wallet address;
- `NEXT_PUBLIC_DONATION_NETWORK` — network and asset, for example `USDT — TRON (TRC-20)`.

## Static machine access

- `GET /catalog.json`
- `GET /llms.txt`

`catalog.json` is a static file served without a database or application API. The website and the static JSON file share the same catalogue data.
