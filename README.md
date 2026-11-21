# Adi Yoga

Personal portfolio for selected projects, experience, technical skills, and contact — with a private, spreadsheet-backed content studio.

## Overview

A responsive, multilingual portfolio built with React, Vite, and Express. Content lives in a private Google Sheet and is edited through an admin studio, so the site can change without a redeploy.

### Highlights

- **Five languages** — Indonesian, English, Japanese, Korean, and Simplified Chinese.
- **Light and dark themes** with responsive, content-first layouts.
- **Content studio** — localized create, edit, and delete for portfolio sections.
- **Portfolio assistant** powered by the Gemini API and grounded in current content.
- **Contact form** stored in the spreadsheet and optionally delivered through Telegram.
- **CV generation** and localized page metadata.

### Design — Apple Design Hierarchy

The interface follows Apple's design hierarchy: clear typography leads, content comes first, and controls stay quiet until they are needed. The admin studio uses the same principles — focused sections, concise labels, one primary action per view, and confirmation before destructive changes.

## Getting started

### Requirements

- Node.js compatible with the versions required by the dependencies
- npm

### Install

```bash
npm ci
cp .env.example .env
```

Fill in `.env` for the services you want to use. Keep secrets server-side; never expose them through `VITE_` variables or commit `.env` files.

### Configure environment

| Variable | Required for | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Chat assistant | Server-side Gemini API key. |
| `TELEGRAM_BOT_TOKEN` | Contact form (optional) | Bot token used by the server to deliver submissions. |
| `TELEGRAM_CHAT_ID` | Contact form (optional) | Destination chat or group for submissions. |
| `TELEGRAM_THREAD_ID` | Optional | Forum topic or thread ID for Telegram groups that use topics. |
| `APP_URL` | Optional | Public application URL for self-referential links and metadata. |
| `ADMIN_PASSWORD_HASH` | Admin | Scrypt hash of a strong admin password; never store the plain password. |
| `ADMIN_TOTP_SECRET` | Admin | Base32 secret configured in an authenticator app. |
| `ADMIN_SESSION_SECRET` | Admin | Random secret, at least 32 characters, for signed sessions and CSRF tokens. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Content and messages | Service-account email with editor access to the sheet. |
| `GOOGLE_PRIVATE_KEY` | Content and messages | Service-account private key; escaped `\\n` line breaks are supported. |
| `GOOGLE_SHEET_ID` | Content and messages | ID from the private Google Sheets URL. |

Without spreadsheet credentials, the site falls back to the content bundled in the code.

### Run locally

```bash
npm run dev
```

The Express server starts the Vite development middleware at `http://localhost:3000`.

## Content studio

### Access and security

The studio lives at `/_gate` and is not linked from the public site. That obscurity is not a security boundary: every admin request is verified on the server.

- Sign-in requires a strong password and a six-digit TOTP code.
- Sessions last two hours in an `HttpOnly`, `SameSite=Strict` cookie, marked `Secure` in production.
- Every change requires a CSRF token.
- Failed sign-ins are rate-limited in process memory. On serverless platforms such as Vercel, add a shared limiter or an access gateway before relying on this in production.

### Spreadsheet structure

| Tab | Holds | Columns |
| --- | --- | --- |
| `Profile` | Profile for each language | `locale, id, data` |
| `Experiences` | Work and education | `locale, id, data` |
| `Certificates` | Certificates and awards | `locale, id, data` |
| `Projects` | Featured projects | `locale, id, data` |
| `Skills` | Technical skills | `locale, id, data` |
| `Copy` | Interface text | `locale, id, data` |
| `SEO` | Page titles, descriptions, and sharing images | `locale, id, data` |
| `Messages` | Contact submissions | `id, submittedAt, name, email, purpose, subject, message, status` |

Each content row stores one item for one language; `data` holds the item as JSON. Contact timestamps use ISO 8601 UTC.

### Set up the spreadsheet

1. Create a Google Cloud service account and enable the Google Sheets API.
2. Create a spreadsheet and share it **only** with the service-account email as an editor. Keep general access restricted — never use “Anyone with the link” or “Publish to web”.
3. Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SHEET_ID` to the server's secret manager or local `.env`.
4. Sign in to `/_gate` and choose **Isi spreadsheet kosong**. Missing tabs are created and filled with the bundled content.

Already using the earlier single `Portfolio` tab? Choose **Migrasi data lama** instead. Migration never overwrites tabs that already hold content, and it leaves the old tab in place as a backup.

The full walkthrough is in [`TUTORIAL-2.md`](TUTORIAL-2.md).

### Configure admin credentials

Generate credentials locally; never reuse example values in production.

1. Hash the password with `node --import tsx --input-type=module -e "import { hashPassword } from './src/server/adminAuth.ts'; console.log(await hashPassword(process.env.ADMIN_PASSWORD ?? ''))"`, providing `ADMIN_PASSWORD` in a private shell. Use the output as `ADMIN_PASSWORD_HASH`.
2. Create a unique base32 `ADMIN_TOTP_SECRET` and add it to your authenticator app.
3. Set `ADMIN_SESSION_SECRET` to at least 32 random characters.

Rotate any value that may have been exposed.

### Editing content

- **Choose a language and section** from the sidebar.
- **Collections** — experience, certificates, projects, and skills — support add, edit, and delete.
- **Single objects** — profile, interface text, and SEO — open in a full-width editor.
- **Images** use public HTTPS URLs.
- **Saving** validates content, writes all tabs in a batch, and refreshes the public site immediately. Otherwise, content is cached on the server for 60 seconds.

## Validate and build

```bash
npm run lint
npm run build
```

`npm run lint` runs the TypeScript compiler without emitting files. To run the Node test suite:

```bash
node --import tsx --test \
  src/server/adminAuth.test.ts \
  src/server/portfolioSheetStore.test.ts \
  src/server/telegramService.test.ts \
  src/utils/chatAnswerPresentation.test.ts \
  src/utils/portfolioLogic.test.ts
```

The production build is written to `dist/`. Serve it with the Express server:

```bash
npm start
```

Or preview the Vite build:

```bash
npm run preview
```

## API routes

### Public

- `GET /api/health` — service health
- `GET /api/portfolio` — current portfolio content for every language
- `POST /api/chat` — portfolio-scoped assistant
- `POST /api/contact` — validates and stores a contact message

### Admin

All admin routes require a valid session; changes also require a CSRF token.

- `POST /api/admin/login`, `GET /api/admin/session`, `POST /api/admin/logout`
- `GET /api/admin/data`, `PUT /api/admin/data` — read and save content
- `POST /api/admin/initialize` — create missing tabs and seed empty ones
- `POST /api/admin/migrate-legacy` — move the earlier `Portfolio` tab into the new structure
- `GET /api/admin/messages`, `PATCH /api/admin/messages/:id` — read messages and update their status

The Vercel function entry point is `api/[...path].ts`. Configure the environment variables above for each deployment environment that needs them.

## Project structure

```text
api/                     Vercel API function entry point
src/
  assets/images/         Portfolio and project images
  components/            Page sections, interactive UI, and admin studio
  data/                  Bundled localized content (fallback and seed)
  server/                Admin auth, Google Sheets storage, and Telegram delivery
  utils/                 Shared domain logic and tests
server.ts                Express server and API handlers
vite.config.ts           Vite configuration
```

## Security

- Never commit `.env`, service-account keys, API keys, bot tokens, or other credentials.
- Keep every secret on the server; never use client-exposed `VITE_` prefixes for them.
- Keep the spreadsheet restricted to the service account.
- `.env.example` contains placeholder values only.
