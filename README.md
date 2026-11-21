# Adi Yoga

Personal portfolio for selected projects, experience, technical skills, and contact — with a private, spreadsheet-backed content studio.

## Overview

A responsive, multilingual portfolio built with React, Vite, and Express. Portfolio content is managed through a private Google Sheet and an authenticated admin studio.

### Highlights

- **Five languages** — Indonesian, English, Japanese, Korean, and Simplified Chinese.
- **Light and dark themes** with responsive layouts.
- **Content studio** for localized profile, experience, certificates, projects, skills, interface text, and SEO.
- **Portfolio assistant** powered by Gemini and grounded in current content.
- **Contact form** stored in the spreadsheet and optionally delivered through Telegram.
- **CV generation** and localized page metadata.

## Getting started

### Requirements

- Node.js compatible with the versions required by the dependencies
- npm

### Install

```bash
npm ci
cp .env.example .env
```

Fill in `.env` for the services you want to use. Keep secrets on the server; do not expose them through `VITE_` variables or commit `.env` files.

### Environment variables

| Variable | Used for | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Chat assistant | Server-side Gemini API key. |
| `TELEGRAM_BOT_TOKEN` | Contact form (optional) | Bot token used for contact notifications. |
| `TELEGRAM_CHAT_ID` | Contact form (optional) | Destination chat or group. |
| `TELEGRAM_THREAD_ID` | Optional | Forum topic or thread ID for Telegram groups. |
| `APP_URL` | Optional | Public application URL for self-referential links and metadata. |
| `ADMIN_PASSWORD_HASH` | Admin | Scrypt hash of the admin password; never store the plain password. |
| `ADMIN_TOTP_SECRET` | Admin | Base32 secret configured in an authenticator app. |
| `ADMIN_SESSION_SECRET` | Admin | Random secret of at least 32 characters for signed sessions and CSRF tokens. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Sheets | Service account email shared on the spreadsheet. |
| `GOOGLE_PRIVATE_KEY` | Sheets | Service account private key; escaped `\\n` line breaks are supported. |
| `GOOGLE_SHEET_ID` | Sheets | ID from the private spreadsheet URL. |

Without spreadsheet credentials, the site uses bundled portfolio content as a fallback.

## Run locally

```bash
npm run dev
```

The Express server starts the Vite development middleware at `http://localhost:3000`.

## Admin content studio

### Access and protection

Open `/_gate` directly; the public site does not link to this route. Hiding the URL is not a security boundary. The server protects every admin endpoint.

- Sign-in requires a strong password and a six-digit TOTP code.
- Sessions expire after two hours and use an `HttpOnly`, `SameSite=Strict` cookie; production cookies are `Secure`.
- State-changing requests require a CSRF token.
- Failed sign-ins are rate-limited in process memory. On serverless platforms such as Vercel, use a shared limiter or an additional access gateway before production use.

### Create a private Google Sheet

1. In Google Cloud Console, create a project or select an existing one and enable the **Google Sheets API**.
2. Create a service account and a JSON key. Store the downloaded key securely outside the repository.
3. Create a Google Spreadsheet and share it only with the service account email as an **Editor**.
4. Keep **General access** set to **Restricted**. Do not enable “Anyone with the link” or “Publish to web”.
5. Copy the spreadsheet ID from its URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
6. Set these server-side environment variables, using the values from the service account key and spreadsheet:

   ```text
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<service account email>
   GOOGLE_PRIVATE_KEY=<service account PEM private key>
   GOOGLE_SHEET_ID=<spreadsheet ID>
   ```

   The backend accepts escaped `\\n` in the private key. Never use `VITE_` for a secret. Do not commit the service account JSON or paste its private key into issues, logs, or chat.

### Spreadsheet tabs and columns

The admin's **Isi spreadsheet kosong** action automatically creates any missing tabs and fills the initial portfolio content. Creating tabs manually is optional.

| Tab | Content | Columns |
| --- | --- | --- |
| `Profile` | Profile fields by language | `locale, id, data` |
| `Experiences` | Work and education entries | `locale, id, data` |
| `Certificates` | Certificates and awards | `locale, id, data` |
| `Projects` | Portfolio projects | `locale, id, data` |
| `Skills` | Technical skills | `locale, id, data` |
| `Copy` | Localized interface text | `locale, id, data` |
| `SEO` | Page titles, descriptions, and social image metadata | `locale, id, data` |
| `Messages` | Contact submissions | `id, submittedAt, name, email, purpose, subject, message, status` |

