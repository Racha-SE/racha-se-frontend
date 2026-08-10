# Contributing

Please read this before you start coding here. This file explains the frontend structure, where code should live, and how frontend team members should collaborate on this repo.

## Architecture

Keep code organized by responsibility. If a file starts doing more than one job, split it before it becomes the pattern other people copy. For example, create a new component when the same UI block appears in more than one page, when a section of TSX becomes hard to scan, or when state/behavior belongs to a smaller part of the page. Create a new API function when a backend call is used by a page, and create a utility only when the logic is generic enough to be reused outside one feature.

### `src/api/`

Backend API access lives here.

- Use `src/api/client.ts` as the shared request wrapper.
- Add feature-specific API files beside it, for example `src/api/products.ts` or `src/api/mock-users.ts`.
- Do not call `fetch(...)` directly from page components.
- Do not hardcode backend URLs in pages or components. Use `VITE_API_BASE_URL` through the API client.

Avoid calling `apiClient` directly from a page:

```tsx
import { apiClient } from "@/api/client";

const response = await apiClient.get("/mock/users");
```

Create a feature API function instead:

```ts
import { apiClient } from "@/api/client";

export function getMockUsers() {
  return apiClient.get("/mock/users");
}
```

Then call that function from the page:

```tsx
import { getMockUsers } from "@/api/mock-users";

const response = await getMockUsers();
```

### `src/components/`

Reusable UI components live here.

- `src/components/ui/` is for shadcn/ui components.
- Shared app components can live directly under `src/components/` or a clear subfolder.
- Prefer existing shadcn/ui components before creating custom UI from scratch.
- Components in this folder should not know about backend endpoints.
- shadcn/ui files are source code in this repo, not ignored generated files. Keep them linted and formatted.

### `src/lib/`

Generic frontend utilities live here.

- Keep utilities simple and not tied to React when possible.
- `src/lib/utils.ts` contains shared low-level helpers such as `cn()`.
- Do not put business/domain logic here just because it is reused.

### `src/pages/`

Full-page route screens live here.

- Group pages by user viewpoint, for example `hq`, `branch`, and `cashier`.
- Page components can compose API functions, components, and local state for that screen.
- Keep reusable UI out of pages once a pattern appears in more than one place.

### `src/router.tsx`

Route registration lives here.

- Register frontend routes in one place.
- Keep route entries boring: path to page component.
- Do not put API calls or business logic directly in the router.

## Path Aliases

- `@/*` maps to `src/*`.
- Use `@/...` for cross-folder imports.
- Keep same-folder imports relative, for example `./button`.

## Environment

- Frontend-readable env vars must start with `VITE_`.
- Do not commit `.env`.
- Add new env vars to `.env.example`.

## Adding A Page

1. Create a page component under `src/pages/<module>/`.
2. Add the route in `src/router.tsx`.
3. Add API calls through a file in `src/api/` if the page needs backend data.
4. Reuse components from `src/components/ui/` or `src/components/`.

## Git / Commits

- Use Conventional Commits, for example `feat: add product page` or `chore: add api client`.
- Do not push directly to `main`; open a PR instead.
- Install all three pre-commit hook stages: `pre-commit`, `commit-msg`, and `pre-push`.

Reference: [commitlint conventional config](https://commitlint.js.org/reference/configuration.html).

Common commit types:

| Type       | Use when                                          |
| ---------- | ------------------------------------------------- |
| `feat`     | Adding a user-facing feature                      |
| `fix`      | Fixing a bug                                      |
| `docs`     | Updating documentation                            |
| `chore`    | Tooling, setup, dependencies, or repo maintenance |
| `refactor` | Changing code structure without changing behavior |
| `test`     | Adding or updating tests                          |
| `style`    | Formatting-only changes                           |
| `build`    | Build system or package changes                   |
| `ci`       | CI workflow changes                               |
| `perf`     | Performance improvements                          |
| `revert`   | Reverting a previous commit                       |

Keep the subject lowercase:

```txt
docs: update frontend readme
chore: add pre-commit hooks
feat: add product page
```

Avoid:

```txt
docs: Update Frontend README
update stuff
fix bug
```

## Checks

Before opening a PR, run:

```bash
bun run typecheck
bun run lint
bun run format
bun run build
```
