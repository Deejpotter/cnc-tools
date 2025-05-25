# CNC Tools Monorepo

This repository contains both the frontend (Next.js) and backend (Express/Flask/Node) applications for CNC Tools.

## Structure

```
frontend/   # Next.js 14 app (deployed to Netlify)
backend/    # Express/Node/Flask API server (deploy separately)
types/      # (Optional) Shared TypeScript types/interfaces
```

## Development

- **Frontend:**
  - `cd frontend && yarn dev` (or `npm run dev`)
  - Runs on [http://localhost:3000](http://localhost:3000)
- **Backend:**
  - `cd backend && yarn dev` (or `npm run dev` or `npm start`)
  - Runs on [http://localhost:5000](http://localhost:5000) (or your configured port)

## Deployment

- **Frontend:**
  - Deployed via Netlify. See the root `netlify.toml` for build settings.
  - **Important:** Only the `frontend/` directory is built and published by Netlify. The root `netlify.toml` controls this. Do not add a `netlify.toml` to the `frontend/` directory—Netlify will ignore it.
  - If you see build errors about missing `package.json`, make sure your build command is `cd frontend && yarn build` and your publish directory is `frontend/.next`.
- **Backend:**
  - Deploy to your preferred service (Render, Railway, Heroku, VPS, etc.).
  - Make sure to set the correct API URL in `frontend/.env.local` (e.g., `NEXT_PUBLIC_API_URL`).

## Environment Variables

- `frontend/.env.local` for frontend secrets and API URLs
- `backend/.env` for backend secrets (DB, API keys, etc.)

## Netlify Setup

- The root `netlify.toml` configures Netlify to build and publish the frontend only.
- **Do not add a `netlify.toml` to the `frontend/` directory.** Netlify will only use the root config.
- Set environment variables for the frontend in the Netlify dashboard or in `frontend/.env.local`.
- **Troubleshooting:** If Netlify fails to build, double-check that your build command and publish directory are correct in the root `netlify.toml`. Also ensure there is no conflicting `netlify.toml` in the `frontend/` directory.

## GitHub Setup

- The root `.gitignore` ignores `node_modules` and build artifacts in both `frontend/` and `backend/`.
- You can add workflows in `.github/workflows/` for CI/CD for both apps (see below for a sample).

## Sample GitHub Actions Workflow (Optional)

```yaml
# .github/workflows/ci.yml
name: Monorepo CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn test
      - run: yarn build
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: yarn install --frozen-lockfile
      - run: yarn lint || true # If you have linting
      - run: yarn test || true # If you have tests
      - run: yarn build || true # If you have a build step
```

## Notes

- Keep shared types/interfaces in `types/` or `interfaces/` and import from both apps.
- Each app manages its own dependencies and scripts.
- **Keep all config files (like `netlify.toml`, `.gitignore`, etc.) at the root of the repo for clarity and to avoid conflicts.**
- For more details, see the `README.md` in each subfolder.
