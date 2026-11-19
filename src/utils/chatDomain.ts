import type { Language, LocalizedPortfolioData } from '../data/portfolioData.ts';

export type ChatRole = 'user' | 'assistant';

export type ChatSectionHref =
  | '#top'
  | '#about'
  | '#experience'
  | '#projects'
  | '#skills'
  | '#contact';

export const ALLOWED_CHAT_SECTIONS: readonly ChatSectionHref[] = [
  '#top',
  '#about',
  '#experience',
  '#projects',
  '#skills',
  '#contact'
];

export interface ChatHistoryTurn {
  role: ChatRole;
  content: string;
}

export interface ChatTopicEvaluation {
  allowed: boolean;
  reason: 'in-scope' | 'empty' | 'too-long' | 'prompt-injection' | 'off-topic';
  refusalMessage?: string;
  suggestedSection?: ChatSectionHref;
  followUpPrompts?: string[];
}

export const MAX_CHAT_MESSAGE_LENGTH = 600;

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|system|your)\s+(instructions?|prompts?|rules?|directives?)/i,
  /abaikan\s+(semua\s+)?(instruksi|aturan|perintah|prompt)/i,
  /lupakan\s+(semua\s+)?(instruksi|aturan|perintah)/i,
  /\b(system\s*prompt|developer\s*prompt|jailbreak|dan\s*mode|bypass\s*(filter|rules?|guardrails?)|reveal\s+(your\s+)?(instructions?|prompt))\b/i,
  /^(pretend\s+to\s+be|act\s+as|you\s+are\s+now|roleplay\s+as|berperan\s+sebagai|jadilah\s+sebagai)\b/i
];

const GREETING_PATTERN =
  /^(hi|hello|hey|halo|hai|pagi|siang|sore|malam|selamat\s+(pagi|siang|sore|malam)|permisi|tes|test|yo|apa\s+kabar|こんにちは|こんばんは|おはよう|안녕|안녕하세요|您好|你好)[\s!?.。！]*$/i;

const PORTFOLIO_SIGNAL_PATTERN = /\b(adi|yoga|komang|portfolio|portofolio|profile|profil|about|website|instiki|lks|mandha\s*ru|mandharu|evoting|github|react|typescript|tailwind|laravel|express|mysql|postgresql|aws|gcp|linkedin|instagram|proyek(?:-proyek)?|karya|pengalaman|keahlian|prestasi|pendidikan|kuliah|kontak)\b|ポートフォリオ|プロフィール|プロジェクト|経験|スキル|連絡|作品|技術|이력|포트폴리오|프로필|프로젝트|경력|기술|연락|작품|作品集|简介|项目|经历|技能|联系|作品|技术/i;

const EXPLICIT_OFF_TOPIC_PATTERNS: RegExp[] = [
  /\b(resep|masak|masakan|memasak|cooking|recipe|makanan|kalori)\b/i,
  /\b(cuaca|prakiraan|hujan|suhu\s+hari\s+ini|weather|forecast|temperature\s+today)\b/i,
  /\b(presiden|pemilu|partai|politik|politician|election|gubernur|menteri)\b/i,
  /\b(saham|bitcoin|crypto|kripto|forex|harga\s+emas|ihsg|stock\s+price)\b/i,
  /\b(skor\s+bola|pertandingan|piala\s+dunia|champions\s+league|nba|motogp|f1)\b/i,
  /\b(zodiak|ramalan|horoscope|tarot|mimpi)\b/i,
  /\b(puisi|pantun|cerpen|novel|dongeng|write\s+a\s+(poem|story|essay)|buatkan\s+(puisi|pantun|cerpen|esai|makalah))\b/i,
  /\b(buatkan|buatin|tulis|tuliskan|write|generate)\s+(kode|script|program|code|aplikasi|tutorial)\s+(?!portofolio|adi\s*yoga)/i,
  /\b(terjemahkan|translate)\s+(kalimat|teks|paragraf|artikel|kata)\b/i,
  /\b(fotosintesis|hukum\s+newton|tabel\s+periodik|perang\s+dunia|ibukota\s+negara|capital\s+of)\b/i,
  /\b(hitung|calculate|solve)\s+[\d+\-*/^()=\s]{3,}/i,
  /^\s*[\d+\-*/^().\s]{3,}\s*=?\s*\??\s*$/i
];

