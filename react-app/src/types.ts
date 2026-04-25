export type AppPage = 'home' | 'avatar' | 'shop' | 'games' | 'settings';
export type Gender = 'male' | 'female';
export type CategoryId = 'it' | 'economy' | 'soft' | 'agro';
export type WardrobeSlot = 'skin' | 'hair' | 'shirt' | 'pants' | 'shoes' | 'aura';
export type WardrobeTone = 'starter' | 'common' | 'rare' | 'epic';
export type ProductKind = 'boost' | 'badge' | 'utility';
export type ToastTone = 'success' | 'warning' | 'info';
export type LanguageCode = 'uk' | 'en';
export type LessonStep = 'lecture' | 'logic' | 'practice';

export interface WardrobeOption {
  id: string;
  slot: WardrobeSlot;
  label: string;
  description: string;
  color: string;
  price: number;
  tone: WardrobeTone;
  starterFor?: Gender[];
}

export interface ShopProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  kind: ProductKind;
  repeatable: boolean;
  accent: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  text: string;
  tag: string;
  xp: number;
  coins: number;
  difficulty: 'easy' | 'mid' | 'hard';
  loopLabel: string;
}

export interface SubcategoryDefinition {
  id: string;
  title: string;
  intro: string;
  games: GameDefinition[];
}

export interface CategoryDefinition {
  id: CategoryId;
  title: string;
  accent: string;
  description: string;
  subcategories: SubcategoryDefinition[];
}

export interface GameWithMeta extends GameDefinition {
  categoryId: CategoryId;
  categoryTitle: string;
  subcategoryId: string;
  subcategoryTitle: string;
  accent: string;
}

export interface LessonLecture {
  summary: string;
  points: string[];
  result: string;
}

export interface LessonLogicCard {
  title: string;
  lines: string[];
}

export interface LessonLogicBlueprint {
  summary: string;
  cards: LessonLogicCard[];
}

export interface LessonPracticeOption {
  id: string;
  code: string;
}

export interface LessonPracticeTask {
  id: string;
  title: string;
  lead: string;
  lines: string[];
  options: LessonPracticeOption[];
  correctOptionId: string;
  success: string;
  hint: string;
}

export interface LessonPracticeBlueprint {
  label: string;
  title: string;
  lead: string;
  cards: LessonLogicCard[];
  tasks: LessonPracticeTask[];
}

export interface Reward {
  xp: number;
  coins: number;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  kind: 'wardrobe' | 'product' | 'legacy';
  price: number;
  timestamp: number;
  title: string;
}

export interface ToastState {
  id: number;
  tone: ToastTone;
  title: string;
  message: string;
}

export interface ProfileState {
  name: string;
  phone: string;
  username: string;
  email: string;
  bio: string;
  status: string;
  avatar: string;
  avatarImage: string;
  badge: string;
  level: number;
}

export interface CharacterState {
  gender: Gender;
  equipped: Record<WardrobeSlot, string>;
  ownedWardrobe: string[];
}

export interface ShopState {
  coins: number;
  ownedProducts: string[];
  purchases: PurchaseRecord[];
  xpBoosts: number;
}

export interface ProgressState {
  xp: number;
  gamesPlayed: number;
  streak: number;
  favoriteCategory: CategoryId;
  categoryScores: Record<CategoryId, number>;
  completedGames: Record<string, number>;
}

export interface NavigationState {
  page: AppPage;
  selectedCategory: CategoryId;
  selectedSubcategory: string;
}

export interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  musicEnabled: boolean;
  soundEnabled: boolean;
  volume: number;
  language: LanguageCode;
}

export interface UiState {
  toast: ToastState | null;
  gameSessionSeed: number;
}

export interface PersistedAppState {
  navigation: NavigationState;
  profile: ProfileState;
  character: CharacterState;
  shop: ShopState;
  progress: ProgressState;
  settings: SettingsState;
}
