import { AnimatePresence, motion } from 'framer-motion';
import { lazy, startTransition, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import AuthGate from './components/AuthGate';
import {
  categories,
  gameFlowMap,
  gameLogicMap,
  gameMap,
  leaderboardSeed,
  practiceGameMap,
  shopProductMap,
  shopProducts,
  slotLabels,
  slotOrder,
  subcategoryLessonMap,
  wardrobeCatalog,
  wardrobeOptionMap
} from './data';
import {
  buildDefaultWorkspace,
  cloneWorkspace,
  createAuthUserRecord,
  findUserByIdentity,
  isStrongPassword,
  isValidEmailValue,
  isValidLoginValue,
  type BrowserAuthResult,
  type BrowserAuthState,
  type BrowserAuthUser,
  type AuthMode,
  readAuthState,
  slugifyName,
  writeAuthState
} from './auth';
import { useAppStore } from './store';
import type { AppPage, CategoryId, GameWithMeta, Gender, LessonStep, PersistedAppState, PurchaseRecord, WardrobeSlot } from './types';

const AvatarStage = lazy(() => import('./components/AvatarStage'));
const PhaserPreview = lazy(() => import('./components/PhaserPreview'));

const pageMeta: Record<AppPage, { title: string; subtitle: string; icon: string }> = {
  home: { title: 'Home Base', subtitle: 'Єдина React-основа замість розбитого UI.', icon: '⌂' },
  avatar: { title: 'Avatar Lab', subtitle: 'Керування персонажем і гардеробом у єдиному store.', icon: '●' },
  shop: { title: 'Shop Board', subtitle: 'Покупки, історія й прев’ю речей без дубльованої логіки.', icon: '▣' },
  games: { title: 'Game Lab', subtitle: 'Жива Phaser-сцена з винагородою назад у прогрес.', icon: '▶' },
  settings: { title: 'Settings', subtitle: 'Профіль, стать, статус і скидання foundation.', icon: '⚙' }
};

const pageOrder: Array<{ id: AppPage; label: string; icon: string }> = [
  { id: 'home', label: 'Головна', icon: '⌂' },
  { id: 'avatar', label: 'Аватар', icon: '●' },
  { id: 'shop', label: 'Магазин', icon: '▣' },
  { id: 'games', label: 'Ігри', icon: '▶' },
  { id: 'settings', label: 'Налаштування', icon: '⚙' }
];

const pageTransition = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.2, 0.9, 0.25, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } }
};

const cardTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } }
};

type LessonFeedbackTone = 'success' | 'warning' | null;

type LessonSessionState = {
  gameId: string;
  step: LessonStep;
  taskIndex: number;
  selectedOptionId: string;
  checked: boolean;
  feedbackTone: LessonFeedbackTone;
  feedbackMessage: string;
  correctAnswers: number;
  mistakes: number;
  completed: boolean;
  awarded: boolean;
  reward: { xp: number; coins: number } | null;
};

function createLessonSession(gameId: string): LessonSessionState {
  return {
    gameId,
    step: 'lecture',
    taskIndex: 0,
    selectedOptionId: '',
    checked: false,
    feedbackTone: null,
    feedbackMessage: '',
    correctAnswers: 0,
    mistakes: 0,
    completed: false,
    awarded: false,
    reward: null
  };
}

function buildLessonLecture(game: GameWithMeta) {
  return subcategoryLessonMap[game.subcategoryId] || {
    summary: `У блоці "${game.subcategoryTitle}" ти працюєш із навичкою малими кроками: спочатку розумієш суть, а потім переходиш до дії.`,
    points: [
      'Кожне завдання спирається на базову ідею з підкатегорії.',
      'Важливо не просто рухатися далі, а зрозуміти, чому рішення працює.',
      'Навичка закріплюється тоді, коли теорія одразу переходить у практику.'
    ],
    result: `Після міні-лекції легше увійти в гру ${game.title} і не втрачати темп на старті.`
  };
}

function buildLessonLogic(game: GameWithMeta) {
  return gameLogicMap[game.id] || {
    summary: gameFlowMap[game.id] || `Гра ${game.title} тренує навичку через короткий цикл рішень, темп і нагороду за точність.`,
    cards: [
      {
        title: 'Що робить гравець',
        lines: [
          `Працює із темою "${game.subcategoryTitle}" через серію коротких рішень.`,
          'Тримає темп, не губиться в зайвих діях і доводить цикл до результату.'
        ]
      },
      {
        title: 'Що перевіряє система',
        lines: [
          `Чи вдається пройти сценарій на складності ${game.difficulty}.`,
          `Чи перетворюються рішення на XP і монети в категорії ${game.categoryTitle}.`
        ]
      }
    ]
  };
}

function buildPracticeReward(game: GameWithMeta, correctAnswers: number, mistakes: number, totalTasks: number) {
  const accuracy = totalTasks ? correctAnswers / totalTasks : 0;
  const mistakePenalty = Math.max(0, 1 - mistakes * 0.12);
  const factor = Math.max(0.45, Math.min(1, accuracy * mistakePenalty + 0.25));

  return {
    xp: Math.max(10, Math.round(game.xp * factor)),
    coins: Math.max(8, Math.round(game.coins * factor))
  };
}

function extractWorkspaceFromStoreSnapshot(state: ReturnType<typeof useAppStore.getState>): PersistedAppState {
  return cloneWorkspace({
    navigation: state.navigation,
    profile: state.profile,
    character: state.character,
    shop: state.shop,
    progress: state.progress,
    settings: state.settings
  });
}

function loadWorkspaceIntoStore(workspace: PersistedAppState) {
  useAppStore.setState((state) => ({
    ...state,
    ...cloneWorkspace(workspace)
  }));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('uk-UA').format(value);
}

function getCategoryTitle(categoryId: CategoryId) {
  return categories.find((category) => category.id === categoryId)?.title || 'IT';
}

function resolvePurchaseTitle(entry: PurchaseRecord) {
  return entry.title
    || wardrobeOptionMap[entry.itemId]?.label
    || shopProductMap[entry.itemId]?.title
    || entry.itemId;
}

function usePageNavigation() {
  const setPage = useAppStore((state) => state.setPage);
  return (page: AppPage) => startTransition(() => setPage(page));
}

function ModuleFallback({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div className={`module-fallback${tall ? ' module-fallback--tall' : ''}`} role="status" aria-live="polite">
      <span className="section-kicker">Loading</span>
      <strong>{label}</strong>
      <p>Модуль підвантажується окремим чанком, щоб GitHub Pages стартував швидше.</p>
    </div>
  );
}