const CHAT_COPY: Record<Language, { empty: string; tooLong: string; injection: string; offTopic: string; injectionFollowUps: string[]; offTopicFollowUps: string[] }> = {
  id: { empty:'Silakan tulis pertanyaan seputar profil Adi Yoga atau portofolio ini.', tooLong:`Pesan melebihi ${MAX_CHAT_MESSAGE_LENGTH} karakter. Ringkas pertanyaan seputar portofolio.`, injection:'Saya hanya menjawab tentang portofolio Adi Yoga. Tanyakan profil, pengalaman, proyek, keahlian, atau kontak.', offTopic:'Saya hanya menjawab tentang Adi Yoga dan isi portofolio ini.', injectionFollowUps:['Siapa Adi Yoga?','Apa saja proyeknya?','Bagaimana cara menghubunginya?'], offTopicFollowUps:['Apa saja proyeknya?','Apa prestasi LKS-nya?','Apa tech stack-nya?'] },
  en: { empty:'Ask a question about Adi Yoga or this portfolio.', tooLong:`Your message exceeds ${MAX_CHAT_MESSAGE_LENGTH} characters. Keep it concise and portfolio-related.`, injection:'I can only answer about Adi Yoga’s portfolio. Ask about profile, experience, projects, skills, or contact.', offTopic:'I can only answer questions about Adi Yoga and this portfolio.', injectionFollowUps:['Who is Adi Yoga?','What projects has he built?','How can I contact him?'], offTopicFollowUps:['What projects are featured?','What are his LKS awards?','What is his tech stack?'] },
  ja: { empty:'Adi Yogaやこのポートフォリオについて質問してください。', tooLong:`メッセージが${MAX_CHAT_MESSAGE_LENGTH}文字を超えています。短く入力してください。`, injection:'このアシスタントはAdi Yogaのポートフォリオについてのみ回答します。プロフィール、経験、プロジェクト、スキル、連絡先について質問できます。', offTopic:'Adi Yogaとこのポートフォリオの内容についてのみ回答できます。', injectionFollowUps:['Adi Yogaとは？','どんなプロジェクトがありますか？','連絡方法は？'], offTopicFollowUps:['掲載プロジェクトは？','LKSの受賞歴は？','技術スタックは？'] },
  ko: { empty:'Adi Yoga 또는 이 포트폴리오에 대해 질문해 주세요.', tooLong:`메시지가 ${MAX_CHAT_MESSAGE_LENGTH}자를 넘었습니다. 짧게 입력해 주세요.`, injection:'이 도우미는 Adi Yoga 포트폴리오에 대해서만 답변합니다. 프로필, 경력, 프로젝트, 기술, 연락 방법을 질문해 주세요.', offTopic:'Adi Yoga와 이 포트폴리오 내용에 대해서만 답변할 수 있습니다.', injectionFollowUps:['Adi Yoga는 누구인가요?','어떤 프로젝트가 있나요?','어떻게 연락하나요?'], offTopicFollowUps:['어떤 프로젝트가 있나요?','LKS 수상 내역은?','기술 스택은 무엇인가요?'] },
  'zh-CN': { empty:'请询问Adi Yoga或本作品集相关内容。', tooLong:`消息超过${MAX_CHAT_MESSAGE_LENGTH}个字符，请简要提问。`, injection:'我仅回答Adi Yoga作品集相关问题。可询问简介、经历、项目、技能或联系方式。', offTopic:'我仅回答Adi Yoga及本作品集相关内容。', injectionFollowUps:['Adi Yoga是谁？','有哪些项目？','如何联系？'], offTopicFollowUps:['作品集有哪些项目？','LKS获奖情况如何？','使用哪些技术？'] }
};

