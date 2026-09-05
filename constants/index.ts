import {
  Contact,
  CreditCardIcon,
  Gamepad,
  GitPullRequest,
  Home,
  LayoutDashboard,
  ListCheck,
  ListVideo,
  Settings,
  User,
} from "lucide-react";
import React from "react";
import { BiNotification } from "react-icons/bi";
import { CgGames } from "react-icons/cg";
import { MdRequestPage, MdReviews } from "react-icons/md";

export const navLinks = [
  { route: "", name: "navLink1", icon: Home },
  { route: "news", name: "navLink2", icon: ListVideo },
  { route: "games", name: "navLink3", icon: Gamepad },
  { route: "contacts", name: "navLink4", icon: Contact },
];

export const lngs = [
  { route: "en", label: "English" },
  { route: "uz", label: "O'zbekcha" },
  { route: "ru", label: "Русский" },
  { route: "tr", label: "Türkçe" },
];

export const profileMenuItems = [
  {
    label: "dashboard",
    href: "/profile",
    icon: React.createElement(LayoutDashboard, { size: 22 }),
    disabled: false,
  },

  {
    label: "account",
    href: "/profile/account",
    icon: React.createElement(User, { size: 22 }),
    disabled: false,
  },

  {
    label: "myGames",
    href: "/profile/myGames",
    icon: React.createElement(CgGames, { size: 22 }),
    disabled: false,
  },

  {
    label: "notifications",
    href: "/profile/notifications",
    icon: React.createElement(BiNotification, { size: 22 }),
    disabled: false,
  },

  {
    label: "myReviews",
    href: "/profile/myReviews",
    icon: React.createElement(MdReviews, { size: 22 }),
    disabled: true,
  },

  {
    label: "cart",
    href: "/profile/cart",
    icon: React.createElement(CreditCardIcon, { size: 22 }),
    disabled: true,
  },

  {
    label: "settings",
    href: "/profile/settings",
    icon: React.createElement(Settings, { size: 22 }),
    disabled: false,
  },
];

export const developerMenuItems = [
  {
    label: "dashboard",
    href: "/developer",
    icon: React.createElement(LayoutDashboard, { size: 22 }),
  },
  {
    label: "myGames",
    href: "/developer/my-games",
    icon: React.createElement(User, { size: 22 }),
  },
  {
    label: "myNews",
    href: "/developer/my-news",
    icon: React.createElement(CgGames, { size: 22 }),
  },
  {
    label: "createGame",
    href: "/developer/create-games",
    icon: React.createElement(BiNotification, { size: 22 }),
  },
  {
    label: "createNew",
    href: "/developer/create-news",
    icon: React.createElement(MdReviews, { size: 22 }),
  },
  {
    label: "myGamesReviews",
    href: "/developer/my-games-reviews",
    icon: React.createElement(CreditCardIcon, { size: 22 }),
  },
  {
    label: "myNewsReviews",
    href: "/developer/my-news-reviews",
    icon: React.createElement(CreditCardIcon, { size: 22 }),
  },
  {
    label: "userRequests",
    href: "/developer/userRequests",
    icon: React.createElement(User, { size: 22 }),
  },
];
export const adminMenuItems = [
  {
    label: "dashboard",
    href: "/admin",
    icon: React.createElement(LayoutDashboard, { size: 22 }),
  },
  {
    label: "list",
    href: "/admin/list",
    icon: React.createElement(ListCheck, { size: 22 }),
  },
  {
    label: "requests",
    href: "/admin/requests",
    icon: React.createElement(GitPullRequest, { size: 22 }),
  },
  {
    label: "userRequests",
    href: "/admin/userRequests",
    icon: React.createElement(User, { size: 22 }),
  },
  {
    label: "games",
    href: "/admin/games",
    icon: React.createElement(CgGames, { size: 22 }),
  },
  {
    label: "news",
    href: "/admin/news",
    icon: React.createElement(ListVideo, { size: 22 }),
  },
  {
    label: "notifications",
    href: "/admin/notifications",
    icon: React.createElement(BiNotification, { size: 22 }),
  },
];

