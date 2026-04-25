import { categories, categoryMap, starterWardrobeByGender, wardrobeOptionMap } from './data';
import type { CategoryId, Gender, PersistedAppState, PurchaseRecord, SettingsState } from './types';

export type AuthProvider = 'local' | 'google' | 'telegram' | 'discord' | 'facebook';
export type AuthMode = 'signin' | 'signup';

export type BrowserAuthUser = {
  id: string;
  login: string;
  email: string;
  password: string;
  providers: AuthProvider[];
  lastAuthMethod: AuthProvider;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  workspace: PersistedAppState;
};

export type BrowserAuthState = {
  mode: AuthMode;
  currentUserLogin: string | null;
  users: BrowserAuthUser[];
};

export type BrowserAuthResult =
  | { ok: true }
  | { ok: false; code: 'MISSING_FIELDS' | 'INVALID_LOGIN' | 'INVALID_EMAIL' | 'WEAK_PASSWORD' | 'LOGIN_EXISTS' | 'EMAIL_EXISTS' | 'INVALID_CREDENTIALS' | 'USE_BROWSER_ACCOUNT'; providers?: AuthProvider[] };

type LegacyCategoryId = CategoryId | 'softskills';

type LegacyUser = {
  id?: string;
  login?: string;
  email?: string;
  password?: string;
  authProvider?: string;
  authProviders?: string[];
  lastAuthMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  profile?: {
    name?: string;
    phone?: string;
    username?: string;
    email?: string;
    bio?: string;
    gender?: string;
    statusText?: string;
    avatarImage?: string;
    avatar?: string;
    currentAvatar?: string;
    coins?: number;
  };
  progress?: {
    xp?: number;
    gamesPlayed?: number;
    favoriteCategory?: LegacyCategoryId;
    categoryScores?: Partial<Record<LegacyCategoryId, number>>;
  };
  character?: {
    selected?: Partial<Record<'skin' | 'hair' | 'shirt' | 'pants' | 'shoes' | 'extra', string>>;
    owned?: string[];
  };
};

type LegacyDb = {
  session?: {
    user?: string | null;
  };
  users?: LegacyUser[];
  profile?: LegacyUser['profile'];
  settings?: {
    darkMode?: boolean;
    notifications?: boolean;
    musicEnabled?: boolean;
    soundEnabled?: boolean;
    volume?: number;
    language?: string;
  };
  progress?: LegacyUser['progress'];
  character?: LegacyUser['character'];
  shop?: {
    purchaseHistory?: Array<{ itemId?: string; price?: number; timestamp?: number; boughtAt?: number }>;
    dailyClaimCount?: number;
  };
};

const AUTH_STORAGE_KEY = 'skill-play-auth-v1';

const CATEGORY_SCORES_TEMPLATE = categories.reduce((scores, category) => {
  scores[category.id] = 0;
  return scores;
}, {} as Record<CategoryId, number>);

const DEFAULT_SETTINGS: SettingsState = {
  darkMode: true,
  notifications: true,
  musicEnabled: true,
  soundEnabled: true,
  volume: 70,
  language: 'uk'
};

export function slugifyName(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '') || 'player';
}

export function normalizeAuthProvider(value: unknown): AuthProvider {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'google' || normalized === 'telegram' || normalized === 'discord' || normalized === 'facebook') {
    return normalized;
  }
  return 'local';
}

export function normalizeAuthProviders(values: unknown): AuthProvider[] {
  const list = Array.isArray(values) ? values : [values];
  const normalized = list
    .map((value) => normalizeAuthProvider(value))
    .filter(Boolean);

  return Array.from(new Set(normalized.length ? normalized : ['local']));
}

export function isValidLoginValue(value: string) {
  const normalized = String(value || '').trim();
  return /^[a-zа-яіїєґ0-9_.-]{3,20}$/i.test(normalized) && !normalized.includes('@');
}

export function isValidEmailValue(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());
}

export function isStrongPassword(value: string) {
  const password = String(value || '');
  return password.length >= 8 && /[A-ZА-ЯІЇЄҐ]/.test(password) && /\d/.test(password);
}

export function getDefaultAvatarForGender(gender: Gender) {
  return gender === 'female' ? '👩‍🎓' : '👨‍🎓';
}

