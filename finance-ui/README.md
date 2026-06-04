# Personal Finance UI

Angular 21 frontend for the Personal Finance app.

## Requirements

- Node.js 20+
- Angular CLI: `npm install -g @angular/cli`

## Setup

```bash
npm install
```

## Development server

```bash
ng serve
```

Open `http://localhost:4200/`. The app reloads automatically on file changes.

The dev server proxies API requests to `http://localhost:3000` (Rails). Start the Rails API before running the frontend locally.

## Running unit tests

```bash
ng test
```

Runs 80 Vitest unit tests covering utility functions, services, and component logic. Add `--watch=false` to run once without watch mode.

## Running end-to-end tests

```bash
npx playwright test
```

Runs 25 Playwright E2E tests against a live Rails API + database. The tests sign up fresh user accounts on each run, so the API must be running locally before executing the suite.

To run with the Playwright UI:

```bash
npx playwright test --ui
```

## Building for production

```bash
ng build
```

Output goes to `dist/`. The production build swaps `environment.ts` for `environment.prod.ts`, pointing the API URL at the Render deployment.

## Code scaffolding

```bash
ng generate component component-name
```
