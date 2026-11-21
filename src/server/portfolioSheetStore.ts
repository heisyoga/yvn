import { SUPPORTED_LANGUAGES, type Language, type LocalizedPortfolioData } from '../data/portfolioData.ts';

export const PORTFOLIO_TABS = ['Profile', 'Experiences', 'Certificates', 'Projects', 'Skills', 'Copy', 'SEO'] as const;
export type PortfolioTab = (typeof PORTFOLIO_TABS)[number];
export type PortfolioSheetRows = Record<PortfolioTab, unknown[][]>;
export interface PortfolioSeoData { title: string; description: string; imageAlt: string; notFound: string; notFoundDescription: string; socialImageUrl?: string }
export type PortfolioData = Record<Language, LocalizedPortfolioData & { seo?: PortfolioSeoData }>;

const HEADERS = ['locale', 'id', 'data'];
const SEO_BASE: Record<Language, { title: string; description: string; imageAlt: string; notFound: string; notFoundDescription: string }> = {
  id: { title:'Adi Yoga — IT College, Web Developer & Musician', description:'Portofolio Adi Yoga — Mahasiswa Informatika INSTIKI, Web Developer, Cloud & Musician. Jelajahi proyek web, keahlian teknis, dan hubungi langsung.', imageAlt:'Ruang kerja pengembangan perangkat lunak dan portofolio web Adi Yoga', notFound:'404 — Halaman tidak ditemukan | Adi Yoga', notFoundDescription:'Halaman tidak ditemukan. Kembali ke beranda untuk melihat proyek dan profil.' },
  en: { title:'Adi Yoga — IT College, Web Developer & Musician', description:'Personal portfolio of Adi Yoga — Informatics student at INSTIKI, Web Developer, Cloud & Musician. Explore selected works, tech stack, and connect.', imageAlt:'Software development workspace and web portfolio showcase of Adi Yoga', notFound:'404 — Page Not Found | Adi Yoga', notFoundDescription:'Page not found. Return home to explore projects and profile.' },
  ja: { title:'Adi Yoga — Web開発・情報学・音楽', description:'Adi Yogaのポートフォリオ。Web開発、クラウド、情報学のプロジェクトと経験を紹介。', imageAlt:'Adi Yogaのソフトウェア開発環境とポートフォリオ', notFound:'404 — ページが見つかりません | Adi Yoga', notFoundDescription:'ページが見つかりません。ホームでプロジェクトをご覧ください。' },
  ko: { title:'Adi Yoga — 웹 개발·정보학·음악', description:'Adi Yoga 포트폴리오. 웹 개발, 클라우드, 정보학 프로젝트와 경험을 소개합니다.', imageAlt:'Adi Yoga의 소프트웨어 개발 작업 공간과 포트폴리오', notFound:'404 — 페이지를 찾을 수 없습니다 | Adi Yoga', notFoundDescription:'페이지를 찾을 수 없습니다. 홈에서 프로젝트를 확인해 주세요.' },
  'zh-CN': { title:'Adi Yoga — Web开发、信息学与音乐', description:'Adi Yoga个人作品集，展示Web开发、云计算与信息学项目和经历。', imageAlt:'Adi Yoga的软件开发工作区与个人作品集', notFound:'404 — 页面未找到 | Adi Yoga', notFoundDescription:'页面未找到。返回首页查看项目与个人简介。' }
};

function asJsonRow(locale: Language, id: string, data: unknown): unknown[] {
  return [locale, id, JSON.stringify(data)];
}

export function serializePortfolioSheets(data: PortfolioData): PortfolioSheetRows {
  const rows = Object.fromEntries(PORTFOLIO_TABS.map((tab) => [tab, [HEADERS]])) as PortfolioSheetRows;
  for (const locale of SUPPORTED_LANGUAGES) {
    const content = data[locale];
    rows.Profile.push(asJsonRow(locale, 'profile', content.profile));
    rows.Copy.push(asJsonRow(locale, 'copy', content.copy));
    rows.SEO.push(asJsonRow(locale, 'seo', content.seo ?? SEO_BASE[locale]));
    for (const [tab, collection] of [
      ['Experiences', content.experiences], ['Certificates', content.certificates],
      ['Projects', content.projects], ['Skills', content.skills]
    ] as const) {
      if (collection.length === 0) rows[tab].push(asJsonRow(locale, '__empty__', null));
      else for (const item of collection) rows[tab].push(asJsonRow(locale, String(item.id), item));
    }
  }
  return rows;
}

function parseRows(rows: unknown[][], tab: PortfolioTab): Map<Language, Map<string, unknown>> {
  if (!Array.isArray(rows) || rows[0]?.[0] !== 'locale' || rows[0]?.[1] !== 'id' || rows[0]?.[2] !== 'data') {
    throw new Error(`${tab} tab is missing its required locale, id, data header.`);
  }
  const result = new Map<Language, Map<string, unknown>>();
  for (const row of rows.slice(1)) {
    if (!Array.isArray(row) || row.length < 3 || typeof row[0] !== 'string' || !SUPPORTED_LANGUAGES.includes(row[0] as Language) || typeof row[1] !== 'string' || typeof row[2] !== 'string') {
      throw new Error(`${tab} tab contains an invalid row.`);
    }
    const locale = row[0] as Language;
    const localeRows = result.get(locale) ?? new Map<string, unknown>();
    if (localeRows.has(row[1])) throw new Error(`${tab} contains duplicate id ${row[1]} for ${locale}.`);
    try { localeRows.set(row[1], JSON.parse(row[2])); }
    catch { throw new Error(`${tab} contains malformed JSON for ${row[1]}.`); }
    result.set(locale, localeRows);
  }
  return result;
}

export function deserializePortfolioSheets(rows: PortfolioSheetRows): PortfolioData {
  const parsed = Object.fromEntries(PORTFOLIO_TABS.map((tab) => [tab, parseRows(rows[tab], tab)])) as Record<PortfolioTab, Map<Language, Map<string, unknown>>>;
  const result = {} as PortfolioData;
  for (const tab of ['Profile', 'Copy', 'SEO'] as const) {
    if (!rows[tab] || rows[tab].length <= 1) throw new Error(`${tab} tab is empty. Run the one-time spreadsheet initialization.`);
  }
  for (const locale of SUPPORTED_LANGUAGES) {
    const profile = parsed.Profile.get(locale)?.get('profile');
    const copy = parsed.Copy.get(locale)?.get('copy');
    const seo = parsed.SEO.get(locale)?.get('seo');
    const readCollection = (tab: 'Experiences' | 'Certificates' | 'Projects' | 'Skills') => [...(parsed[tab].get(locale)?.entries() ?? [])].filter(([id]) => id !== '__empty__').map(([, item]) => item);
    const experiences = readCollection('Experiences');
    const certificates = readCollection('Certificates');
    const projects = readCollection('Projects');
    const skills = readCollection('Skills');
    if (!profile || !copy || !seo) {
      throw new Error(`Portfolio sheets are incomplete for locale ${locale}. Run the one-time spreadsheet initialization.`);
    }
    result[locale] = { profile, copy, experiences, certificates, projects, skills, seo } as PortfolioData[Language];
  }
  return result;
}