function normalizeGender(value: unknown): Gender {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'female' || normalized === 'жінка' ? 'female' : 'male';
}

function normalizeLanguage(value: unknown): SettingsState['language'] {
  return String(value || '').trim().toLowerCase() === 'en' ? 'en' : 'uk';
}

function normalizeVolume(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_SETTINGS.volume;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function mapLegacyCategoryId(value: unknown): CategoryId {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'economy' || normalized === 'agro' || normalized === 'soft' || normalized === 'it') {
    return normalized;
  }
  if (normalized === 'softskills') return 'soft';
  return 'it';
}

function normalizeCategoryScores(input?: Partial<Record<string, number>>) {
  const scores = { ...CATEGORY_SCORES_TEMPLATE };

  Object.entries(input || {}).forEach(([key, value]) => {
    const mappedKey = mapLegacyCategoryId(key);
    scores[mappedKey] += Number(value || 0);
  });

  return scores;
}

function mergeOwnedWardrobe(...groups: Array<string[] | undefined>) {
  return Array.from(
    new Set(
      groups
        .flatMap((group) => group || [])
        .filter((id) => Boolean(wardrobeOptionMap[id]))
    )
  );
}

function getFavoriteCategory(categoryScores: Record<CategoryId, number>): CategoryId {
  return categories.reduce((best, category) => (
    categoryScores[category.id] > categoryScores[best] ? category.id : best
  ), 'it' as CategoryId);
}

function getDefaultSubcategory(categoryId: CategoryId) {
  return categoryMap[categoryId]?.subcategories[0]?.id || '';
}

function getLevelForXp(xp: number) {
  return Math.max(1, Math.floor(xp / 180) + 1);
}

export function buildDefaultWorkspace(gender: Gender = 'male'): PersistedAppState {
  const starter = starterWardrobeByGender[gender];
  const ownedWardrobe = mergeOwnedWardrobe(Object.values(starter));

  return {
    navigation: {
      page: 'home',
      selectedCategory: 'it',
      selectedSubcategory: getDefaultSubcategory('it')
    },
    profile: {
      name: 'Авантюрист',
      phone: '+380',
      username: 'adventurer',
      email: '',
      bio: 'React foundation pilot',
      status: 'Online',
      avatar: getDefaultAvatarForGender(gender),
      avatarImage: '',
      badge: 'Starter',
      level: 1
    },
    character: {
      gender,
      equipped: { ...starter },
      ownedWardrobe
    },
    shop: {
      coins: 125,
      ownedProducts: [],
      purchases: [],
      xpBoosts: 0
    },
    progress: {
      xp: 0,
      gamesPlayed: 0,
      streak: 1,
      favoriteCategory: 'it',
      categoryScores: { ...CATEGORY_SCORES_TEMPLATE },
      completedGames: {}
    },
    settings: { ...DEFAULT_SETTINGS }
  };
}

export function cloneWorkspace(workspace: PersistedAppState): PersistedAppState {
  return JSON.parse(JSON.stringify(workspace));
}

export function hasMeaningfulWorkspace(workspace: PersistedAppState) {
  return (
    workspace.profile.name !== 'Авантюрист'
    || Boolean(workspace.profile.email)
    || workspace.progress.xp > 0
    || workspace.shop.purchases.length > 0
    || workspace.shop.ownedProducts.length > 0
    || workspace.shop.coins !== 125
    || workspace.character.ownedWardrobe.length > 6
  );
}

function mapLegacyPurchaseHistory(entries?: Array<{ itemId?: string; price?: number; timestamp?: number; boughtAt?: number }>) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry) => {
      const itemId = String(entry?.itemId || '');
      const option = wardrobeOptionMap[itemId];
      if (!option) return null;
      return {
        id: `${itemId}_${entry?.timestamp || entry?.boughtAt || Date.now()}`,
        title: option.label,
        itemId,
        kind: 'legacy' as const,
        price: Number(entry?.price || option.price || 0),
        timestamp: Number(entry?.timestamp || entry?.boughtAt || Date.now())
      };
    })
    .filter(Boolean) as PurchaseRecord[];
}

