# Project Structure & Conventions

## Layout

```
src/
  app/                        Routes only. No business logic.
    api/
      auth/{login,logout,session}/route.ts
      drive/{sync,photos}/route.ts
      upload/route.ts
    layout.tsx                Root shell, force-dynamic for the CSP nonce
    page.tsx                  Tab host
    error.tsx  not-found.tsx  robots.ts
    globals.css

  proxy.ts                    Per-request CSP + nonce (Next 16 name for middleware)

  components/
    auth/                     PasscodeGate
    layout/                   Header, Footer, MobileNav, SmoothScroll
    dates/                    DateCard, ChecklistHub, DateMapView,
                              ScrapbookView, HeroCountdown
    modals/                   One file per modal
      date-detail/            The detail modal, split by section
    ui/                       Reusable widgets with no domain knowledge

  hooks/                      Reusable stateful logic, one concern each

  lib/                        Non-React logic, grouped by concern
    auth/                     session tokens, rate limiting, route guard
    date/                     date and time formatting
    env/server.ts             validated env access (server-only)
    google-drive/             Drive client, photo ops, database file
    http/                     API envelopes, browser client
    media/                    image compression, upload client, presets
    storage/                  localStorage-backed store
    sync/                     Drive sync orchestration
    validation/               schemas and primitives for untrusted input

  context/                    React context providers
  data/                       Seed data
  types/                      Shared domain types
```

## Rules

**Routes stay thin.** A file under `app/api/` handles the HTTP concern:
authenticate, rate limit, validate, delegate, shape the response. The work
belongs in `lib/`. This keeps the security checks visible in one place per
endpoint instead of tangled with Drive calls.

**`lib/` never imports from `components/`.** The dependency runs one way:
`app/` and `components/` depend on `lib/`, never the reverse.

**Server-only modules declare it.** Anything touching credentials starts with
`import 'server-only'`, which turns a stray client import into a build error
rather than a leaked secret.

**Imports use the `@/` alias.** Parent-relative imports (`../`) are an ESLint
error. Same-directory imports are fine.

**Naming.** Files exporting a React component are `PascalCase.tsx`. Everything
else is `kebab-case.ts`. Hooks are `use-*.ts` and export `useThing`.

**Components own their own state.** State lives in the component that uses it.
It moves up to a hook only when two siblings genuinely share it, which is why
`useMemoryEditor` sits above the memory tab: closing the modal has to flush
unsaved notes even when another tab is showing.

## The date detail modal

It was one 1825-line component with about 40 `useState` calls. It is now:

| File | Role |
| --- | --- |
| `DateDetailModal.tsx` | Shell, active tab, toast, lightbox, close behaviour |
| `date-detail/CoverBanner.tsx` | Cover image, title editor, top actions |
| `date-detail/ScheduleBar.tsx` | Status pills, date and time pickers |
| `date-detail/TabNav.tsx` | Tab bar, driven by a config array |
| `date-detail/ChecklistTab.tsx` | Preparation checklist |
| `date-detail/ItineraryTab.tsx` | Timeline steps |
| `date-detail/DetailsTab.tsx` | Specification fields |
| `date-detail/MemoryTab.tsx` | Scrapbook notes and photos |

Shared drafts live in `hooks/use-date-details-editor.ts` (the title editor and
the details form edit the same record) and `hooks/use-memory-editor.ts`.

## Checks

```bash
pnpm run typecheck   # tsc --noEmit
pnpm run lint        # eslint
pnpm run check       # both
```

TypeScript runs with `strict` plus `noUnusedLocals`, `noUnusedParameters`,
`noImplicitOverride`, `noFallthroughCasesInSwitch` and
`forceConsistentCasingInFileNames`.

The 13 remaining `@next/next/no-img-element` warnings are intentional. Photos
come from three sources: the Drive CDN, arbitrary pasted URLs, and base64 data
URLs from the offline fallback. `next/image` cannot optimise the latter two, so
migrating would mean branching per source for no real gain here.
