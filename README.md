# The Digital Student Experience

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

## Description

The Digital Student Experience is a web-based survey application built for BAIS:3300 at the University of Iowa, Spring 2026. It collects responses from undergraduate students about their digital habits on campus — covering majors, study locations, preferred buildings, note-taking devices, and software tools. All responses are stored in Supabase and visualized as aggregated, anonymized charts on the Results page, giving instructors and students real-time insight into campus digital patterns.

## Features

- **7-question survey** covering major, year in college, favorite study spot, primary building, note-taking device, preferred apps, and curriculum suggestions
- **Conditional "Other" inputs** that appear automatically for the building dropdown (Q4) and apps checkboxes (Q6), with auto-focus for accessibility
- **Inline validation** on every required field — submission is blocked until complete, with WCAG 2.1 AA `aria` attributes and descriptive error messages throughout
- **Thank-you summary screen** showing the respondent's own answers after a successful submission, with options to submit another response or jump to Results
- **Live Results page** with three Recharts visualizations: year-in-college bar chart, app-usage horizontal bar chart (sorted by count), and major distribution chart
- **Azure Static Web Apps ready** — includes `staticwebapp.config.json` for SPA client-side routing fallback on any static host
- **Responsive design** that works on mobile and desktop with a warm cream (`#fdf8f0`) color scheme and pink (`#FFB6C1`) accents

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component framework |
| TypeScript 5.9 | Type-safe JavaScript throughout |
| Vite 7 | Build tool and HMR dev server |
| Tailwind CSS | Utility-first styling |
| Supabase JS v2 | PostgreSQL database client and Row Level Security |
| Recharts | Survey results data visualization |
| Wouter | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| pnpm | Package manager and monorepo workspace tooling |

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- A [Supabase](https://supabase.com/) project (free tier works)

### Installation

1. Clone the repository (replace `your-username` with your GitHub handle):
   ```bash
   git clone https://github.com/your-username/digital-student-experience.git
   cd digital-student-experience
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set environment variables — create a `.env` file inside `artifacts/survey/` (or set them in your host platform's secret manager):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Create the Supabase table by running this SQL in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):
   ```sql
   create table digital_experience_results (
     id               uuid primary key default gen_random_uuid(),
     created_at       timestamptz not null default now(),
     major            text not null,
     year_in_college  text not null,
     study_spot       text not null,
     primary_building text not null,
     note_device      text not null,
     apps             text[] not null,
     other_app        text,
     curriculum_suggestion text
   );

   alter table digital_experience_results enable row level security;

   create policy "allow_anon_insert"
     on digital_experience_results for insert to anon with check (true);

   create policy "allow_anon_select"
     on digital_experience_results for select to anon using (true);
   ```

5. Start the development server:
   ```bash
   pnpm --filter @workspace/survey run dev
   ```

6. Open your browser to the local URL printed in the terminal (e.g. `http://localhost:3000`).

## Usage

| Route | Description |
|---|---|
| `/` | Home page — welcome screen with navigation to the survey and results |
| `/survey` | 7-question survey form |
| `/results` | Aggregated, anonymized results charts |

**Environment variables:**

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon (public) key |

To build for production:
```bash
pnpm --filter @workspace/survey run build
```

Output is written to `artifacts/survey/dist/public/`. Deploy that folder to Azure Static Web Apps or any static hosting provider.

## Project Structure

```text
artifacts/survey/
├── public/
│   ├── favicon.svg                   # App favicon
│   ├── opengraph.jpg                 # Social preview image
│   └── staticwebapp.config.json      # Azure SPA routing fallback config
├── src/
│   ├── lib/
│   │   └── supabase.ts               # Supabase client + SurveyRow / SurveyInsert types
│   ├── pages/
│   │   ├── Home.tsx                  # Welcome page with navigation buttons
│   │   ├── SurveyForm.tsx            # 7-question form with validation and submit logic
│   │   ├── Results.tsx               # Aggregated results with Recharts charts
│   │   └── not-found.tsx             # 404 fallback page
│   ├── App.tsx                       # Wouter router — /, /survey, /results routes
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Global styles (Tailwind import + base reset)
├── index.html                        # HTML shell
├── vite.config.ts                    # Vite config (port, base path, plugins)
└── package.json                      # Survey package dependencies and scripts
```

## Changelog

### v1.0.0 — March 26, 2026

- Initial release of The Digital Student Experience survey app
- 7-question survey form with inline validation and WCAG 2.1 AA accessibility
- Conditional "Other" text inputs for building (Q4) and apps (Q6) with auto-focus
- Thank-you summary screen displayed after a successful Supabase insert
- Results page with year-in-college bar chart, app-usage horizontal bar chart, and major distribution chart powered by Recharts
- Supabase backend with Row Level Security for anonymous read/write access
- Azure Static Web Apps deployment configuration included

## Known Issues / To-Do

- [ ] The Supabase table must be created manually via SQL Editor — no automated migration or setup script is included
- [ ] The Results page has no skeleton loading state; it shows a plain spinner while data is fetched from Supabase
- [ ] Submitting the form multiple times is not rate-limited — a single user could submit many responses

## Roadmap

- **Export to CSV** — allow instructors to download all responses directly from the Results page
- **Admin authentication** — protect the Results page behind Supabase Auth so only authorized viewers can access aggregate data
- **Word cloud for Q7** — visualize the free-text curriculum suggestion responses as a tag cloud
- **Multi-survey support** — extend the schema and routing to host multiple survey versions under different URLs
- **Email confirmation** — send respondents a copy of their submitted answers via Supabase Edge Functions

## Contributing

Contributions are welcome! Please open an issue first to discuss any significant changes. Fork the repository, make your changes on a feature branch, and open a pull request with a clear description of what was changed and why.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Mia Maiers**
University of Iowa
BAIS:3300 — Business Analytics and Information Systems
Spring 2026

## Contact

GitHub: [github.com/MiaMaiers](https://github.com/MiaMaiers)

## Acknowledgements

- [Supabase Docs](https://supabase.com/docs) — PostgreSQL database setup and Row Level Security guides
- [Recharts](https://recharts.org/en-US/) — composable charting library for React
- [Tailwind CSS](https://tailwindcss.com/docs) — utility-first CSS framework documentation
- [Wouter](https://github.com/molefrog/wouter) — minimalist client-side routing for React
- [Vite](https://vitejs.dev/) — fast frontend build tooling
- [Shields.io](https://shields.io/) — badge generation for README files
- [Replit](https://replit.com/) — cloud development and deployment environment
- Claude by Anthropic — AI assistant used during development and debugging
