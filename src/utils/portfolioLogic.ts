import { SUPPORTED_LANGUAGES } from '../data/portfolioData';
import type {
  ExperienceFilterKey,
  ExperienceItem,
  Language,
  LocalizedPortfolioData,
  ProjectFilterKey,
  ProjectItem,
  SkillFilterKey,
  SkillItem
} from '../data/portfolioData';

export type ThemeMode = 'light' | 'dark';

export function resolveInitialTheme(
  storedTheme: string | null | undefined,
  systemPrefersDark: boolean
): ThemeMode {
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  return systemPrefersDark ? 'dark' : 'light';
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

export function resolveInitialLanguage(
  storedLang: string | null | undefined
): Language {
  return SUPPORTED_LANGUAGES.find((language) => language === storedLang) ?? 'id';
}

export function toggleLanguage(current: Language): Language {
  const currentIndex = SUPPORTED_LANGUAGES.indexOf(current);
  return SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
}

export function filterProjects(
  projects: ProjectItem[],
  filterKey: ProjectFilterKey
): ProjectItem[] {
  if (filterKey === 'all') {
    return projects;
  }
  return projects.filter((project) => project.filterKey === filterKey);
}

export function filterExperiences(
  experiences: ExperienceItem[],
  filterKey: ExperienceFilterKey
): ExperienceItem[] {
  if (filterKey === 'all') {
    return experiences;
  }
  return experiences.filter((item) => item.filterKey === filterKey);
}

export function filterSkills(
  skills: SkillItem[],
  filterKey: SkillFilterKey
): SkillItem[] {
  if (filterKey === 'all') {
    return skills;
  }
  return skills.filter((skill) => skill.filterKey === filterKey);
}

export interface FloatingSkillIcon {
  id: string;
  name: string;
  filterKey: Exclude<SkillFilterKey, 'all'>;
  categoryLabel: string;
}

export interface SkillTransitionPlan {
  toHide: FloatingSkillIcon[];
  toReveal: FloatingSkillIcon[];
}

export function flattenSkillIcons(skills: SkillItem[]): FloatingSkillIcon[] {
  return skills.flatMap((skill) =>
    skill.techIcons.map((icon) => ({
      id: `${skill.id}-${icon}`,
      name: icon,
      filterKey: skill.filterKey,
      categoryLabel: skill.categoryLabel
    }))
  );
}

export function computeSkillTransition(
  allIcons: FloatingSkillIcon[],
  prevFilter: SkillFilterKey,
  nextFilter: SkillFilterKey
): SkillTransitionPlan {
  const prevVisible =
    prevFilter === 'all'
      ? allIcons
      : allIcons.filter((icon) => icon.filterKey === prevFilter);
  const nextVisible =
    nextFilter === 'all'
      ? allIcons
      : allIcons.filter((icon) => icon.filterKey === nextFilter);

  const nextIds = new Set(nextVisible.map((icon) => icon.id));
  const prevIds = new Set(prevVisible.map((icon) => icon.id));

  return {
    toHide: prevVisible.filter((icon) => !nextIds.has(icon.id)),
    toReveal: nextVisible.filter((icon) => !prevIds.has(icon.id))
  };
}

export interface ContactFormInput {
  name: string;
  email: string;
  purpose: string;
  subject: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(
  input: ContactFormInput,
  lang: Language = 'id'
): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};

  const validationCopy: Record<Language, { name: string; purpose: string; subject: string; email: string; invalidEmail: string; message: string }> = {
    id: { name: 'Mohon isi nama lengkap minimal 2 karakter.', purpose: 'Mohon pilih tujuan pesan.', subject: 'Mohon isi subjek pesan.', email: 'Mohon isi alamat email Anda.', invalidEmail: 'Format email tidak valid (contoh: nama@domain.com).', message: 'Mohon tulis pesan minimal 10 karakter agar jelas.' },
    en: { name: 'Please enter your full name (at least 2 characters).', purpose: 'Please select a message purpose.', subject: 'Please enter a subject.', email: 'Please enter your email address.', invalidEmail: 'Invalid email format (e.g. name@domain.com).', message: 'Please write a message of at least 10 characters.' },
    ja: { name: '氏名を2文字以上で入力してください。', purpose: 'お問い合わせ内容を選択してください。', subject: '件名を入力してください。', email: 'メールアドレスを入力してください。', invalidEmail: '有効なメールアドレスを入力してください。', message: 'メッセージを10文字以上で入力してください。' },
    ko: { name: '이름을 두 글자 이상 입력해 주세요.', purpose: '문의 목적을 선택해 주세요.', subject: '제목을 입력해 주세요.', email: '이메일을 입력해 주세요.', invalidEmail: '올바른 이메일 주소를 입력해 주세요.', message: '메시지를 10자 이상 입력해 주세요.' },
    'zh-CN': { name: '请输入至少两个字符的姓名。', purpose: '请选择联系事由。', subject: '请输入主题。', email: '请输入邮箱地址。', invalidEmail: '请输入有效的邮箱地址。', message: '留言至少需要10个字符。' }
  };
  const text = validationCopy[lang];

  if (!input.name.trim() || input.name.trim().length < 2) errors.name = text.name;
  if (!input.purpose.trim()) errors.purpose = text.purpose;
  if (!input.subject.trim()) errors.subject = text.subject;

  const trimmedEmail = input.email.trim();
  if (!trimmedEmail) errors.email = text.email;
  else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = text.invalidEmail;

  if (!input.message.trim() || input.message.trim().length < 10) errors.message = text.message;

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function buildCvDocument(
  data: LocalizedPortfolioData,
  lang: Language = 'id'
): string {
  const { profile, experiences, certificates, projects, skills } = data;
  const headingsByLanguage: Record<Language, { location: string; about: string; experience: string; certificates: string; projects: string; skills: string }> = {
    id: { location:'Lokasi', about:'=== TENTANG SAYA ===', experience:'=== PENGALAMAN PROFESIONAL & PENDIDIKAN ===', certificates:'=== SERTIFIKAT & PENCAPAIAN ===', projects:'=== PORTOFOLIO PROYEK ===', skills:'=== TECHNICAL STACK ===' },
    en: { location:'Location', about:'=== ABOUT ME ===', experience:'=== PROFESSIONAL EXPERIENCE & EDUCATION ===', certificates:'=== CERTIFICATES & ACHIEVEMENTS ===', projects:'=== PORTFOLIO PROJECTS ===', skills:'=== TECHNICAL STACK ===' },
    ja: { location:'所在地', about:'=== プロフィール ===', experience:'=== 職務経験・学歴 ===', certificates:'=== 資格・受賞歴 ===', projects:'=== プロジェクト ===', skills:'=== 技術スタック ===' },
    ko: { location:'위치', about:'=== 소개 ===', experience:'=== 경력 및 학력 ===', certificates:'=== 자격 및 수상 ===', projects:'=== 프로젝트 ===', skills:'=== 기술 스택 ===' },
    'zh-CN': { location:'所在地', about:'=== 个人简介 ===', experience:'=== 工作与教育经历 ===', certificates:'=== 证书与成就 ===', projects:'=== 项目作品 ===', skills:'=== 技术栈 ===' }
  };
  const headings = headingsByLanguage[lang];

  const lines: string[] = [
    `CURRICULUM VITAE — ${profile.name.toUpperCase()}`,
    `${profile.roles.join(' | ')}`,
    `${profile.degree} — ${profile.university}`,
    `${headings.location}: ${profile.location} | Email: ${profile.email}`,
    '',
    headings.about,
    ...profile.aboutParagraphs,
    '',
    headings.experience,
    ...experiences.flatMap((exp) => [
      `- ${exp.role} | ${exp.organization} (${exp.period})`,
      `  ${exp.summary}`,
      ...exp.responsibilities.map((item) => `  * ${item}`),
      ''
    ]),
    headings.certificates,
    ...certificates.map(
      (cert) => `- ${cert.title} (${cert.award}) — ${cert.issuer}`
    ),
    '',
    headings.projects,
    ...projects.flatMap((proj) => [
      `- ${proj.title} [${proj.statusLabel}, ${proj.year}]`,
      `  ${proj.summary}`,
      `  Tech Stack: ${proj.techStack.join(', ')}`,
      ''
    ]),
    headings.skills,
    ...skills.map(
      (skill) => `- ${skill.name} (${skill.categoryLabel}): ${skill.context}`
    )
  ];

  return lines.join('\n');
}

export function calculateScrollProgress(
  scrollY: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) {
    return 0;
  }
  const ratio = scrollY / maxScroll;
  return Math.min(1, Math.max(0, ratio));
}

