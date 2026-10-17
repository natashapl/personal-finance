# Personal Finance API

Ruby on Rails 8.1 API backend for the Personal Finance app.

## Requirements

- Ruby 3.4.9 (see `.ruby-version`)
- Bundler 2.6+

On Windows, use a Ruby+Devkit installation. Verify the tools in a new PowerShell window:

```powershell
ruby --version
bundle --version
```

## Setup

Windows PowerShell:

```powershell
bundle install
ruby bin/rails db:prepare
ruby bin/rails db:seed
```

macOS/Linux:

```bash
bundle install
bin/rails db:prepare
bin/rails db:seed
```

Run these commands inside the `finance-api` directory. `db:prepare` creates the SQLite development database when needed and applies pending migrations. `db:seed` loads the demo account and its transactions, budgets, pots, and recurring bills; it is safe to rerun.

## Running the server

Windows PowerShell:

```powershell
ruby bin/rails server
```

macOS/Linux:

```bash
bin/rails server
```

Runs on `http://localhost:3000` by default.

Visit `http://localhost:3000/health` and confirm it displays `ok`, then leave this terminal running while using the frontend. Stop the server with `Ctrl+C`.

On Windows, do not enter `bin/rails` directly in PowerShell. PowerShell may report `Access is denied` or ask which application should open the file. Prefix Rails commands with `ruby`, as shown above.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (production only) |
| `RAILS_MASTER_KEY` | Decrypts `config/credentials.yml.enc` in production |

Local development uses SQLite and does not require `DATABASE_URL`. The repository's ignored `config/master.key` is not required for the documented local workflow.

## Running tests

There are no Rails unit tests. All API behaviour is covered by the Playwright E2E suite in `finance-ui/e2e/`.

You can still verify that Rails boots and the database is current:

```powershell
ruby bin/rails db:migrate:status
```

On macOS/Linux, omit the leading `ruby`.

## Windows notes

Ruby may print warnings about optional `vips-heif`, `vips-jxl`, `vips-magick`, `vips-openslide`, or `vips-poppler` modules. They do not prevent this application from booting and can be ignored for normal local development.

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
