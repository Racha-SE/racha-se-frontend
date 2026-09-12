# racha-se-frontend

Frontend app for RachaCPALL, built with [Vite](https://vite.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/).

## Prerequisites

- [Bun](https://bun.sh) (JS runtime + package manager)
- [pre-commit](https://pre-commit.com)

Install `pre-commit` with your preferred system package manager. Examples:

```bash
brew install pre-commit
```

```bash
pip install pre-commit
```

## Setup

```bash
# 1. install dependencies
bun install

# 2. copy env vars
cp .env.example .env

# 3. install git hooks
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit install --hook-type pre-push

# 4. run the dev server
bun run dev
```

The frontend is now available at `http://localhost:5173`.

The local backend API base URL is configured in `.env`:

```env
VITE_API_BASE_URL=http://localhost:6767/v1
```

## Scripts

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `bun run dev`        | Start the Vite dev server             |
| `bun run build`      | Type-check and build for production   |
| `bun run lint`       | Run ESLint                            |
| `bun run lint:fix`   | Run ESLint with auto-fix              |
| `bun run format`     | Check formatting with Prettier        |
| `bun run format:fix` | Format files with Prettier            |
| `bun run typecheck`  | Run TypeScript without emitting files |
| `bun run preview`    | Preview the production build locally  |

## Frontend Runtime

```bash
bun run dev
```

The frontend talks to the backend through `VITE_API_BASE_URL`. When the backend is run through Docker Compose, the backend app listens internally on port `3000`, but is exposed to the host on port `6767`; the frontend should use the exposed host URL:

```txt
http://localhost:6767/api/v1
```

API calls should go through `src/api/client.ts`, not direct `fetch(...)` calls inside pages. Feature-specific API wrappers can live beside it, for example `src/api/mock-users.ts`.

## Routing

Routes are registered in `src/router.tsx`. Current top-level route groups are:

| Route      | Viewpoint         |
| ---------- | ----------------- |
| `/hq`      | Headquarter admin |
| `/branch`  | Branch user       |
| `/cashier` | Cashier / POS     |

## UI

This project uses Tailwind CSS and shadcn/ui. shadcn components are copied into this repo under:

```txt
src/components/ui/
```

Because these files are project source code, they are checked by ESLint, Prettier, and TypeScript like any other source file.

## Pre-commit

`.pre-commit-config.yaml` installs checks at three git stages:

- **`pre-commit`**: file hygiene, TypeScript, ESLint, and Prettier
- **`commit-msg`**: commitlint for Conventional Commits
- **`pre-push`**: blocks direct pushes to `main`

Install all three hook stages:

```bash
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit install --hook-type pre-push
```

Run all hooks manually:

```bash
pre-commit run --all-files
```

## Testing

There is no dedicated test suite yet. Before opening a PR, run:

```bash
bun run typecheck
bun run lint
bun run format
bun run build
```