function buildRefusal(
  reason: Exclude<ChatTopicEvaluation['reason'], 'in-scope'>,
  language: Language
): ChatTopicEvaluation {
  const text = CHAT_COPY[language];
  if (reason === 'empty' || reason === 'too-long') {
    return { allowed:false, reason, refusalMessage: reason === 'empty' ? text.empty : text.tooLong };
  }
  if (reason === 'prompt-injection') {
    return { allowed:false, reason, refusalMessage:text.injection, suggestedSection:'#about', followUpPrompts:text.injectionFollowUps };
  }
  return { allowed:false, reason:'off-topic', refusalMessage:text.offTopic, suggestedSection:'#projects', followUpPrompts:text.offTopicFollowUps };
}

export function evaluateChatTopicScope(
  message: string,
  language: Language = 'id'
): ChatTopicEvaluation {
  const trimmed = message.trim();
  if (!trimmed) {
    return buildRefusal('empty', language);
  }

  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return buildRefusal('too-long', language);
  }

  if (PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return buildRefusal('prompt-injection', language);
  }

  if (GREETING_PATTERN.test(trimmed)) {
    return { allowed: true, reason: 'in-scope' };
  }

  const hasExplicitOffTopic = EXPLICIT_OFF_TOPIC_PATTERNS.some((pattern) =>
    pattern.test(trimmed)
  );
  if (hasExplicitOffTopic) {
    return buildRefusal('off-topic', language);
  }

  const hasPortfolioSignal = PORTFOLIO_SIGNAL_PATTERN.test(trimmed);
  if (!hasPortfolioSignal && trimmed.split(/\s+/).length >= 3) {
    // Allow short open-ended conversational prompts to reach the model's context classifier,
    // while multi-word unrelated queries without any portfolio context are caught strictly.
    const genericConversation =
      /\b(bisa\s+apa|bantu\s+apa|info|ringkasan|summary|overview|help|what\s+can\s+you|menu|bagian|section)\b/i;
    if (!genericConversation.test(trimmed)) {
      return buildRefusal('off-topic', language);
    }
  }

  return { allowed: true, reason: 'in-scope' };
}

export function sanitizeSuggestedSection(
  href: string | null | undefined
): ChatSectionHref | '' {
  if (!href) return '';
  const trimmed = href.trim() as ChatSectionHref;
  return ALLOWED_CHAT_SECTIONS.includes(trimmed) ? trimmed : '';
}

export function buildPortfolioContextPrompt(
  allData: Record<Language, LocalizedPortfolioData>,
  language: Language = 'id'
): string {
  const data = allData[language];

  return JSON.stringify({
    site: {
      owner: data.profile.name,
      style: 'Apple Design Hierarchy (Light/Dark, multilingual UI, 404 route, interactive project modals, CV download)',
      sections: [
        '#top (Hero, roles, highlights, Download CV)',
        '#about (Profile, INSTIKI study, theater & music, principles)',
        '#experience (Work, education & LKS Cloud Computing honors)',
        '#projects (4 featured projects carousel & detail modal)',
        '#skills (Technical Stack: 22 technologies across 5 categories)',
        '#contact (Email, form & social links)'
      ]
    },
    profile: {
      name: data.profile.name,
      roles: data.profile.roles,
      degree: data.profile.degree,
      university: data.profile.university,
      location: data.profile.location,
      email: data.profile.email,
      summary: data.profile.heroSummary,
      about: data.profile.aboutParagraphs,
      highlights: data.profile.highlights,
      principles: data.profile.principles.map((p) => `${p.title}: ${p.description}`),
      socials: data.profile.socials.map((s) => `${s.platform}: ${s.url}`)
    },
    experiences: data.experiences.map((e) => ({
      type: e.filterKey,
      role: e.role,
      org: e.organization,
      period: e.period,
      location: e.location,
      summary: e.summary,
      details: e.responsibilities
    })),
    certificates: data.certificates.map((c) => `${c.title} — ${c.award} (${c.issuer}, ${c.scope})`),
    projects: data.projects.map((p) => ({
      title: p.title,
      category: p.categoryLabel,
      year: p.year,
      status: p.statusLabel,
      summary: p.summary,
      tech: p.techStack,
      highlights: p.highlights,
      demoUrl: p.demoUrl,
      githubAvailable: Boolean(p.githubUrl)
    })),
    skills: data.skills.map((s) => ({
      category: s.categoryLabel,
      name: s.name,
      tech: s.techIcons,
      context: s.context
    }))
  });
}
