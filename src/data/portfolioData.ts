export const SUPPORTED_LANGUAGES = ['id', 'en', 'ja', 'ko', 'zh-CN'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  id: 'ID',
  en: 'EN',
  ja: '日本語',
  ko: '한국어',
  'zh-CN': '简体中文'
};

export type ExperienceFilterKey = 'all' | 'work' | 'education';
export type ProjectFilterKey = 'all' | 'frontend' | 'fullstack';
export type SkillFilterKey =
  | 'all'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cloud'
  | 'tools';

export interface ProfileData {
  name: string;
  shortName: string;
  university: string;
  degree: string;
  location: string;
  email: string;
  roles: string[];
  heroSummary: string;
  aboutParagraphs: string[];
  highlights: Array<{
    value: string;
    label: string;
    detail: string;
  }>;
  principles: Array<{
    index: string;
    title: string;
    description: string;
  }>;
  socials: Array<{
    platform: 'LinkedIn' | 'GitHub' | 'Instagram';
    url: string;
    handle: string;
  }>;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  filterKey: Exclude<ExperienceFilterKey, 'all'>;
  categoryLabel: string;
  period: string;
  location: string;
  summary: string;
  responsibilities: string[];
}

export interface CertificateItem {
  id: string;
  title: string;
  award: string;
  issuer: string;
  scope: string;
}

export type ProjectActionState =
  | 'live'
  | 'discontinued'
  | 'deprecated'
  | 'archived'
  | 'this-website';

export interface ProjectItem {
  id: string;
  title: string;
  filterKey: Exclude<ProjectFilterKey, 'all'>;
  categoryLabel: string;
  statusLabel: string;
  actionState: ProjectActionState;
  actionLabel: string;
  year: string;
  summary: string;
  description: string;
  thumbnail: string;
  thumbnailAlt: string;
  /** When false, the thumbnail image is hidden in the project carousel card. */
  showThumbnail: boolean;
  techStack: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  displayUrl: string;
  highlights: string[];
  architectureNote: string;
}

export interface SkillItem {
  id: string;
  name: string;
  filterKey: Exclude<SkillFilterKey, 'all'>;
  categoryLabel: string;
  level: number;
  context: string;
  techIcons: string[];
}

export interface PortfolioCopy {
  nav: {
    ariaMain: string;
    ariaMobile: string;
    openMenu: string;
    closeMenu: string;
    enableDark: string;
    enableLight: string;
    switchLangLabel: string;
    links: Array<{ label: string; href: string }>;
  };
  hero: {
    rolesAria: string;
    viewProjects: string;
    downloadCv: string;
    cvDownloaded: string;
    portraitAlt: string;
  };
  about: {
    kicker: string;
    heading: string;
  };
  experience: {
    kicker: string;
    heading: string;
    filterAria: string;
    filters: Array<{ key: ExperienceFilterKey; label: string }>;
    marqueeAria: string;
    certificatesKicker: string;
    certificatesHeading: string;
  };
  projects: {
    kicker: string;
    heading: string;
    filterAria: string;
    filters: Array<{ key: ProjectFilterKey; label: string }>;
    techStackAria: string;
    openDetailPrefix: string;
    githubButton: string;
    demoButton: string;
    githubAriaPrefix: string;
    demoAriaPrefix: string;
    prevSlide: string;
    nextSlide: string;
    pauseAuto: string;
    playAuto: string;
    slideDotsAria: string;
    goToSlidePrefix: string;
  };
  modal: {
    closePrefix: string;
    tabsAria: string;
    previewTab: string;
    codeTab: string;
    highlightsHeading: string;
    architectureHeading: string;
    techStackHeading: string;
    repoLabel: string;
    githubUnavailable: string;
    liveUrlLabel: string;
    openLiveSite: string;
    copyUrl: string;
    copied: string;
    openGithub: string;
  };
  skills: {
    kicker: string;
    heading: string;
    filterAria: string;
    filters: Array<{ key: SkillFilterKey; label: string }>;
    floatingAria: string;
    hiddenDockLabel: string;
    hiddenDockAria: string;
    restoreAllLabel: string;
  };
  contact: {
    kicker: string;
    heading: string;
    closing: string;
    directEmail: string;
    socialHeading: string;
    visitSocialPrefix: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    purposeLabel: string;
    purposePlaceholder: string;
    purposeOptions: Array<{ value: string; label: string }>;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    successTitle: string;
    successBodyLead: string;
    successBodyMid: string;
    successBodyEnd: string;
    sendAnother: string;
    sendingButton: string;
    submitError: string;
    rateLimitError: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    pathLabel: string;
    backHomeButton: string;
    viewProjectsButton: string;
  };
  scrollToTop: {
    ariaLabel: string;
    title: string;
  };
  chatbot: {
    openLabel: string;
    closeLabel: string;
    title: string;
    subtitle: string;
    resetLabel: string;
    placeholder: string;
    sendLabel: string;
    thinkingLabel: string;
    outOfScopeBadge: string;
    welcomeMessage: string;
    starterQuestions: string[];
    sectionLabels: Record<
      '#top' | '#about' | '#experience' | '#projects' | '#skills' | '#contact',
      string
    >;
    errorFallback: string;
    retryLabel: string;
  };
}

export interface LocalizedPortfolioData {
  profile: ProfileData;
  experiences: ExperienceItem[];
  certificates: CertificateItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  copy: PortfolioCopy;
}

const SOCIALS: ProfileData['socials'] = [
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/adiyoga-dev',
    handle: 'linkedin.com/in/adiyoga-dev'
  },
  {
    platform: 'GitHub',
    url: 'https://github.com/adiyoga-dev',
    handle: 'github.com/adiyoga-dev'
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/adiyoga.dev',
    handle: '@adiyoga.dev'
  }
];

type BaseLanguage = 'id' | 'en';

