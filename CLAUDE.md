# Instructions for Claude Code

- Read `README.md` and `CONTRIBUTING.md` before making changes.
- Do not add a `Co-Authored-By` trailer or any generated-tool footer to commits.
- Follow the frontend architecture in `CONTRIBUTING.md`.
- Use `src/api/client.ts` for backend requests through feature-specific API modules.
- Use `src/router.tsx` for route registration.
- Prefer shadcn/ui components from `src/components/ui/`.
- Run `bun run typecheck`, `bun run lint`, `bun run format`, and `bun run build` before finishing code changes.