For each content tab, a row stores one entity in one locale; the `data` cell contains the entity as JSON. Supported locales are `id`, `en`, `ja`, `ko`, and `zh-CN`. Contact timestamps use ISO 8601 UTC. The spreadsheet and its edit access remain private; portfolio content delivered by the public site is visible to visitors.

### Populate an empty spreadsheet

1. Configure the Google environment variables above and the admin credentials below.
2. Start the app with `npm run dev` and open `http://localhost:3000/_gate`.
3. Sign in with the admin password and the current authenticator code.
4. In **Content Studio**, choose **Isi spreadsheet kosong**.
5. The app creates the missing CMS tabs and seeds them with the bundled data for all five locales. It will proceed only when content tabs are empty or contain only the expected header, to avoid overwriting existing content.
6. Choose **Muat Ulang** and confirm that profile, projects, experience, certificates, skills, interface text, and SEO appear. Check the corresponding rows in Google Sheets.
7. Open the public site and verify that the portfolio content loads.

A new spreadsheet does **not** need a `Portfolio` tab or any data in it. The `Portfolio` tab belongs only to the earlier storage format.

### Migrate from the earlier `Portfolio` tab

If the spreadsheet already contains portfolio JSON in the old `Portfolio` tab:

1. Keep the old tab unchanged as a backup.
2. Open the admin studio and choose **Migrasi data lama**.
3. Missing CMS tabs are created automatically. Migration runs only if the new content tabs do not already contain data.
4. Reload the admin data and verify each locale and section before deployment.

The migration does not delete the legacy tab. Do not manually add headers or edit the old tab during migration.

### Configure admin credentials

Generate credentials locally. Use unique production values and never commit them.

1. Create a strong, unique admin password and provide it privately to the shell as `ADMIN_PASSWORD`. Generate its scrypt hash with:

   ```bash
   node --import tsx --input-type=module -e "import { hashPassword } from './src/server/adminAuth.ts'; console.log(await hashPassword(process.env.ADMIN_PASSWORD ?? ''))"
   ```

   Set the printed result as `ADMIN_PASSWORD_HASH`; unset the temporary `ADMIN_PASSWORD` afterward.

2. Generate a random Base32 TOTP secret, for example with a Base32-capable password manager or generator. Add that same secret to Google Authenticator (or another authenticator) using **Enter a setup key** and **Time based**. Set it as `ADMIN_TOTP_SECRET`. Store the secret and recovery information securely.
3. Generate a session secret with `openssl rand -hex 32` and set it as `ADMIN_SESSION_SECRET`.
4. Restart the local server after changing environment variables.

The authenticator displays a changing six-digit code; enter the current code at `/_gate`. Rotate the affected credentials if any secret is exposed. Changing the session secret invalidates existing sessions.

### Edit content

1. Choose a locale and a section in the admin sidebar.
2. Collections (experience, certificates, projects, and skills) support adding, editing, and deleting items. Deletion requires confirmation.
3. Profile, interface text, and SEO are single objects with a full-width editor. Structured objects and nested arrays are edited as JSON; keep valid JSON syntax and stable item IDs.
4. For profile portraits and project thumbnails, use public HTTPS image URLs.
5. Choose **Simpan Perubahan**. The server validates the data, writes all tabs in a batch, and refreshes the active content cache. Public requests otherwise use a 60-second server cache.
6. Verify the changes on the public site, including the relevant language.

### Messages

Contact form submissions are stored in `Messages` with the fields `id`, `submittedAt`, `name`, `email`, `purpose`, `subject`, `message`, and `status`. The admin inbox can mark messages as read or archived. Configure Telegram variables if notifications outside the spreadsheet are desired.

## Deploy

1. Add the required environment variables to the hosting provider's server-side secret settings. Never add secrets to client build variables.
2. Deploy with a backend that can call the Google Sheets API.
3. Open `https://your-domain/_gate`. If it returns 404, configure the SPA fallback for non-API paths while keeping `/api/*` routed to the backend.
4. Test successful and failed login, session refresh, content save, public content, contact storage, and logout.
5. Confirm unauthenticated requests to admin endpoints are rejected.

