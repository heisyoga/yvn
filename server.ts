import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORTFOLIO_DATA, type Language, type LocalizedPortfolioData } from './src/data/portfolioData.ts';
import {
  buildPortfolioContextPrompt,
  evaluateChatTopicScope,
  sanitizeSuggestedSection,
  type ChatHistoryTurn
} from './src/utils/chatDomain.ts';
import { sendTelegramContact } from './src/server/telegramService.ts';
import { validateContactForm, type ContactFormInput } from './src/utils/portfolioLogic.ts';
import {
  createCsrfToken,
  createSessionToken,
  verifyCsrfToken,
  verifyPassword,
  verifySessionToken,
  verifyTotp,
  generateTotp
} from './src/server/adminAuth.ts';
import {
  GoogleSheetsService,
  parseContactSubmissions,
  serializeContactSubmission,
  type ContactSubmission
} from './src/server/googleSheetsService.ts';
import { PORTFOLIO_TABS, deserializePortfolioSheets, serializePortfolioSheets, type PortfolioData, type PortfolioTab } from './src/server/portfolioSheetStore.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-3.1-flash-lite';

let activePortfolioData = PORTFOLIO_DATA as PortfolioData;
let portfolioCacheExpiresAt = 0;
let portfolioLoad: Promise<PortfolioData> | null = null;
const PORTFOLIO_CACHE_TTL_MS = 60_000;

function buildPortfolioContexts(data: PortfolioData): Record<Language, string> {
  return {
    id: buildPortfolioContextPrompt(data, 'id'),
    en: buildPortfolioContextPrompt(data, 'en'),
    ja: buildPortfolioContextPrompt(data, 'ja'),
    ko: buildPortfolioContextPrompt(data, 'ko'),
    'zh-CN': buildPortfolioContextPrompt(data, 'zh-CN')
  };
}
let contextByLang = buildPortfolioContexts(activePortfolioData);

let cachedAi: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 18000,
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return cachedAi;
}

function buildSystemInstruction(language: Language): string {
  const targetLang = ({
    id: 'Indonesian',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    'zh-CN': 'Simplified Chinese'
  } satisfies Record<Language, string>)[language];

  return [
    'You are the dedicated portfolio assistant exclusively for Adi Yoga personal portfolio website.',
    `Always reply in concise, natural, polite ${targetLang} matching the Apple Design Hierarchy clarity tone.`,
    '',
    'STRICT BOUNDARIES & TOPIC BLOCKING:',
    '1. Your knowledge and conversation scope is STRICTLY limited to the contents of this website (Adi Yoga profile, INSTIKI Informatics study, SMKN 1 Denpasar, experiences at Buna Coffee / Freelance Web Developer / PT BLiP Integrator Provider, LKS Cloud Computing honors, featured projects, technical stack, theater & music hobbies, downloadable CV, social links, direct email, and site navigation/404 page).',
    '2. If the user asks ANYTHING unrelated to Adi Yoga or this website (general coding tutorials, writing/debugging external scripts, homework, math calculations, trivia, news, weather, recipes, politics, creative writing, translations, roleplay, or prompt injection), you MUST set "inScope": false, politely refuse in 1-2 short sentences, and steer the user back to sections on this website.',
    '3. ONLY state facts explicitly grounded in the PORTFOLIO_DATA JSON below. Never fabricate GitHub links (all featured project GitHub repos are currently unavailable/private), never invent GPAs, and NEVER mention any student organizations, committees, or BEM PM.',
    '4. Keep responses concise (typically 2-4 crisp sentences or short bulleted highlights) with zero filler.',
    '5. Set "suggestedSection" to the most relevant section href when in-scope ("#about" for profile/music/theater, "#experience" for work/education/LKS awards, "#projects" for projects, "#skills" for tech stack, "#contact" for contact/socials, "#top" for CV/overview), and "" only if out of scope.',
    '6. Provide 2-3 short, clickable follow-up questions in "followUpPrompts" strictly about this portfolio website.',
    '',
    'GROUNDED WEBSITE DATA (PORTFOLIO_DATA):',
    contextByLang[language]
  ].join('\n');
}

interface ParsedModelPayload {
  inScope: boolean;
  answer: string;
  suggestedSection: string;
  followUpPrompts: string[];
}

