# Adi Yoga

Personal portfolio for selected projects, experience, technical skills, and contact information.

## Overview

A responsive, multilingual portfolio built with React and Vite. It includes project details, experience and skills sections, a downloadable CV, a portfolio-focused AI chat assistant, and a contact form delivered through Telegram.

### Highlights

- Indonesian, English, Japanese, Korean, and Simplified Chinese content
- Light and dark themes with responsive layouts
- Project, experience, and skills browsing
- Portfolio chatbot powered by the Gemini API
- Contact form with server-side Telegram delivery
- CV generation and localized page metadata

## Getting started

### Requirements

- Node.js compatible with the versions required by the dependencies
- npm

### Install

```bash
npm ci
cp .env.example .env
```

Set the environment values in `.env` for the services you want to use. Keep secrets server-side; do not expose them through `VITE_` variables or commit `.env` files.

### Configure environment

| Variable | Required for | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Chat assistant | Server-side Gemini API key. |
| `TELEGRAM_BOT_TOKEN` | Contact form | Bot token used by the server to deliver submissions. |
| `TELEGRAM_CHAT_ID` | Contact form | Destination chat or group for submissions. |
| `TELEGRAM_THREAD_ID` | Optional | Forum topic/thread ID for Telegram groups that use topics. |
| `APP_URL` | Optional | Public application URL for self-referential links and metadata. |

The chatbot and contact form need their respective credentials. The rest of the portfolio can be run without them.

## Run locally

```bash
npm run dev
```

The Express server starts the Vite development middleware. By default, the application is available at `http://localhost:3000`.

## Validate and build

```bash
npm run lint
npm run build
```

`npm run lint` runs the TypeScript compiler without emitting files. To run the current Node test suite:

```bash
node --import tsx --test \
  src/server/telegramService.test.ts \
  src/utils/chatAnswerPresentation.test.ts \
  src/utils/portfolioLogic.test.ts
```

The production build is written to `dist/`. To serve the built application with the Express server:

```bash
npm start
```

To preview the Vite build locally instead:

```bash
npm run preview
```

## API routes

- `GET /api/health` — basic service health response
- `POST /api/chat` — portfolio-scoped chat endpoint
- `POST /api/contact` — validates and delivers a contact message through Telegram

The Vercel function entry point is `api/[...path].ts`. Configure the environment variables above in the Vercel project settings for each deployment environment that needs them.

## Project structure

```text
api/                    Vercel API function entry point
src/
  assets/images/         Portfolio and project images
  components/            Page sections and interactive UI
  data/                  Localized portfolio content
  server/                Server-side integrations
  utils/                 Shared domain logic and tests
server.ts                Express server and API handlers
vite.config.ts           Vite configuration
```

## Security

- Do not commit `.env`, API keys, bot tokens, or other credentials.
- Keep Gemini and Telegram credentials on the server; never use client-exposed `VITE_` prefixes for secrets.
- `.env.example` contains placeholder values only.
