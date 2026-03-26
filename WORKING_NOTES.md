# Working Notes — The Digital Student Experience

> **Internal document — not public-facing.**
> Not for the repository README. Update this file at the end of every working session.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before doing anything else.
2. Read `README.md` for public-facing context, installation steps, and the tech stack overview.
3. Do not change the folder structure or module conventions without explicit discussion with the developer.
4. Follow all naming conventions, code style, and framework patterns documented in the **Conventions** section exactly.
5. Do not suggest any approach listed in **What Was Tried and Rejected** — those decisions were made deliberately.
6. Ask before making any large structural change (adding a new library, reorganizing the `src/` tree, switching routing libraries, etc.).
7. This project was partially AI-assisted. Refactor conservatively — prefer surgical edits over wholesale rewrites.
8. When in doubt, ask. Do not invent conventions that are not documented here.

---

## Current State

**Last Updated:** March 26, 2026

The survey app is functionally complete and running on Replit. Students can fill in the 7-question form, submit responses to Supabase, and view aggregated results charts. The key submit bug (NOT NULL constraint on `other_app`) has been resolved. Azure Static Web Apps deployment has not been set up yet.

### What Is Working

- [x] Home page with navigation to survey and results
- [x] 7-question survey form with inline validation and required-field enforcement
- [x] Conditional "Other" text inputs for Q4 (building) and Q6 (apps) with auto-focus
- [x] Supabase insert on form submit — stores responses in `digital_experience_results`
- [x] Thank-you summary screen after successful submission
- [x] Results page: total response count + three Recharts charts (year, apps, major)
- [x] Client-side routing with Wouter (`/`, `/survey`, `/results`, 404 fallback)
- [x] Descriptive Supabase error messages on submit failure (mapped by error code)
- [x] Production build succeeds without `PORT` or `BASE_PATH` env vars
- [x] `staticwebapp.config.json` in `public/` for Azure SWA SPA routing

### What Is Partially Built

- [ ] Azure deployment — `staticwebapp.config.json` is ready but no GitHub Actions workflow exists yet; env vars must be set manually in Azure portal
- [ ] Error handling — Supabase errors are now human-readable but no retry UI is shown

### What Is Not Started

- [ ] Rate limiting on form submission
- [ ] CSV export of results
- [ ] Admin authentication for the Results page
- [ ] GitHub Actions workflow for Azure Static Web Apps CI/CD

---

## Current Task