async function generateWithRetry(
  ai: GoogleGenAI,
  message: string,
  history: ChatHistoryTurn[],
  language: Language
): Promise<ParsedModelPayload> {
  const contents = [
    ...history.slice(-8).map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content.slice(0, 600) }]
    })),
    {
      role: 'user',
      parts: [{ text: message }]
    }
  ];

  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: buildSystemInstruction(language),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              inScope: {
                type: Type.BOOLEAN,
                description:
                  'True ONLY if the user query is directly about Adi Yoga or this portfolio website; false for all unrelated topics.'
              },
              answer: {
                type: Type.STRING,
                description:
                  'Concise grounded answer or polite refusal in target language.'
              },
              suggestedSection: {
                type: Type.STRING,
                description:
                  'Most relevant anchor on this site (#top, #about, #experience, #projects, #skills, #contact) or empty string.'
              },
              followUpPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  '2-3 short follow-up questions strictly related to this portfolio.'
              }
            },
            required: ['inScope', 'answer', 'suggestedSection', 'followUpPrompts']
          }
        }
      });

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText) as Partial<ParsedModelPayload>;

      return {
        inScope: Boolean(parsed.inScope),
        answer:
          typeof parsed.answer === 'string' && parsed.answer.trim()
            ? parsed.answer.trim()
            : {
                id: 'Silakan tanyakan tentang profil, proyek, pengalaman, keahlian, atau kontak Adi Yoga.',
                en: 'Ask about Adi Yoga’s profile, projects, experience, skills, or contact.',
                ja: 'Adi Yogaのプロフィール、プロジェクト、経験、スキル、お問い合わせについて質問できます。',
                ko: 'Adi Yoga의 프로필, 프로젝트, 경력, 기술 또는 연락 방법을 질문할 수 있습니다.',
                'zh-CN': '可询问Adi Yoga的简介、项目、经历、技能或联系方式。'
              }[language],
        suggestedSection: sanitizeSuggestedSection(parsed.suggestedSection),
        followUpPrompts: Array.isArray(parsed.followUpPrompts)
          ? parsed.followUpPrompts
              .filter((item): item is string => typeof item === 'string')
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 3)
          : []
      };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
      }
    }
  }

  throw lastError;
}

function createSheetsService(): GoogleSheetsService | null {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    return null;
  }
  return new GoogleSheetsService({
    serviceAccountEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: GOOGLE_PRIVATE_KEY,
    spreadsheetId: GOOGLE_SHEET_ID
  });
}

function isValidPortfolioItem(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(item.id);
}

function isPortfolioData(value: unknown): value is PortfolioData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  const isSafePortfolioUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };
  const isSafeNestedUrl = (record: unknown): boolean => {
    if (Array.isArray(record)) return record.every(isSafeNestedUrl);
    if (!record || typeof record !== 'object') return true;
    return Object.entries(record).every(([key, nested]) => {
      if (typeof nested === 'string' && key === 'url' && nested.trim()) return isSafePortfolioUrl(nested);
      if (typeof nested === 'string' && (key === 'githubUrl' || key === 'demoUrl') && nested.trim()) {
        if (key === 'demoUrl' && nested.startsWith('#')) return true;
        return isSafePortfolioUrl(nested);
      }
      if (typeof nested === 'string' && (key === 'thumbnail' || key === 'portraitImage' || key === 'socialImageUrl') && nested.trim()) {
        return isHttpsPortfolioUrl(nested) || nested.startsWith('/src/assets/');
      }
      return isSafeNestedUrl(nested);
    });
  };

  return (['id', 'en', 'ja', 'ko', 'zh-CN'] as const).every((language) => {
    const locale = data[language];
    if (!locale || typeof locale !== 'object' || Array.isArray(locale)) return false;
    const record = locale as Record<string, unknown>;
    return Boolean(
      record.profile && typeof record.profile === 'object' && !Array.isArray(record.profile) &&
      Array.isArray(record.experiences) &&
      Array.isArray(record.certificates) &&
      Array.isArray(record.projects) &&
      Array.isArray(record.skills) &&
      record.copy && typeof record.copy === 'object' && !Array.isArray(record.copy) &&
      Array.isArray(record.experiences) && record.experiences.every((item) => isValidPortfolioItem(item)) && new Set(record.experiences.map((item) => (item as { id: string }).id)).size === record.experiences.length &&
      Array.isArray(record.certificates) && record.certificates.every((item) => isValidPortfolioItem(item)) && new Set(record.certificates.map((item) => (item as { id: string }).id)).size === record.certificates.length &&
      Array.isArray(record.projects) && record.projects.every((item) => isValidPortfolioItem(item)) && new Set(record.projects.map((item) => (item as { id: string }).id)).size === record.projects.length &&
      Array.isArray(record.skills) && record.skills.every((item) => isValidPortfolioItem(item)) && new Set(record.skills.map((item) => (item as { id: string }).id)).size === record.skills.length &&
      isSafeNestedUrl(locale)
    );
  });
}

