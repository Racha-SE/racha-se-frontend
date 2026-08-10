# Agent instructions

Read `README.md` and `CONTRIBUTING.md` before making changes.

Do not add `Co-Authored-By` trailers or generated-tool footers to commits.

Frontend conventions:

- Register routes in `src/router.tsx`.
- Put full-page route screens in `src/pages/`.
- Put backend API access in `src/api/`.
- Do not call `fetch(...)` directly from pages.
- Prefer shadcn/ui components from `src/components/ui/` before creating custom UI.
- Keep reusable UI in `src/components/`.
- Keep generic helpers in `src/lib/`.

Before finishing code changes, run:

```bash
bun run typecheck
bun run lint
bun run format
bun run build
```
