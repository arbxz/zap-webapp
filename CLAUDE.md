# zap

Next.js app that shows planned power outages in Mauritius.

## Practices

Load the `arbxz-practices` skill when starting work, at the end of a phase, and before pushing to main.
It covers tests, the deep refactor pass, Lighthouse budgets, the writing pass and version bumps.

For any UI change, load `ui-ux-pro-max:ui-ux-pro-max` and check the change against its accessibility
and interaction rules. The stack to pass it is `nextjs` (or `shadcn` for the primitives in `src/components/ui`).

### Tooling

- `pnpm install` points git at `.githooks/`. The pre-push hook runs typecheck, lint, tests and build, and
  on a push to main it checks that the version in `package.json` went up (`scripts/check-version.mjs`).
- CI (`.github/workflows/ci.yml`) runs the same checks on every push and PR, plus Lighthouse.
- `pnpm test` runs Vitest (jsdom). Tests sit next to the code as `*.test.ts(x)`.
- `pnpm lighthouse` builds nothing itself: run `pnpm build` first. It serves the build with `pnpm start --port 3100`
  and checks `/` and `/dashboard` against the budgets in `lighthouserc.json`.

## Design system

The tokens come from the arbxz site (`~/projects/arbxz/src/themes/styles.css`, reasons in
`~/projects/arbxz/design/decisions.md`) and live in `src/app/globals.css`.

- arbxz is dark-first with a `.light` class. Here next-themes uses a `.dark` class, so the light values
  sit on `:root` and the dark ones on `.dark`.
- Components use tokens only: no raw Tailwind palette colours (`yellow-300`, `stone-900`...).
- Text in the brand violet uses `text-arbxz-accent-text`. The plain violet fails contrast on the dark page.
- Status text uses `text-danger-text` / `text-success-text`, always with an icon or a word next to it.
- `accent-2` (lime) is a fill. Put `text-ink` on it, never use it as text.
- Corners are square (the radius scale is 0). Panels use `src/components/window/Window.tsx`: `tone="accent"`
  for the one primary window on screen, `ink` for the rest.
- Labels, titles and metadata use `font-mono`, small and uppercase. Body text uses Source Sans 3.

When you sync a token change from arbxz, copy the contrast reasoning into the comment next to it.
