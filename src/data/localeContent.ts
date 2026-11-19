import type { Language, LocalizedPortfolioData } from './portfolioData';

export type ExtraLanguage = Exclude<Language, 'id' | 'en'>;

type LocalizedContent = Pick<LocalizedPortfolioData, 'profile' | 'experiences' | 'certificates' | 'projects' | 'skills'>;

const copy = <T>(value: T): T => structuredClone(value);

const CONTENT: Record<ExtraLanguage, (base: LocalizedPortfolioData) => LocalizedContent> = {
  ja: (base) => {
    const data = copy(base);
    Object.assign(data.profile, {
      roles: ['IT専攻学生', 'Web開発者', '音楽家'],
      degree: '情報学（人工知能）学士',
      heroSummary: 'INSTIKIデンパサールで情報学を学び、Webアプリとネットワーク基盤を構築。演劇と音楽にも取り組む。',
      aboutParagraphs: ['INSTIKIでIT、Web開発、データ処理を中心に情報学を専攻。Teater INSTIKIで活動し、楽曲のリメイクを制作。ピアノ、ベース、ギターを演奏し、ドラムも学んでいる。', 'テクノロジーと創造性、個人の表現が交わる領域に関心を持ち、信頼性と速度、使いやすさを備えたデジタルシステムを設計。'],
      highlights: [
        { value: 'INSTIKI', label: '情報学（AI）', detail: '2025年〜現在' },
        { value: 'LKS #7', label: '全国クラウドコンピューティング', detail: '優秀賞' },
        { value: '2×優勝', label: 'Bali・Denpasar LKS', detail: 'クラウドコンピューティング' },
        { value: 'Full-Stack', label: 'Web・クラウド・ネットワーク', detail: 'React、Laravel、AWS' }
      ],
      principles: [
        { index: '01', title: '信頼できる設計', description: 'フロントエンド、バックエンド、データベースを整理し、高速で保守しやすく。' },
        { index: '02', title: '直感的なUI', description: '明快な文字と自然な操作で、使いやすい体験を実現。' },
        { index: '03', title: '分野を越えた創造性', description: 'ソフトウェアの精密さに、演劇と音楽の表現力を融合。' }
      ]
    });
    const exp: Record<string, Partial<(typeof data.experiences)[number]>> = {
      'buna-coffee-barista': { role: 'バリスタ', categoryLabel: '職務経験', summary: '味の一貫性を保ちながらスペシャルティコーヒーを提供。', responsibilities: ['エスプレッソを調整し、店舗基準の品質を維持。', '混雑時も接客とバー業務を円滑に運営。'] },
      'freelance-web-dev': { role: 'フリーランスWeb開発者', organization: '個人事業', categoryLabel: '職務経験', summary: 'ランディングページ、店舗紹介サイト、Webアプリを制作。', responsibilities: ['ReactとTailwind CSSで高速なモバイル優先UIを構築。', '表示速度を最適化し、Vercelへデプロイ。'] },
      'blip-it-intern': { role: 'ITサポートインターン', categoryLabel: '職務経験', summary: '住宅、ヴィラ、ホテル向けの光回線設置とMikroTik設定。', responsibilities: ['現場に合わせて光回線を敷設し、MikroTikを設定。', 'ルーティング、帯域管理、定期保守を最適化。'] },
      'edu-instiki': { role: '情報学（人工知能）', categoryLabel: '学歴', summary: 'AI、Web開発、データ処理を学び、Teater INSTIKIでも活動。', responsibilities: ['アルゴリズム、ソフトウェア工学、データ処理、AIを学習。', 'Webアプリを開発し、クラウドとデータベースを探究。'] },
      'edu-smkn1': { role: 'コンピューター・ネットワーク工学', categoryLabel: '学歴', summary: '平均82.5/100で卒業。LKS全国クラウドコンピューティングで受賞。', responsibilities: ['ネットワーク、サーバー、MikroTik、AWS/GCPを学習。', 'React、Laravel、MySQLでeVoting SKENSA 2024を共同開発。'] }
    };
    data.experiences = data.experiences.map((item) => Object.assign(item, exp[item.id]));
    data.certificates = data.certificates.map((item) => ({ ...item, title: item.id === 'lks-nasional' ? 'LKS全国クラウドコンピューティング' : item.id === 'lks-provinsi' ? 'LKS Bali州クラウドコンピューティング' : 'LKS Denpasar市クラウドコンピューティング', award: item.id === 'lks-nasional' ? '優秀賞 第7位' : '優勝', scope: item.id === 'lks-nasional' ? '全国' : item.id === 'lks-provinsi' ? 'Bali州' : 'Denpasar市' }));
    const proj: Record<string, Partial<(typeof data.projects)[number]>> = {
      'mandharu-profile': { categoryLabel: 'フロントエンド', statusLabel: '公開中', actionLabel: 'デモを見る', summary: '店舗紹介、メニュー、サービス情報を掲載するコーヒーショップのWebサイト。', description: 'Mandha Ruの店舗紹介サイト。店の特徴、メニュー、所在地、営業時間をすぐに確認できる。', thumbnailAlt: 'ノートPCに表示されたMandha Ru Profile', highlights: ['メニューと店舗情報をモバイルでも見やすく表示。', 'ReactとTailwind CSSによる軽量でレスポンシブな構成。', 'Vercelで公開中。'], architectureNote: 'ReactとTailwind CSSによる軽量SPA。メニュー情報をUIから分離し、更新を容易に。' },
      'mandharu-order': { categoryLabel: 'フルスタック', statusLabel: '開発終了', actionLabel: '開発終了', summary: '席から注文し、レジで確認するコーヒーショップ向けWebアプリ。', description: '席でメニューを選んで注文し、レジで確認する流れでカウンターの行列を抑える。', thumbnailAlt: 'タブレットとスマートフォンに表示されたMandha Ruの注文アプリ', highlights: ['席から注文し、レジ前の待ち時間を削減。', 'Laravel REST APIとMySQLで注文と確認状況を管理。', 'ReactとTailwind CSSで顧客・レジ画面を構築。'], architectureNote: 'Laravel REST APIとMySQLで注文、確認状況、メニュー在庫を管理。' },
      'evoting-skensa-2024': { categoryLabel: 'フルスタック', statusLabel: 'アーカイブ', actionLabel: 'アーカイブ', actionState: 'archived', summary: 'SMK Negeri 1 Denpasarの生徒会選挙向けに同級生と開発した投票サイト。', description: '2024年の生徒会長選挙を円滑かつ透明に実施するため、学生チームで開発。', thumbnailAlt: 'ノートPCに表示されたeVoting SKENSA 2024', highlights: ['1アカウント1票で結果の信頼性を確保。', 'Laravelの検証でMySQLの投票データを保護。', '全生徒が使いやすい候補者選択画面。'], architectureNote: 'LaravelとMySQLの原子トランザクションで、認証済み有権者の投票を1票に制限。' },
      'web-profile-pribadi': { title: '個人ポートフォリオサイト', categoryLabel: 'フロントエンド', statusLabel: '公開中', actionLabel: 'このWebサイト', summary: 'プロフィール、経験、学歴、受賞歴、プロジェクトを紹介する個人サイト。', description: 'Apple Design Hierarchyを採用。ライト／ダークモード、ID/EN切替、スクロール進捗、表示アニメーションに対応。', thumbnailAlt: 'ノートPCに表示されたAdi Yogaのポートフォリオ', highlights: ['ライト／ダークとインドネシア語／英語に対応。', 'スクロール進捗とreduced-motion対応アニメーション。', 'フィルター、検証、CV生成をユニットテストで確認。'], architectureNote: '多言語コンテンツとドメイン処理をReact UIから分離し、決定論的にテスト。' }
    };
    data.projects = data.projects.map((item) => Object.assign(item, proj[item.id], { showThumbnail: base.projects.find((source) => source.id === item.id)?.showThumbnail ?? item.showThumbnail }));
    const skillContext: Record<string, [string, string]> = {
      react: ['フロントエンド', 'モジュール型UI、レスポンシブSPA、型安全性'], tailwind: ['フロントエンド', 'モバイル優先、テーマ対応、精密なレイアウト'], heroui: ['フロントエンド', 'React向けUIコンポーネント'], bootstrap: ['フロントエンド', 'レスポンシブグリッドとUIコンポーネント'], laravel: ['バックエンド', 'REST API、認証、検証、DBトランザクション'], express: ['バックエンド', '軽量Node.js、ルーティング、APIミドルウェア'], discordjs: ['バックエンド', 'Discordボットと連携機能'], 'mysql-postgres': ['データベース', 'リレーショナル設計、構造化クエリ、データ整合性'], supabase: ['データベース', 'マネージドDBとデータ同期'], firebase: ['データベース', 'データベース、認証、データ同期'], 'cloud-platforms': ['クラウド・DevOps', 'クラウド基盤とコンピューティング'], 'tools-stack': ['ツール', 'バージョン管理、UI設計、プロトタイプ、デプロイ'], 'ai-developer-tools': ['ツール', 'AIルーティング、コーディング支援、クラウドノートブック']
    };
    data.skills = data.skills.map((item) => ({ ...item, categoryLabel: skillContext[item.id][0], context: skillContext[item.id][1] }));
    return data;
  },
  ko: (base) => {
    const data = copy(base);
    Object.assign(data.profile, {
      roles: ['IT 전공 대학생', '웹 개발자', '음악가'], degree: '정보학 학사(인공지능)',
      heroSummary: 'INSTIKI 덴파사르에서 정보학을 공부하며 웹 앱과 네트워크 인프라를 구축합니다. 연극과 음악 활동도 이어갑니다.',
      aboutParagraphs: ['INSTIKI에서 IT, 웹 개발, 데이터 처리를 중심으로 정보학을 전공합니다. Teater INSTIKI에서 활동하고 곡을 편곡하며, 피아노·베이스·기타를 연주하고 드럼도 배웁니다.', '기술과 창의성, 개인의 표현이 만나는 지점에 관심을 두고 신뢰할 수 있고 빠르며 사용하기 편한 디지털 시스템을 설계합니다.'],
      highlights: [{value:'INSTIKI',label:'정보학(AI)',detail:'2025년~현재'},{value:'LKS #7',label:'전국 클라우드 컴퓨팅',detail:'우수상'},{value:'2회 우승',label:'Bali·Denpasar LKS',detail:'클라우드 컴퓨팅'},{value:'Full-Stack',label:'웹·클라우드·네트워크',detail:'React, Laravel, AWS'}],
      principles: [{index:'01',title:'신뢰할 수 있는 구조',description:'프런트엔드·백엔드·데이터베이스를 명확히 구성해 빠르고 관리하기 쉽게 만듭니다.'},{index:'02',title:'직관적인 UI',description:'명확한 타이포그래피와 자연스러운 인터랙션으로 편리한 경험을 제공합니다.'},{index:'03',title:'분야를 넘는 창의성',description:'소프트웨어의 정밀함과 연극·음악의 표현력을 결합합니다.'}]
    });
    const exp: Record<string, Partial<(typeof data.experiences)[number]>> = {
      'buna-coffee-barista': {role:'바리스타',categoryLabel:'경력',summary:'일관된 맛의 스페셜티 커피를 만들고 세심하게 서비스합니다.',responsibilities:['에스프레소를 조정하고 매장 기준에 맞는 음료 품질을 유지합니다.','혼잡한 시간에도 고객 응대와 바 운영을 원활하게 합니다.']},
      'freelance-web-dev': {role:'프리랜서 웹 개발자',organization:'개인 사업',categoryLabel:'경력',summary:'랜딩 페이지, 매장 소개 사이트, 맞춤형 웹 앱을 제작합니다.',responsibilities:['React와 Tailwind CSS로 빠른 모바일 우선 UI를 구축합니다.','성능을 최적화하고 Vercel에 배포합니다.']},
      'blip-it-intern': {role:'IT 지원 인턴',categoryLabel:'경력',summary:'주택, 빌라, 호텔의 광섬유 설치와 MikroTik 구성을 담당했습니다.',responsibilities:['현장에 맞춰 광 회선을 설치하고 MikroTik을 설정했습니다.','라우팅, 대역폭 관리, 정기 네트워크 유지보수를 최적화했습니다.']},
      'edu-instiki': {role:'정보학(인공지능)',categoryLabel:'학력',summary:'AI, 웹 개발, 데이터 처리를 공부하며 Teater INSTIKI에서도 활동합니다.',responsibilities:['알고리즘, 소프트웨어 공학, 데이터 처리, AI를 학습합니다.','웹 앱을 만들고 클라우드와 데이터베이스를 탐구합니다.']},
      'edu-smkn1': {role:'컴퓨터·네트워크 공학',categoryLabel:'학력',summary:'평균 82.5/100으로 졸업하고 전국 LKS 클라우드 컴퓨팅에서 수상했습니다.',responsibilities:['네트워크, 서버, MikroTik, AWS/GCP를 학습했습니다.','React, Laravel, MySQL 기반 eVoting SKENSA 2024를 공동 개발했습니다.']}
    };
    data.experiences = data.experiences.map((item) => Object.assign(item, exp[item.id]));
    data.certificates = data.certificates.map((item) => ({...item,title:item.id==='lks-nasional'?'LKS 전국 클라우드 컴퓨팅':item.id==='lks-provinsi'?'LKS Bali주 클라우드 컴퓨팅':'LKS Denpasar시 클라우드 컴퓨팅',award:item.id==='lks-nasional'?'우수상 7위':'우승',scope:item.id==='lks-nasional'?'전국':item.id==='lks-provinsi'?'Bali주':'Denpasar시'}));
    const proj: Record<string, Partial<(typeof data.projects)[number]>> = {
      'mandharu-profile':{categoryLabel:'프런트엔드',statusLabel:'운영 중',actionLabel:'데모 보기',summary:'매장 소개와 메뉴, 방문객 정보를 제공하는 커피숍 웹사이트입니다.',description:'Mandha Ru의 디지털 매장 소개 사이트입니다. 매장 정보, 메뉴, 위치, 영업시간을 쉽게 확인할 수 있습니다.',thumbnailAlt:'노트북에 표시된 Mandha Ru Profile',highlights:['모바일에서도 보기 쉬운 메뉴와 매장 정보.','React와 Tailwind CSS 기반의 가볍고 반응형인 구성.','Vercel에 배포되어 바로 이용할 수 있습니다.'],architectureNote:'React와 Tailwind CSS로 만든 경량 SPA입니다. 메뉴 데이터를 UI와 분리해 쉽게 업데이트합니다.'},
      'mandharu-order':{categoryLabel:'풀스택',statusLabel:'개발 중단',actionLabel:'개발 중단',summary:'자리에서 주문하고 계산대에서 확인해 대기열을 줄이는 주문 앱입니다.',description:'고객이 자리에서 메뉴를 선택하고 계산대에서 주문을 확인하는 흐름으로 대기열을 줄입니다.',thumbnailAlt:'태블릿과 휴대폰에 표시된 Mandha Ru 주문 앱',highlights:['자리에서 주문해 계산대 대기 시간을 줄입니다.','Laravel REST API와 MySQL로 주문 및 확인 상태를 관리합니다.','React와 Tailwind CSS로 고객·계산대 화면을 구성했습니다.'],architectureNote:'Laravel REST API와 MySQL로 주문, 확인 상태, 메뉴 재고를 관리합니다.'},
      'evoting-skensa-2024':{categoryLabel:'풀스택',statusLabel:'보관',actionLabel:'보관',actionState:'archived',summary:'SMK Negeri 1 Denpasar 학생회장 선거를 위해 동료들과 만든 투표 웹앱입니다.',description:'2024년 학생회장 선거를 원활하고 투명하게 진행하도록 학생 팀과 개발했습니다.',thumbnailAlt:'노트북에 표시된 eVoting SKENSA 2024',highlights:['계정당 1표로 선거 결과를 보호합니다.','Laravel 검증으로 MySQL 투표 데이터를 보호합니다.','모든 학생이 쉽게 사용할 후보 선택 화면.'],architectureNote:'Laravel과 MySQL 원자 트랜잭션으로 인증된 유권자당 유효 투표 한 건을 보장합니다.'},
      'web-profile-pribadi':{title:'개인 포트폴리오 웹사이트',categoryLabel:'프런트엔드',statusLabel:'운영 중',actionLabel:'현재 웹사이트',summary:'프로필, 경력, 학력, 수상 및 프로젝트를 소개하는 개인 포트폴리오입니다.',description:'Apple Design Hierarchy 기반 웹앱입니다. 라이트·다크 테마, ID/EN 전환, 스크롤 진행 표시와 등장 애니메이션을 지원합니다.',thumbnailAlt:'노트북에 표시된 Adi Yoga 포트폴리오',highlights:['라이트·다크 테마와 인도네시아어·영어를 지원합니다.','스크롤 표시와 reduced-motion 대응 애니메이션.','필터, 검증, CV 생성을 자동 테스트합니다.'],architectureNote:'다국어 콘텐츠와 도메인 로직을 React UI에서 분리해 결정론적으로 테스트합니다.'}
    };
    data.projects = data.projects.map((item) => Object.assign(item, proj[item.id], { showThumbnail: base.projects.find((source) => source.id === item.id)?.showThumbnail ?? item.showThumbnail }));
    const skills: Record<string,[string,string]> = {react:['프런트엔드','모듈형 UI, 반응형 SPA, 타입 안전성'],tailwind:['프런트엔드','모바일 우선 레이아웃, 테마, 정밀한 UI'],heroui:['프런트엔드','React UI 컴포넌트'],bootstrap:['프런트엔드','반응형 그리드와 UI 컴포넌트'],laravel:['백엔드','REST API, 인증, 요청 검증, DB 트랜잭션'],express:['백엔드','경량 Node.js, 라우팅, API 미들웨어'],discordjs:['백엔드','Discord 봇과 연동'],'mysql-postgres':['데이터베이스','관계형 설계, 쿼리, 데이터 무결성'],firebase:['데이터베이스','데이터베이스, 인증, 데이터 동기화'],supabase:['데이터베이스','관리형 데이터베이스와 동기화'],'cloud-platforms':['클라우드·DevOps','클라우드 인프라와 컴퓨팅'],'tools-stack':['도구','버전 관리, UI 설계, 프로토타입, 배포'],'ai-developer-tools':['도구','AI 라우팅, 터미널 코딩 도우미, 클라우드 노트북']};
    data.skills = data.skills.map((item)=>({...item,categoryLabel:skills[item.id][0],context:skills[item.id][1]}));
    return data;
  },
  'zh-CN': (base) => {
    const data = copy(base);
    Object.assign(data.profile, {
      roles:['IT专业学生','Web开发者','音乐人'], degree:'信息学学士（人工智能）',
      heroSummary:'在INSTIKI登巴萨攻读信息学，开发Web应用与网络基础设施，同时参与戏剧和音乐创作。',
      aboutParagraphs:['在INSTIKI主修信息学，专注IT、Web开发和数据处理。参与Teater INSTIKI，制作歌曲改编，演奏钢琴、贝斯和吉他，也在学习架子鼓。','关注技术、创造力与个人表达的交汇，致力于打造可靠、快速且易用的数字系统。'],
      highlights:[{value:'INSTIKI',label:'信息学（人工智能）',detail:'2025年至今'},{value:'LKS #7',label:'全国云计算',detail:'卓越奖'},{value:'两次第一名',label:'Bali与Denpasar LKS',detail:'云计算'},{value:'Full-Stack',label:'Web、云与网络',detail:'React、Laravel、AWS'}],
      principles:[{index:'01',title:'可靠架构',description:'清晰组织前端、后端和数据库，兼顾速度与可维护性。'},{index:'02',title:'直观界面',description:'用清晰排版和灵敏交互，带来自然易用的体验。'},{index:'03',title:'跨领域创造力',description:'将软件工程的严谨与戏剧、音乐的表达相融合。'}]
    });
    const exp: Record<string,Partial<(typeof data.experiences)[number]>> = {
      'buna-coffee-barista':{role:'咖啡师',categoryLabel:'工作经历',summary:'稳定呈现精品咖啡风味，并提供周到服务。',responsibilities:['调校浓缩咖啡，确保饮品符合门店标准。','高峰时段保持良好服务与顺畅运营。']},
      'freelance-web-dev':{role:'自由职业Web开发者',organization:'自由职业',categoryLabel:'工作经历',summary:'开发着陆页、店铺介绍网站和定制Web应用。',responsibilities:['使用React和Tailwind CSS构建快速、移动优先的界面。','优化性能并部署至Vercel。']},
      'blip-it-intern':{role:'IT支持实习生',categoryLabel:'工作经历',summary:'为住宅、别墅和酒店安装光纤网络并配置MikroTik。',responsibilities:['按现场需求铺设光纤并配置MikroTik路由器。','优化路由、带宽管理和定期网络维护。']},
      'edu-instiki':{role:'信息学（人工智能）',categoryLabel:'教育经历',summary:'学习AI、Web开发和数据处理，并参与Teater INSTIKI创作。',responsibilities:['学习算法、软件工程、数据处理和AI。','开发个人Web应用，探索云服务与数据库。']},
      'edu-smkn1':{role:'计算机与网络工程',categoryLabel:'教育经历',summary:'平均成绩82.5/100毕业，并在LKS全国云计算比赛获奖。',responsibilities:['学习网络管理、服务器、MikroTik及AWS/GCP。','与团队使用React、Laravel和MySQL开发eVoting SKENSA 2024。']}
    };
    data.experiences=data.experiences.map((item)=>Object.assign(item,exp[item.id]));
    data.certificates=data.certificates.map((item)=>({...item,title:item.id==='lks-nasional'?'LKS全国云计算':item.id==='lks-provinsi'?'LKS Bali省云计算':'LKS Denpasar市云计算',award:item.id==='lks-nasional'?'卓越奖第7名':'第一名',scope:item.id==='lks-nasional'?'全国级':item.id==='lks-provinsi'?'Bali省':'Denpasar市'}));
    const proj: Record<string,Partial<(typeof data.projects)[number]>> = {
      'mandharu-profile':{categoryLabel:'前端',statusLabel:'已上线',actionLabel:'查看演示',summary:'咖啡店介绍网站，展示店铺信息、菜单和访客服务信息。',description:'Mandha Ru咖啡店的数字介绍网站，方便查看店铺特色、餐饮菜单、地址和营业时间。',thumbnailAlt:'笔记本电脑上展示的Mandha Ru Profile',highlights:['清晰呈现菜单与店铺信息，便于手机浏览。','使用React和Tailwind CSS构建轻量响应式界面。','已部署至Vercel，可直接访问。'],architectureNote:'基于React和Tailwind CSS构建轻量SPA，将菜单数据与界面分离，便于更新。'},
      'mandharu-order':{categoryLabel:'全栈',statusLabel:'已停止开发',actionLabel:'已停止开发',summary:'顾客可在座位点单并由收银台确认，以减少柜台排队。',description:'顾客在座位选择菜单并提交订单，由收银台确认，让点单流程更顺畅。',thumbnailAlt:'平板和手机上展示的Mandha Ru桌边点单应用',highlights:['支持桌边点单，减少收银台等待。','通过Laravel REST API与MySQL管理订单及确认状态。','使用React和Tailwind CSS构建顾客与收银台界面。'],architectureNote:'使用Laravel REST API连接MySQL，管理订单、收银确认和菜单库存。'},
      'evoting-skensa-2024':{categoryLabel:'全栈',statusLabel:'已归档',actionLabel:'档案',actionState:'archived',summary:'与同学合作开发的线上投票平台，用于SMK Negeri 1 Denpasar学生会主席选举。',description:'与学生团队开发的数字投票应用，用于有序、透明地举办2024年学生会主席选举。',thumbnailAlt:'笔记本电脑上展示的eVoting SKENSA 2024',highlights:['每个账号限投一票，保障选举结果可信。','Laravel服务器验证保护MySQL投票数据。','提供易用的候选人选择界面。'],architectureNote:'Laravel后端通过MySQL原子事务，确保每位已验证选民只能提交一张有效选票。'},
      'web-profile-pribadi':{title:'个人作品集网站',categoryLabel:'前端',statusLabel:'已上线',actionLabel:'当前网站',summary:'展示个人简介、经历、教育、证书和项目的作品集网站。',description:'遵循Apple Design Hierarchy的个人作品集Web应用，支持浅色／深色模式、ID/EN切换、滚动进度和显现动画。',thumbnailAlt:'笔记本电脑上展示的Adi Yoga个人作品集',highlights:['支持浅色／深色主题及印尼语／英语切换。','提供滚动进度和兼顾reduced-motion的动画。','通过单元测试验证筛选、校验和CV生成逻辑。'],architectureNote:'将多语言内容与领域逻辑从React界面分离，支持确定性测试。'}
    };
    data.projects=data.projects.map((item)=>Object.assign(item,proj[item.id]));
    const skills: Record<string,[string,string]>={react:['前端','模块化UI、响应式SPA与类型安全'],tailwind:['前端','移动优先布局、主题适配与精细设计'],heroui:['前端','React UI组件'],bootstrap:['前端','响应式网格与UI组件'],laravel:['后端','REST API、身份验证、请求校验与数据库事务'],express:['后端','轻量Node.js服务、路由与API中间件'],discordjs:['后端','Discord机器人与集成'],'mysql-postgres':['数据库','关系型设计、结构化查询与数据完整性'],firebase:['数据库','数据库、身份验证与数据同步'],supabase:['数据库','托管数据库与数据同步'],'cloud-platforms':['云与DevOps','云基础设施与计算服务'],'tools-stack':['工具','版本控制、UI原型、界面设计与Web部署'],'ai-developer-tools':['工具','AI路由、终端编程助手与云笔记本']};
    data.skills=data.skills.map((item)=>({...item,categoryLabel:skills[item.id][0],context:skills[item.id][1]}));
    return data;
  }
};

export function buildExtraLocaleData(locale: ExtraLanguage, base: LocalizedPortfolioData): LocalizedContent {
  return CONTENT[locale](base);
}