function ProfileAvatar({
  avatar,
  avatarImage,
  label,
  large = false
}: {
  avatar: string;
  avatarImage: string;
  label: string;
  large?: boolean;
}) {
  return (
    <div className={`profile-avatar${large ? ' profile-avatar--large' : ''}`} aria-label={label}>
      {avatarImage ? (
        <img alt={label} src={avatarImage} />
      ) : (
        <span aria-hidden="true">{avatar}</span>
      )}
    </div>
  );
}

function PreferenceToggle({
  title,
  description,
  active,
  onClick
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className="preference-row" type="button" onClick={onClick}>
      <div className="preference-row__copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      <span className={`preference-switch${active ? ' is-active' : ''}`} aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

function TopBar({
  currentUser,
  onLogout
}: {
  currentUser: BrowserAuthUser;
  onLogout: () => void;
}) {
  const navigation = useAppStore((state) => state.navigation);
  const profile = useAppStore((state) => state.profile);
  const coins = useAppStore((state) => state.shop.coins);
  const boosts = useAppStore((state) => state.shop.xpBoosts);
  const meta = pageMeta[navigation.page];

  return (
    <header className="topbar shell-card">
      <div className="topbar__brand">
        <div className="brand-mark" aria-hidden="true">{meta.icon}</div>
        <div>
          <span className="section-kicker">Skill Play Base</span>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
      </div>

      <div className="topbar__stats">
        <button className="account-pill" type="button" onClick={onLogout}>
          <span>{currentUser.login}</span>
          <strong>Вийти</strong>
        </button>
        <div className="status-pill">
          <span>{profile.badge}</span>
          <strong>Lvl {profile.level}</strong>
        </div>
        <div className="coin-pill">
          <span aria-hidden="true" />
          {formatNumber(coins)}
        </div>
        <div className="boost-pill">x{Math.max(1, boosts)} boost</div>
      </div>
    </header>
  );
}

function ToastViewport() {
  const toast = useAppStore((state) => state.ui.toast);
  const clearToast = useAppStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => clearToast(), 2400);
    return () => window.clearTimeout(timer);
  }, [clearToast, toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`toast toast--${toast.tone}`}
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
        >
          <strong>{toast.title}</strong>
          <p>{toast.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuickHero() {
  const profile = useAppStore((state) => state.profile);
  const progress = useAppStore((state) => state.progress);
  const navigate = usePageNavigation();

  return (
    <motion.section className="hero-card shell-card" {...cardTransition}>
      <div className="hero-card__copy">
        <span className="section-kicker">GitHub Pages Base</span>
        <h2>{profile.name}, тепер сайт повністю живе в React-основі</h2>
        <p>
          Стан зберігається через Zustand, сторінки перемикаються без дублювання логіки,
          а прогрес, покупки й персонаж уже живуть в одному місці.
        </p>
        <div className="hero-card__actions">
          <button className="primary-button" type="button" onClick={() => navigate('games')}>
            Відкрити Game Lab
          </button>
          <button className="ghost-button" type="button" onClick={() => navigate('shop')}>
            Подивитись магазин
          </button>
        </div>
      </div>

      <div className="hero-card__metrics">
        <div>
          <span>XP</span>
          <strong>{formatNumber(progress.xp)}</strong>
        </div>
        <div>
          <span>Ігор</span>
          <strong>{progress.gamesPlayed}</strong>
        </div>
        <div>
          <span>Серія</span>
          <strong>{progress.streak} дн.</strong>
        </div>
      </div>
    </motion.section>
  );
}

function StatsGrid() {
  const profile = useAppStore((state) => state.profile);
  const shop = useAppStore((state) => state.shop);
  const progress = useAppStore((state) => state.progress);

  const stats = [
    { label: 'Рівень', value: `Lv ${profile.level}`, tone: 'blue' },
    { label: 'Монети', value: formatNumber(shop.coins), tone: 'gold' },
    { label: 'Ігри', value: String(progress.gamesPlayed), tone: 'mint' },
    { label: 'Сильна зона', value: getCategoryTitle(progress.favoriteCategory), tone: 'rose' }
  ];

  return (
    <motion.section className="stats-grid" {...cardTransition}>
      {stats.map((item) => (
        <motion.article className={`stat-card stat-card--${item.tone}`} key={item.label} whileHover={{ y: -4 }}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </motion.article>
      ))}
    </motion.section>
  );
}

function CategoryExplorer({ onOpenLesson }: { onOpenLesson: (gameId: string) => void }) {
  const navigation = useAppStore((state) => state.navigation);
  const setCategory = useAppStore((state) => state.setCategory);
  const setSubcategory = useAppStore((state) => state.setSubcategory);
  const navigate = usePageNavigation();

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === navigation.selectedCategory) || categories[0],
    [navigation.selectedCategory]
  );

  const selectedSubcategory = selectedCategory.subcategories.find((subcategory) => subcategory.id === navigation.selectedSubcategory)
    || selectedCategory.subcategories[0];

  return (
    <motion.section className="shell-card section-card" {...cardTransition}>
      <div className="section-head">
        <div>
          <span className="section-kicker">Категорії</span>
          <h2>Скелет контенту вже всередині React app</h2>
        </div>
      </div>

      <div className="category-deck">
        {categories.map((category) => (
          <motion.button
            className={`category-card${category.id === selectedCategory.id ? ' is-active' : ''}`}
            key={category.id}
            type="button"
            style={{ '--accent': category.accent } as CSSProperties}
            whileHover={{ y: -4 }}
            onClick={() => setCategory(category.id)}
          >
            <strong>{category.title}</strong>
            <p>{category.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="chip-row">
        {selectedCategory.subcategories.map((subcategory) => (
          <button
            className={subcategory.id === selectedSubcategory.id ? 'is-active' : ''}
            key={subcategory.id}
            type="button"
            onClick={() => setSubcategory(subcategory.id)}
          >
            {subcategory.title}
          </button>
        ))}
      </div>

      <div className="feature-grid">
        {selectedSubcategory.games.map((game) => (
          <motion.article className="feature-card" key={game.id} layout>
            <span>{game.tag}</span>
            <strong>{game.title}</strong>
            <p>{game.text}</p>
            <div className="feature-card__bottom">
              <div className="feature-card__meta">
                <small>+{game.xp} XP / +{game.coins} монет</small>
                <small>{practiceGameMap[game.id] ? 'Лекція -> логіка -> практика' : 'Лекція -> логіка -> жива сцена'}</small>
              </div>
              <div className="feature-card__actions">
                <button className="primary-button feature-card__action" type="button" onClick={() => onOpenLesson(game.id)}>
                  Лекція
                </button>
                <button className="ghost-button feature-card__action" type="button" onClick={() => navigate('games')}>
                  До Game Lab
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

function LeaderboardCard() {
  const progress = useAppStore((state) => state.progress);
  const profile = useAppStore((state) => state.profile);

  const rows = useMemo<Array<{ name: string; xp: number; badge: string; tone: string; isCurrent?: boolean }>>(
    () => [
      ...leaderboardSeed,
      { name: profile.name, xp: progress.xp, badge: profile.badge, tone: '#5fd4ff', isCurrent: true }
    ].sort((left, right) => right.xp - left.xp).slice(0, 5),
    [profile.badge, profile.name, progress.xp]
  );

  return (
    <motion.section className="shell-card section-card" {...cardTransition}>
      <div className="section-head">
        <div>
          <span className="section-kicker">Лідерборд</span>
          <h2>Реактивний, а не статичний рейтинг</h2>
        </div>
      </div>

      <div className="leaderboard-list">
        {rows.map((entry, index) => (
          <article className={`leader-row${entry.isCurrent ? ' is-current' : ''}`} key={`${entry.name}_${index}`}>
            <span className="leader-row__rank">#{index + 1}</span>
            <strong>{entry.name}</strong>
            <small>{entry.badge}</small>
            <b>{formatNumber(entry.xp)} XP</b>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function PurchaseHistoryCard({ limit = 6 }: { limit?: number }) {
  const purchases = useAppStore((state) => state.shop.purchases.slice(0, limit));

  return (
    <motion.section className="shell-card section-card" {...cardTransition}>
      <div className="section-head">
        <div>
          <span className="section-kicker">Історія</span>
          <h2>Останні покупки</h2>
        </div>
      </div>

      {!purchases.length ? (
        <div className="empty-state">Ще немає покупок. Перша транзакція з’явиться тут.</div>
      ) : (
        <div className="history-list">
          {purchases.map((purchase) => (
            <article className="history-row" key={purchase.id}>
              <div>
                <strong>{resolvePurchaseTitle(purchase)}</strong>
                <p>{new Date(purchase.timestamp).toLocaleDateString('uk-UA')}</p>
              </div>
              <b>-{purchase.price}</b>
            </article>
          ))}
        </div>
      )}
    </motion.section>
  );
}

function HomePage() {
  const setPage = useAppStore((state) => state.setPage);
  const setCategory = useAppStore((state) => state.setCategory);
  const setSubcategory = useAppStore((state) => state.setSubcategory);
  const completeGame = useAppStore((state) => state.completeGame);
  const [lessonSession, setLessonSession] = useState<LessonSessionState | null>(null);

  const activeLessonGame = useMemo(
    () => (lessonSession ? gameMap[lessonSession.gameId] : undefined),
    [lessonSession]
  );
  const activeLecture = useMemo(
    () => (activeLessonGame ? buildLessonLecture(activeLessonGame) : null),
    [activeLessonGame]
  );
  const activeLogic = useMemo(
    () => (activeLessonGame ? buildLessonLogic(activeLessonGame) : null),
    [activeLessonGame]
  );
  const activePractice = useMemo(
    () => (activeLessonGame ? practiceGameMap[activeLessonGame.id] : undefined),
    [activeLessonGame]
  );
  const activeTask = lessonSession && activePractice
    ? activePractice.tasks[lessonSession.taskIndex]
    : undefined;
  const isAnsweredCorrectly = Boolean(
    lessonSession
    && lessonSession.checked
    && activeTask
    && lessonSession.selectedOptionId === activeTask.correctOptionId
  );
  const progressSteps: LessonStep[] = activePractice ? ['lecture', 'logic', 'practice'] : ['lecture', 'logic'];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = lessonSession ? 'hidden' : previousOverflow || '';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lessonSession]);

  useEffect(() => {
    if (!lessonSession) return undefined;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLessonSession(null);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [lessonSession]);

  function alignToGame(game: GameWithMeta) {
    setCategory(game.categoryId);
    setSubcategory(game.subcategoryId);
  }

  function openLesson(gameId: string) {
    const game = gameMap[gameId];
    if (!game) return;

    alignToGame(game);
    setLessonSession(createLessonSession(gameId));
  }

  function closeLesson() {
    setLessonSession(null);
  }

  function openGameLab(game: GameWithMeta) {
    alignToGame(game);
    setLessonSession(null);
    startTransition(() => setPage('games'));
  }

  function moveToLogic() {
    setLessonSession((current) => (
      current ? { ...current, step: 'logic' } : current
    ));
  }

  function moveToPractice() {
    setLessonSession((current) => (
      current ? { ...current, step: 'practice' } : current
    ));
  }

  function selectPracticeOption(optionId: string) {
    setLessonSession((current) => {
      if (!current || current.checked || current.completed) return current;

      return {
        ...current,
        selectedOptionId: optionId,
        feedbackTone: null,
        feedbackMessage: ''
      };
    });
  }

  function checkPracticeAnswer() {
    if (!activePractice) return;

    setLessonSession((current) => {
      if (!current || current.step !== 'practice' || current.checked || current.completed) return current;

      const task = activePractice.tasks[current.taskIndex];
      if (!task) return current;

      if (!current.selectedOptionId) {
        return {
          ...current,
          feedbackTone: 'warning',
          feedbackMessage: 'Спочатку обери один варіант, а вже потім перевіряй відповідь.'
        };
      }

      const isCorrect = current.selectedOptionId === task.correctOptionId;

      return {
        ...current,
        checked: true,
        feedbackTone: isCorrect ? 'success' : 'warning',
        feedbackMessage: isCorrect ? task.success : task.hint,
        correctAnswers: current.correctAnswers + (isCorrect ? 1 : 0),
        mistakes: current.mistakes + (isCorrect ? 0 : 1)
      };
    });
  }

  function retryPracticeTask() {
    setLessonSession((current) => {
      if (!current || current.step !== 'practice' || current.completed) return current;

      return {
        ...current,
        checked: false,
        selectedOptionId: '',
        feedbackTone: null,
        feedbackMessage: ''
      };
    });
  }

  function nextPracticeTask() {
    if (!activePractice || !lessonSession || !isAnsweredCorrectly) return;

    const isLastTask = lessonSession.taskIndex >= activePractice.tasks.length - 1;
    if (isLastTask) return;

    setLessonSession((current) => {
      if (!current) return current;

      return {
        ...current,
        taskIndex: current.taskIndex + 1,
        selectedOptionId: '',
        checked: false,
        feedbackTone: null,
        feedbackMessage: ''
      };
    });
  }

  function finishPractice() {
    if (!lessonSession || !activeLessonGame || !activePractice || lessonSession.awarded) return;

    const reward = buildPracticeReward(
      activeLessonGame,
      lessonSession.correctAnswers,
      lessonSession.mistakes,
      activePractice.tasks.length
    );

    completeGame(activeLessonGame.id, activeLessonGame.categoryId, reward);

    setLessonSession((current) => {
      if (!current) return current;

      return {
        ...current,
        completed: true,
        awarded: true,
        reward,
        feedbackTone: 'success',
        feedbackMessage: 'Практику завершено: нагорода вже повернута в твій глобальний прогрес.'
      };
    });
  }

  return (
    <motion.div className="page-stack" key="home" {...pageTransition}>
      <QuickHero />
      <StatsGrid />
      <div className="dashboard-grid">
        <CategoryExplorer onOpenLesson={openLesson} />
        <div className="stack-column">
          <LeaderboardCard />
          <PurchaseHistoryCard />
        </div>
      </div>

      <AnimatePresence>
        {lessonSession && activeLessonGame && activeLecture && activeLogic && (
          <motion.div
            className="lesson-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="lesson-modal shell-card"
              aria-modal="true"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.22 }}
            >
              <div className="lesson-modal__top">
                <div>
                  <span className="section-kicker">{activeLessonGame.categoryTitle} · {activeLessonGame.subcategoryTitle}</span>
                  <h2>{activeLessonGame.title}</h2>
                  <p>{gameFlowMap[activeLessonGame.id] || activeLogic.summary}</p>
                </div>
                <button className="lesson-close" type="button" aria-label="Закрити урок" onClick={closeLesson}>
                  ×
                </button>
              </div>

              <div className="lesson-progress">
                {progressSteps.map((step) => {
                  const stepIndex = progressSteps.indexOf(step);
                  const currentIndex = progressSteps.indexOf(lessonSession.step);
                  const isActive = step === lessonSession.step;
                  const isComplete = lessonSession.completed || stepIndex < currentIndex;

                  return (
                    <article
                      className={`lesson-progress__step${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
                      key={step}
                    >
                      <small>Крок {stepIndex + 1}</small>
                      <strong>
                        {step === 'lecture' ? 'Лекція' : step === 'logic' ? 'Логіка' : 'Практика'}
                      </strong>
                    </article>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {lessonSession.step === 'lecture' && (
                  <motion.div
                    className="lesson-pane"
                    key="lecture"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <article className="lesson-highlight">
                      <strong>Суть теми</strong>
                      <p>{activeLecture.summary}</p>
                    </article>

                    <div className="lesson-point-list">
                      {activeLecture.points.map((point, index) => (
                        <article className="lesson-point" key={`${index + 1}_${point}`}>
                          <span>{index + 1}</span>
                          <p>{point}</p>
                        </article>
                      ))}
                    </div>

                    <article className="lesson-result-card">
                      <strong>Що отримаєш на виході</strong>
                      <p>{activeLecture.result}</p>
                    </article>

                    <div className="lesson-actions">
                      <button className="ghost-button" type="button" onClick={closeLesson}>
                        Закрити
                      </button>
                      <button className="primary-button" type="button" onClick={moveToLogic}>
                        Далі до логіки
                      </button>
                    </div>
                  </motion.div>
                )}

                {lessonSession.step === 'logic' && (
                  <motion.div
                    className="lesson-pane"
                    key="logic"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <article className="lesson-highlight">
                      <strong>Як працює сценарій</strong>
                      <p>{activeLogic.summary}</p>
                    </article>

                    <div className="lesson-card-grid">
                      {activeLogic.cards.map((card) => (
                        <article className="lesson-logic-card" key={card.title}>
                          <strong>{card.title}</strong>
                          <div className="lesson-bullet-list">
                            {card.lines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="lesson-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => setLessonSession((current) => (current ? { ...current, step: 'lecture' } : current))}
                      >
                        Назад
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => (activePractice ? moveToPractice() : openGameLab(activeLessonGame))}
                      >
                        {activePractice ? 'До практики' : 'Відкрити Game Lab'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {lessonSession.step === 'practice' && activePractice && (
                  <motion.div
                    className="lesson-pane"
                    key="practice"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    {!lessonSession.completed && activeTask ? (
                      <>
                        <div className="lesson-task-head">
                          <div>
                            <span className="section-kicker">{activePractice.label}</span>
                            <h3>{activePractice.title}</h3>
                            <p>{activePractice.lead}</p>
                          </div>
                          <div className="lesson-mini-stats">
                            <span>Питання {lessonSession.taskIndex + 1}/{activePractice.tasks.length}</span>
                            <span>Помилки {lessonSession.mistakes}</span>
                          </div>
                        </div>

                        <div className="lesson-card-grid">
                          {activePractice.cards.map((card) => (
                            <article className="lesson-logic-card" key={card.title}>
                              <strong>{card.title}</strong>
                              <div className="lesson-bullet-list">
                                {card.lines.map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>

                        <article className="lesson-question-card">
                          <strong>{activeTask.title}</strong>
                          <p>{activeTask.lead}</p>
                          <div className="lesson-bullet-list">
                            {activeTask.lines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        </article>

                        <div className="lesson-option-list">
                          {activeTask.options.map((option) => {
                            const isSelected = lessonSession.selectedOptionId === option.id;
                            const isCorrectOption = lessonSession.checked && option.id === activeTask.correctOptionId;
                            const isWrongOption = lessonSession.checked && isSelected && option.id !== activeTask.correctOptionId;

                            return (
                              <button
                                className={`lesson-option${isSelected ? ' is-selected' : ''}${isCorrectOption ? ' is-correct' : ''}${isWrongOption ? ' is-wrong' : ''}`}
                                disabled={lessonSession.checked}
                                key={option.id}
                                type="button"
                                onClick={() => selectPracticeOption(option.id)}
                              >
                                <small>Варіант {option.id.toUpperCase()}</small>
                                <code>{option.code}</code>
                              </button>
                            );
                          })}
                        </div>

                        {lessonSession.feedbackMessage && (
                          <article className={`lesson-feedback lesson-feedback--${lessonSession.feedbackTone || 'warning'}`}>
                            <strong>{lessonSession.feedbackTone === 'success' ? 'Правильно' : 'Підказка'}</strong>
                            <p>{lessonSession.feedbackMessage}</p>
                          </article>
                        )}

                        <div className="lesson-actions">
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setLessonSession((current) => (current ? { ...current, step: 'logic' } : current))}
                          >
                            До логіки
                          </button>

                          {!lessonSession.checked && (
                            <button className="primary-button" type="button" onClick={checkPracticeAnswer}>
                              Перевірити
                            </button>
                          )}

                          {lessonSession.checked && !isAnsweredCorrectly && (
                            <button className="primary-button" type="button" onClick={retryPracticeTask}>
                              Спробувати ще раз
                            </button>
                          )}

                          {lessonSession.checked && isAnsweredCorrectly && lessonSession.taskIndex < activePractice.tasks.length - 1 && (
                            <button className="primary-button" type="button" onClick={nextPracticeTask}>
                              Далі
                            </button>
                          )}

                          {lessonSession.checked && isAnsweredCorrectly && lessonSession.taskIndex === activePractice.tasks.length - 1 && (
                            <button className="primary-button" type="button" onClick={finishPractice}>
                              Завершити практику
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <article className="lesson-highlight">
                          <strong>Практику завершено</strong>
                          <p>{lessonSession.feedbackMessage}</p>
                        </article>

                        <div className="lesson-scoreboard">
                          <article className="lesson-score-card">
                            <small>Правильних</small>
                            <strong>{lessonSession.correctAnswers}/{activePractice.tasks.length}</strong>
                          </article>
                          <article className="lesson-score-card">
                            <small>Помилок</small>
                            <strong>{lessonSession.mistakes}</strong>
                          </article>
                          <article className="lesson-score-card">
                            <small>Нагорода</small>
                            <strong>
                              +{lessonSession.reward?.xp || 0} XP / +{lessonSession.reward?.coins || 0}
                            </strong>
                          </article>
                        </div>

                        <div className="lesson-actions">
                          <button className="ghost-button" type="button" onClick={closeLesson}>
                            Закрити
                          </button>
                          <button className="primary-button" type="button" onClick={() => openGameLab(activeLessonGame)}>
                            До Game Lab
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AvatarPage() {
  const character = useAppStore((state) => state.character);
  const equipWardrobe = useAppStore((state) => state.equipWardrobe);

  return (
    <motion.div className="page-stack" key="avatar" {...pageTransition}>
      <div className="split-layout">
        <motion.section className="shell-card stage-card" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Three.js</span>
              <h2>Повноцінний preview персонажа</h2>
            </div>
          </div>
          <Suspense fallback={<ModuleFallback label="Avatar preview завантажується" tall />}>
            <AvatarStage accentColor={character.gender === 'female' ? '#a78bfa' : '#4e9cff'} />
          </Suspense>
        </motion.section>

        <motion.section className="shell-card control-card" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Гардероб</span>
              <h2>Екіпірування з єдиного store</h2>
            </div>
          </div>

          <div className="slot-stack">
            {slotOrder.map((slot) => {
              const owned = wardrobeCatalog[slot].filter((option) => character.ownedWardrobe.includes(option.id));

              return (
                <section className="slot-panel" key={slot}>
                  <div className="slot-panel__head">
                    <strong>{slotLabels[slot]}</strong>
                    <span>{owned.length} доступно</span>
                  </div>
                  <div className="wardrobe-grid">
                    {owned.map((option) => (
                      <motion.button
                        className={`wardrobe-option${character.equipped[slot] === option.id ? ' is-active' : ''}`}
                        key={option.id}
                        type="button"
                        whileHover={{ y: -3 }}
                        onClick={() => equipWardrobe(option.id)}
                      >
                        <span style={{ background: option.color }} />
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </motion.button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function ShopPage() {
  const character = useAppStore((state) => state.character);
  const shop = useAppStore((state) => state.shop);
  const buyWardrobe = useAppStore((state) => state.buyWardrobe);
  const buyProduct = useAppStore((state) => state.buyProduct);
  const [previewOptionId, setPreviewOptionId] = useState<string | null>(null);
  const deferredPreviewOptionId = useDeferredValue(previewOptionId);

  const previewSelection = useMemo(() => {
    if (!deferredPreviewOptionId || !wardrobeOptionMap[deferredPreviewOptionId]) return undefined;
    const option = wardrobeOptionMap[deferredPreviewOptionId];
    return { [option.slot]: option.id } as Partial<Record<WardrobeSlot, string>>;
  }, [deferredPreviewOptionId]);

  const availableWardrobe = slotOrder.flatMap((slot) =>
    wardrobeCatalog[slot].filter((option) => !character.ownedWardrobe.includes(option.id) && option.price > 0)
  );

  const availableProducts = shopProducts.filter((product) => product.repeatable || !shop.ownedProducts.includes(product.id));

  return (
    <motion.div className="page-stack" key="shop" {...pageTransition}>
      <div className="split-layout split-layout--shop">
        <motion.section className="shell-card shop-preview-panel" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Прев’ю</span>
              <h2>Предмет одразу видно на персонажі</h2>
            </div>
          </div>
          <Suspense fallback={<ModuleFallback label="Shop preview завантажується" tall />}>
            <AvatarStage
              previewSelection={previewSelection}
              accentColor={deferredPreviewOptionId ? wardrobeOptionMap[deferredPreviewOptionId]?.color : '#4e9cff'}
              compact
            />
          </Suspense>
          <div className="shop-preview-panel__meta">
            <div>
              <span>Монети</span>
              <strong>{formatNumber(shop.coins)}</strong>
            </div>
            <div>
              <span>Boost</span>
              <strong>{shop.xpBoosts}</strong>
            </div>
            <div>
              <span>Покупок</span>
              <strong>{shop.purchases.length}</strong>
            </div>
          </div>
        </motion.section>

        <div className="stack-column">
          <motion.section className="shell-card section-card" {...cardTransition}>
            <div className="section-head">
              <div>
                <span className="section-kicker">Wardrobe Store</span>
                <h2>Непридбані речі</h2>
              </div>
            </div>

            {!availableWardrobe.length ? (
              <div className="empty-state">Увесь одяг уже куплено. Магазин порожній.</div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="store-grid">
                  {availableWardrobe.map((option) => (
                    <motion.article
                      className="store-card"
                      key={option.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      onMouseEnter={() => setPreviewOptionId(option.id)}
                      onMouseLeave={() => setPreviewOptionId(null)}
                    >
                      <span className={`tone tone--${option.tone}`}>{slotLabels[option.slot]}</span>
                      <div className="store-card__swatch" style={{ background: option.color }} />
                      <strong>{option.label}</strong>
                      <p>{option.description}</p>
                      <div className="store-card__bottom">
                        <b>{option.price} мон.</b>
                        <button className="primary-button" type="button" onClick={() => buyWardrobe(option.id)}>
                          Купити
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.section>

          <motion.section className="shell-card section-card" {...cardTransition}>
            <div className="section-head">
              <div>
                <span className="section-kicker">Products</span>
                <h2>Системні покращення</h2>
              </div>
            </div>
            <div className="store-grid">
              {availableProducts.map((product) => (
                <motion.article className="store-card" key={product.id} whileHover={{ y: -4 }}>
                  <span className="tone" style={{ '--tone-accent': product.accent } as CSSProperties}>{product.kind}</span>
                  <strong>{product.title}</strong>
                  <p>{product.description}</p>
                  <small>{product.subtitle}</small>
                  <div className="store-card__bottom">
                    <b>{product.price} мон.</b>
                    <button className="ghost-button" type="button" onClick={() => buyProduct(product.id)}>
                      Активувати
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <PurchaseHistoryCard limit={8} />
        </div>
      </div>
    </motion.div>
  );
}

function GamesPage() {
  const navigation = useAppStore((state) => state.navigation);
  const setCategory = useAppStore((state) => state.setCategory);
  const setSubcategory = useAppStore((state) => state.setSubcategory);
  const completeGame = useAppStore((state) => state.completeGame);
  const gameSessionSeed = useAppStore((state) => state.ui.gameSessionSeed);
  const bumpGameSession = useAppStore((state) => state.bumpGameSession);
  const boosts = useAppStore((state) => state.shop.xpBoosts);
  const completedGames = useAppStore((state) => state.progress.completedGames);
  const [activeGameId, setActiveGameId] = useState<string>('');

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === navigation.selectedCategory) || categories[0],
    [navigation.selectedCategory]
  );
  const selectedSubcategory = selectedCategory.subcategories.find((subcategory) => subcategory.id === navigation.selectedSubcategory)
    || selectedCategory.subcategories[0];
  const availableGames = selectedSubcategory.games.map((game) => gameMap[game.id]).filter(Boolean);

  useEffect(() => {
    if (!availableGames.length) {
      setActiveGameId('');
      return;
    }

    if (!availableGames.some((game) => game.id === activeGameId)) {
      setActiveGameId(availableGames[0].id);
    }
  }, [activeGameId, availableGames]);

  const activeGame = availableGames.find((game) => game.id === activeGameId) || availableGames[0];

  return (
    <motion.div className="page-stack" key="games" {...pageTransition}>
      <div className="shell-card section-card">
        <div className="section-head">
          <div>
            <span className="section-kicker">Game Lab</span>
            <h2>Реальна Phaser-сцена замість демо-пустишки</h2>
          </div>
        </div>

        <div className="category-tabs">
          {categories.map((category) => (
            <button
              className={category.id === selectedCategory.id ? 'is-active' : ''}
              key={category.id}
              type="button"
              style={{ '--tab-accent': category.accent } as CSSProperties}
              onClick={() => setCategory(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="chip-row">
          {selectedCategory.subcategories.map((subcategory) => (
            <button
              className={subcategory.id === selectedSubcategory.id ? 'is-active' : ''}
              key={subcategory.id}
              type="button"
              onClick={() => setSubcategory(subcategory.id)}
            >
              {subcategory.title}
            </button>
          ))}
        </div>
      </div>

      <div className="split-layout split-layout--games">
        <motion.section className="shell-card game-list-card" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Список сцен</span>
              <h2>{selectedSubcategory.title}</h2>
            </div>
          </div>
          <p className="section-lead">{selectedSubcategory.intro}</p>

          <div className="game-list">
            {availableGames.map((game) => (
              <motion.button
                className={`game-list__item${game.id === activeGame?.id ? ' is-active' : ''}`}
                key={game.id}
                type="button"
                whileHover={{ y: -3 }}
                onClick={() => setActiveGameId(game.id)}
              >
                <span>{game.tag}</span>
                <strong>{game.title}</strong>
                <p>{game.text}</p>
                <small>Пройдено: {completedGames[game.id] || 0}</small>
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section className="shell-card lab-stage-card" {...cardTransition}>
          {activeGame ? (
            <>
              <div className="section-head">
                <div>
                  <span className="section-kicker">{activeGame.tag}</span>
                  <h2>{activeGame.title}</h2>
                </div>
                <div className="lab-meta">
                  <span>Складність: {activeGame.difficulty}</span>
                  <span>Boost: {boosts}</span>
                </div>
              </div>

              <p className="section-lead">
                Три рівні, таймер, вороги й повернення нагороди прямо у глобальний store.
              </p>

              <Suspense fallback={<ModuleFallback label="Phaser-сцена завантажується" tall />}>
                <PhaserPreview
                  game={activeGame}
                  sessionKey={gameSessionSeed}
                  onComplete={(reward) => completeGame(activeGame.id, activeGame.categoryId, reward)}
                />
              </Suspense>

              <div className="lab-actions">
                <div>
                  <strong>Нагорода</strong>
                  <p>+{activeGame.xp} XP / +{activeGame.coins} монет. XP boost спалиться автоматично.</p>
                </div>
                <button className="primary-button" type="button" onClick={() => bumpGameSession()}>
                  Перезапустити сцену
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">У цій підкатегорії ще немає підготовленої сцени.</div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}

function SettingsPage() {
  const profile = useAppStore((state) => state.profile);
  const character = useAppStore((state) => state.character);
  const settings = useAppStore((state) => state.settings);
  const shop = useAppStore((state) => state.shop);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setAvatarImage = useAppStore((state) => state.setAvatarImage);
  const resetPreferences = useAppStore((state) => state.resetPreferences);
  const setGender = useAppStore((state) => state.setGender);
  const resetFoundation = useAppStore((state) => state.resetFoundation);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [status, setStatus] = useState(profile.status);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [infoPanel, setInfoPanel] = useState<'about' | 'privacy' | 'terms'>('about');

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
    setStatus(profile.status);
    setUsername(profile.username);
    setEmail(profile.email);
    setBio(profile.bio);
  }, [profile.bio, profile.email, profile.name, profile.phone, profile.status, profile.username]);

  const infoCopy = {
    about: {
      title: 'Про foundation',
      text: 'React-основа тепер є єдиною робочою версією проєкту і саме вона деплоїться на GitHub Pages.'
    },
    privacy: {
      title: 'Конфіденційність',
      text: 'Профіль, покупки, гардероб і preferences зберігаються локально в браузері через Zustand persist та браузерний auth-layer.'
    },
    terms: {
      title: 'Умови використання',
      text: 'Поточна React-версія є основною: старий root-legacy прибрано, а GitHub Pages працює тільки від неї.'
    }
  }[infoPanel];

  function handleAvatarUpload(event: { target: { files?: FileList | null; value?: string } }) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarImage(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);

    if (typeof event.target.value === 'string') {
      event.target.value = '';
    }
  }

  return (
    <motion.div className="page-stack" key="settings" {...pageTransition}>
      <div className="settings-grid">
        <motion.aside className="settings-sidebar-stack" {...cardTransition}>
          <section className="shell-card profile-card-foundation">
            <ProfileAvatar avatar={profile.avatar} avatarImage={profile.avatarImage} label={profile.name} large />
            <div className="profile-card-foundation__body">
              <span className="section-kicker">Profile</span>
              <h2>{profile.name}</h2>
              <p>{profile.status}</p>
              <small>{profile.bio}</small>
            </div>
            <div className="profile-card-foundation__actions">
              <button className="primary-button" type="button" onClick={() => fileInputRef.current?.click()}>
                Завантажити фото
              </button>
              <button className="ghost-button" type="button" onClick={() => setAvatarImage(null)}>
                Стандартна ава
              </button>
            </div>
            <input
              hidden
              accept="image/*"
              ref={fileInputRef}
              type="file"
              onChange={handleAvatarUpload}
            />
          </section>

          <section className="shell-card summary-card-foundation">
            <div className="section-head">
              <div>
                <span className="section-kicker">Summary</span>
                <h2>Швидкий огляд</h2>
              </div>
            </div>

            <div className="summary-list-foundation">
              <article className="summary-item-foundation">
                <span>Тема</span>
                <strong>{settings.darkMode ? 'Темна' : 'Світла'}</strong>
              </article>
              <article className="summary-item-foundation">
                <span>Мова</span>
                <strong>{settings.language === 'en' ? 'English' : 'Українська'}</strong>
              </article>
              <article className="summary-item-foundation">
                <span>Баланс</span>
                <strong>{formatNumber(shop.coins)}</strong>
              </article>
              <article className="summary-item-foundation">
                <span>Рівень</span>
                <strong>Lv {profile.level}</strong>
              </article>
            </div>
          </section>
        </motion.aside>

        <motion.section className="shell-card section-card settings-account-card" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Account</span>
              <h2>Поля зі старого settings уже в React</h2>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Ім’я</span>
              <input value={name} maxLength={24} onChange={(event: { target: { value: string } }) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span>Телефон</span>
              <input value={phone} maxLength={24} onChange={(event: { target: { value: string } }) => setPhone(event.target.value)} />
            </label>
            <label className="field">
              <span>Username</span>
              <input value={username} maxLength={24} onChange={(event: { target: { value: string } }) => setUsername(event.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} maxLength={48} onChange={(event: { target: { value: string } }) => setEmail(event.target.value)} />
            </label>
            <label className="field field--full">
              <span>Про себе</span>
              <input value={bio} maxLength={72} onChange={(event: { target: { value: string } }) => setBio(event.target.value)} />
            </label>
            <label className="field field--full">
              <span>Статус</span>
              <input value={status} maxLength={52} onChange={(event: { target: { value: string } }) => setStatus(event.target.value)} />
            </label>
          </div>

          <div className="segmented segmented--wide" role="radiogroup" aria-label="Стать">
            <button className={character.gender === 'male' ? 'is-active' : ''} type="button" onClick={() => setGender('male')}>
              Чоловік
            </button>
            <button className={character.gender === 'female' ? 'is-active' : ''} type="button" onClick={() => setGender('female')}>
              Жінка
            </button>
          </div>

          <div className="settings-actions">
            <button className="primary-button" type="button" onClick={() => updateProfile({ name, phone, status, username, email, bio })}>
              Зберегти профіль
            </button>
          </div>
        </motion.section>

        <motion.section className="shell-card section-card settings-prefs-card" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Preferences</span>
              <h2>Перенесені параметри інтерфейсу</h2>
            </div>
          </div>

          <div className="preference-stack">
            <PreferenceToggle
              active={settings.darkMode}
              description="Відображення foundation у темному режимі"
              title="Темна тема"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            />
            <PreferenceToggle
              active={settings.notifications}
              description="Нагадування та системна активність"
              title="Сповіщення"
              onClick={() => updateSettings({ notifications: !settings.notifications })}
            />
            <PreferenceToggle
              active={settings.musicEnabled}
              description="Фоновий музичний шар"
              title="Музика"
              onClick={() => updateSettings({ musicEnabled: !settings.musicEnabled })}
            />
            <PreferenceToggle
              active={settings.soundEnabled}
              description="Кліки й службові звуки"
              title="Звукові ефекти"
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />

            <label className="range-setting">
              <span>Гучність</span>
              <strong>{settings.volume}%</strong>
              <input
                max="100"
                min="0"
                type="range"
                value={settings.volume}
                onChange={(event: { target: { value: string } }) => updateSettings({ volume: Number(event.target.value) })}
              />
            </label>

            <label className="field field--full">
              <span>Мова</span>
              <select
                className="settings-select"
                value={settings.language}
                onChange={(event: { target: { value: string } }) => updateSettings({ language: event.target.value === 'en' ? 'en' : 'uk' })}
              >
                <option value="uk">Українська</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        </motion.section>

        <motion.section className="shell-card section-card settings-actions-card" {...cardTransition}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Actions</span>
              <h2>Миграционные действия без поломки deploy</h2>
            </div>
          </div>

          <div className="action-grid-foundation">
            <button className="ghost-button" type="button" onClick={() => resetPreferences()}>
              Скинути параметри
            </button>
            <button className="ghost-button" type="button" onClick={() => resetFoundation()}>
              Скинути foundation
            </button>
            <button className={infoPanel === 'about' ? 'primary-button' : 'ghost-button'} type="button" onClick={() => setInfoPanel('about')}>
              Про основу
            </button>
            <button className={infoPanel === 'privacy' ? 'primary-button' : 'ghost-button'} type="button" onClick={() => setInfoPanel('privacy')}>
              Конфіденційність
            </button>
            <button className={infoPanel === 'terms' ? 'primary-button' : 'ghost-button'} type="button" onClick={() => setInfoPanel('terms')}>
              Умови
            </button>
          </div>

          <article className="settings-info-card">
            <strong>{infoCopy.title}</strong>
            <p>{infoCopy.text}</p>
          </article>
        </motion.section>
      </div>
    </motion.div>
  );
}

function BottomNav() {
  const page = useAppStore((state) => state.navigation.page);
  const navigate = usePageNavigation();

  return (
    <nav className="bottom-nav" aria-label="Головна навігація">
      {pageOrder.map((item) => (
        <button className={page === item.id ? 'is-active' : ''} key={item.id} type="button" onClick={() => navigate(item.id)}>
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const page = useAppStore((state) => state.navigation.page);
  const settings = useAppStore((state) => state.settings);
  const deferredPage = useDeferredValue(page);
  const meta = pageMeta[deferredPage];
  const [authState, setAuthState] = useState<BrowserAuthState>(() => (
    readAuthState(extractWorkspaceFromStoreSnapshot(useAppStore.getState()))
  ));

  const currentUser = useMemo(
    () => authState.users.find((user) => user.login === authState.currentUserLogin) || null,
    [authState]
  );

  useEffect(() => {
    document.title = currentUser ? `${meta.title} · Skill Play` : 'Skill Play Access';
  }, [currentUser, meta.title]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.body.style.filter = settings.darkMode ? 'none' : 'saturate(.94) brightness(1.03)';
  }, [settings.darkMode, settings.language]);

  useEffect(() => {
    writeAuthState(authState);
  }, [authState]);

  useEffect(() => {
    if (!currentUser) return undefined;
    loadWorkspaceIntoStore(currentUser.workspace);
    return undefined;
  }, [currentUser]);

  useEffect(() => {
    if (!authState.currentUserLogin) return undefined;

    const unsubscribe = useAppStore.subscribe((state) => {
      setAuthState((current) => {
        if (!current.currentUserLogin) return current;

        const workspace = extractWorkspaceFromStoreSnapshot(state);
        let changed = false;
        const nextUsers = current.users.map((user) => {
          if (user.login !== current.currentUserLogin) return user;

          const previousWorkspace = JSON.stringify(user.workspace);
          const nextWorkspace = JSON.stringify(workspace);
          if (previousWorkspace === nextWorkspace) return user;

          changed = true;
          return {
            ...user,
            email: workspace.profile.email,
            updatedAt: new Date().toISOString(),
            workspace
          };
        });

        return changed ? { ...current, users: nextUsers } : current;
      });
    });

    return () => unsubscribe();
  }, [authState.currentUserLogin]);

  function handleModeChange(mode: AuthMode) {
    setAuthState((current) => ({
      ...current,
      mode
    }));
  }

  function handleRegister(input: { login: string; email: string; password: string; gender: Gender }): BrowserAuthResult {
    const normalizedLogin = String(input.login || '').trim().toLowerCase();
    const normalizedEmail = String(input.email || '').trim().toLowerCase();
    if (!normalizedLogin || !normalizedEmail || !input.password) return { ok: false, code: 'MISSING_FIELDS' };
    if (!isValidLoginValue(normalizedLogin)) return { ok: false, code: 'INVALID_LOGIN' };
    if (!isValidEmailValue(normalizedEmail)) return { ok: false, code: 'INVALID_EMAIL' };
    if (!isStrongPassword(input.password)) return { ok: false, code: 'WEAK_PASSWORD' };
    if (authState.users.some((user) => user.login.toLowerCase() === normalizedLogin)) return { ok: false, code: 'LOGIN_EXISTS' };
    if (authState.users.some((user) => user.email.toLowerCase() === normalizedEmail)) return { ok: false, code: 'EMAIL_EXISTS' };

    const workspace = buildDefaultWorkspace(input.gender);
    workspace.profile.name = normalizedLogin;
    workspace.profile.username = slugifyName(normalizedLogin);
    workspace.profile.email = normalizedEmail;
    workspace.profile.avatar = input.gender === 'female' ? '👩‍🎓' : '👨‍🎓';

    const user = createAuthUserRecord({
      login: normalizedLogin,
      email: normalizedEmail,
      password: input.password,
      providers: ['local'],
      lastAuthMethod: 'local',
      lastLoginAt: new Date().toISOString(),
      workspace
    });

    setAuthState((current) => ({
      mode: 'signin',
      currentUserLogin: user.login,
      users: [...current.users, user]
    }));
    loadWorkspaceIntoStore(user.workspace);
    return { ok: true };
  }

  function handleLogin(identity: string, password: string): BrowserAuthResult {
    const normalizedIdentity = String(identity || '').trim().toLowerCase();
    if (!normalizedIdentity || !String(password || '')) return { ok: false, code: 'MISSING_FIELDS' };

    const user = findUserByIdentity(authState.users, normalizedIdentity);
    if (!user) return { ok: false, code: 'INVALID_CREDENTIALS' };
    if (!user.password) return { ok: false, code: 'USE_BROWSER_ACCOUNT', providers: user.providers };
    if (user.password !== password) return { ok: false, code: 'INVALID_CREDENTIALS' };

    const nextUser = {
      ...user,
      lastAuthMethod: 'local' as const,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAuthState((current) => ({
      mode: 'signin',
      currentUserLogin: user.login,
      users: current.users.map((entry) => (entry.login === user.login ? nextUser : entry))
    }));
    loadWorkspaceIntoStore(user.workspace);
    return { ok: true };
  }

  function handleQuickLogin(login: string) {
    const user = authState.users.find((entry) => entry.login === login);
    if (!user) return;

    const nextUser = {
      ...user,
      lastAuthMethod: user.providers[0] || 'local',
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAuthState((current) => ({
      mode: 'signin',
      currentUserLogin: user.login,
      users: current.users.map((entry) => (entry.login === user.login ? nextUser : entry))
    }));
    loadWorkspaceIntoStore(user.workspace);
  }

  function handleLogout() {
    const currentWorkspace = extractWorkspaceFromStoreSnapshot(useAppStore.getState());
    const resetWorkspace = buildDefaultWorkspace(currentWorkspace.character.gender);

    setAuthState((current) => ({
      mode: current.users.length ? 'signin' : 'signup',
      currentUserLogin: null,
      users: current.users.map((user) => (
        user.login === current.currentUserLogin
          ? {
            ...user,
            email: currentWorkspace.profile.email,
            updatedAt: new Date().toISOString(),
            workspace: currentWorkspace
          }
          : user
      ))
    }));

    loadWorkspaceIntoStore(resetWorkspace);
  }

  if (!currentUser) {
    return (
      <AuthGate
        mode={authState.mode}
        users={authState.users}
        onLogin={handleLogin}
        onModeChange={handleModeChange}
        onQuickLogin={handleQuickLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className="ambient ambient--blue" aria-hidden="true" />
        <div className="ambient ambient--mint" aria-hidden="true" />
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        <ToastViewport />

        <main className="page-host">
          <AnimatePresence mode="wait">
            {deferredPage === 'home' && <HomePage />}
            {deferredPage === 'avatar' && <AvatarPage />}
            {deferredPage === 'shop' && <ShopPage />}
            {deferredPage === 'games' && <GamesPage />}
            {deferredPage === 'settings' && <SettingsPage />}
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