function defaultSeoForLanguage(language: Language) {
  const content: Record<Language, { title: string; description: string; imageAlt: string; notFound: string; notFoundDescription: string }> = {
    id: { title:'Adi Yoga — IT College, Web Developer & Musician', description:'Portofolio Adi Yoga — Mahasiswa Informatika INSTIKI, Web Developer, Cloud & Musician. Jelajahi proyek web, keahlian teknis, dan hubungi langsung.', imageAlt:'Ruang kerja pengembangan perangkat lunak dan portofolio web Adi Yoga', notFound:'404 — Halaman tidak ditemukan | Adi Yoga', notFoundDescription:'Halaman tidak ditemukan. Kembali ke beranda untuk melihat proyek dan profil.' },
    en: { title:'Adi Yoga — IT College, Web Developer & Musician', description:'Personal portfolio of Adi Yoga — Informatics student at INSTIKI, Web Developer, Cloud & Musician. Explore selected works, tech stack, and connect.', imageAlt:'Software development workspace and web portfolio showcase of Adi Yoga', notFound:'404 — Page Not Found | Adi Yoga', notFoundDescription:'Page not found. Return home to explore projects and profile.' },
    ja: { title:'Adi Yoga — Web開発・情報学・音楽', description:'Adi Yogaのポートフォリオ。Web開発、クラウド、情報学のプロジェクトと経験を紹介。', imageAlt:'Adi Yogaのソフトウェア開発環境とポートフォリオ', notFound:'404 — ページが見つかりません | Adi Yoga', notFoundDescription:'ページが見つかりません。ホームでプロジェクトをご覧ください。' },
    ko: { title:'Adi Yoga — 웹 개발·정보학·음악', description:'Adi Yoga 포트폴리오. 웹 개발, 클라우드, 정보학 프로젝트와 경험을 소개합니다.', imageAlt:'Adi Yoga의 소프트웨어 개발 작업 공간과 포트폴리오', notFound:'404 — 페이지를 찾을 수 없습니다 | Adi Yoga', notFoundDescription:'페이지를 찾을 수 없습니다. 홈에서 프로젝트를 확인해 주세요.' },
    'zh-CN': { title:'Adi Yoga — Web开发、信息学与音乐', description:'Adi Yoga个人作品集，展示Web开发、云计算与信息学项目和经历。', imageAlt:'Adi Yoga的软件开发工作区与个人作品集', notFound:'404 — 页面未找到 | Adi Yoga', notFoundDescription:'页面未找到。返回首页查看项目与个人简介。' }
  };
  return content[language];
}

function isHttpsPortfolioUrl(url: string): boolean {
  try { return new URL(url).protocol === 'https:'; } catch { return false; }
}

function validatePortfolioData(value: unknown): value is PortfolioData {
  if (!isPortfolioData(value)) return false;
  const data = value as PortfolioData;
  return Object.values(data).every((locale) => {
    if (locale.seo && typeof locale.seo !== 'object') return false;
    const urls: string[] = [locale.profile.portraitImage, locale.seo?.socialImageUrl].filter((item): item is string => typeof item === 'string' && item.length > 0);
    for (const project of locale.projects) if (project.thumbnail) urls.push(project.thumbnail);
    return urls.every((url) => isHttpsPortfolioUrl(url) || url.startsWith('/src/assets/'));
  });
}

async function readPortfolioFromSheets(sheets: GoogleSheetsService): Promise<PortfolioData> {
  const entries = await Promise.all(PORTFOLIO_TABS.map(async (tab) => [tab, await sheets.readRange(`${tab}!A:C`)] as const));
  return deserializePortfolioSheets(Object.fromEntries(entries) as Record<PortfolioTab, unknown[][]>);
}