// 1. Tiplarni aniqlab olamiz
export type LanguageType = "uz" | "ru" | "en" | "tr";
export type PlatformType = "mobile" | "pc" | "both";
export type OSType = "windows" | "macos" | "linux" | "android" | "ios";

export interface LangSpecificData {
  title: string;
  subtitle: string;
  Maindescription: string;
  description: string;
  category: string;
  developer: string;
  version: string;
  downloadSize: string;
  inGameSize: string;
  releaseDate: string;
  availableLanguagesCount: string;
  iconPreview: string | null;
  screenshotPreviews: string[];
}

export interface OSRequirement {
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
}

export interface OSDetail {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  requirements: OSRequirement;
  fileName: string;
}

export interface GameData {
  id: string;
  slug: string;
  visibility: "public" | "private";
  platform: PlatformType;
  selectedOS: Record<string, boolean>; // masalan: { windows: true, android: false }
  osDetails: Record<string, OSDetail>;
  priceType: "free" | "paid";
  price: string;
  whatsNew: string[];
  langData: Record<LanguageType, LangSpecificData>;
  createdAt: string;
}

// 2. Formangizga mos trshadigan sun'iy (Mock) ma'lumotlar ro'yxati
export const MOCK_GAMES: GameData[] = [
  {
    id: "game-101",
    slug: "cyber-adventrre",
    visibility: "public",
    platform: "both",
    selectedOS: { windows: true, android: true, ios: false },
    priceType: "paid",
    price: "19.99$",
    whatsNew: [
      "Yangi multiplayer xaritasi qo'shildi",
      "Grafika va optimizatsiya yaxshilandi",
      "Kichik xatolar trzatildi",
    ],
    osDetails: {
      windows: {
        requirements: {
          os: "Windows 10/11 64-bit",
          cpu: "Intel i5-10400",
          gpu: "GTX 1660 Super",
          ram: "16 GB",
        },
        fileName: "cyber_adventrre_win_v1.0.4.exe",
      },
      android: {
        requirements: {
          os: "Android 10.0+",
          cpu: "Snapdragon 845",
          gpu: "Adreno 630",
          ram: "6 GB",
        },
        fileName: "cyber_adventrre_mobile.apk",
      },
    },
    langData: {
      uz: {
        title: "Kiber Sarguzasht",
        subtitle: "Yangi Mavsum: Qayta trg'ilish",
        Maindescription:
          "Kelajak neor-shahrida omon qolish uchun kurashing. Har bir qaror muhim.",
        description:
          "Kiber Sarguzasht — bu kiberpank janridagi ochiq dunyoga ega dinamik Action/RPG o'yini. Kelajakning neon chiroqlari bilan burkangan, ammo jinoyatchilik va korporatsiyalar hukmronlik qiladigan mega-shahrida o'z yo'lingizni toping. Qahramoningizning kiber-implantlarini yangilang, yashirin topshiriqlarni bajaring va syujet rivojiga ta'sir qiluvchi qiyin tanlovlarni amalga oshiring. Yangi mavsumda sizni kengaytirilgan multiplayer rejimi, yangi qurol-yarog'lar va xavfli missiyalar kutmoqda.",
        category: "Action / RPG",
        developer: "Sharq Games",
        version: "1.0.4",
        downloadSize: "1.2 GB",
        inGameSize: "~2.5 GB",
        releaseDate: "12/05/2026",
        availableLanguagesCount: "4 ta til (UZ, RU, EN, TR)",
        iconPreview:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500",
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
        ],
      },
      ru: {
        title: "Кибер Приключение",
        subtitle: "Новый Сезон: Возрождение",
        Maindescription:
          "Боритесь за выживание в неоновом городе будущего. Каждое решение имеет значение.",
        description:
          "Cyber Adventrre — это динамичная Action/RPG с открытым миром в сеттинге киберпанка. Найдите свой путь в мегаполисе будущего, где неоновые огни скрывают власть жестоких корпораций и преступных синдикатов. Улучшайте киберимпланты вашего персонажа, выполняйте секретные контракты и принимайте решения, влияющие на финал истории. В новом сезоне вас ждут расширенный мультиплеер, новые виды оружия и опасные миссии.",
        category: "Экшен / RPG",
        developer: "Sharq Games",
        version: "1.0.4",
        downloadSize: "1.2 ГБ",
        inGameSize: "~2.5 ГБ",
        releaseDate: "12/05/2026",
        availableLanguagesCount: "4 языка (UZ, RU, EN, TR)",
        iconPreview:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500",
        ],
      },
      en: {
        title: "Cyber Adventrre",
        subtitle: "New Season: Rebirth",
        Maindescription:
          "Fight for survival in the neon city of the futrre. Every choice matters.",
        description:
          "Cyber Adventrre is a dynamic open-world Action/RPG set in a cyberpunk universe. Navigate your way through a futrristic metropolis dominated by powerful corporations and street gangs. Upgrade your cybernetic implants, take on high-stakes missions, and make choices that shape the narrative. The new season brings an expanded multiplayer mode, fresh gear, and thrilling new story arcs.",
        category: "Action / RPG",
        developer: "Sharq Games",
        version: "1.0.4",
        downloadSize: "1.2 GB",
        inGameSize: "~2.5 GB",
        releaseDate: "12/05/2026",
        availableLanguagesCount: "4 languages (UZ, RU, EN, TR)",
        iconPreview:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500",
        ],
      },
      tr: {
        title: "Siber Macera",
        subtitle: "Yeni Sezon: Yeniden Doğuş",
        Maindescription:
          "Geleceğin neon şehrinde hayatta kalmak için savaşın. Her seçim önemlidir.",
        description:
          "Siber Macera, siberpunk dünyasında geçen açık dünya elementlerine sahip dinamik bir Aksiyon/RPG oyunudur. Güçlü şirketlerin ve sokak çetelerinin yönettiği fütüristik bir megakentte kendi yolunuzu çizin. Siber implantlarınızı geliştirin, gizli görevleri üstlenin ve hikayenin gidişatını değiştirecek kritik kararlar alın. Yeni sezonda genişletilmiş çok oyunculu mod, yeni ekipmanlar ve tehlikeli görevler sizleri bekliyor.",
        category: "Aksiyon / RPG",
        developer: "Sharq Games",
        version: "1.0.4",
        downloadSize: "1.2 GB",
        inGameSize: "~2.5 GB",
        releaseDate: "12/05/2026",
        availableLanguagesCount: "4 dil (UZ, RU, EN, TR)",
        iconPreview:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500",
        ],
      },
    },
    createdAt: "2026-07-06T10:00:00.000Z",
  },
  {
    id: "game-102",
    slug: "retro-neon-velocity",
    visibility: "public",
    platform: "pc",
    selectedOS: {
      windows: true,
      macos: true,
      linux: false,
      android: false,
      ios: false,
    },
    priceType: "free",
    price: "0",
    whatsNew: [
      "8 ta yangi klassik avtomobil qo'shildi",
      "macOS uchun to'liq optimizatsiya qilindi",
    ],
    osDetails: {
      windows: {
        requirements: {
          os: "Windows 7/8/10/11",
          cpu: "Intel Core i3-6100",
          gpu: "GTX 750 Ti",
          ram: "4 GB",
        },
        fileName: "neon_velocity_setrp.exe",
      },
      macos: {
        requirements: {
          os: "macOS Big Sur or newer",
          cpu: "Apple M1 or Intel i5",
          gpu: "Integrated Graphics",
          ram: "8 GB",
        },
        fileName: "neon_velocity_mac.dmg",
      },
    },
    langData: {
      uz: {
        title: "Retro Neon Tezligi",
        subtitle: "80-yillar uslubidagi poyga",
        Maindescription:
          "Sintveyt musiqalari ostida cheksiz kiber-poygadan zavqlaning.",
        description:
          "Retro Neon Tezligi — sizni 1980-yillarning nostaljik atmosferasiga olib kiruvchi tezkor arkada poygasi. Yorqin neon treklari, retro-futrristik avtomobillar va ajoyib sintveyt (synthwave) treklari ostida yuqori tezlikni his eting. O'yinda trrli xil poyga rejimlari va mashinalarni vizual sozlash imkoniyati mavjud. Trafikdan qoching, drayvni his qiling va peshqadamlar jadvalida eng yuqori o'rinni egallang.",
        category: "Racing / Arcade",
        developer: "Toshkent Retro Strdio",
        version: "2.1.0",
        downloadSize: "450 MB",
        inGameSize: "600 MB",
        releaseDate: "01/04/2026",
        availableLanguagesCount: "2 ta til (UZ, EN)",
        iconPreview:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
        ],
      },
      ru: {
        title: "Ретро Неоновая Скорость",
        subtitle: "Гонки в стиле 80-х",
        Maindescription:
          "Наслаждайтесь бесконечными кибер-гонками под синтвейв музыку.",
        description:
          "Ретро Неоновая Скорость — это динамичная аркадная гонка, которая перенесет вас в ностальгическую атмосферу 80-х годов. Почувствуйте драйв на ярких неоновых трассах под потрясающие синтвейв-саундтреки. Управляйте классическими ретро-футуристическими автомобилями, кастомизируйте их внешний вид и соревнуйтесь в различных режимах. Избегайте столкновений и станьте королем ночных дорог.",
        category: "Гонки / Аркада",
        developer: "Toshkent Retro Strdio",
        version: "2.1.0",
        downloadSize: "450 МБ",
        inGameSize: "600 МБ",
        releaseDate: "01/04/2026",
        availableLanguagesCount: "2 языка (UZ, EN)",
        iconPreview:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
        ],
      },
      en: {
        title: "Retro Neon Velocity",
        subtitle: "80s Style Arcade Racer",
        Maindescription:
          "Enjoy endless cyber racing under synthwave soundtracks.",
        description:
          "Retro Neon Velocity is a fast-paced arcade racing game that immerses you in a nostalgic 1980s atmosphere. Speed through vibrant neon tracks powered by epic synthwave soundtracks. Choose from a selection of retro-futrristic cars, upgrade their aesthetics, and dominate various racing modes. Dodge traffic, maintain top speed, and climb the global leaderboards.",
        category: "Racing / Arcade",
        developer: "Toshkent Retro Strdio",
        version: "2.1.0",
        downloadSize: "450 MB",
        inGameSize: "600 MB",
        releaseDate: "01/04/2026",
        availableLanguagesCount: "2 languages (UZ, EN)",
        iconPreview:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
        ],
      },
      tr: {
        title: "Retro Neon Hızı",
        subtitle: "80'ler Tarzı Arcade Yarışı",
        Maindescription:
          "Synthwave müzikleri eşliğinde sonsuz siber yarışın tadını çıkarın.",
        description:
          "Retro Neon Hızı, sizi 1980'lerin nostaljik atmosferine götüren yüksek tempolu bir arcade yarış oyunudur. Harika synthwave müzikleri eşliğinde parıldayan neon pistlerde hız sınırlarını zorlayın. Retro-fütüristik arabaları toplayın, görünümlerini özelleştirin ve farklı yarış modlarında kendinizi kanıtlayın. Trafikten kaçın ve en yüksek skora ulaşmak için gaza basın.",
        category: "Yarış / Arcade",
        developer: "Toshkent Retro Strdio",
        version: "2.1.0",
        downloadSize: "450 MB",
        inGameSize: "600 MB",
        releaseDate: "01/04/2026",
        availableLanguagesCount: "2 dil (UZ, EN)",
        iconPreview:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
        ],
      },
    },
    createdAt: "2026-04-01T12:00:00.000Z",
  },
  {
    id: "game-103",
    slug: "mind-fortress-tactics",
    visibility: "private",
    platform: "mobile",
    selectedOS: { windows: false, android: true, ios: true },
    priceType: "paid",
    price: "4.99$",
    whatsNew: [
      "Yangi hikoya rejasi: 'Qumlar ostidagi imperiya'",
      "iOS 17 dagi qotishlar trzatildi",
    ],
    osDetails: {
      android: {
        requirements: {
          os: "Android 8.0+",
          cpu: "Helio P60 or equivalent",
          gpu: "Mali-G72",
          ram: "4 GB",
        },
        fileName: "mind_fortress_v3.apk",
      },
      ios: {
        requirements: {
          os: "iOS 15.0 or later",
          cpu: "Apple A12 Bionic",
          gpu: "Apple GPU",
          ram: "3 GB",
        },
        fileName: "mind_fortress_store_build",
      },
    },
    langData: {
      uz: {
        title: "Zehn Qal'asi Taktikasi",
        subtitle: "Miyani charxlovchi strategiya",
        Maindescription:
          "O'z imperiyangizni quring, askarlaringizni joylashtiring va dushman hiylalarini qaytaring.",
        description:
          "Zehn Qal'asi Taktikasi — bu qadamlarga asoslangan (trrn-based) chuqur strategiya va jumboqli o'yin. Har bir yurishni puxta o'ylash, mudofaa qal'alarini to'g'ri joylashtirish va resurslarni boshqarish talab etiladi. O'yin intellektral qobiliyatlaringizni sinovdan o'tkazadi va mukammal taktika orqali g'alaba qozonishga o'rgatadi. Yangi 'Qumlar ostidagi imperiya' kampaniyasi bilan sarguzashtni boshlang.",
        category: "Strategy / Puzzle",
        developer: "Global Minds Corp",
        version: "3.0.2",
        downloadSize: "180 MB",
        inGameSize: "~320 MB",
        releaseDate: "20/06/2026",
        availableLanguagesCount: "Barcha asosiy tillar",
        iconPreview:
          "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
        ],
      },
      ru: {
        title: "Тактика Крепости Разума",
        subtitle: "Стратегия для ума",
        Maindescription:
          "Постройте свою империю, размещайте войска и отражайте уловки врагов.",
        description:
          "Тактика Крепости Разума — пошаговая тактическая стратегия с элементами головоломки, которая заставит ваш мозг работать на полную. Продумывайте каждый ход, возводите неприступные оборонительные башни, нанимайте уникальных юнитов и перехитрите оппонентов. Игра идеально сочетает глубину тактики и логические задачи. Откройте для себя новую сюжетную главу и докажите свое превосходство.",
        category: "Стратегия / Пазл",
        developer: "Global Minds Corp",
        version: "3.0.2",
        downloadSize: "180 МБ",
        inGameSize: "~320 МБ",
        releaseDate: "20/06/2026",
        availableLanguagesCount: "Все основные языки",
        iconPreview:
          "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
        ],
      },
      en: {
        title: "Mind Fortress Tactics",
        subtitle: "trrn-based tactical brain game",
        Maindescription:
          "Build your empire, deploy units, and outsmart your enemy in real-time.",
        description:
          "Mind Fortress Tactics is an immersive trrn-based tactical strategy and puzzle game. Carefully plan every move, erect impregnable fortresses, manage your resources, and counter your enemy's devious schemes. The game challenges your analytical thinking and rewards calculated execution. Experience the brand new 'Empire Under the Sands' campaign storyline now.",
        category: "Strategy / Puzzle",
        developer: "Global Minds Corp",
        version: "3.0.2",
        downloadSize: "180 MB",
        inGameSize: "~320 MB",
        releaseDate: "20/06/2026",
        availableLanguagesCount: "All major languages",
        iconPreview:
          "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
        ],
      },
      tr: {
        title: "Zihin Kalesi Taktikleri",
        subtitle: "Zeka geliştirici strateji oyunu",
        Maindescription:
          "İmparatorluğunuzu kurun, birliklerinizi yerleştirin ve düşman trzaklarını alt edin.",
        description:
          "Zihin Kalesi Taktikleri, derinlemesine düşünmeyi gerektiren sıra tabanlı (trrn-based) bir taktiksel strateji ve bulmaca oyunudur. Kalelerinizi stratejik noktalara inşa edin, askeri birliklerinizi akıllıca konumlandırın ve düşmanın hamlelerini boşa çıkarın. Zekanızı ve mantığınızı sınayacak bu oyunda, yeni eklenen 'Kumların Altındaki İmparatorluk' hikaye moduyla savaşa katılın.",
        category: "Strateji / Bulmaca",
        developer: "Global Minds Corp",
        version: "3.0.2",
        downloadSize: "180 MB",
        inGameSize: "~320 MB",
        releaseDate: "20/06/2026",
        availableLanguagesCount: "Tüm ana diller",
        iconPreview:
          "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
        screenshotPreviews: [
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
        ],
      },
    },
    createdAt: "2026-06-20T08:30:00.000Z",
  },
];