export function hasScrolledPastHero(
  heroBottom: number,
  headerOffset = 68
): boolean {
  if (!Number.isFinite(heroBottom) || !Number.isFinite(headerOffset)) {
    return false;
  }
  return heroBottom <= headerOffset;
}

export function isPortfolioHomePath(pathname: string): boolean {
  const normalized = pathname.trim();
  return normalized === '/' || normalized === '/index.html';
}

export const DEFAULT_SOCIAL_IMAGE_PATH =
  '/src/assets/images/og_portfolio_card_1794958153903.jpg';

export interface SeoMetadata {
  title: string;
  description: string;
  siteName: string;
  canonicalUrl: string;
  imageUrl: string;
  imageAlt: string;
  locale: 'id_ID' | 'en_US' | 'ja_JP' | 'ko_KR' | 'zh_CN';
  robots: 'index, follow' | 'noindex, follow';
}

export function resolveSeoMetadata(options: {
  language: Language;
  pathname: string;
  origin?: string;
  isHome: boolean;
}): SeoMetadata {
  const { language, pathname, origin = '', isHome } = options;
  const cleanOrigin = origin.replace(/\/+$/, '');
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonicalUrl = cleanOrigin ? `${cleanOrigin}${cleanPath}` : cleanPath;
  const imageUrl = cleanOrigin
    ? `${cleanOrigin}${DEFAULT_SOCIAL_IMAGE_PATH}`
    : DEFAULT_SOCIAL_IMAGE_PATH;

  const localeByLanguage: Record<Language, SeoMetadata['locale']> = {
    id: 'id_ID', en: 'en_US', ja: 'ja_JP', ko: 'ko_KR', 'zh-CN': 'zh_CN'
  };
  const seoCopy: Record<Language, { title: string; description: string; imageAlt: string; notFound: string; notFoundDescription: string }> = {
    id: { title:'Adi Yoga — IT College, Web Developer & Musician', description:'Portofolio Adi Yoga — Mahasiswa Informatika INSTIKI, Web Developer, Cloud & Musician. Jelajahi proyek web, keahlian teknis, dan hubungi langsung.', imageAlt:'Ruang kerja pengembangan perangkat lunak dan portofolio web Adi Yoga', notFound:'404 — Halaman tidak ditemukan | Adi Yoga', notFoundDescription:'Halaman tidak ditemukan. Kembali ke beranda untuk melihat proyek dan profil.' },
    en: { title:'Adi Yoga — IT College, Web Developer & Musician', description:'Personal portfolio of Adi Yoga — Informatics student at INSTIKI, Web Developer, Cloud & Musician. Explore selected works, tech stack, and connect.', imageAlt:'Software development workspace and web portfolio showcase of Adi Yoga', notFound:'404 — Page Not Found | Adi Yoga', notFoundDescription:'Page not found. Return home to explore projects and profile.' },
    ja: { title:'Adi Yoga — Web開発・情報学・音楽', description:'Adi Yogaのポートフォリオ。Web開発、クラウド、情報学のプロジェクトと経験を紹介。', imageAlt:'Adi Yogaのソフトウェア開発環境とポートフォリオ', notFound:'404 — ページが見つかりません | Adi Yoga', notFoundDescription:'ページが見つかりません。ホームでプロジェクトをご覧ください。' },
    ko: { title:'Adi Yoga — 웹 개발·정보학·음악', description:'Adi Yoga 포트폴리오. 웹 개발, 클라우드, 정보학 프로젝트와 경험을 소개합니다.', imageAlt:'Adi Yoga의 소프트웨어 개발 작업 공간과 포트폴리오', notFound:'404 — 페이지를 찾을 수 없습니다 | Adi Yoga', notFoundDescription:'페이지를 찾을 수 없습니다. 홈에서 프로젝트를 확인해 주세요.' },
    'zh-CN': { title:'Adi Yoga — Web开发、信息学与音乐', description:'Adi Yoga个人作品集，展示Web开发、云计算与信息学项目和经历。', imageAlt:'Adi Yoga的软件开发工作区与个人作品集', notFound:'404 — 页面未找到 | Adi Yoga', notFoundDescription:'页面未找到。返回首页查看项目与个人简介。' }
  };
  const content = seoCopy[language];
  return {
    title: isHome ? content.title : content.notFound,
    description: isHome ? content.description : content.notFoundDescription,
    siteName: 'Adi Yoga',
    canonicalUrl,
    imageUrl,
    imageAlt: content.imageAlt,
    locale: localeByLanguage[language],
    robots: isHome ? 'index, follow' : 'noindex, follow'
  };
}