function buildLegacyWorkspace(input: {
  profile?: LegacyDb['profile'] | LegacyUser['profile'];
  progress?: LegacyDb['progress'] | LegacyUser['progress'];
  character?: LegacyDb['character'] | LegacyUser['character'];
  settings?: LegacyDb['settings'];
  purchases?: PurchaseRecord[];
  streak?: number;
}) {
  const gender = normalizeGender(input.profile?.gender);
  const starter = starterWardrobeByGender[gender];
  const legacySelected = input.character?.selected || {};
  const equipped = {
    skin: wardrobeOptionMap[legacySelected.skin || ''] ? String(legacySelected.skin) : starter.skin,
    hair: wardrobeOptionMap[legacySelected.hair || ''] ? String(legacySelected.hair) : starter.hair,
    shirt: wardrobeOptionMap[legacySelected.shirt || ''] ? String(legacySelected.shirt) : starter.shirt,
    pants: wardrobeOptionMap[legacySelected.pants || ''] ? String(legacySelected.pants) : starter.pants,
    shoes: wardrobeOptionMap[legacySelected.shoes || ''] ? String(legacySelected.shoes) : starter.shoes,
    aura: wardrobeOptionMap[legacySelected.extra || ''] ? String(legacySelected.extra) : starter.aura
  };
  const categoryScores = normalizeCategoryScores(input.progress?.categoryScores);
  const favoriteCategory = input.progress?.favoriteCategory
    ? mapLegacyCategoryId(input.progress.favoriteCategory)
    : getFavoriteCategory(categoryScores);
  const xp = Number(input.progress?.xp || 0);
  const avatarImage = String(input.profile?.avatarImage || '').trim();
  const avatar = String(input.profile?.currentAvatar || input.profile?.avatar || '').trim() || getDefaultAvatarForGender(gender);

  return {
    navigation: {
      page: 'home',
      selectedCategory: favoriteCategory,
      selectedSubcategory: getDefaultSubcategory(favoriteCategory)
    },
    profile: {
      name: String(input.profile?.name || 'Авантюрист').trim() || 'Авантюрист',
      phone: String(input.profile?.phone || '+380').trim() || '+380',
      username: slugifyName(String(input.profile?.username || input.profile?.name || 'adventurer')),
      email: String(input.profile?.email || '').trim().toLowerCase(),
      bio: String(input.profile?.bio || 'Migrated from legacy profile').trim() || 'Migrated from legacy profile',
      status: String(input.profile?.statusText || 'Online').trim() || 'Online',
      avatar: avatarImage ? getDefaultAvatarForGender(gender) : avatar,
      avatarImage,
      badge: 'Starter',
      level: getLevelForXp(xp)
    },
    character: {
      gender,
      equipped,
      ownedWardrobe: mergeOwnedWardrobe(Object.values(starter), input.character?.owned, Object.values(equipped))
    },
    shop: {
      coins: Number(input.profile?.coins || 125),
      ownedProducts: [],
      purchases: (input.purchases || []).slice(0, 20),
      xpBoosts: 0
    },
    progress: {
      xp,
      gamesPlayed: Number(input.progress?.gamesPlayed || 0),
      streak: Math.max(1, Number(input.streak || 1)),
      favoriteCategory,
      categoryScores,
      completedGames: {}
    },
    settings: {
      darkMode: input.settings?.darkMode !== false,
      notifications: input.settings?.notifications !== false,
      musicEnabled: input.settings?.musicEnabled !== false,
      soundEnabled: input.settings?.soundEnabled !== false,
      volume: normalizeVolume(input.settings?.volume),
      language: normalizeLanguage(input.settings?.language)
    }
  } satisfies PersistedAppState;
}