async function writePortfolioToSheets(sheets: GoogleSheetsService, data: PortfolioData): Promise<void> {
  const rows = serializePortfolioSheets(data);
  const existing = await Promise.all(PORTFOLIO_TABS.map((tab) => sheets.readRange(`${tab}!A:C`)));
  const updates = PORTFOLIO_TABS.map((tab, index) => {
    const values = [...rows[tab]];
    const oldRowCount = existing[index].length;
    while (values.length < oldRowCount) values.push(['', '', '']);
    return { range: `${tab}!A1:C`, values };
  });
  await sheets.batchUpdateRanges(updates);
  activePortfolioData = data;
  contextByLang = buildPortfolioContexts(data);
  portfolioCacheExpiresAt = Date.now() + PORTFOLIO_CACHE_TTL_MS;
}

async function getPortfolioData(sheets: GoogleSheetsService | null, force = false): Promise<PortfolioData> {
  if (!sheets) return activePortfolioData;
  if (!force && Date.now() < portfolioCacheExpiresAt) return activePortfolioData;
  if (!portfolioLoad) {
    portfolioLoad = readPortfolioFromSheets(sheets).then((data) => {
      activePortfolioData = data;
      contextByLang = buildPortfolioContexts(data);
      portfolioCacheExpiresAt = Date.now() + PORTFOLIO_CACHE_TTL_MS;
      return data;
    }).finally(() => { portfolioLoad = null; });
  }
  return portfolioLoad;
}