const BASE_PORTFOLIO_DATA: Record<BaseLanguage, LocalizedPortfolioData> = {
  id: {
    profile: {
      name: 'Adi Yoga',
      shortName: 'YVN',
      university: 'INSTIKI (Institut Bisnis dan Teknologi Indonesia)',
      degree: 'S1 Informatika (Artificial Intelligence)',
      location: 'Denpasar, Bali',
      email: 'kay.komangyoga@gmail.com',
      roles: ['IT College', 'Web Developer', 'Musician'],
      heroSummary:
        'Mahasiswa S1 Informatika di INSTIKI Denpasar. Membangun aplikasi web dan infrastruktur jaringan, serta berkarya di teater dan musik.',
      aboutParagraphs: [
        'Menempuh S1 Informatika di INSTIKI (Institut Bisnis dan Teknologi Indonesia) dengan fokus IT, web development, dan pengolahan data. Aktif di Teater INSTIKI, memproduksi remake lagu, serta memainkan piano, bass, gitar, dan sedang belajar drum.',
        'Tertarik pada titik temu teknologi, kreativitas, dan preferensi personal untuk merancang sistem digital yang andal, cepat, dan nyaman digunakan.'
      ],
      highlights: [
        {
          value: 'INSTIKI',
          label: 'Informatika (AI)',
          detail: '2025 — Sekarang'
        },
        {
          value: 'LKS #7',
          label: 'Nasional Cloud Computing',
          detail: 'Medal of Excellence'
        },
        {
          value: '2× Juara 1',
          label: 'LKS Bali & Denpasar',
          detail: 'Cloud Computing'
        },
        {
          value: 'Full-Stack',
          label: 'Web, Cloud & Jaringan',
          detail: 'React, Laravel & AWS'
        }
      ],
      principles: [
        {
          index: '01',
          title: 'Arsitektur Andal',
          description:
            'Front-end, back-end, dan basis data tersusun rapi agar cepat dan mudah dirawat.'
        },
        {
          index: '02',
          title: 'Antarmuka Intuitif',
          description:
            'Tipografi jernih dan interaksi responsif agar langsung nyaman digunakan.'
        },
        {
          index: '03',
          title: 'Lintas Disiplin',
          description:
            'Menyatukan presisi rekayasa perangkat lunak dengan ekspresi Teater INSTIKI dan musik.'
        }
      ],
      socials: SOCIALS
    },
    experiences: [
      {
        id: 'buna-coffee-barista',
        role: 'Barista',
        organization: 'Buna Coffee',
        filterKey: 'work',
        categoryLabel: 'Pengalaman',
        period: '2026 — Sekarang',
        location: 'Bali',
        summary:
          'Meracik sajian kopi spesialti dengan konsistensi rasa dan alur layanan yang sigap.',
        responsibilities: [
          'Kalibrasi espresso dan menjaga kualitas minuman sesuai standar kedai.',
          'Pelayanan pelanggan serta manajemen bar yang teratur saat jam ramai.'
        ]
      },
      {
        id: 'freelance-web-dev',
        role: 'Freelance Web Developer',
        organization: 'Self-employed',
        filterKey: 'work',
        categoryLabel: 'Pengalaman',
        period: '2025 — Sekarang',
        location: 'Denpasar, Bali',
        summary:
          'Membangun landing page, profil bisnis, dan situs web kustom.',
        responsibilities: [
          'Antarmuka responsif React dan Tailwind CSS yang ringan di mobile maupun desktop.',
          'Optimasi performa halaman dan deployment langsung ke Vercel.'
        ]
      },
      {
        id: 'blip-it-intern',
        role: 'IT Support Intern',
        organization: 'PT BLiP Integrator Provider',
        filterKey: 'work',
        categoryLabel: 'Pengalaman',
        period: '2023',
        location: 'Bali',
        summary:
          'Instalasi jaringan fiber rumah, villa, dan hotel dengan konfigurasi MikroTik.',
        responsibilities: [
          'Pemasangan jalur fiber optik dan setup router MikroTik sesuai kebutuhan klien.',
          'Optimasi konfigurasi bandwidth, routing, dan maintenance jaringan berkala.'
        ]
      },
      {
        id: 'edu-instiki',
        role: 'S1 Informatika (Artificial Intelligence)',
        organization: 'INSTIKI (Institut Bisnis dan Teknologi Indonesia)',
        filterKey: 'education',
        categoryLabel: 'Pendidikan',
        period: '2025 — Sekarang',
        location: 'Denpasar, Bali',
        summary:
          'Fokus kecerdasan buatan, pengembangan web, pengolahan data, serta Teater INSTIKI.',
        responsibilities: [
          'Mendalami algoritma, rekayasa perangkat lunak, data processing, dan AI.',
          'Mengeksplorasi pengembangan web modern, cloud, dan basis data.'
        ]
      },
      {
        id: 'edu-smkn1',
        role: 'Teknik Komputer dan Jaringan',
        organization: 'SMK Negeri 1 Denpasar',
        filterKey: 'education',
        categoryLabel: 'Pendidikan',
        period: '2022 — 2025',
        location: 'Denpasar, Bali (AVG: 82.5 / 100)',
        summary:
          'Lulus dengan nilai rata-rata 82.5 / 100 dan prestasi LKS Cloud Computing nasional.',
        responsibilities: [
          'Administrasi jaringan, server, MikroTik, dan komputasi awan AWS/GCP.',
          'Kolaborasi membangun eVoting SKENSA 2024 berbasis React, Laravel, dan MySQL.'
        ]
      }
    ],
    certificates: [
      {
        id: 'lks-nasional',
        title: 'LKS Nasional Cloud Computing',
        award: 'Medal of Excellence #7',
        issuer: 'Pusat Prestasi Nasional',
        scope: 'Tingkat Nasional'
      },
      {
        id: 'lks-provinsi',
        title: 'LKS Provinsi Bali Cloud Computing',
        award: 'Winner (Juara 1)',
        issuer: 'Pusat Prestasi Nasional',
        scope: 'Provinsi Bali'
      },
      {
        id: 'lks-kota',
        title: 'LKS Kota Denpasar Cloud Computing',
        award: 'Winner (Juara 1)',
        issuer: 'Pusat Prestasi Nasional',
        scope: 'Kota Denpasar'
      }
    ],
    projects: [
      {
        id: 'mandharu-profile',
        title: 'Mandha Ru Profile',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        statusLabel: 'Live · mandharu.yvn.web.id',
        actionState: 'live',
        actionLabel: 'Lihat Demo',
        year: '2025',
        summary:
          'Web profile kedai kopi yang menyajikan informasi mengenai profil kedai, daftar menu lengkap, serta informasi layanan lainnya.',
        description:
          'Situs profil digital untuk kedai kopi Mandha Ru yang dirancang agar pengunjung dapat menelusuri identitas kedai, melihat katalog menu minuman dan makanan, serta mengakses informasi lokasi dan jam operasional dengan cepat di perangkat mobile maupun desktop.',
        thumbnail: '/src/assets/images/project_mandharu_profile_1794938309357.png',
        thumbnailAlt:
          'Tampilan web profile kedai kopi Mandha Ru Profile pada layar laptop',
        showThumbnail: true,
        techStack: ['React', 'Tailwind CSS', 'Vercel'],
        githubUrl: null,
        demoUrl: 'https://mandharu.yvn.web.id',
        displayUrl: 'mandharu.yvn.web.id',
        highlights: [
          'Penyajian menu kedai kopi dan informasi profil yang ringkas serta mudah dibaca di layar seluler.',
          'Tata letak responsif dan ringan menggunakan komponen modular React dan utilitas Tailwind CSS.',
          'Terpasang langsung (live deployment) di Vercel untuk akses cepat pelanggan.'
        ],
        architectureNote:
          'Dibangun sebagai Single Page Application ringan dengan React dan Tailwind CSS, memisahkan data katalog menu dari komponen tampilan agar pembaruan menu berjalan cepat.'
      },
      {
        id: 'mandharu-order',
        title: 'Mandha Ru Coffee Shop Order',
        filterKey: 'fullstack',
        categoryLabel: 'Full-Stack',
        statusLabel: 'Tidak dilanjutkan',
        actionState: 'discontinued',
        actionLabel: 'Tidak dilanjutkan',
        year: '2025',
        summary:
          'Web order menu kedai kopi langsung dari meja lalu konfirmasi ke kasir untuk menghindari penumpukan antrean.',
        description:
          'Aplikasi pemesanan berbasis web yang dirancang khusus untuk alur pemesanan meja di kedai kopi: pelanggan memilih menu langsung dari meja, sistem menghasilkan rincian pesanan, lalu diteruskan untuk konfirmasi kasir sehingga antrean fisik tetap lancar.',
        thumbnail: '/src/assets/images/project_mandharu_order_1794938307873.jpg',
        thumbnailAlt:
          'Antarmuka sistem pemesanan meja kedai kopi Mandha Ru Coffee Shop Order pada tablet dan ponsel',
        showThumbnail: false,
        techStack: ['React', 'Laravel', 'Tailwind CSS', 'MySQL'],
        githubUrl: null,
        demoUrl: null,
        displayUrl: 'Missing',
        highlights: [
          'Alur pemesanan langsung dari nomor meja untuk memangkas waktu tunggu di depan kasir.',
          'Integrasi API Laravel dan basis data MySQL untuk mencatat keranjang pesanan dan status konfirmasi.',
          'Antarmuka kasir dan pelanggan yang bersih menggunakan React dan Tailwind CSS.'
        ],
        architectureNote:
          'Menggunakan REST API Laravel yang terhubung ke MySQL untuk mengelola transaksi pesanan meja, status antrean kasir, serta sinkronisasi stok menu.'
      },
      {
        id: 'evoting-skensa-2024',
        title: 'eVoting SKENSA 2024',
        filterKey: 'fullstack',
        categoryLabel: 'Full-Stack',
        statusLabel: 'Arsip',
        actionState: 'archived',
        actionLabel: 'Arsip',
        year: '2024',
        summary:
          'Web kolaborasi bersama rekan sekolah untuk pelaksanaan voting ketua OSIS di SMK Negeri 1 Denpasar.',
        description:
          'Platform pemungutan suara digital yang dikembangkan bersama tim siswa SMK Negeri 1 Denpasar guna memfasilitasi pemilihan ketua OSIS 2024 secara tertib, akurat, dan terdokumentasi.',
        thumbnail: '/src/assets/images/project_evoting_skensa_1794938309303.JPG',
        thumbnailAlt:
          'Tampilan antarmuka pemilihan digital eVoting SKENSA 2024 pada laptop',
        showThumbnail: true,
        techStack: ['React', 'Laravel', 'Tailwind CSS', 'MySQL'],
        githubUrl: null,
        demoUrl: null,
        displayUrl: 'Deprecated',
        highlights: [
          'Verifikasi pemilih satu-suara per akun untuk menjaga keabsahan hasil pemilihan ketua OSIS.',
          'Rekapitulasi suara tersimpan terstruktur di MySQL dengan validasi sisi server melalui Laravel.',
          'Antarmuka pemilihan kandidat yang mudah dipahami oleh seluruh siswa di sekolah.'
        ],
        architectureNote:
          'Backend Laravel memberlakukan transaksi atomik pada tabel suara MySQL agar satu akun pemilih hanya dapat mengirimkan satu suara sah tanpa duplikasi.'
      },
      {
        id: 'web-profile-pribadi',
        title: 'Web Profile Pribadi',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        statusLabel: 'Aktif · #',
        actionState: 'this-website',
        actionLabel: 'Website ini',
        year: '2026',
        summary:
          'Web portofolio pribadi untuk menampilkan profil, pengalaman profesional, pendidikan, sertifikat, dan proyek dalam format modern.',
        description:
          'Aplikasi web portofolio pribadi dengan standar Apple Design Hierarchy, mendukung Light & Dark Mode, pengalih bahasa ID/EN, bilah progres gulir, serta animasi kemunculan bertahap.',
        thumbnail:
          '/src/assets/images/project_personal_portfolio_v2_1794938327594.png',
        thumbnailAlt:
          'Tampilan Web Profile Pribadi Adi Yoga pada layar laptop',
        showThumbnail: true,
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Motion'],
        githubUrl: null,
        demoUrl: '#top',
        displayUrl: '#',
        highlights: [
          'Mendukung tema terang dan gelap serta pengalih bahasa Indonesia dan Inggris secara instan.',
          'Bilah progres gulir dan animasi scroll reveal berbasis GPU yang patuh pada reduced motion.',
          'Logika pemfilteran, validasi kontak, dan pembuatan CV teruji dengan unit test otomatis.'
        ],
        architectureNote:
          'Memisahkan data dwibahasa dan fungsi logika murni dari komponen tampilan React agar seluruh interaksi dapat diuji deterministik.'
      }
    ],
    skills: [
      {
        id: 'react',
        name: 'React & TypeScript',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 90,
        context: 'Komponen antarmuka modular, SPA responsif & type-safety',
        techIcons: ['React', 'TypeScript']
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 92,
        context: 'Desain mobile-first, Light/Dark mode & sistem tata letak presisi',
        techIcons: ['Tailwind CSS']
      },
      {
        id: 'heroui',
        name: 'HeroUI (formerly NextUI)',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 82,
        context: 'Komponen antarmuka React yang siap pakai dan konsisten',
        techIcons: ['HeroUI (formerly NextUI)']
      },
      {
        id: 'bootstrap',
        name: 'Bootstrap',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 82,
        context: 'Sistem grid responsif dan komponen UI siap pakai',
        techIcons: ['Bootstrap']
      },
      {
        id: 'laravel',
        name: 'Laravel',
        filterKey: 'backend',
        categoryLabel: 'Back End',
        level: 85,
        context: 'REST API, autentikasi, validasi request & transaksi basis data',
        techIcons: ['Laravel']
      },
      {
        id: 'express',
        name: 'Express.js',
        filterKey: 'backend',
        categoryLabel: 'Back End',
        level: 80,
        context: 'Layanan backend Node.js ringan, routing & middleware API',
        techIcons: ['Express.js']
      },
      {
        id: 'discordjs',
        name: 'discord.js',
        filterKey: 'backend',
        categoryLabel: 'Back End',
        level: 78,
        context: 'Pustaka Node.js untuk bot dan integrasi Discord',
        techIcons: ['discord.js']
      },
      {
        id: 'mysql-postgres',
        name: 'MySQL & PostgreSQL',
        filterKey: 'database',
        categoryLabel: 'Database',
        level: 86,
        context: 'Perancangan skema relasional, kueri terstruktur & integritas data',
        techIcons: ['MySQL', 'PostgreSQL']
      },
      {
        id: 'supabase',
        name: 'Supabase',
        filterKey: 'database',
        categoryLabel: 'Database',
        level: 82,
        context: 'Database terkelola dan sinkronisasi data',
        techIcons: ['Supabase']
      },
      {
        id: 'firebase',
        name: 'Firebase',
        filterKey: 'database',
        categoryLabel: 'Database',
        level: 80,
        context: 'Platform database, autentikasi dan sinkronisasi data',
        techIcons: ['Firebase']
      },
      {
        id: 'cloud-platforms',
        name: 'AWS & GCP',
        filterKey: 'cloud',
        categoryLabel: 'Cloud & DevOps',
        level: 88,
        context: 'Infrastruktur cloud dan layanan komputasi',
        techIcons: ['AWS', 'GCP']
      },
      {
        id: 'tools-stack',
        name: 'Git/GitHub, Figma, Google Stitch, VS Code & Vercel',
        filterKey: 'tools',
        categoryLabel: 'Tools',
        level: 90,
        context: 'Kolaborasi kode, desain UI, ideasi antarmuka & deployment web',
        techIcons: ['GitHub', 'Figma', 'Google Stitch', 'VS Code', 'Vercel']
      },
      {
        id: 'ai-developer-tools',
        name: 'OmniRoute, Claude Code CLI & Google Colab',
        filterKey: 'tools',
        categoryLabel: 'Tools',
        level: 84,
        context: 'Routing model AI, coding agent di terminal, dan notebook cloud',
        techIcons: ['OmniRoute', 'Claude Code CLI', 'Google Colab']
      }
    ],
    copy: {
      nav: {
        ariaMain: 'Navigasi utama',
        ariaMobile: 'Navigasi seluler',
        openMenu: 'Buka menu navigasi',
        closeMenu: 'Tutup menu navigasi',
        enableDark: 'Aktifkan mode gelap',
        enableLight: 'Aktifkan mode terang',
        switchLangLabel: 'Ganti bahasa ke English',
        links: [
          { label: 'About', href: '#about' },
          { label: 'Experience', href: '#experience' },
          { label: 'Projects', href: '#projects' },
          { label: 'Skills', href: '#skills' },
          { label: 'Contact', href: '#contact' }
        ]
      },
      hero: {
        rolesAria: 'Peran utama',
        viewProjects: 'Lihat Proyek Saya',
        downloadCv: 'Download CV',
        cvDownloaded: 'CV Terunduh',
        portraitAlt: 'Adi Yoga bekerja di meja pengembangan perangkat lunak'
      },
      about: {
        kicker: 'Tentang Saya',
        heading: 'Teknologi, kreativitas teater, dan harmoni musik.'
      },
      experience: {
        kicker: 'Pengalaman & Pendidikan',
        heading: 'Rekam jejak profesional, pendidikan & prestasi Cloud.',
        filterAria: 'Filter pengalaman dan pendidikan',
        filters: [
          { key: 'all', label: 'Semua' },
          { key: 'work', label: 'Pengalaman' },
          { key: 'education', label: 'Pendidikan' }
        ],
        marqueeAria: 'Linimasa pengalaman dan pendidikan bergerak horizontal',
        certificatesKicker: 'Sertifikat & Pencapaian',
        certificatesHeading: 'Diterbitkan oleh Pusat Prestasi Nasional'
      },
      projects: {
        kicker: 'Portofolio',
        heading: 'Karya pilihan.',
        filterAria: 'Filter kategori proyek',
        filters: [
          { key: 'all', label: 'Semua' },
          { key: 'frontend', label: 'Front End' },
          { key: 'fullstack', label: 'Full-Stack' }
        ],
        techStackAria: 'Tech stack yang digunakan',
        openDetailPrefix: 'Buka detail proyek',
        githubButton: 'GitHub',
        demoButton: 'Demo',
        githubAriaPrefix: 'Lihat GitHub dan arsitektur',
        demoAriaPrefix: 'Lihat demo dan ringkasan',
        prevSlide: 'Proyek sebelumnya',
        nextSlide: 'Proyek berikutnya',
        pauseAuto: 'Jeda putar otomatis',
        playAuto: 'Putar otomatis',
        slideDotsAria: 'Navigasi slide portofolio',
        goToSlidePrefix: 'Tampilkan proyek'
      },
      modal: {
        closePrefix: 'Tutup detail',
        tabsAria: 'Mode tampilan proyek',
        previewTab: 'Ringkasan & Demo',
        codeTab: 'Arsitektur & Tech Stack',
        highlightsHeading: 'Fitur Utama',
        architectureHeading: 'Catatan Arsitektur',
        techStackHeading: 'Tech Stack',
        repoLabel: 'Status Repositori',
        githubUnavailable:
          'Repositori GitHub belum tersedia untuk diakses publik saat ini.',
        liveUrlLabel: 'Tautan Proyek',
        openLiveSite: 'Buka Situs',
        copyUrl: 'Salin URL',
        copied: 'Tersalin',
        openGithub: 'Buka GitHub'
      },
      skills: {
        kicker: 'Technical Stack',
        heading: 'Teknologi & tools yang saya gunakan.',
        filterAria: 'Filter kategori keahlian',
        filters: [
          { key: 'all', label: 'Semua' },
          { key: 'frontend', label: 'Front End' },
          { key: 'backend', label: 'Back End' },
          { key: 'database', label: 'Database' },
          { key: 'cloud', label: 'Cloud & DevOps' },
          { key: 'tools', label: 'Tools' }
        ],
        floatingAria: 'Ikon teknologi yang dikuasai',
        hiddenDockLabel: 'Disembunyikan',
        hiddenDockAria: 'Stack teknologi lain yang disembunyikan, klik untuk menampilkan semua',
        restoreAllLabel: 'Tampilkan semua'
      },
      contact: {
        kicker: 'Kontak',
        heading: 'Mari terhubung.',
        closing:
          'Terbuka untuk diskusi proyek web, infrastruktur jaringan/cloud, maupun kolaborasi musik.',
        directEmail: 'Email langsung:',
        socialHeading: 'Terhubung melalui kanal sosial',
        visitSocialPrefix: 'Kunjungi profil',
        nameLabel: 'Nama',
        namePlaceholder: 'Nama lengkap Anda',
        emailLabel: 'Email',
        emailPlaceholder: 'nama@email.com',
        purposeLabel: 'Tujuan Pesan',
        purposePlaceholder: 'Pilih tujuan pesan',
        purposeOptions: [
          { value: 'employment', label: 'Peluang kerja' },
          { value: 'freelance', label: 'Proyek freelance' },
          { value: 'collaboration', label: 'Kolaborasi' },
          { value: 'general', label: 'Pertanyaan umum' },
          { value: 'other', label: 'Lainnya' }
        ],
        subjectLabel: 'Subjek',
        subjectPlaceholder: 'Tuliskan subjek pesan',
        messageLabel: 'Pesan',
        messagePlaceholder:
          'Ceritakan ide proyek, peluang kerja sama, atau pertanyaan Anda...',
        submitButton: 'Kirim Pesan',
        successTitle: 'Pesan Anda berhasil dikirim',
        successBodyLead: 'Terima kasih,',
        successBodyMid: 'Pesan dari',
        successBodyEnd: 'telah tercatat dan akan segera saya balas.',
        sendAnother: 'Kirim Pesan Lain',
        sendingButton: 'Mengirim...',
        submitError: 'Pesan gagal dikirim. Silakan coba lagi atau hubungi saya melalui email langsung.',
        rateLimitError: 'Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.'
      },
      notFound: {
        eyebrow: 'Error 404',
        title: 'Halaman yang Anda cari tidak ditemukan.',
        description:
          'Tautan mungkin telah berpindah, dihapus, atau alamat URL yang dimasukkan tidak tersedia.',
        pathLabel: 'Alamat diminta',
        backHomeButton: 'Kembali ke Beranda',
        viewProjectsButton: 'Lihat Proyek'
      },
      scrollToTop: {
        ariaLabel: 'Kembali ke atas halaman',
        title: 'Kembali ke atas'
      },
      chatbot: {
        openLabel: 'Asisten',
        closeLabel: 'Tutup asisten portofolio',
        title: 'Asisten Adi Yoga',
        subtitle: 'BETA',
        resetLabel: 'Mulai ulang percakapan',
        placeholder: 'Tanya seputar profil, proyek, atau kontak...',
        sendLabel: 'Kirim pesan ke asisten',
        thinkingLabel: 'Asisten sedang mengetik...',
        outOfScopeBadge: 'Di luar konteks website',
        welcomeMessage:
          'Halo! Saya asisten khusus portofolio Adi Yoga. Tanyakan seputar latar belakang INSTIKI, pengalaman & pendidikan, prestasi LKS Cloud Computing, proyek, technical stack, atau cara menghubungi Adi. Pertanyaan di luar isi website ini akan diblokir.',
        starterQuestions: [
          'Apa pengalaman Adi Yoga?',
          'Tampilkan keahlian Adi',
          'Apa saja proyek di portofolio ini?',
          'Bagaimana cara menghubungi Adi Yoga?'
        ],
        sectionLabels: {
          '#top': 'Lihat Ringkasan Utama',
          '#about': 'Buka Bagian Tentang Saya',
          '#experience': 'Buka Pengalaman & Pendidikan',
          '#projects': 'Buka Portofolio Proyek',
          '#skills': 'Buka Technical Stack',
          '#contact': 'Buka Kontak & Email'
        },
        errorFallback:
          'Gagal menghubungi layanan asisten saat ini. Silakan coba beberapa saat lagi.',
        retryLabel: 'Coba lagi'
      }
    }
  },
  en: {
    profile: {
      name: 'Adi Yoga',
      shortName: 'YVN',
      university: 'INSTIKI (Institut Bisnis dan Teknologi Indonesia)',
      degree: 'B.Sc. in Informatics (Artificial Intelligence)',
      location: 'Denpasar, Bali',
      email: 'kay.komangyoga@gmail.com',
      roles: ['IT College', 'Web Developer', 'Musician'],
      heroSummary:
        'Informatics student at INSTIKI Denpasar. Building modern web apps and network infrastructure alongside theater and music.',
      aboutParagraphs: [
        'Pursuing a Bachelor of Informatics at INSTIKI (Institut Bisnis dan Teknologi Indonesia), focused on IT, web development, and data processing. Active in Teater INSTIKI, producing song remakes, and playing piano, bass, guitar, while learning drums.',
        'Focused on the intersection of technology, creativity, and personal craft—building digital systems that are reliable, fast, and effortless to use.'
      ],
      highlights: [
        {
          value: 'INSTIKI',
          label: 'Informatics (AI)',
          detail: '2025 — Present'
        },
        {
          value: 'LKS #7',
          label: 'National Cloud Computing',
          detail: 'Medal of Excellence'
        },
        {
          value: '2× Winner',
          label: 'Bali & Denpasar LKS',
          detail: 'Cloud Computing'
        },
        {
          value: 'Full-Stack',
          label: 'Web, Cloud & Network',
          detail: 'React, Laravel & AWS'
        }
      ],
      principles: [
        {
          index: '01',
          title: 'Reliable Architecture',
          description:
            'Clean front-end, back-end, and database structure built for speed and clarity.'
        },
        {
          index: '02',
          title: 'Intuitive UI',
          description:
            'Crisp typography and responsive motion so every interaction feels natural.'
        },
        {
          index: '03',
          title: 'Creative Craft',
          description:
            'Blending software precision with artistic expression from Teater INSTIKI and music.'
        }
      ],
      socials: SOCIALS
    },
    experiences: [
      {
        id: 'buna-coffee-barista',
        role: 'Barista',
        organization: 'Buna Coffee',
        filterKey: 'work',
        categoryLabel: 'Experience',
        period: '2026 — Present',
        location: 'Bali',
        summary:
          'Crafting specialty coffee with consistent taste and attentive service.',
        responsibilities: [
          'Dialed in espresso extraction and upheld drink standards across shifts.',
          'Delivered warm hospitality and smooth bar workflow during peak hours.'
        ]
      },
      {
        id: 'freelance-web-dev',
        role: 'Freelance Web Developer',
        organization: 'Self-employed',
        filterKey: 'work',
        categoryLabel: 'Experience',
        period: '2025 — Present',
        location: 'Denpasar, Bali',
        summary:
          'Building landing pages, cafe profiles, and custom web applications.',
        responsibilities: [
          'Engineered fast, mobile-first interfaces with React and Tailwind CSS.',
          'Optimized loading performance and shipped production builds to Vercel.'
        ]
      },
      {
        id: 'blip-it-intern',
        role: 'IT Support Intern',
        organization: 'PT BLiP Integrator Provider',
        filterKey: 'work',
        categoryLabel: 'Experience',
        period: '2023',
        location: 'Bali',
        summary:
          'Fiber-optic network installation and MikroTik configuration for homes, villas, and hotels.',
        responsibilities: [
          'Installed fiber links and configured MikroTik routers tailored to site needs.',
          'Optimized routing, bandwidth management, and routine network maintenance.'
        ]
      },
      {
        id: 'edu-instiki',
        role: 'Informatics (Artificial Intelligence)',
        organization: 'INSTIKI (Institut Bisnis dan Teknologi Indonesia)',
        filterKey: 'education',
        categoryLabel: 'Education',
        period: '2025 — Present',
        location: 'Denpasar, Bali',
        summary:
          'Studying AI, web development, and data processing while creating with Teater INSTIKI.',
        responsibilities: [
          'Core coursework in algorithms, software engineering, data processing, and AI.',
          'Building personal web apps and exploring modern cloud and database systems.'
        ]
      },
      {
        id: 'edu-smkn1',
        role: 'Computer & Network Engineering',
        organization: 'SMK Negeri 1 Denpasar',
        filterKey: 'education',
        categoryLabel: 'Education',
        period: '2022 — 2025',
        location: 'Denpasar, Bali (AVG: 82.5 / 100)',
        summary:
          'Graduated with an 82.5 / 100 average and National LKS Cloud Computing honors.',
        responsibilities: [
          'Network administration, server systems, MikroTik, and AWS/GCP cloud.',
          'Co-built eVoting SKENSA 2024 using React, Laravel, and MySQL.'
        ]
      }
    ],
    certificates: [
      {
        id: 'lks-nasional',
        title: 'LKS Nasional Cloud Computing',
        award: 'Medal of Excellence #7',
        issuer: 'Pusat Prestasi Nasional',
        scope: 'National Level'
      },
      {
        id: 'lks-provinsi',
        title: 'LKS Provinsi Bali Cloud Computing',
        award: 'Winner',
        issuer: 'Pusat Prestasi Nasional',
        scope: 'Bali Province'
      },
      {
        id: 'lks-kota',
        title: 'LKS Kota Denpasar Cloud Computing',
        award: 'Winner',
        issuer: 'Pusat Prestasi Nasional',
        scope: 'Denpasar City'
      }
    ],
    projects: [
      {
        id: 'mandharu-profile',
        title: 'Mandha Ru Profile',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        statusLabel: 'Live · mandharu.yvn.web.id',
        actionState: 'live',
        actionLabel: 'Live Demo',
        year: '2025',
        summary:
          'Coffee shop profile website presenting brand story, full beverage & food menu, and essential visitor information.',
        description:
          'A digital profile site for Mandha Ru coffee shop allowing guests to browse the cafe identity, inspect the curated menu, and check location and opening details cleanly on any device.',
        thumbnail: '/src/assets/images/project_mandharu_profile_1794938309357.png',
        thumbnailAlt:
          'Mandha Ru Profile coffee shop website displayed on a laptop',
        showThumbnail: true,
        techStack: ['React', 'Tailwind CSS', 'Vercel'],
        githubUrl: null,
        demoUrl: 'https://mandharu.yvn.web.id',
        displayUrl: 'mandharu.yvn.web.id',
        highlights: [
          'Clear menu presentation and cafe profile crafted for fast mobile browsing.',
          'Responsive modular components built with React and Tailwind CSS.',
          'Deployed live on Vercel for instant public access.'
        ],
        architectureNote:
          'Built as a lightweight Single Page Application with React and Tailwind CSS, separating menu catalog data from UI components for effortless updates.'
      },
      {
        id: 'mandharu-order',
        title: 'Mandha Ru Coffee Shop Order',
        filterKey: 'fullstack',
        categoryLabel: 'Full-Stack',
        statusLabel: 'Discontinued',
        actionState: 'discontinued',
        actionLabel: 'Discontinued',
        year: '2025',
        summary:
          'Table-side coffee shop ordering web app with cashier confirmation designed to prevent counter queue bottlenecks.',
        description:
          'A web ordering workflow tailored for coffee shop tables: guests select menu items from their table and send orders for cashier confirmation to keep front-counter queues flowing smoothly.',
        thumbnail: '/src/assets/images/project_mandharu_order_1794938307873.jpg',
        thumbnailAlt:
          'Mandha Ru Coffee Shop Order table-ordering web application on tablet and smartphone',
        showThumbnail: false,
        techStack: ['React', 'Laravel', 'Tailwind CSS', 'MySQL'],
        githubUrl: null,
        demoUrl: null,
        displayUrl: 'Discontinued',
        highlights: [
          'Table-side ordering flow engineered to eliminate physical cashier bottlenecks.',
          'Laravel REST API backed by MySQL for order carts and confirmation tracking.',
          'Clean customer and cashier views styled with React and Tailwind CSS.'
        ],
        architectureNote:
          'Powered by a Laravel REST API connected to MySQL to manage table orders, cashier confirmation states, and menu availability.'
      },
      {
        id: 'evoting-skensa-2024',
        title: 'eVoting SKENSA 2024',
        filterKey: 'fullstack',
        categoryLabel: 'Full-Stack',
        statusLabel: 'Archived',
        actionState: 'archived',
        actionLabel: 'Archived',
        year: '2024',
        summary:
          'Collaborative web platform built with school peers for student council president voting at SMK Negeri 1 Denpasar.',
        description:
          'A digital voting application created in collaboration with fellow students at SMK Negeri 1 Denpasar to run the 2024 student council president election cleanly and transparently.',
        thumbnail: '/src/assets/images/project_evoting_skensa_1794938309303.JPG',
        thumbnailAlt:
          'eVoting SKENSA 2024 student council voting web application on a laptop',
        showThumbnail: true,
        techStack: ['React', 'Laravel', 'Tailwind CSS', 'MySQL'],
        githubUrl: null,
        demoUrl: null,
        displayUrl: 'Deprecated',
        highlights: [
          'One-vote-per-account verification ensuring reliable student council election counts.',
          'Structured MySQL ballot storage protected by Laravel server-side validation.',
          'Accessible candidate selection interface designed for all students.'
        ],
        architectureNote:
          'Laravel backend enforces atomic database transactions on MySQL ballot tables so each verified voter can submit exactly one ballot.'
      },
      {
        id: 'web-profile-pribadi',
        title: 'Web Profile Pribadi',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        statusLabel: 'Active · #',
        actionState: 'this-website',
        actionLabel: 'This website.',
        year: '2026',
        summary:
          'Personal portfolio website presenting biography, professional experience, education, achievements, and software projects.',
        description:
          'A personal web portfolio following Apple Design Hierarchy with Light & Dark mode, ID/EN language switching, scroll progress tracking, and GPU-composited scroll reveal animations.',
        thumbnail:
          '/src/assets/images/project_personal_portfolio_v2_1794938327594.png',
        thumbnailAlt:
          'Adi Yoga personal portfolio website shown on an aluminum laptop',
        showThumbnail: true,
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Motion'],
        githubUrl: null,
        demoUrl: '#top',
        displayUrl: '#',
        highlights: [
          'Instant Light/Dark theme and Indonesian/English bilingual switching.',
          'Scroll progress indicator and reduced-motion-aware reveal animations.',
          'Pure filtering, validation, and CV generation logic backed by automated unit tests.'
        ],
        architectureNote:
          'Decouples bilingual content data and pure domain helpers from React UI components for deterministic testing.'
      }
    ],
    skills: [
      {
        id: 'react',
        name: 'React & TypeScript',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 90,
        context: 'Modular UI components, responsive SPAs & strict type safety',
        techIcons: ['React', 'TypeScript']
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 92,
        context: 'Mobile-first layouts, Light/Dark themes & precise design systems',
        techIcons: ['Tailwind CSS']
      },
      {
        id: 'heroui',
        name: 'HeroUI (formerly NextUI)',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 82,
        context: 'Ready-to-use, consistent React UI components',
        techIcons: ['HeroUI (formerly NextUI)']
      },
      {
        id: 'bootstrap',
        name: 'Bootstrap',
        filterKey: 'frontend',
        categoryLabel: 'Front End',
        level: 82,
        context: 'Responsive grid system and ready-to-use UI components',
        techIcons: ['Bootstrap']
      },
      {
        id: 'laravel',
        name: 'Laravel',
        filterKey: 'backend',
        categoryLabel: 'Back End',
        level: 85,
        context: 'REST APIs, authentication, validation & database transactions',
        techIcons: ['Laravel']
      },
      {
        id: 'express',
        name: 'Express.js',
        filterKey: 'backend',
        categoryLabel: 'Back End',
        level: 80,
        context: 'Lightweight Node.js backend services, routing & API middleware',
        techIcons: ['Express.js']
      },
      {
        id: 'discordjs',
        name: 'discord.js',
        filterKey: 'backend',
        categoryLabel: 'Back End',
        level: 78,
        context: 'Node.js library for Discord bots and integrations',
        techIcons: ['discord.js']
      },
      {
        id: 'mysql-postgres',
        name: 'MySQL & PostgreSQL',
        filterKey: 'database',
        categoryLabel: 'Database',
        level: 86,
        context: 'Relational schema design, structured queries & data integrity',
        techIcons: ['MySQL', 'PostgreSQL']
      },
      {
        id: 'supabase',
        name: 'Supabase',
        filterKey: 'database',
        categoryLabel: 'Database',
        level: 82,
        context: 'Managed database and data synchronization',
        techIcons: ['Supabase']
      },
      {
        id: 'firebase',
        name: 'Firebase',
        filterKey: 'database',
        categoryLabel: 'Database',
        level: 80,
        context: 'Database platform, authentication & data synchronization',
        techIcons: ['Firebase']
      },
      {
        id: 'cloud-platforms',
        name: 'AWS & GCP',
        filterKey: 'cloud',
        categoryLabel: 'Cloud & DevOps',
        level: 88,
        context: 'Cloud infrastructure and compute services',
        techIcons: ['AWS', 'GCP']
      },
      {
        id: 'tools-stack',
        name: 'Git/GitHub, Figma, Google Stitch, VS Code & Vercel',
        filterKey: 'tools',
        categoryLabel: 'Tools',
        level: 90,
        context: 'Version control, UI prototyping, interface ideation & web deployment',
        techIcons: ['GitHub', 'Figma', 'Google Stitch', 'VS Code', 'Vercel']
      },
      {
        id: 'ai-developer-tools',
        name: 'OmniRoute, Claude Code CLI & Google Colab',
        filterKey: 'tools',
        categoryLabel: 'Tools',
        level: 84,
        context: 'AI model routing, terminal coding agent & cloud notebooks',
        techIcons: ['OmniRoute', 'Claude Code CLI', 'Google Colab']
      }
    ],
    copy: {
      nav: {
        ariaMain: 'Primary navigation',
        ariaMobile: 'Mobile navigation',
        openMenu: 'Open navigation menu',
        closeMenu: 'Close navigation menu',
        enableDark: 'Switch to dark mode',
        enableLight: 'Switch to light mode',
        switchLangLabel: 'Switch language to Indonesian',
        links: [
          { label: 'About', href: '#about' },
          { label: 'Experience', href: '#experience' },
          { label: 'Projects', href: '#projects' },
          { label: 'Skills', href: '#skills' },
          { label: 'Contact', href: '#contact' }
        ]
      },
      hero: {
        rolesAria: 'Primary roles',
        viewProjects: 'View My Projects',
        downloadCv: 'Download CV',
        cvDownloaded: 'CV Downloaded',
        portraitAlt: 'Adi Yoga working at a modern software development desk'
      },
      about: {
        kicker: 'About Me',
        heading: 'Technology, theater creativity, and musical craft.'
      },
      experience: {
        kicker: 'Experience & Education',
        heading: 'Professional track, education & Cloud honors.',
        filterAria: 'Filter experience and education',
        filters: [
          { key: 'all', label: 'All' },
          { key: 'work', label: 'Experience' },
          { key: 'education', label: 'Education' }
        ],
        marqueeAria: 'Horizontally scrolling experience and education timeline',
        certificatesKicker: 'Certificates & Achievements',
        certificatesHeading: 'Issued by Pusat Prestasi Nasional'
      },
      projects: {
        kicker: 'Portfolio',
        heading: 'Selected works.',
        filterAria: 'Filter project category',
        filters: [
          { key: 'all', label: 'All' },
          { key: 'frontend', label: 'Front End' },
          { key: 'fullstack', label: 'Full-Stack' }
        ],
        techStackAria: 'Technology stack',
        openDetailPrefix: 'Open project details for',
        githubButton: 'GitHub',
        demoButton: 'Demo',
        githubAriaPrefix: 'View GitHub and architecture for',
        demoAriaPrefix: 'View demo and summary for',
        prevSlide: 'Previous project',
        nextSlide: 'Next project',
        pauseAuto: 'Pause auto-slide',
        playAuto: 'Resume auto-slide',
        slideDotsAria: 'Portfolio slide navigation',
        goToSlidePrefix: 'Show project'
      },
      modal: {
        closePrefix: 'Close details for',
        tabsAria: 'Project view mode',
        previewTab: 'Overview & Demo',
        codeTab: 'Architecture & Tech Stack',
        highlightsHeading: 'Key Highlights',
        architectureHeading: 'Architecture Notes',
        techStackHeading: 'Tech Stack',
        repoLabel: 'Repository Status',
        githubUnavailable:
          'GitHub repository is not publicly accessible at this time.',
        liveUrlLabel: 'Project Link',
        openLiveSite: 'Visit Site',
        copyUrl: 'Copy URL',
        copied: 'Copied',
        openGithub: 'Open GitHub'
      },
      skills: {
        kicker: 'Technical Stack',
        heading: 'Technologies & tools I build with.',
        filterAria: 'Filter skill category',
        filters: [
          { key: 'all', label: 'All' },
          { key: 'frontend', label: 'Front End' },
          { key: 'backend', label: 'Back End' },
          { key: 'database', label: 'Database' },
          { key: 'cloud', label: 'Cloud & DevOps' },
          { key: 'tools', label: 'Tools' }
        ],
        floatingAria: 'Tech stack icons',
        hiddenDockLabel: 'Hidden',
        hiddenDockAria: 'Other hidden stack technologies, click to show all',
        restoreAllLabel: 'Show all'
      },
      contact: {
        kicker: 'Contact',
        heading: "Let's connect.",
        closing:
          'Open for web projects, cloud & network engineering, or music collaborations.',
        directEmail: 'Direct email:',
        socialHeading: 'Connect across platforms',
        visitSocialPrefix: 'Visit',
        nameLabel: 'Name',
        namePlaceholder: 'Your full name',
        emailLabel: 'Email',
        emailPlaceholder: 'you@example.com',
        purposeLabel: 'Message Purpose',
        purposePlaceholder: 'Select a purpose',
        purposeOptions: [
          { value: 'employment', label: 'Job opportunity' },
          { value: 'freelance', label: 'Freelance project' },
          { value: 'collaboration', label: 'Collaboration' },
          { value: 'general', label: 'General question' },
          { value: 'other', label: 'Other' }
        ],
        subjectLabel: 'Subject',
        subjectPlaceholder: 'Enter a subject',
        messageLabel: 'Message',
        messagePlaceholder:
          'Tell me about your project idea, collaboration, or question...',
        submitButton: 'Send Message',
        successTitle: 'Your message has been sent',
        successBodyLead: 'Thank you,',
        successBodyMid: 'Your message from',
        successBodyEnd: 'has been recorded and I will respond shortly.',
        sendAnother: 'Send Another Message',
        sendingButton: 'Sending...',
        submitError: 'Your message could not be sent. Please try again or contact me directly by email.',
        rateLimitError: 'Too many attempts. Please wait a while before trying again.'
      },
      notFound: {
        eyebrow: 'Error 404',
        title: "The page you're looking for can't be found.",
        description:
          'The link may have moved, been removed, or the URL you entered is unavailable.',
        pathLabel: 'Requested path',
        backHomeButton: 'Back to Home',
        viewProjectsButton: 'View Projects'
      },
      scrollToTop: {
        ariaLabel: 'Scroll back to top',
        title: 'Back to top'
      },
      chatbot: {
        openLabel: 'Assistant',
        closeLabel: 'Close portfolio assistant',
        title: 'Adi Yoga Assistant',
        subtitle: 'Scoped to this portfolio only',
        resetLabel: 'Reset conversation',
        placeholder: 'Ask about profile, projects, or contact...',
        sendLabel: 'Send message to assistant',
        thinkingLabel: 'Assistant is typing...',
        outOfScopeBadge: 'Outside website scope',
        welcomeMessage:
          "Hi! I'm the assistant dedicated to Adi Yoga's portfolio. Ask me about his INSTIKI background, work & education, LKS Cloud Computing awards, selected projects, tech stack, or how to get in touch. Anything unrelated to this website is blocked.",
        starterQuestions: [
          "What is Adi's experience?",
          'Show skills',
          'What projects are featured here?',
          'How can I contact Adi Yoga?'
        ],
        sectionLabels: {
          '#top': 'View Hero Highlights',
          '#about': 'Open About Section',
          '#experience': 'Open Experience & Education',
          '#projects': 'Open Portfolio Projects',
          '#skills': 'Open Technical Stack',
          '#contact': 'Open Contact & Email'
        },
        errorFallback:
          'Unable to reach the assistant service right now. Please try again shortly.',
        retryLabel: 'Retry'
      }
    }
  }
};

import { EXTRA_LOCALE_COPY } from './localeCopy.ts';
import { buildExtraLocaleData } from './localeContent.ts';

export const PORTFOLIO_DATA: Record<Language, LocalizedPortfolioData> = {
  ...BASE_PORTFOLIO_DATA,
  ja: { ...buildExtraLocaleData('ja', BASE_PORTFOLIO_DATA.en), copy: EXTRA_LOCALE_COPY.ja },
  ko: { ...buildExtraLocaleData('ko', BASE_PORTFOLIO_DATA.en), copy: EXTRA_LOCALE_COPY.ko },
  'zh-CN': { ...buildExtraLocaleData('zh-CN', BASE_PORTFOLIO_DATA.en), copy: EXTRA_LOCALE_COPY['zh-CN'] }
};