### Serverless rate-limit note

Login limiting and TOTP replay protection currently use in-memory state. On serverless platforms, instances do not share this state and it can reset on cold starts. Do not rely on these limits alone in production; add a persistent shared limiter or an access gateway.

## Validation and build

```bash
npm run lint
npm run build
```

`npm run lint` runs TypeScript without emitting files. Run the Node tests with:

```bash
node --import tsx --test \
  src/server/adminAuth.test.ts \
  src/server/portfolioSheetStore.test.ts \
  src/server/telegramService.test.ts \
  src/utils/chatAnswerPresentation.test.ts \
  src/utils/portfolioLogic.test.ts
```

The production build is written to `dist/`. Use `npm start` to serve it with Express, or `npm run preview` to preview the Vite build.

## API routes

### Public

- `GET /api/health` — service health
- `GET /api/portfolio` — current content for all supported locales
- `POST /api/chat` — portfolio-scoped assistant
- `POST /api/contact` — validate and store a contact message

### Admin

All admin endpoints require a valid session. State-changing requests also require CSRF validation.

- `POST /api/admin/login`, `GET /api/admin/session`, `POST /api/admin/logout`
- `GET /api/admin/data`, `PUT /api/admin/data` — read and save portfolio content
- `POST /api/admin/initialize` — create missing tabs and seed empty tabs
- `POST /api/admin/migrate-legacy` — migrate the earlier `Portfolio` JSON tab
- `GET /api/admin/messages`, `PATCH /api/admin/messages/:id` — view messages and update their status

The Vercel function entry point is `api/[...path].ts`. Configure environment variables for each deployment environment that needs them.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Admin sign-in always fails | Confirm `ADMIN_PASSWORD_HASH` uses the `scrypt:...` format, the password is correct, the TOTP secret matches the authenticator, and the device clock is accurate. |
| Admin is not configured | Set `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, and `ADMIN_SESSION_SECRET` on the backend; the session secret must be at least 32 characters. |
| Google Sheets returns 403 | Confirm the Sheets API is enabled, the service account has Editor access to the spreadsheet, the spreadsheet ID is correct, and the private key belongs to that service account. |
| Portfolio tabs are empty or invalid | Use **Isi spreadsheet kosong** for a new spreadsheet or **Migrasi data lama** for a valid legacy `Portfolio` JSON tab. Existing content tabs are not overwritten. |
| Contact messages are not stored | Check the `Messages` tab name, its eight-column header order, and service account permissions. |
| `/_gate` returns 404 in production | Check SPA fallback and rewrite rules. Route non-API paths to `index.html` but keep `/api/*` on the backend. |
| Private key parsing fails | Verify the complete PEM value is present and newlines are preserved or escaped as `\\n`. |
| Admin API returns an empty or non-JSON response | Confirm the deployed backend is running the current version, then check backend and hosting logs for spreadsheet/API errors. |

## Credential rotation

- If credentials may have been exposed, replace the affected password/hash, `ADMIN_TOTP_SECRET`, and `ADMIN_SESSION_SECRET`.
- Replacing `ADMIN_SESSION_SECRET` invalidates existing admin sessions.
- Revoke the old service account's spreadsheet access when rotating its account or key.
- Review spreadsheet sharing periodically and keep general access restricted.
- Never include private keys, passwords, TOTP seeds, or contact message contents in public issues, commits, or logs.

## Project structure

```text
api/                     Vercel API function entry point
src/
  assets/images/         Portfolio and project images
  components/            Page sections, interactions, and admin studio
  data/                  Localized bundled content and seed data
  server/                Authentication and external service integrations
  utils/                 Shared domain logic and tests
server.ts                Express server and API handlers
vite.config.ts           Vite configuration
```

## Security checklist

- Never commit `.env`, service-account keys, API keys, bot tokens, or other credentials.
- Keep secrets on the server; never expose them through client-side `VITE_` variables.
- Keep the spreadsheet restricted to the service account.
- `.env.example` contains placeholder values only.
