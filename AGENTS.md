# AGENTS.md

## Cursor Cloud specific instructions

This is the `shadcn/ui` monorepo (pnpm + Turborepo). Standard commands live in `package.json` and `CONTRIBUTING.md`; only non-obvious, durable notes are captured here.

### Services / products
- `apps/v4` — the Next.js 16 website powering `ui.shadcn.com`. It also serves the component **registry** at `http://localhost:4000/r`. Dev server runs on **port 4000** (`pnpm v4:dev`).
- `packages/shadcn` — the published `shadcn` CLI. It consumes the registry served by `apps/v4`. Build with `pnpm shadcn:build`; run against the local registry with `pnpm shadcn <init|add|...>` (which sets `REGISTRY_URL=http://localhost:4000/r`, so `pnpm v4:dev` must be running first).
- `packages/tests` — integration tests that run the built CLI against the live `v4` registry server on port 4000.

### Non-obvious setup / run caveats
- **Bun is required** (in addition to Node + pnpm) for `pnpm registry:build`, `pnpm v4:build`, `pnpm test:apps`, and the full `pnpm test` flow (they invoke `bun --conditions=react-server ...`). It is installed at `~/.bun/bin` (already on PATH for login shells via `~/.bashrc`). Lint, typecheck, format, and the CLI unit tests (`pnpm shadcn:test`) do NOT need Bun or a running server.
- **Build the CLI before typecheck/format:** `apps/v4` imports types from `packages/shadcn/dist`, so run `pnpm shadcn:build` (or `pnpm --filter=shadcn build`) before `pnpm typecheck` / `pnpm format:check`. CI does the same.
- `pnpm test` starts the `v4` dev server via `start-server-and-test`, runs the suite, then tears the server down — the trailing `SIGINT` / `Command failed with signal "SIGINT"` at the very end is the expected teardown, not a test failure (check the reported test totals and exit code instead).
- `pnpm install` prints "Ignored build scripts" warnings (esbuild, msw, puppeteer, sharp, unrs-resolver) and "Failed to create bin ... shadcn" until the CLI is built. Both are harmless for dev/test; the v4 dev server and registry build work without approving those build scripts.
- Env vars used by `v4`: `NEXT_PUBLIC_APP_URL=http://localhost:4000` and `NEXT_PUBLIC_V0_URL=https://v0.dev` (both non-secret; see `apps/v4/.env.example`). No secrets are required to run or test locally.

### Common commands
- Install: `pnpm install`
- Website dev server (port 4000): `pnpm v4:dev`
- Build CLI: `pnpm shadcn:build`
- Run CLI locally against local registry: `pnpm shadcn add button -c <target-dir>` (needs `pnpm v4:dev` running)
- Lint: `pnpm lint` — Typecheck: `pnpm typecheck` (build CLI first) — Format check: `pnpm format:check`
- CLI unit tests only (no server): `pnpm shadcn:test`
- Full test suite (needs Bun; starts v4 on :4000): `pnpm test`
