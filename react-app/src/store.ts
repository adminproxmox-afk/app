import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { categoryMap, categories, shopProductMap, slotOrder, starterWardrobeByGender, wardrobeOptionMap } from './data';
import type {
  CategoryId,
  Gender,
  PersistedAppState,
  ProfileState,
  PurchaseRecord,
  Reward,
  SettingsState,
  ShopState,
  ToastState,
  WardrobeSlot
} from './types';

type LegacyCategoryId = CategoryId | 'softskills';

type LegacyDb = {
  profile?: {
    name?: string;
    phone?: string;
    username?: string;
    email?: string;
    bio?: string;
    statusText?: string;
    gender?: string;
    avatar?: string;
    currentAvatar?: string;
    avatarImage?: string;
    coins?: number;
  };
  settings?: {
    darkMode?: boolean;
    notifications?: boolean;
    musicEnabled?: boolean;
    soundEnabled?: boolean;
    volume?: number;
    language?: string;
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
  shop?: {
    purchaseHistory?: Array<{ itemId?: string; price?: number; timestamp?: number; boughtAt?: number }>;
    dailyClaimCount?: number;
  };
};

interface AppStore extends PersistedAppState {
  ui: {
    toast: ToastState | null;
    gameSessionSeed: number;
  };
  setPage: (page: PersistedAppState['navigation']['page']) => void;
  setCategory: (categoryId: CategoryId) => void;
  setSubcategory: (subcategoryId: string) => void;
  updateProfile: (payload: Partial<ProfileState>) => void;
  updateSettings: (payload: Partial<SettingsState>) => void;
  setAvatarImage: (imageData: string | null) => void;
  resetPreferences: () => void;
  setGender: (gender: Gender) => void;
  equipWardrobe: (optionId: string) => void;
  buyWardrobe: (optionId: string) => boolean;
  buyProduct: (productId: string) => boolean;
  completeGame: (gameId: string, categoryId: CategoryId, reward: Reward) => void;
  bumpGameSession: () => void;
  clearToast: () => void;
  resetFoundation: () => void;
}

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

function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '') || 'player';
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

function getDefaultAvatarForGender(gender: Gender) {
  return gender === 'female' ? '👩‍🎓' : '👨‍🎓';
}

function isBuiltInAvatar(value: unknown) {
  const avatar = String(value || '').trim();
  return !avatar || avatar === '👨‍🎓' || avatar === '👩‍🎓';
}

function getLevelForXp(xp: number) {
  return Math.max(1, Math.floor(xp / 180) + 1);
}

