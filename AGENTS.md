# Repository Guidelines

## Project Structure & Module Organization
`eplat-devtools` is a WXT-based browser extension. Put runtime entrypoints under `entrypoints/`: `eplat.content/` for content-script logic, `background/` for the service worker, `sidepanel/` for the React UI, and `ace-bridge.ts` for main-world editor access. Shared code lives in `lib/` (`constants.ts`, `messaging.ts`, `storage.ts`, `snippet-engine.ts`). Design and architecture notes are in `docs/`; long-lived working notes are in `memory/`. Treat `.wxt/` and `.output/` as generated output.

## Build, Test, and Development Commands
Use `pnpm` for all package management.

- `pnpm install`: install dependencies and run `wxt prepare`.
- `pnpm dev`: start Chrome MV3 development mode.
- `pnpm dev:firefox`: start Firefox development mode.
- `pnpm build`: produce a production build in `.output/chrome-mv3`.
- `pnpm zip`: create a distributable ZIP in `.output/`.
- `pnpm build:firefox` / `pnpm zip:firefox`: build or package the Firefox target.

`pnpm build` and `pnpm zip` both succeed in the current workspace.

## Coding Style & Naming Conventions
Write TypeScript with strict typing and 2-space indentation. Match the existing style: single quotes, semicolons, and small focused modules. Use `@/` imports for repo-root aliases when appropriate. Name React components in PascalCase (`SnippetTab.tsx`, `SettingsTab.tsx`); keep non-component modules lowercase (`zoom.ts`, `toolbar.ts`, `storage.ts`). Avoid editing generated files under `.wxt/` or `.output/`.

## Testing Guidelines
There is no committed automated test runner or `pnpm test` script yet. Until one is added, validate changes with `pnpm build` and smoke-test the extension in Chrome or Firefox. For UI and editor changes, verify sidepanel actions, content-script behavior on `/eplat/` pages, and `chrome.storage.local` persistence. If you add automated tests, prefer `*.test.ts` or `*.test.tsx` names near the affected module or under a new `tests/` directory.

## Commit & Pull Request Guidelines
Current history uses Conventional Commit prefixes such as `feat:` and `docs:`; continue that pattern. Keep commits scoped and descriptive, for example `feat: add sidepanel clipboard clear action`. PRs should include a short summary, linked issue when relevant, validation steps run (`pnpm build`, `pnpm zip`), and screenshots for visible sidepanel or content-script UI changes.

## Agent-Specific Workflow
For repository exploration, start with `mcp__fast_context__fast_context_search` when the code location is not obvious or the task is cross-module. Use `rg` only after you know the likely file or need exact-string matching.