// constants/index.ts

export interface NewsItem {
  id: string;
  slug: string; // Yangi qo'shilgan maydon
  gameId: string;
  gameTitle: string;
  isPublic: boolean;
  isRequested: boolean;
  createdAt: string;
  translations: {
    uz: { title: string; content: string; banners: string[] };
    ru: { title: string; content: string; banners: string[] };
    en: { title: string; content: string; banners: string[] };
    tr: { title: string; content: string; banners: string[] };
  };
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    slug: "yangi-yangilanish-katta-ozgarishlar-va-sovglar", // Slug namunasi
    gameId: "1",
    gameTitle: "Shadowbound: Chronicle",
    isPublic: true,
    isRequested: false,
    createdAt: "2026-07-01",
    translations: {
      uz: {
        title: "Yangi yangilanish: Katta o'zgarishlar va sovg'alar!",
        content:
          "Shadowbound o'yinida yangi mavsum boshlanmoqda. Ko'plab yangi xaritalar va qahramonlar qo'shildi.",
        banners: [
          "https://picsum.photos/seed/shadow1/800/450",
          "https://picsum.photos/seed/shadow2/800/450",
        ],
      },
      ru: {
        title: "Новое обновление: Большие изменения и подарки!",
        content:
          "В игре Shadowbound начинается новый сезон. Добавлено много новых карт и героев.",
        banners: ["https://picsum.photos/seed/shadow1/800/450"],
      },
      en: {
        title: "New Update: Huge Changes & Rewards!",
        content:
          "A new season is starting in Shadowbound. Many new maps and heroes have been added.",
        banners: ["https://picsum.photos/seed/shadow1/800/450"],
      },
      tr: {
        title: "Yeni Güncelleme: Büyük Değişiklikler ve Ödüller!",
        content:
          "Shadowbound'da yeni bir sezon başlıyor. Birçok yeni harita ve kahraman eklendi.",
        banners: ["https://picsum.photos/seed/shadow1/800/450"],
      },
    },
  },
  {
    id: "news-2",
    slug: "kiberpank-poygasi-uchun-maxsus-trrnir", // Slug namunasi
    gameId: "2",
    gameTitle: "Cyber Neon: Drift",
    isPublic: false,
    isRequested: false,
    createdAt: "2026-07-05",
    translations: {
      uz: {
        title: "Kiberpank poygasi uchun maxsus trrnir",
        content:
          "Yaqinda mukofot jamg'armasi 5000$ bo'lgan Cyber Neon trrniri start oladi.",
        banners: [
          "https://picsum.photos/seed/cyber1/800/450",
          "https://picsum.photos/seed/cyber2/800/450",
        ],
      },
      ru: {
        title: "Специальный турнир по киберпанк-гонкам",
        content: "Скоро стартует турнир Cyber Neon с призовым фондом $5000.",
        banners: ["https://picsum.photos/seed/cyber1/800/450"],
      },
      en: {
        title: "Special Tournament for Cyberpunk Racing",
        content:
          "Cyber Neon tournament with a $5000 prize pool is starting soon.",
        banners: ["https://picsum.photos/seed/cyber1/800/450"],
      },
      tr: {
        title: "Cyberpunk Yarışı İçin Özel trrnuva",
        content: "$5000 ödül havuzlu Cyber Neon trrnuvası yakında başlıyor.",
        banners: ["https://picsum.photos/seed/cyber1/800/450"],
      },
    },
  },
];

