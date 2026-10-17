# Personal Finance UI

Angular 21 frontend for the Personal Finance app.

## Requirements

- Node.js 22.14+
- npm 11+

Angular CLI is installed in this project's development dependencies. A global Angular CLI installation is not required.

## Setup

Run inside the `finance-ui` directory:

```shell
npm ci
```

## Development server

```shell
npm start
```

Open `http://localhost:4200/`. The app reloads automatically on file changes.

The development environment sends API requests directly to `http://localhost:3000/api`. Start the Rails API before running the frontend locally. See [`../finance-api/README.md`](../finance-api/README.md) for the platform-specific Rails commands.

## Running unit tests

```shell
npm test
```

Runs 80 Vitest unit tests covering utility functions, services, and component logic.

## Running end-to-end tests

```shell
npm run test:e2e
```

Runs 25 Playwright E2E tests against a live Rails API + database. The tests sign up fresh user accounts on each run, so the API must be running locally before executing the suite.

To run with the Playwright UI:

```shell
npm run test:e2e:ui
```

## Building for production

```shell
npm run build
```

Output goes to `dist/`. The production build swaps `environment.ts` for `environment.prod.ts`, pointing the API URL at the Render deployment.

## Code scaffolding

```shell
npm exec ng generate component component-name
```