At the end of the last session the app was fully working on Replit. The next immediate step for the user is Azure deployment: connecting the GitHub repo to Azure Static Web Apps, setting `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Application Settings in Azure (baked in at build time by Vite), and customizing the auto-generated GitHub Actions workflow to use `pnpm` instead of `npm`.

**Single next step:** Create `.github/workflows/azure-static-web-apps.yml` with the correct pnpm setup and build command (`pnpm --filter @workspace/survey run build`), app location (`artifacts/survey`), and output location (`dist/public`).

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 | Industry-standard UI library; required by course context |
| TypeScript | 5.9 | Type safety across all components and Supabase interfaces |
| Vite | 7 | Fast HMR dev server; integrates well with Tailwind and React |
| Tailwind CSS | 4 | Utility classes for layout; avoids custom CSS files |
| Supabase JS | 2 | Direct frontend-to-database connection; no API server needed |
| Recharts | 2.15 | Composable React chart library; easy bar/pie integration |
| Wouter | 3.3 | Lightweight client-side router; no extra bundle weight vs React Router |
| pnpm | 10 | Monorepo workspace tooling; faster installs than npm |

---

## Project Structure Notes

```text
artifacts/survey/
├── public/
│   ├── favicon.svg                   # App favicon
│   ├── opengraph.jpg                 # Social preview image
│   └── staticwebapp.config.json      # Azure SPA routing fallback — must stay in public/
├── src/
│   ├── lib/
│   │   └── supabase.ts               # Supabase client + SurveyRow / SurveyInsert types
│   ├── pages/
│   │   ├── Home.tsx                  # Welcome page — two nav links only, no state
│   │   ├── SurveyForm.tsx            # All form logic, validation, and Supabase insert
│   │   ├── Results.tsx               # Reads all rows from Supabase, renders 3 charts
│   │   └── not-found.tsx             # 404 fallback
│   ├── App.tsx                       # Wouter router — 4 routes, base from BASE_URL
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Tailwind import + box-sizing + font-smoothing
├── index.html                        # HTML shell — single div#root
├── vite.config.ts                    # PORT and BASE_PATH optional; Replit plugins gated on REPL_ID
└── package.json                      # Minimal deps — only what is actually used
```

### Non-obvious decisions

- `App.tsx` passes `base={import.meta.env.BASE_URL.replace(/\/$/, "")}` to Wouter so routes work under any sub-path (e.g. Replit preview proxying).
- `vite.config.ts` defaults `PORT` to `3000` and `BASE_PATH` to `/` so `pnpm run build` works in Azure's CI environment without setting those vars.
- Replit-specific plugins (`cartographer`, `dev-banner`) are loaded only when `REPL_ID` is set — they are silently skipped in Azure builds.

### Files that must not be changed without discussion

- `artifacts/survey/public/staticwebapp.config.json` — Azure SWA depends on this exact location and the `navigationFallback` key
- `artifacts/survey/src/lib/supabase.ts` — `SurveyRow` and `SurveyInsert` interfaces must stay in sync with the Supabase table schema
- `vite.config.ts` — the optional-PORT/BASE_PATH logic is intentional; do not restore the throwing validation

---

## Data / Database

**Provider:** Supabase (external PostgreSQL). The app connects directly from the browser using the anon key and Row Level Security.

### Table: `digital_experience_results`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes (auto) | Primary key, `gen_random_uuid()` default |
| `created_at` | `timestamptz` | Yes (auto) | Set to `now()` on insert |
| `major` | `text` | Yes | Free text, e.g. "Business Analytics" |
| `year_in_college` | `text` | Yes | One of: "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year or More" |
| `study_spot` | `text` | Yes | Free text, e.g. "BizHub" |
| `primary_building` | `text` | Yes | One of the dropdown values, or the typed "Other" text (never the literal string "Other") |
| `note_device` | `text` | Yes | One of: "Laptop (Mac/PC)", "Tablet (iPad/Surface)", "Pen and Paper", "Phone" |
| `apps` | `text[]` | Yes | Array of selected app names; may include "Other" |
| `other_app` | `text` | No | Empty string `""` when "Other" not selected; typed text when it is |
| `curriculum_suggestion` | `text` | No | Free text textarea response |

**RLS Policies:**
- `allow_anon_insert` — any anon user can insert one row
- `allow_anon_select` — any anon user can read all rows (needed for Results page)

---

## Conventions

### Naming conventions

- Page files: `PascalCase.tsx` (exception: `not-found.tsx` — lowercase kebab, matches scaffold convention)
- Component functions: `PascalCase`
- Constants/colors at file top: `SCREAMING_SNAKE_CASE` (e.g. `ACCENT`, `DARK`, `BG`, `BORDER`)
- Supabase interfaces: `PascalCase` with suffix (`SurveyRow`, `SurveyInsert`)

### Code style

- Inline `style={{}}` props for brand colors and one-off overrides; Tailwind utilities for layout (`flex`, `min-h-screen`, `px-4`, etc.)
- No `className` utility helpers (`clsx`, `cn`) — they were removed; use template literals or style objects directly
- All form inputs: `id`, `aria-describedby` (when error present), `aria-invalid`, `aria-required`
- Error messages rendered via the shared `<FieldError id="..." message={...} />` component

### Framework patterns

- Navigation links (routing to another page): use `<Link href="...">` styled as anchor — never `<Link><button>`
- Imperative navigation (after async action): `const [, navigate] = useLocation()` from wouter
- Form state: `useState<FormData>` with a single object; partial updates via `setFormData(p => ({ ...p, field: value }))`
- Conditional field visibility: derived boolean (`showOtherBuilding`, `showOtherApp`) from form state, not separate state

### Git commit style

Conventional Commits format: `type: short description`
Types used: `feat`, `fix`, `chore`, `docs`
Examples: `fix: send empty string for other_app to avoid NOT NULL constraint`, `docs: add README.md to project root`

---

## Decisions and Tradeoffs

- **Wouter over React Router:** Wouter is ~2 KB vs ~50 KB; the app has only 3 routes and needs no advanced features. Do not suggest switching to React Router.
- **Direct Supabase from browser (no API server):** The survey is read/write with public anon access only; no server-side secrets need protecting. Do not suggest adding an Express API layer.
- **Inline styles + Tailwind utilities over shadcn/ui:** The scaffold included 30+ shadcn/Radix components; none were needed. All were removed to keep the bundle lean and the code readable. Do not suggest re-adding component libraries.
- **`other_app` sends `""` not `null`:** The Supabase table may have a NOT NULL constraint depending on when/how it was created. Sending `""` is safe for both nullable and NOT NULL schemas. Do not change this back to `null`.
- **`BASE_PATH` defaults to `"/"` in vite.config.ts:** Required for Azure build environments that do not set this variable. The Replit dev server sets `BASE_PATH` automatically. Do not restore the throwing behavior.
- **Error messages keyed to Supabase error codes:** The submit handler maps `42P01` (table not found) and `PGRST301`/`401` (bad credentials) to friendly messages, with `error.message` as fallback. This was added after diagnosing a real submission failure.

---

## What Was Tried and Rejected

- **`<Link><button>` nested pattern:** Used initially for button-styled navigation. Rejected — creates invalid nested interactive semantics. All navigation links now use styled `<Link>` (renders as `<a>`). Do not suggest re-nesting buttons inside Link components.
- **shadcn/ui component library:** The scaffold included alert-dialog, calendar, carousel, command, sidebar, and 25+ other components. None were used in the app; all were removed. Do not suggest using shadcn, Radix UI, or `@/components/ui/*` components.
- **`react-hook-form`:** Removed from the scaffold — the form is simple enough that native `useState` + a `validate()` function is sufficient. Do not suggest adding react-hook-form.
- **Sending `null` for `other_app`:** Caused a `23502` NOT NULL constraint error in Supabase. Fixed by sending `""`. Do not revert.
- **Throwing error if `PORT` env var is missing:** The original vite.config.ts threw if `PORT` was not set, which broke `pnpm run build` in Azure. Replaced with a `?? 3000` default. Do not restore the throwing guard.

---

## Known Issues and Workarounds

**Issue 1: `other_app` NOT NULL constraint**
- Problem: Some Supabase table configurations have `other_app text NOT NULL`. The form was sending `null` when "Other" was not selected, causing error `23502`.
- Workaround: The payload now always sends `""` (empty string) for `other_app` when "Other" is not selected.
- Status: Resolved in code. The Supabase table should ideally have `other_app text` (nullable), but the app works either way.
- Do not remove the `""` fallback.

**Issue 2: Supabase table must be created manually**
- Problem: There is no migration runner or setup script. The table must be created by running the SQL block in the Supabase SQL Editor before any submissions or results will work.
- Workaround: README.md and WORKING_NOTES.md both document the SQL.
- Status: Open — no automated migration planned yet.

**Issue 3: Results page shows generic spinner during load**
- Problem: No skeleton loading state while Supabase data is fetched; the page just shows a text spinner.
- Workaround: None needed in practice (fetches are fast), but it may feel abrupt on slow connections.
- Status: Open — low priority.

---

## Browser / Environment Compatibility

### Front-end

- **Browsers tested:** Chrome (latest), Firefox (latest)
- **Expected support:** All modern evergreen browsers (ES2022 targets)
- **Known incompatibilities:** Internet Explorer — not supported; no polyfills included

### Back-end / Build Environment

- **OS:** Linux (Replit NixOS, Azure build agents)
- **Node.js:** 20+ required (project uses ESM `import.meta.dirname`)
- **Package manager:** pnpm 10 (do not use npm or yarn — a preinstall guard is in the root `package.json`)
- **Environment variables required at build time:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Environment variables optional:** `PORT` (defaults to 3000), `BASE_PATH` (defaults to `/`)

---

## Open Questions

- Should the Results page be protected behind Supabase Auth so only the instructor can view aggregate data?
- Should `curriculum_suggestion` responses (free text) be shown anywhere, or only stored?
- Is there a need to prevent duplicate submissions from the same browser session?
- For Azure deployment: will the app be served at the root (`/`) or a sub-path? This affects `BASE_PATH`.

---

## Session Log

### 2026-03-26

**Accomplished:**
- Built the complete 3-page survey app (Home, SurveyForm, Results) from scratch
- Configured Supabase client with graceful fallback when env vars are absent
- Implemented all 7 form questions with conditional "Other" inputs and WCAG 2.1 AA aria attributes
- Added Recharts visualizations to Results page (year bar, apps horizontal bar, major distribution)
- Removed all unused scaffold dependencies (30+ Radix/shadcn packages, react-hook-form, framer-motion, etc.)
- Fixed `<Link><button>` nested interactive element pattern across all pages
- Fixed production build (PORT/BASE_PATH now optional in vite.config.ts)
- Debugged and fixed Supabase submit failure: `other_app` now sends `""` instead of `null` to avoid NOT NULL constraint error (23502)
- Improved Supabase error messages to be code-mapped and human-readable
- Updated background color to warmer cream (`#fdf8f0`)
- Generated `README.md` and `WORKING_NOTES.md` at project root

**Left incomplete:**
- Azure Static Web Apps GitHub Actions workflow not yet created
- No rate limiting on form submissions

**Decisions made:**
- `other_app` sends `""` not `null` to handle both nullable and NOT NULL schemas safely
- Removed all unused scaffold UI components permanently

**Next step:**
- Create `.github/workflows/azure-static-web-apps.yml` with pnpm support and correct app/output locations

---

## Useful References

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Recharts API Reference](https://recharts.org/en-US/api)
- [Wouter README](https://github.com/molefrog/wouter) — especially the `base` prop for sub-path routing
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode) — why `VITE_` prefix is required for client-side vars
- [Azure Static Web Apps — Build Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Azure Static Web Apps — Environment Variables](https://learn.microsoft.com/en-us/azure/static-web-apps/application-settings)
- [pnpm/action-setup GitHub Action](https://github.com/pnpm/action-setup) — for Azure/GitHub CI with pnpm
- **AI assistance:** Claude (Anthropic) via Replit Agent — used for scaffolding, debugging Supabase errors, and documentation generation throughout this session