// --- USER REQUESTS (FOYDALANUVChI SO'ROVLARI) TIPI ---
export interface UserRequest {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  type: "game_suggestion" | "bug_report" | "partnership" | "other";
  subject: string;
  message: string;
  status: "pending" | "investigating" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

// --- MOCK FOYDALANUVChI SO'ROVLARI MA'LUMOTLARI ---
export const MOCK_USER_REQUESTS: UserRequest[] = [
  {
    id: "REQ-001",
    userName: "Asadbek Olimov",
    userEmail: "asadbek@example.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Asadbek",
    type: "game_suggestion",
    subject: "Yangi PUBG Mobile trrnir rejimini qo'shish",
    message:
      "Assalomu alaykum adminlar. Saytga PUBG Mobile bo'yicha yangi 1v1 va 2v2 reyting tizimli trrnirlarni qo'shish imkoni bormi? Ko'pchilik shuni kutyapti.",
    status: "pending",
    priority: "medium",
    createdAt: "2026-07-18 10:30",
  },
  {
    id: "REQ-002",
    userName: "Madina Axmedova",
    userEmail: "madina.dev@example.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Madina",
    type: "bug_report",
    subject: "Dark modeda o'yin kartalari matni ko'rinmayapti",
    message:
      "trngi rejimga (Dark mode) o'tgan paytda asosiy sahifadagi o'yinlar ro'yxatining ba'zi sarlavhalari text-slate-900 bo'lib qolgan, qora fonda umuman o'qib bo'lmayapti. Iltimos ko'rib chiqinglar.",
    status: "investigating",
    priority: "high",
    createdAt: "2026-07-17 18:45",
  },
  {
    id: "REQ-003",
    userName: "Diyorbek Karimov",
    userEmail: "diyor_media@example.com",
    type: "partnership",
    subject: "Telegram kanalimiz orqali hamkorlik va reklama",
    message:
      "Bizning 50K obunachiga ega geymerlar kanalimiz bor. Saytingiz bilan hamkorlikda haftalik trrnirlar tashkil qilib, uni reklama qilmoqchi edik. Shartlarni qayerda gaplashsak bo'ladi?",
    status: "resolved",
    priority: "low",
    createdAt: "2026-07-15 14:20",
  },
  {
    id: "REQ-004",
    userName: "Sardor Rahimov",
    userEmail: "sardor99@example.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sardor",
    type: "other",
    subject: "Akkauntim parolini tiklay olmayapman",
    message:
      "Emailimga parolni tiklash kodi kelmayapti. Spam papkasini ham tekshirdim, baribir yo'q. Akkauntimni tekshirib bera olasizlarmi?",
    status: "rejected",
    priority: "high",
    createdAt: "2026-07-14 09:15",
  },
  {
    id: "REQ-005",
    userName: "Javohir trrsunov",
    userEmail: "javohir_g@example.com",
    type: "game_suggestion",
    subject: "Valorant o'yinini requests bo'limiga qo'shish",
    message:
      "Admin trrnir arizalari bo'limiga Valorant o'yinini ham qo'shinglar, hozirda bu o'yin juda ommalashib boryapti, jamoalar talab qilmoqda.",
    status: "pending",
    priority: "medium",
    createdAt: "2026-07-18 12:00",
  },
];