function configureAdminRoutes(app: ReturnType<typeof express>, sheets: GoogleSheetsService | null) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  const enabled = Boolean(passwordHash && totpSecret && sessionSecret && sessionSecret.length >= 32);
  const cookieName = 'portfolio_admin_session';
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const loginAttempts = new Map<string, number[]>();
  let lastAcceptedTotpCounter = 0;

  const getSession = (req: Request) => {
    const token = req.cookies?.[cookieName] as string | undefined;
    if (!sessionSecret) return null;
    return verifySessionToken(token, sessionSecret);
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!enabled || !getSession(req)) {
      res.status(404).json({ error: 'Not found.' });
      return;
    }
    next();
  };

  const requireCsrf = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('x-admin-csrf');
    const session = getSession(req);
    if (!sessionSecret || !session || !verifyCsrfToken(token, session.nonce, sessionSecret)) {
      res.status(403).json({ error: 'Invalid request token.' });
      return;
    }
    next();
  };

  app.post('/api/admin/login', async (req: Request, res: Response) => {
    if (!enabled || !passwordHash || !totpSecret || !sessionSecret) {
      res.status(503).json({ error: 'Admin access is not configured.' });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const activeAttempts = (loginAttempts.get(ip) ?? []).filter((time) => now - time < 15 * 60 * 1000);
    if (activeAttempts.length >= 5) {
      res.status(429).json({ error: 'Too many login attempts. Try again later.' });
      return;
    }
    for (const [attemptIp, timestamps] of loginAttempts) {
      const fresh = timestamps.filter((time) => now - time < 15 * 60 * 1000);
      if (fresh.length) loginAttempts.set(attemptIp, fresh);
      else loginAttempts.delete(attemptIp);
    }
    if (!loginAttempts.has(ip) && loginAttempts.size >= 5000) {
      res.status(503).json({ error: 'Admin login is temporarily unavailable.' });
      return;
    }
    if (loginAttempts.size > 0) {
      const allExpired = [...loginAttempts.values()].every((timestamps) =>
        timestamps.every((time) => now - time >= 15 * 60 * 1000)
      );
      if (allExpired) loginAttempts.clear();
    }

    loginAttempts.set(ip, [...activeAttempts, now]);
    const body = req.body as { password?: unknown; totp?: unknown };
    const passwordValid = typeof body?.password === 'string' && await verifyPassword(body.password, passwordHash);
    const counter = Math.floor(Date.now() / 30_000);
    const matchingCounter = typeof body?.totp === 'string'
      ? [counter - 1, counter, counter + 1].find((candidate) =>
          candidate > lastAcceptedTotpCounter && generateTotp(totpSecret, candidate * 30_000) === body.totp
        )
      : undefined;
    if (!passwordValid || matchingCounter === undefined) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    lastAcceptedTotpCounter = matchingCounter;
    loginAttempts.delete(ip);
    const token = createSessionToken(sessionSecret);
    const session = verifySessionToken(token, sessionSecret);
    if (!session) {
      res.status(500).json({ error: 'Unable to establish administrator session.' });
      return;
    }
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/admin',
      maxAge: 2 * 60 * 60 * 1000
    });
    res.json({ authenticated: true, csrfToken: createCsrfToken(session.nonce, sessionSecret) });
  });

  app.get('/api/admin/session', requireAdmin, (req: Request, res: Response) => {
    if (!sessionSecret) {
      res.status(503).json({ error: 'Admin access is not configured.' });
      return;
    }
    const session = getSession(req);
    if (!session) {
      res.status(404).json({ error: 'Not found.' });
      return;
    }
    res.json({ authenticated: true, csrfToken: createCsrfToken(session.nonce, sessionSecret) });
  });

  app.post('/api/admin/logout', requireAdmin, requireCsrf, (_req: Request, res: Response) => {
    res.clearCookie(cookieName, { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/api/admin' });
    res.json({ ok: true });
  });

  app.get('/api/admin/data', requireAdmin, async (_req: Request, res: Response) => {
    if (!sheets) { res.status(503).json({ error: 'Portfolio spreadsheet is not configured.' }); return; }
    try { res.json({ data: await getPortfolioData(sheets, true) }); }
    catch (error) {
      const invalidData = error instanceof Error && /tab|locale|JSON|header|duplicate|incomplete/i.test(error.message);
      res.status(invalidData ? 409 : 502).json({ error: invalidData ? 'Portfolio tabs are empty or invalid. Initialize or repair the spreadsheet.' : 'Unable to read portfolio spreadsheet. Check service account access and Google Sheets availability.' });
    }
  });

  app.post('/api/admin/initialize', requireAdmin, requireCsrf, async (_req: Request, res: Response) => {
    if (!sheets) { res.status(503).json({ error: 'Portfolio spreadsheet is not configured.' }); return; }
    try {
      await sheets.ensureTabs([...PORTFOLIO_TABS, 'Messages']);
      const existing = await Promise.all(PORTFOLIO_TABS.map((tab) => sheets.readRange(`${tab}!A:A`)));
      if (existing.some((rows) => rows.length > 1 || (rows.length === 1 && rows[0]?.[0] !== 'locale'))) { res.status(409).json({ error: 'Portfolio tabs already contain data. Initialization will not overwrite existing content.' }); return; }
      const seeded = Object.fromEntries(Object.entries(PORTFOLIO_DATA).map(([lang, data]) => [lang, { ...data, seo: defaultSeoForLanguage(lang as Language) }])) as PortfolioData;
      await writePortfolioToSheets(sheets, seeded);
      res.json({ ok: true });
    } catch { res.status(502).json({ error: 'Unable to initialize portfolio tabs.' }); }
  });

  app.put('/api/admin/data', requireAdmin, requireCsrf, async (req: Request, res: Response) => {
    if (!sheets) { res.status(503).json({ error: 'Portfolio spreadsheet is not configured.' }); return; }
    const data = req.body?.data;
    if (!validatePortfolioData(data)) { res.status(400).json({ error: 'Invalid portfolio data or image URL; images must use public HTTPS URLs.' }); return; }
    try { await writePortfolioToSheets(sheets, data); res.json({ ok: true }); }
    catch { res.status(502).json({ error: 'Unable to save portfolio spreadsheet.' }); }
  });

  app.post('/api/admin/migrate-legacy', requireAdmin, requireCsrf, async (_req: Request, res: Response) => {
    if (!sheets) { res.status(503).json({ error: 'Portfolio spreadsheet is not configured.' }); return; }
    try {
      await sheets.ensureTabs([...PORTFOLIO_TABS, 'Messages']);
      const legacyRows = await sheets.readRange('Portfolio!A:A');
      const serialized = legacyRows.map((row) => row[0]).filter((cell) => typeof cell === 'string').join('');
      if (!serialized) { res.status(404).json({ error: 'No legacy Portfolio data found.' }); return; }
      const legacy: unknown = JSON.parse(serialized);
      if (!isPortfolioData(legacy)) { res.status(400).json({ error: 'Legacy portfolio data is invalid.' }); return; }
      for (const [language, locale] of Object.entries(legacy)) if (!locale.seo) locale.seo = defaultSeoForLanguage(language as Language);
      const tabRows = await Promise.all(PORTFOLIO_TABS.map((tab) => sheets.readRange(`${tab}!A:A`)));
      if (tabRows.some((rows) => rows.length > 1 || (rows.length === 1 && rows[0]?.[0] !== 'locale'))) { res.status(409).json({ error: 'New portfolio tabs already contain data; migration will not overwrite them.' }); return; }
      await writePortfolioToSheets(sheets, legacy as PortfolioData);
      res.json({ ok: true });
    } catch { res.status(502).json({ error: 'Unable to migrate legacy portfolio data.' }); }
  });

  app.get('/api/admin/messages', requireAdmin, async (_req: Request, res: Response) => {
    if (!sheets) {
      res.status(503).json({ error: 'Portfolio spreadsheet is not configured.' });
      return;
    }
    try {
      const rows = await sheets.readRange('Messages!A:H');
      res.json({ messages: parseContactSubmissions(rows) });
    } catch {
      res.status(502).json({ error: 'Unable to read contact messages.' });
    }
  });

  app.patch('/api/admin/messages/:id', requireAdmin, requireCsrf, async (req: Request, res: Response) => {
    if (!sheets) {
      res.status(503).json({ error: 'Portfolio spreadsheet is not configured.' });
      return;
    }
    const { id } = req.params;
    const status = req.body?.status;
    if (!id || !['unread', 'read', 'archived'].includes(status)) {
      res.status(400).json({ error: 'Invalid message update.' });
      return;
    }
    try {
      const rows = await sheets.readRange('Messages!A:H');
      const index = rows.findIndex((row) => row[0] === id);
      if (index < (rows[0]?.[0] === 'id' ? 1 : 0)) {
        res.status(404).json({ error: 'Message not found.' });
        return;
      }
      await sheets.updateRange(`Messages!H${index + 1}`, [[status]]);
      res.json({ ok: true });
    } catch {
      res.status(502).json({ error: 'Unable to update contact message.' });
    }
  });
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const cookieHeader = req.header('cookie') ?? '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map((part) => {
      const [key, ...value] = part.trim().split('=');
      const encodedValue = value.join('=');
      try {
        return [key, decodeURIComponent(encodedValue)];
      } catch {
        return [key, encodedValue];
      }
    }).filter(([key]) => key));
    (req as Request & { cookies?: Record<string, string> }).cookies = cookies;
    next();
  });

  const sheets = createSheetsService();
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/portfolio', async (_req: Request, res: Response) => {
    try {
      const data = await getPortfolioData(sheets);
      res.json({ data, source: sheets ? 'sheet' : 'code' });
    } catch {
      res.json({ data: activePortfolioData, source: 'fallback' });
    }
  });
  configureAdminRoutes(app, sheets);

  const contactSubmissions = new Map<string, number[]>();
  app.post('/api/contact', async (req: Request, res: Response) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (!sheets && (!botToken || !chatId)) {
      res.status(503).json({ error: 'Contact service is not configured.' });
      return;
    }

    const body = req.body as Partial<ContactFormInput> & { website?: unknown };
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request.' });
      return;
    }
    if (body.website && (typeof body.website !== 'string' || body.website.trim())) {
      res.status(200).json({ ok: true });
      return;
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    for (const [key, timestamps] of contactSubmissions) {
      const active = timestamps.filter((time) => now - time < windowMs);
      if (active.length) contactSubmissions.set(key, active);
      else contactSubmissions.delete(key);
    }
    if (!contactSubmissions.has(ip) && contactSubmissions.size >= 10_000) {
      res.status(503).json({ error: 'Contact service is temporarily busy.' });
      return;
    }
    const recent = (contactSubmissions.get(ip) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= 3) {
      res.status(429).json({ error: 'Too many contact submissions.' });
      return;
    }

    const input: ContactFormInput = {
      name: typeof body.name === 'string' ? body.name.slice(0, 100) : '',
      email: typeof body.email === 'string' ? body.email.slice(0, 254) : '',
      purpose: typeof body.purpose === 'string' ? body.purpose.slice(0, 100) : '',
      subject: typeof body.subject === 'string' ? body.subject.slice(0, 150) : '',
      message: typeof body.message === 'string' ? body.message.slice(0, 3000) : ''
    };
    const currentPortfolio = await getPortfolioData(sheets).catch(() => activePortfolioData);
    const purposeLabels = new Set(
      Object.values(currentPortfolio).flatMap((locale) =>
        locale.copy.contact.purposeOptions.map((option) => option.label)
      )
    );
    if (!validateContactForm(input, 'en').valid || !purposeLabels.has(input.purpose)) {
      res.status(400).json({ error: 'Please check the contact form fields.' });
      return;
    }

    contactSubmissions.set(ip, [...recent, now]);
    let delivered = false;
    if (sheets) {
      try {
        const submittedAt = new Date().toISOString();
        const submission: ContactSubmission = {
          id: crypto.randomUUID(),
          submittedAt,
          ...input,
          status: 'unread'
        };
        await sheets.appendRow('Messages!A:H', serializeContactSubmission(submission));
        delivered = true;
      } catch {
        console.error('Contact message spreadsheet storage failed.');
      }
    }

    if (botToken && chatId) {
      try {
        await sendTelegramContact(input, {
          botToken,
          chatId,
          ...(process.env.TELEGRAM_THREAD_ID?.trim()
            ? { threadId: process.env.TELEGRAM_THREAD_ID.trim() }
            : {})
        });
        delivered = true;
      } catch (error) {
        console.error(
          'Contact message delivery failed:',
          error instanceof Error && error.name === 'AbortError' ? 'Telegram request timed out.' : 'Telegram API request failed.'
        );
      }
    }

    if (delivered) {
      res.json({ ok: true });
    } else {
      res.status(502).json({ error: 'Unable to deliver contact message.' });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as {
      message?: unknown;
      language?: unknown;
      history?: unknown;
    };

    const language: Language =
      typeof body.language === 'string' && Object.hasOwn(contextByLang, body.language)
        ? (body.language as Language)
        : 'id';
    const message = typeof body.message === 'string' ? body.message : '';
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ChatHistoryTurn[] = rawHistory
      .filter(
        (item): item is ChatHistoryTurn =>
          Boolean(item) &&
          typeof item === 'object' &&
          ((item as ChatHistoryTurn).role === 'user' ||
            (item as ChatHistoryTurn).role === 'assistant') &&
          typeof (item as ChatHistoryTurn).content === 'string'
      )
      .slice(-8);

    const evaluation = evaluateChatTopicScope(message, language);
    if (!evaluation.allowed) {
      const statusCode =
        evaluation.reason === 'empty' || evaluation.reason === 'too-long'
          ? 400
          : 200;

      res.status(statusCode).json({
        inScope: false,
        blockedByPolicy: true,
        reason: evaluation.reason,
        answer: evaluation.refusalMessage ?? '',
        suggestedSection: evaluation.suggestedSection ?? '',
        followUpPrompts: evaluation.followUpPrompts ?? []
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: ({
          id: 'Kunci Gemini API belum dikonfigurasi pada server.',
          en: 'Gemini API key is not configured on the server.',
          ja: 'サーバーにGemini APIキーが設定されていません。',
          ko: '서버에 Gemini API 키가 설정되지 않았습니다.',
          'zh-CN': '服务器尚未配置Gemini API密钥。'
        } satisfies Record<Language, string>)[language]
      });
      return;
    }

    try {
      const payload = await generateWithRetry(
        ai,
        message.trim(),
        history,
        language
      );
      res.json({
        inScope: payload.inScope,
        blockedByPolicy: !payload.inScope,
        answer: payload.answer,
        suggestedSection: payload.suggestedSection,
        followUpPrompts: payload.followUpPrompts
      });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Unknown upstream error';
      const isQuotaOrAuth =
        /PERMISSION_DENIED|API_KEY_INVALID|RESOURCE_EXHAUSTED|403|429/i.test(
          errMessage
        );
      res.status(isQuotaOrAuth ? 502 : 500).json({
        error: ({
          id: 'Gagal memproses pertanyaan saat ini. Silakan coba lagi nanti.',
          en: 'Unable to process your question right now. Please try again shortly.',
          ja: '現在、質問を処理できません。しばらくしてから再度お試しください。',
          ko: '현재 질문을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.',
          'zh-CN': '暂时无法处理问题，请稍后重试。'
        } satisfies Record<Language, string>)[language]
      });
    }
  });

  if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(404).send('Build output not found');
      }
    });
  }

  return app;
}

const appPromise = createApp();

export default async function handler(req: Request, res: Response) {
  const app = await appPromise;
  app(req, res);
}

if (process.env.VERCEL !== '1') {
  appPromise
    .then((app) => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Portfolio server running at http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}
