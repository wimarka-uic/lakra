# Contributing to Lakra

Thank you for your interest in contributing to Lakra! This guide reflects the current state of the project and explains how to set up your environment, make changes, and submit high-quality pull requests.

## Table of Contents

- [Contributing to Lakra](#contributing-to-lakra)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Repository Structure](#repository-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
  - [Conventions](#conventions)
    - [Branching](#branching)
    - [Commit Messages](#commit-messages)
    - [Pull Requests](#pull-requests)
    - [Code Style](#code-style)
  - [Project Notes](#project-notes)
    - [Supabase Usage](#supabase-usage)
    - [CSV Imports](#csv-imports)
  - [Issue Reporting](#issue-reporting)
  - [Feature Requests](#feature-requests)
  - [Getting Help](#getting-help)
  - [License](#license)

## Project Overview

Lakra is a frontend web app built with React 19, TypeScript, Vite, TailwindCSS, and Supabase (Auth, Postgres, Storage, and RLS). The app now lives at the repository root (no separate `frontend/` folder). All data operations go through Supabase.

Key paths:
- Root Vite app with `src/`, `public/`, `index.html`

For a detailed feature list and tech stack, see the main `README.md`.

## Repository Structure

```text
lakra/
├─ package.json
├─ bun.lock
├─ index.html
├─ eslint.config.js
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ public/
│  ├─ lakra.svg
│  ├─ favicon.svg
│  ├─ _redirects
│  └─ (images, sitemap, robots.txt)
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ assets/
│  ├─ components/
│  │  ├─ auth/ (Login, Register, Forgot/Reset Password)
│  │  ├─ layout/ (Navbar, Footer, Layout, AnimatedBackground)
│  │  ├─ modals/ (Confirmation, Guidelines, QuizSuccess/Failure)
│  │  ├─ pages/ (Landing, About, Dashboards, Interfaces)
│  │  ├─ ui/ (Logo, SEO, VoiceRecorder)
│  │  └─ index.ts (barrel exports)
│  ├─ contexts/ (AuthContext.tsx)
│  ├─ hooks/ (useSEO.ts, useSEO-new.ts)
│  ├─ services/ (api.ts, supabase-api.ts)
│  ├─ types/ (index.ts)
│  └─ utils/ (logger.ts, seo.ts, supabase.ts)
├─ CONTRIBUTING.md
├─ README.md
├─ vercel.json
└─ _redirects (optional root-level for static hosts)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or bun (any one)
- Git
- A Supabase project (free tier works)

## Local Development

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd lakra
   ```

2. Install dependencies (at repo root)
   ```bash
   npm install
   # or: yarn install
   # or: bun install
   ```

3. Configure environment variables (see next section), then start the dev server
   ```bash
   npm run dev
   # or: yarn dev
   # or: bun dev
   ```

The app will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file at the repository root with the following:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- Do not commit secrets. Use project/environment-scoped variables in your hosting provider.

## Available Scripts

Run these at the repository root:

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check (`tsc -b`) and build for production
- `npm run preview` — Preview the production build locally
- `npm run lint` — Lint code with ESLint

Notes:
- The Vite config removes `console.log`, `console.debug`, `console.info`, and `console.warn` during production builds. Prefer structured logging via the in-app logger where necessary.

## Conventions

### Branching

- Base branch: `master`
- Create topic branches from `master` using descriptive names:
  - `feature/annotation-improvements`
  - `bugfix/login-username-auth`
  - `docs/update-contributing`
  - `refactor/api-hooks`

### Commit Messages

Use Conventional Commits:
```
type(scope): description

[optional body]
[optional footer]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`.

Examples:
```
feat(auth): support username-based login via RPC lookup
fix(csv-import): validate language codes and domains
docs(readme): add setup steps for Supabase
```

### Pull Requests

Before opening a PR:
- Ensure the app builds: `npm run build`
- Ensure lint passes: `npm run lint`
- Smoke test relevant flows locally (auth, navigation, pages you touched)
- Update docs when behavior or setup changes

PR checklist:
- Clear title and description of changes
- Link related issues
- Screenshots/GIFs for UI changes
- Call out any migrations or environment variable changes

### Code Style

- TypeScript everywhere; add/extend types rather than using `any`
- React 19 with functional components and hooks
- Avoid `React.FC`; use named functions with typed props
- Keep components small, focused, and reusable; colocate UI and logic prudently
- Prefer early returns and guard clauses; minimize deep nesting
- Follow existing formatting; run ESLint (`npm run lint`) before committing
- Client routing lives in `src/App.tsx` today; align with current patterns when adding routes

## Project Notes

### Supabase Usage

- Auth: `@supabase/supabase-js` is used for email and username-based login
- Database: Row-Level Security (RLS) is expected; queries are client-side with policies enforced on Supabase
- Storage: Voice recordings are uploaded to a private `voice-recordings` bucket, and access is provided via signed URLs

### CSV Imports

- CSV imports for sentences require: `source_text`, `machine_translation`, `source_language`, `target_language`
- Optional fields include `domain`
- The `back_translation` column should be excluded from CSV files; the database handles it as optional data

## Issue Reporting

Before reporting:
- Search existing issues and discussions
- Verify with the latest `master`
- Include steps to reproduce, expected vs actual behavior, environment info, and relevant logs

Bug report template:
```markdown
## Bug Description

## Steps to Reproduce
1. ...

## Expected Behavior

## Actual Behavior

## Environment
- OS: ...
- Browser: ...
- Node: ...

## Additional Context
```

## Feature Requests

When proposing a feature, include:
- Problem statement and scope
- Proposed solution and alternatives
- Impact on users and maintainers
- Any schema or environment changes

## Getting Help

- GitHub Issues — bugs and feature requests
- GitHub Discussions — questions and design discussions
- Security issues — please email the maintainers (see `SECURITY.md` if available)

## License

By contributing to Lakra, you agree that your contributions will be licensed under the project’s MIT License.

---

Thank you for contributing to Lakra! Your help makes the project better for everyone. 