function getDefaultSubcategory(categoryId: CategoryId) {
  return categoryMap[categoryId]?.subcategories[0]?.id || '';
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

function createPurchase(title: string, itemId: string, kind: PurchaseRecord['kind'], price: number): PurchaseRecord {
  return {
    id: `${itemId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    itemId,
    kind,
    price,
    timestamp: Date.now()
  };
}

function buildDefaultState(): PersistedAppState {
  const gender: Gender = 'male';
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

function readLegacyState(): Partial<PersistedAppState> {
  if (typeof window === 'undefined') return {};

  const raw = window.localStorage.getItem('miniAppDb');
  if (!raw) return {};

  try {
    const legacy = JSON.parse(raw) as LegacyDb;
    const gender = normalizeGender(legacy.profile?.gender);
    const starter = starterWardrobeByGender[gender];
    const legacySelected = legacy.character?.selected || {};
    const equipped = {
      skin: wardrobeOptionMap[legacySelected.skin || ''] ? String(legacySelected.skin) : starter.skin,
      hair: wardrobeOptionMap[legacySelected.hair || ''] ? String(legacySelected.hair) : starter.hair,
      shirt: wardrobeOptionMap[legacySelected.shirt || ''] ? String(legacySelected.shirt) : starter.shirt,
      pants: wardrobeOptionMap[legacySelected.pants || ''] ? String(legacySelected.pants) : starter.pants,
      shoes: wardrobeOptionMap[legacySelected.shoes || ''] ? String(legacySelected.shoes) : starter.shoes,
      aura: wardrobeOptionMap[legacySelected.extra || ''] ? String(legacySelected.extra) : starter.aura
    };

    const legacyPurchases = Array.isArray(legacy.shop?.purchaseHistory)
      ? legacy.shop.purchaseHistory
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
          .filter(Boolean) as PurchaseRecord[]
      : [];

    const categoryScores = normalizeCategoryScores(legacy.progress?.categoryScores);
    const favoriteCategory = legacy.progress?.favoriteCategory
      ? mapLegacyCategoryId(legacy.progress.favoriteCategory)
      : getFavoriteCategory(categoryScores);
    const xp = Number(legacy.progress?.xp || 0);
    const avatarImage = String(legacy.profile?.avatarImage || '').trim();
    const avatar = String(legacy.profile?.currentAvatar || legacy.profile?.avatar || '').trim() || getDefaultAvatarForGender(gender);

    return {
      navigation: {
        page: 'home',
        selectedCategory: favoriteCategory,
        selectedSubcategory: getDefaultSubcategory(favoriteCategory)
      },
      profile: {
        name: legacy.profile?.name || 'Авантюрист',
        phone: legacy.profile?.phone || '+380',
        username: legacy.profile?.username || slugifyName(legacy.profile?.name || 'adventurer'),
        email: String(legacy.profile?.email || '').trim().toLowerCase(),
        bio: legacy.profile?.bio || 'Migrated from legacy profile',
        status: legacy.profile?.statusText || 'Online',
        avatar: avatarImage ? getDefaultAvatarForGender(gender) : avatar,
        avatarImage,
        badge: 'Starter',
        level: getLevelForXp(xp)
      },
      character: {
        gender,
        equipped,
        ownedWardrobe: mergeOwnedWardrobe(Object.values(starter), legacy.character?.owned, Object.values(equipped))
      },
      shop: {
        coins: Number(legacy.profile?.coins || 125),
        ownedProducts: [],
        purchases: legacyPurchases.slice(0, 12),
        xpBoosts: 0
      },
      progress: {
        xp,
        gamesPlayed: Number(legacy.progress?.gamesPlayed || 0),
        streak: Math.max(1, Number(legacy.shop?.dailyClaimCount || 1)),
        favoriteCategory,
        categoryScores,
        completedGames: {}
      },
      settings: {
        darkMode: legacy.settings?.darkMode !== false,
        notifications: legacy.settings?.notifications !== false,
        musicEnabled: legacy.settings?.musicEnabled !== false,
        soundEnabled: legacy.settings?.soundEnabled !== false,
        volume: normalizeVolume(legacy.settings?.volume),
        language: normalizeLanguage(legacy.settings?.language)
      }
    };
  } catch (error) {
    return {};
  }
}

function mergePersistedState<T extends PersistedAppState | AppStore>(currentState: T, persistedState: unknown): T {
  const persisted = persistedState && typeof persistedState === 'object'
    ? persistedState as Partial<PersistedAppState>
    : {};

  const mergedCharacter = {
    ...currentState.character,
    ...(persisted.character || {}),
    equipped: {
      ...currentState.character.equipped,
      ...(persisted.character?.equipped || {})
    },
    ownedWardrobe: mergeOwnedWardrobe(
      currentState.character.ownedWardrobe,
      persisted.character?.ownedWardrobe,
      Object.values(persisted.character?.equipped || {})
    )
  };

  const mergedProgressScores = normalizeCategoryScores({
    ...currentState.progress.categoryScores,
    ...(persisted.progress?.categoryScores || {})
  });

  const favoriteCategory = persisted.progress?.favoriteCategory
    ? mapLegacyCategoryId(persisted.progress.favoriteCategory)
    : getFavoriteCategory(mergedProgressScores);

  const mergedProfile = {
    ...currentState.profile,
    ...(persisted.profile || {}),
    name: String(persisted.profile?.name || currentState.profile.name).trim() || currentState.profile.name,
    phone: String(persisted.profile?.phone || currentState.profile.phone || '').trim(),
    username: slugifyName(String(
      persisted.profile?.username
      || persisted.profile?.name
      || currentState.profile.username
      || currentState.profile.name
    )),
    email: String(persisted.profile?.email || currentState.profile.email || '').trim().toLowerCase(),
    bio: String(persisted.profile?.bio || currentState.profile.bio || '').trim() || currentState.profile.bio,
    status: String(persisted.profile?.status || currentState.profile.status || '').trim() || 'Online',
    avatar: String(persisted.profile?.avatar || currentState.profile.avatar || '').trim() || getDefaultAvatarForGender(mergedCharacter.gender),
    avatarImage: String(persisted.profile?.avatarImage || currentState.profile.avatarImage || '').trim(),
    badge: String(persisted.profile?.badge || currentState.profile.badge || '').trim() || 'Starter',
    level: Number(persisted.profile?.level || currentState.profile.level || 1)
  };

  if (!mergedProfile.avatarImage && isBuiltInAvatar(mergedProfile.avatar)) {
    mergedProfile.avatar = getDefaultAvatarForGender(mergedCharacter.gender);
  }

  return {
    ...currentState,
    ...persisted,
    navigation: {
      ...currentState.navigation,
      ...(persisted.navigation || {}),
      selectedCategory: persisted.navigation?.selectedCategory
        ? mapLegacyCategoryId(persisted.navigation.selectedCategory)
        : currentState.navigation.selectedCategory,
      selectedSubcategory: String(
        persisted.navigation?.selectedSubcategory
        || currentState.navigation.selectedSubcategory
        || getDefaultSubcategory(favoriteCategory)
      )
    },
    profile: mergedProfile,
    character: mergedCharacter,
    shop: {
      ...currentState.shop,
      ...(persisted.shop || {}),
      coins: Number(persisted.shop?.coins ?? currentState.shop.coins),
      ownedProducts: Array.from(new Set(persisted.shop?.ownedProducts || currentState.shop.ownedProducts)),
      purchases: Array.isArray(persisted.shop?.purchases) ? persisted.shop.purchases : currentState.shop.purchases,
      xpBoosts: Number(persisted.shop?.xpBoosts ?? currentState.shop.xpBoosts)
    },
    progress: {
      ...currentState.progress,
      ...(persisted.progress || {}),
      categoryScores: mergedProgressScores,
      completedGames: {
        ...currentState.progress.completedGames,
        ...(persisted.progress?.completedGames || {})
      },
      favoriteCategory
    },
    settings: {
      ...currentState.settings,
      ...(persisted.settings || {}),
      darkMode: persisted.settings?.darkMode ?? currentState.settings.darkMode,
      notifications: persisted.settings?.notifications ?? currentState.settings.notifications,
      musicEnabled: persisted.settings?.musicEnabled ?? currentState.settings.musicEnabled,
      soundEnabled: persisted.settings?.soundEnabled ?? currentState.settings.soundEnabled,
      volume: normalizeVolume(persisted.settings?.volume ?? currentState.settings.volume),
      language: normalizeLanguage(persisted.settings?.language ?? currentState.settings.language)
    }
  };
}

function createInitialState(): PersistedAppState {
  return mergePersistedState(buildDefaultState(), readLegacyState());
}

function withToast(
  set: (updater: (state: AppStore) => Partial<AppStore>) => void,
  toast: Omit<ToastState, 'id'>
) {
  set((state) => ({
    ui: {
      ...state.ui,
      toast: {
        id: Date.now(),
        ...toast
      }
    }
  }));
}

const initialState = createInitialState();

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      ui: {
        toast: null,
        gameSessionSeed: 0
      },
      setPage: (page) => set((state) => ({
        navigation: {
          ...state.navigation,
          page
        }
      })),
      setCategory: (categoryId) => set((state) => ({
        navigation: {
          ...state.navigation,
          selectedCategory: categoryId,
          selectedSubcategory: getDefaultSubcategory(categoryId)
        }
      })),
      setSubcategory: (subcategoryId) => {
        const categoryId = get().navigation.selectedCategory;
        if (!categoryMap[categoryId]?.subcategories.some((subcategory) => subcategory.id === subcategoryId)) {
          return;
        }

        set((state) => ({
          navigation: {
            ...state.navigation,
            selectedSubcategory: subcategoryId
          }
        }));
      },
      updateProfile: (payload) => {
        set((state) => {
          const nextName = String(payload.name ?? state.profile.name).trim() || state.profile.name;
          return {
            profile: {
              ...state.profile,
              ...payload,
              name: nextName,
              phone: String(payload.phone ?? state.profile.phone ?? '').trim(),
              username: slugifyName(String(payload.username ?? state.profile.username ?? nextName)),
              email: String(payload.email ?? state.profile.email ?? '').trim().toLowerCase(),
              bio: String(payload.bio ?? state.profile.bio ?? '').trim(),
              status: String(payload.status ?? state.profile.status ?? '').trim() || 'Online',
              level: getLevelForXp(state.progress.xp)
            }
          };
        });

        withToast(set, {
          tone: 'success',
          title: 'Профіль оновлено',
          message: 'Legacy-поля профілю вже працюють у React foundation.'
        });
      },
      updateSettings: (payload) => set((state) => ({
        settings: {
          ...state.settings,
          ...payload,
          volume: normalizeVolume(payload.volume ?? state.settings.volume),
          language: normalizeLanguage(payload.language ?? state.settings.language)
        }
      })),
      setAvatarImage: (imageData) => {
        const cleanedImage = String(imageData || '').trim();

        set((state) => ({
          profile: {
            ...state.profile,
            avatar: getDefaultAvatarForGender(state.character.gender),
            avatarImage: cleanedImage
          }
        }));

        withToast(set, {
          tone: 'success',
          title: cleanedImage ? 'Аватар оновлено' : 'Аватар скинуто',
          message: cleanedImage
            ? 'Нове фото профілю збережено у foundation.'
            : 'Повернуто стандартний аватар профілю.'
        });
      },
      resetPreferences: () => set((state) => ({
        settings: {
          ...DEFAULT_SETTINGS
        },
        ui: {
          ...state.ui,
          toast: {
            id: Date.now(),
            tone: 'info',
            title: 'Параметри скинуто',
            message: 'Тему, мову й системні перемикачі повернуто до стандартних значень.'
          }
        }
      })),
      setGender: (gender) => set((state) => {
        const starter = starterWardrobeByGender[gender];
        const ownedWardrobe = mergeOwnedWardrobe(state.character.ownedWardrobe, Object.values(starter));
        const nextEquipped = slotOrder.reduce((equipped, slot) => {
          const currentId = state.character.equipped[slot];
          equipped[slot] = ownedWardrobe.includes(currentId) ? currentId : starter[slot];
          return equipped;
        }, {} as Record<WardrobeSlot, string>);

        return {
          character: {
            gender,
            ownedWardrobe,
            equipped: nextEquipped
          },
          profile: {
            ...state.profile,
            avatar: state.profile.avatarImage ? state.profile.avatar : getDefaultAvatarForGender(gender)
          }
        };
      }),
      equipWardrobe: (optionId) => {
        const option = wardrobeOptionMap[optionId];
        if (!option) return;

        const state = get();
        if (!state.character.ownedWardrobe.includes(optionId)) {
          withToast(set, {
            tone: 'warning',
            title: 'Спочатку покупка',
            message: 'Цей предмет ще не куплений у магазині.'
          });
          return;
        }

        set((current) => ({
          character: {
            ...current.character,
            equipped: {
              ...current.character.equipped,
              [option.slot]: optionId
            }
          }
        }));

        withToast(set, {
          tone: 'info',
          title: 'Обрано',
          message: `${option.label} тепер активний у персонажа.`
        });
      },
      buyWardrobe: (optionId) => {
        const option = wardrobeOptionMap[optionId];
        if (!option) return false;

        const state = get();
        if (state.character.ownedWardrobe.includes(optionId)) {
          set((current) => ({
            character: {
              ...current.character,
              equipped: {
                ...current.character.equipped,
                [option.slot]: optionId
              }
            }
          }));

          withToast(set, {
            tone: 'info',
            title: 'Вже куплено',
            message: `${option.label} вже є у гардеробі.`
          });
          return false;
        }

        if (state.shop.coins < option.price) {
          withToast(set, {
            tone: 'warning',
            title: 'Недостатньо монет',
            message: `Потрібно ${option.price}, а зараз є ${state.shop.coins}.`
          });
          return false;
        }

        set((current) => ({
          character: {
            ...current.character,
            ownedWardrobe: mergeOwnedWardrobe(current.character.ownedWardrobe, [optionId]),
            equipped: {
              ...current.character.equipped,
              [option.slot]: optionId
            }
          },
          shop: {
            ...current.shop,
            coins: current.shop.coins - option.price,
            purchases: [createPurchase(option.label, optionId, 'wardrobe', option.price), ...current.shop.purchases].slice(0, 20)
          }
        }));

        withToast(set, {
          tone: 'success',
          title: 'Покупка успішна',
          message: `${option.label} одразу застосовано до персонажа.`
        });

        return true;
      },
      buyProduct: (productId) => {
        const product = shopProductMap[productId];
        if (!product) return false;

        const state = get();
        const alreadyOwned = state.shop.ownedProducts.includes(productId);
        if (!product.repeatable && alreadyOwned) {
          withToast(set, {
            tone: 'info',
            title: 'Вже активовано',
            message: `${product.title} уже доступний у профілі.`
          });
          return false;
        }

        if (state.shop.coins < product.price) {
          withToast(set, {
            tone: 'warning',
            title: 'Недостатньо монет',
            message: `Потрібно ${product.price}, а зараз є ${state.shop.coins}.`
          });
          return false;
        }

        set((current) => {
          const nextOwnedProducts = product.repeatable
            ? current.shop.ownedProducts
            : Array.from(new Set([...current.shop.ownedProducts, productId]));
          const nextShop: ShopState = {
            ...current.shop,
            coins: current.shop.coins - product.price,
            ownedProducts: nextOwnedProducts,
            purchases: [createPurchase(product.title, productId, 'product', product.price), ...current.shop.purchases].slice(0, 20),
            xpBoosts: current.shop.xpBoosts + (productId === 'xp-boost' ? 1 : 0)
          };

          return {
            profile: {
              ...current.profile,
              badge: productId === 'mentor-badge' ? 'Mentor' : current.profile.badge
            },
            progress: {
              ...current.progress,
              streak: productId === 'streak-core' ? current.progress.streak + 2 : current.progress.streak
            },
            shop: nextShop
          };
        });

        withToast(set, {
          tone: 'success',
          title: 'Магазин оновлено',
          message: `${product.title} додано до вашого прогресу.`
        });

        return true;
      },
      completeGame: (gameId, categoryId, reward) => {
        const state = get();
        const boostActive = state.shop.xpBoosts > 0;
        const xpGain = reward.xp * (boostActive ? 2 : 1);
        const nextXp = state.progress.xp + xpGain;
        const nextCategoryScores = {
          ...state.progress.categoryScores,
          [categoryId]: state.progress.categoryScores[categoryId] + xpGain
        };

        set((current) => ({
          profile: {
            ...current.profile,
            level: getLevelForXp(nextXp)
          },
          shop: {
            ...current.shop,
            coins: current.shop.coins + reward.coins,
            xpBoosts: boostActive ? Math.max(0, current.shop.xpBoosts - 1) : current.shop.xpBoosts
          },
          progress: {
            ...current.progress,
            xp: nextXp,
            gamesPlayed: current.progress.gamesPlayed + 1,
            streak: current.progress.streak + 1,
            categoryScores: nextCategoryScores,
            favoriteCategory: getFavoriteCategory(nextCategoryScores),
            completedGames: {
              ...current.progress.completedGames,
              [gameId]: (current.progress.completedGames[gameId] || 0) + 1
            }
          }
        }));

        withToast(set, {
          tone: 'success',
          title: 'Забіг завершено',
          message: `+${xpGain} XP і +${reward.coins} монет${boostActive ? ' з активним boost' : ''}.`
        });
      },
      bumpGameSession: () => set((state) => ({
        ui: {
          ...state.ui,
          gameSessionSeed: state.ui.gameSessionSeed + 1
        }
      })),
      clearToast: () => set((state) => ({
        ui: {
          ...state.ui,
          toast: null
        }
      })),
      resetFoundation: () => set(() => ({
        ...createInitialState(),
        ui: {
          toast: {
            id: Date.now(),
            tone: 'info',
            title: 'Основа скинута',
            message: 'Стан React foundation повернуто до стартового.'
          },
          gameSessionSeed: 0
        }
      }))
    }),
    {
      name: 'skill-play-foundation-v1',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        navigation: state.navigation,
        profile: state.profile,
        character: state.character,
        shop: state.shop,
        progress: state.progress,
        settings: state.settings
      }),
      merge: (persistedState, currentState) => mergePersistedState(currentState, persistedState)
    }
  )
);
