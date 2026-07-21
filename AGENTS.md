# AGENTS.md

## Cursor Cloud specific instructions

This is the shadcn/ui monorepo (pnpm workspaces + Turborepo). Two products:

- `apps/v4` — the Next.js website (ui.shadcn.com). Dev server runs on port 4000.
- `packages/shadcn` — the `shadcn` CLI. `packages/tests` holds the CLI integration tests.

Standard commands live in the root `package.json`, `apps/v4/package.json`, and `CONTRIBUTING.md`; prefer those. Notes below cover only non-obvious gotchas.

### Environment gotchas

- Bun is required (not just Node): `apps/v4` `registry:build` and `test:apps` invoke `bun`. Bun is installed on `PATH` (persisted via `~/.bashrc`). If `bun` is missing, `pnpm test` and `pnpm registry:build` will fail. Node 22 (system) is used; the repo `.nvmrc` pins an older 20.x but everything runs on 22 (matching the Test CI workflow).
- The `v4` dev server needs `apps/v4/.env.local` (copied from `apps/v4/.env.example`). Without `NEXT_PUBLIC_APP_URL` set, the homepage throws `Invalid URL` and returns HTTP 500. The update script recreates this file; it is gitignored.
- Build the CLI before typechecking/formatting/testing: `pnpm --filter=shadcn build`. `apps/v4` and `packages/tests` import from `shadcn`'s `dist/`, so a fresh checkout needs this first (CI does the same before `typecheck`/`format:check`). `pnpm test` builds it automatically via `registry:build`.

### Running / testing

- Dev (website): `pnpm --filter=v4 dev` → http://localhost:4000 (the `icons:dev` watcher starts alongside Next; the log line about it is expected).
- Lint: `pnpm lint`. Typecheck: `pnpm typecheck` (needs the CLI built first).
- Tests: `pnpm test` from the root. It runs `registry:build` (Bun), then uses `start-server-and-test` to boot the `v4` dev server on port 4000 and run the `shadcn` + `tests` vitest suites against it. On completion it SIGINTs the dev server, which prints a harmless `ELIFECYCLE ... signal "SIGINT"` line — that is NOT a test failure; check the vitest "Test Files ... passed" summary and Turbo's "Tasks: N successful". Do not have another server already bound to port 4000 when running `pnpm test`.
- CLI (manual): with the dev server running, `pnpm shadcn <init|add|...>` points the CLI at the local registry (`REGISTRY_URL=http://localhost:4000/r`).
