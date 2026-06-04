# Personal Finance API

Ruby on Rails 8.1 API backend for the Personal Finance app.

## Requirements

- Ruby 3.4+
- Bundler

## Setup

```bash
bundle install
bin/rails db:create db:migrate db:seed
```

`db:seed` loads the demo account and its transactions, budgets, pots, and recurring bills.

## Running the server

```bash
bin/rails server
```

Runs on `http://localhost:3000` by default.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (production only) |
| `RAILS_MASTER_KEY` | Decrypts `config/credentials.yml.enc` (production only) |

In development the app uses SQLite and reads `config/master.key` from disk.

## Running tests

There are no Rails unit tests. All API behaviour is covered by the Playwright E2E suite in `finance-ui/e2e/`.

## API endpoints

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Log in, receive JWT |
| POST | `/api/auth/demo` | No | Log in as demo account |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/transactions` | Yes | List (paginated, filterable) |
| POST | `/api/transactions` | Yes | Create transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
| GET | `/api/transactions/recurring` | Yes | List recurring bills |
| GET/POST/PATCH/DELETE | `/api/budgets` | Yes | Budgets CRUD |
| GET/POST/PATCH/DELETE | `/api/pots` | Yes | Pots CRUD |
| PATCH | `/api/pots/:id` | Yes | Add/withdraw money (via `saved_amount`) |
| GET | `/api/overview` | Yes | Dashboard summary |
| GET | `/health` | No | DB health check (keeps Supabase active) |
