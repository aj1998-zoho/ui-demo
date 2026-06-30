# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **shadcn/ui** monorepo (pnpm workspaces + Turborepo). The two
products that matter for local development are:

- `apps/v4` — the Next.js documentation website (`ui.shadcn.com`), runs on **port 4000**.
- `packages/shadcn` — the `shadcn` CLI that adds components to user projects.
- `packages/tests` — integration tests for the CLI.

The update script already runs `pnpm install`. Standard commands live in
`package.json` (root) and each workspace's `package.json`, and contributor docs
are in `CONTRIBUTING.md`. Notes below are the non-obvious gotchas.

### Bun is required (not just pnpm)

`apps/v4`'s `registry:build` (used by `pnpm test` and `pnpm --filter=v4 build`)
runs with **`bun`** (`bun --conditions=react-server ...`). Bun is installed at
`~/.bun/bin` and is on `PATH` via `~/.bashrc`. If `bun` is ever missing,
reinstall with `curl -fsSL https://bun.sh/install | bash`. Node 22 is used here
(works despite `.nvmrc` pinning 20.5.1; `engines` requires `>=20.18.1`).

### Build the CLI before lint / typecheck / test

`pnpm --filter=shadcn build` must run before `pnpm typecheck`, `pnpm test`, or
using the CLI. CI does this explicitly. Skipping it causes workspace bin
warnings (`.bin/shadcn` ENOENT) and `shadcn` import type errors in `apps/v4`.

### Running the website (dev)

`pnpm --filter=v4 dev` (or `pnpm dev`) serves on `http://localhost:4000`. It also
starts an icon watcher. With Turbopack the **first** request to a route compiles
on demand and can take ~30–50s; subsequent requests are fast.

### Local registry + CLI workflow

The dev server also serves the component registry at
`http://localhost:4000/r/...`. `pnpm shadcn <cmd>` runs the locally-built CLI
with `REGISTRY_URL=http://localhost:4000/r` and
`SHADCN_TEMPLATE_DIR=../../templates`, so the dev server must be running for the
CLI to fetch components. Example end-to-end check: with the dev server up,
`pnpm shadcn add card -c <existing-project> --yes` writes the component from the
local registry.

Note: `pnpm shadcn init -t next ...` scaffolds a brand-new app and can stall in
this environment; prefer exercising `add` against an existing project (e.g. a
copy of `packages/shadcn/test/fixtures/vite-with-tailwind`, with its
`components.json` `style` set to `new-york-v4`).

### Tests

- `pnpm --filter=shadcn test` — fast vitest unit suite (~1500 tests), no server needed.
- `pnpm test` (full) — runs `registry:build` (needs **bun**) then
  `start-server-and-test` which boots the v4 dev server on **port 4000** and runs
  the integration suite. Make sure port 4000 is free (stop any running dev
  server) before running it.