export const CAROUSEL_AUTOPLAY_MS = 4500;

export interface CarouselStepResult {
  nextElapsedMs: number;
  progress: number;
  nextIndex: number;
  didAdvance: boolean;
}

export function computeCarouselStep(options: {
  elapsedMs: number;
  deltaMs: number;
  durationMs?: number;
  currentIndex: number;
  totalSlides: number;
}): CarouselStepResult {
  const {
    elapsedMs,
    deltaMs,
    durationMs = CAROUSEL_AUTOPLAY_MS,
    currentIndex,
    totalSlides
  } = options;

  if (totalSlides <= 1 || durationMs <= 0) {
    return {
      nextElapsedMs: 0,
      progress: 0,
      nextIndex: 0,
      didAdvance: false
    };
  }

  const clampedDelta = Math.min(Math.max(0, deltaMs), 100);
  const rawElapsed = Math.max(0, elapsedMs) + clampedDelta;

  if (rawElapsed >= durationMs) {
    return {
      nextElapsedMs: 0,
      progress: 0,
      nextIndex: (currentIndex + 1) % totalSlides,
      didAdvance: true
    };
  }

  return {
    nextElapsedMs: rawElapsed,
    progress: rawElapsed / durationMs,
    nextIndex: currentIndex % totalSlides,
    didAdvance: false
  };
}