export function createAuthUserRecord(input: {
  login: string;
  email?: string;
  password?: string;
  providers?: AuthProvider[];
  lastAuthMethod?: AuthProvider;
  workspace: PersistedAppState;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}) {
  const login = String(input.login || '').trim().toLowerCase() || slugifyName(input.workspace.profile.username || input.workspace.profile.name);
  const now = new Date().toISOString();
  const providers = normalizeAuthProviders(input.providers || input.lastAuthMethod || (input.password ? 'local' : 'local'));

  return {
    id: String(input.id || `auth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    login,
    email: String(input.email || input.workspace.profile.email || '').trim().toLowerCase(),
    password: String(input.password || ''),
    providers,
    lastAuthMethod: normalizeAuthProvider(input.lastAuthMethod || providers[0]),
    createdAt: String(input.createdAt || now),
    updatedAt: String(input.updatedAt || now),
    lastLoginAt: input.lastLoginAt || null,
    workspace: cloneWorkspace(input.workspace)
  } satisfies BrowserAuthUser;
}

export function findUserByIdentity(users: BrowserAuthUser[], identity: string) {
  const normalized = String(identity || '').trim().toLowerCase();
  return users.find((user) => (
    user.login.toLowerCase() === normalized
    || String(user.email || '').toLowerCase() === normalized
  ));
}

function readLegacyDb() {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem('miniAppDb');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LegacyDb;
  } catch (error) {
    return null;
  }
}

function importLegacyAuth(fallbackWorkspace: PersistedAppState): BrowserAuthState {
  const legacy = readLegacyDb();
  if (!legacy) {
    if (hasMeaningfulWorkspace(fallbackWorkspace)) {
      const imported = createAuthUserRecord({
        login: slugifyName(fallbackWorkspace.profile.username || fallbackWorkspace.profile.name || fallbackWorkspace.profile.email || 'player'),
        email: fallbackWorkspace.profile.email,
        password: '',
        providers: ['local'],
        lastAuthMethod: 'local',
        workspace: fallbackWorkspace
      });
      return {
        mode: 'signin',
        currentUserLogin: imported.login,
        users: [imported]
      };
    }

    return {
      mode: 'signup',
      currentUserLogin: null,
      users: []
    };
  }

  const users = Array.isArray(legacy.users)
    ? legacy.users
        .map((user) => {
          const login = String(user.login || '').trim().toLowerCase();
          if (!login) return null;

          const workspace = login === String(legacy.session?.user || '').trim().toLowerCase()
            ? fallbackWorkspace
            : buildLegacyWorkspace({
              profile: user.profile,
              progress: user.progress,
              character: user.character,
              settings: legacy.settings,
              purchases: [],
              streak: 1
            });

          return createAuthUserRecord({
            id: user.id,
            login,
            email: user.email,
            password: user.password,
            providers: normalizeAuthProviders(user.authProviders || user.authProvider || user.lastAuthMethod || (user.password ? 'local' : 'local')),
            lastAuthMethod: normalizeAuthProvider(user.lastAuthMethod || user.authProvider),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt || null,
            workspace
          });
        })
        .filter(Boolean) as BrowserAuthUser[]
    : [];

  if (!users.length && hasMeaningfulWorkspace(fallbackWorkspace)) {
    const imported = createAuthUserRecord({
      login: slugifyName(fallbackWorkspace.profile.username || fallbackWorkspace.profile.name || fallbackWorkspace.profile.email || 'player'),
      email: fallbackWorkspace.profile.email,
      password: '',
      providers: ['local'],
      lastAuthMethod: 'local',
      workspace: fallbackWorkspace
    });
    return {
      mode: 'signin',
      currentUserLogin: imported.login,
      users: [imported]
    };
  }

  const currentUserLogin = users.some((user) => user.login === String(legacy.session?.user || '').trim().toLowerCase())
    ? String(legacy.session?.user || '').trim().toLowerCase()
    : null;

  if (currentUserLogin) {
    return {
      mode: 'signin',
      currentUserLogin,
      users
    };
  }

  return {
    mode: users.length ? 'signin' : 'signup',
    currentUserLogin: null,
    users
  };
}

function normalizeAuthState(state: BrowserAuthState): BrowserAuthState {
  const users = Array.isArray(state.users)
    ? state.users.map((user) => createAuthUserRecord(user))
    : [];
  const currentUserLogin = users.some((user) => user.login === state.currentUserLogin)
    ? state.currentUserLogin
    : null;

  return {
    mode: users.length ? (state.mode === 'signup' ? 'signup' : 'signin') : 'signup',
    currentUserLogin,
    users
  };
}

export function readAuthState(fallbackWorkspace: PersistedAppState) {
  if (typeof window === 'undefined') {
    return importLegacyAuth(fallbackWorkspace);
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return importLegacyAuth(fallbackWorkspace);

  try {
    return normalizeAuthState(JSON.parse(raw) as BrowserAuthState);
  } catch (error) {
    return importLegacyAuth(fallbackWorkspace);
  }
}

export function writeAuthState(state: BrowserAuthState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}
