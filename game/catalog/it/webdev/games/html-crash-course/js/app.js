const APP_HOME_TOAST_KEY = 'appHomeToast';
const APP_SPLASH_SEEN_KEY = 'appSplashSeen';
const GAME_STORAGE_SCOPE = window.AppDB?.getCurrentUser?.() || 'guest';
const GAME_STORAGE_PREFIX = `hbg2_${GAME_STORAGE_SCOPE}_`;
const TOTAL_GAME_LEVELS = 5;
const SPLASH_FIRST_MIN_PLAY_MS = 3800;
const SPLASH_RETURN_MIN_PLAY_MS = 1600;
const SPLASH_FALLBACK_DELAY = 4200;
const SPLASH_POST_PAUSE_MS = 300;
const SPLASH_EXIT_MS = 820;
const HOME_TOAST_HIDE_DELAY = 4200;

const CATALOG = [
  {
    id: 'web-builder',
    title: 'Web Builder Track',
    badge: 'Featured track',
    tag: 'IT / Front-end',
    completedLessons: 8,
    totalLessons: 18,
    difficulty: 'Beginner',
    reward: '5 рівнів практики',
    progress: 'Активний трек',
    copy: 'HTML, CSS і мобільна композиція інтерфейсів через короткі місії з живим preview.',
    modules: ['Semantic structure', 'Semantic layout', 'Responsive cards', 'Starter CSS polish'],
    perks: ['Практика руками', 'Мобільний UX фокус', 'Живий фідбек по коду'],
    cta: 'Відкрити трек',
    launchGame: true
  },
  {
    id: 'economy-sprint',
    title: 'Economy Sprint',
    badge: 'Popular with students',
    tag: 'Finance',
    completedLessons: 4,
    totalLessons: 12,
    difficulty: 'Starter',
    reward: '12 коротких уроків',
    progress: 'Наступний у черзі',
    copy: 'Фінансова грамотність, щоденні мікро-рішення та корисні звички для особистого капіталу.',
    modules: ['Budget basics', 'Daily habits', 'Risk thinking', 'Personal reserve'],
    perks: ['Короткі сценарії', 'Живі кейси', 'Фокус на звички'],
    cta: 'Переглянути програму',
    launchGame: false
  },
  {
    id: 'soft-skills-lab',
    title: 'Soft Skills Lab',
    badge: 'Career growth',
    tag: 'Communication',
    completedLessons: 2,
    totalLessons: 10,
    difficulty: 'Beginner',
    reward: '10 коротких уроків',
    progress: 'Available now',
    copy: 'Переговори, презентації, впевнена комунікація та навички, які реально допомагають у кар’єрі.',
    modules: ['Active listening', 'Clear speaking', 'Conflict handling', 'Pitch basics'],
    perks: ['М’які навички', 'Швидкі місії', 'Ситуаційний формат'],
    cta: 'Відкрити програму',
    launchGame: false
  }
];

const GAMES = [
  {
    id: 'html-crash',
    title: 'HTML Builder Quest',
    copy: 'Drag-and-drop редактор DOM із live preview, audit-панеллю та винагородами.',
    cta: 'Запустити',
    href: 'runtime/index.html',
    meta: ['5 рівнів', 'Практика', 'Live audit']
  },
  {
    id: 'css-layout-arena',
    title: 'CSS Layout Arena',
    copy: 'Наступний модуль із flex, grid та візуальними місіями для мобільних екранів.',
    cta: 'Скоро',
    href: '',
    meta: ['Upcoming', 'Layout logic', 'Locked']
  }
];

const LEADERBOARD_TEMPLATE = [
  { rank: 1, name: 'Nika', score: 'Лідер тижня', badge: '🔥 19 day streak' },
  { rank: 2, name: 'Академіст', score: 'У фокусі', badge: 'Ти тут' },
  { rank: 3, name: 'Maks', score: 'Сильний темп', badge: '⚡ Fast finisher' },
  { rank: 4, name: 'Lina', score: 'Стабільний прогрес', badge: '🎯 Accuracy master' }
];

const ACHIEVEMENTS = [
  { id: 'first_steps', icon: '◎', title: 'First Steps', copy: 'Початок шляху в академії.' },
  { id: 'focus_mode', icon: '◌', title: 'Focus Mode', copy: '7 днів поспіль без пропусків.' },
  { id: 'builder_core', icon: '▣', title: 'Builder Core', copy: 'Пройди повний HTML курс.' },
  { id: 'shop_ready', icon: '✦', title: 'Shop Ready', copy: 'Купи перший візуальний апгрейд.' }
];

const SCREENS = ['home', 'courses', 'course', 'games', 'leaderboard', 'profile'];

const state = {
  activeScreen: 'home',
  previousScreen: 'courses',
  selectedCourseId: CATALOG[0].id
};

let homeToastTimer = 0;
let splashWatchdogTimer = 0;
let splashMinTimer = 0;
let splashPauseTimer = 0;
let splashCanHide = false;
let pageFullyLoaded = false;
let splashMediaReady = false;
let splashHidden = false;
let splashTransitionStarted = false;

function systemPrefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
}

function shouldReduceMotion() {
  return document.body.classList.contains('reduce-motion') || systemPrefersReducedMotion();
}

function getSplashMinPlayMs() {
  if (shouldReduceMotion()) return 0;
  return localStorage.getItem(APP_SPLASH_SEEN_KEY) === '1'
    ? SPLASH_RETURN_MIN_PLAY_MS
    : SPLASH_FIRST_MIN_PLAY_MS;
}

function setTextIfExists(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getTodayStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getGameProgress() {
  const levelRaw = Number.parseInt(localStorage.getItem(`${GAME_STORAGE_PREFIX}level`) || '0', 10);
  const xpRaw = Number.parseInt(localStorage.getItem(`${GAME_STORAGE_PREFIX}xp`) || '0', 10);
  const done = readJsonStorage(`${GAME_STORAGE_PREFIX}done`, []);

  return {
    currentLevel: Number.isFinite(levelRaw) ? Math.min(TOTAL_GAME_LEVELS, Math.max(1, levelRaw + 1)) : 1,
    xp: Number.isFinite(xpRaw) ? Math.max(0, xpRaw) : 0,
    doneCount: Array.isArray(done) ? done.length : 0,
    completion: Math.round(((Array.isArray(done) ? done.length : 0) / TOTAL_GAME_LEVELS) * 100)
  };
}

function getDb() {
  return window.AppDB?.getData?.() || {
    user: { name: 'Академіст', avatar: 'LC', handle: '@guest', streak: 7, city: 'Kyiv' },
    profile: { level: 1, rank: 'Student' },
    progress: { xp: 182, completedLessons: 8, totalLessons: 18, recentGames: [], categoryScores: {} },
    academy: { achievements: [], unlockedGames: ['html-crash'] },
    settings: { reduceMotion: false, darkMode: true }
  };
}

function getCourseById(courseId) {
  return CATALOG.find((course) => course.id === courseId) || CATALOG[0];
}

function getNavScreenTarget(screenId) {
  return screenId === 'course' ? 'courses' : screenId;
}

function getLeaderboardRows(db) {
  const fallbackName = db.user?.name || 'Академіст';
  return LEADERBOARD_TEMPLATE.map((entry) => {
    if (entry.rank !== 2) return entry;
    return {
      ...entry,
      name: fallbackName,
      score: 'У фокусі'
    };
  });
}

function showToast(message, type = 'default') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = `toast${type === 'success' ? ' toast--success' : type === 'warning' ? ' toast--warning' : ''}`;
  toast.textContent = message;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function setScreen(screenId) {
  if (!SCREENS.includes(screenId)) return;
  state.activeScreen = screenId;

  document.querySelectorAll('.app-screen').forEach((screen) => {
    screen.classList.toggle('active', screen.dataset.screen === screenId);
  });

  window.scrollTo({
    top: 0,
    behavior: document.body.classList.contains('reduce-motion') ? 'auto' : 'smooth'
  });
}

function updateHomeToast() {
  const toastMessage = localStorage.getItem(APP_HOME_TOAST_KEY);
  const toastEl = document.getElementById('home-toast');
  if (!toastEl) return;

  if (homeToastTimer) {
    window.clearTimeout(homeToastTimer);
    homeToastTimer = 0;
  }

  if (!toastMessage) {
    toastEl.hidden = true;
    toastEl.textContent = '';
    return;
  }

  toastEl.hidden = false;
  toastEl.textContent = toastMessage;
  localStorage.removeItem(APP_HOME_TOAST_KEY);
  homeToastTimer = window.setTimeout(() => {
    toastEl.hidden = true;
    toastEl.textContent = '';
    homeToastTimer = 0;
  }, HOME_TOAST_HIDE_DELAY);
}

function launchGame() {
  window.location.href = 'runtime/index.html';
}

function getSettingsMarkup() {
  const db = getDb();
  const settings = [
    ['reduceMotion', 'Reduce motion']
  ];

  return `
    <div class="settings-list">
      ${settings.map(([key, label]) => `
        <article class="settings-item">
          <div>
            <strong>${label}</strong>
            <p>${key === 'reduceMotion' ? 'Спокійніша анімація для чутливих користувачів.' : 'Зберігається локально у твоєму профілі.'}</p>
          </div>
          <button class="toggle${db.settings[key] ? ' is-on' : ''}" type="button" data-toggle-key="${key}" aria-label="${label}"></button>
        </article>
      `).join('')}
      <article class="settings-item settings-item--action">
        <div>
          <strong>Щотижнева статистика</strong>
          <p>Подивись загальний прогрес, темп проходження та активні теми.</p>
        </div>
        <button class="secondary-btn" type="button" data-open-sheet="stats">Звіт</button>
      </article>
    </div>
  `;
}

function getAchievementsMarkup() {
  const db = getDb();
  const unlockedCount = ACHIEVEMENTS.filter((item) => db.academy.achievements.includes(item.id)).length;
  return `
    <div class="sheet-summary">
      <strong>Прогрес досягнень</strong>
      <span>${unlockedCount} / ${ACHIEVEMENTS.length} unlocked</span>
    </div>
    <div class="reward-list">
      ${ACHIEVEMENTS.map((item) => `
        <article class="sheet-item">
          <strong>${item.icon} ${item.title}</strong>
          <p>${item.copy}</p>
          <span>${db.academy.achievements.includes(item.id) ? 'Unlocked' : 'Locked'}</span>
        </article>
      `).join('')}
    </div>
  `;
}

function getStatsMarkup() {
  const db = getDb();
  const favoriteCategory = db.progress.favoriteCategory || 'it';
  return `
    <div class="sheet-list">
      <article class="sheet-item">
        <strong>Прогрес проходження</strong>
        <p>${db.progress.completedLessons} із ${db.progress.totalLessons} навчальних кроків та ${db.progress.gamesPlayed || 0} ігрових сесій.</p>
      </article>
      <article class="sheet-item">
        <strong>Сильна категорія</strong>
        <p>Найвищий прогрес зараз у напрямі <strong>${favoriteCategory}</strong>. Це твій поточний growth-zone.</p>
      </article>
    </div>
  `;
}

function openSheet(type) {
  const backdrop = document.getElementById('sheet-backdrop');
  const body = document.getElementById('sheet-body');
  const title = document.getElementById('sheet-title');
  const kicker = document.getElementById('sheet-kicker');
  if (!backdrop || !body || !title || !kicker) return;

  const configs = {
    settings: {
      kicker: 'Preferences',
      title: 'Налаштування досвіду',
      markup: getSettingsMarkup()
    },
    achievements: {
      kicker: 'Achievements',
      title: 'Досягнення та прогрес',
      markup: getAchievementsMarkup()
    },
    stats: {
      kicker: 'Stats',
      title: 'Щотижневий звіт',
      markup: getStatsMarkup()
    }
  };

  const config = configs[type];
  if (!config) return;

  kicker.textContent = config.kicker;
  title.textContent = config.title;
  body.innerHTML = config.markup;
  backdrop.hidden = false;
  document.body.classList.add('sheet-open');
}

function closeSheet() {
  const backdrop = document.getElementById('sheet-backdrop');
  if (backdrop) backdrop.hidden = true;
  document.body.classList.remove('sheet-open');
}

function toggleSetting(key) {
  window.AppDB.update((db) => {
    db.settings[key] = !db.settings[key];
  });

  hydrateApp();
  openSheet('settings');
}

function renderCatalog() {
  const catalog = document.getElementById('catalog-grid');
  if (!catalog) return;

  catalog.innerHTML = CATALOG.map((item) => {
    const percent = Math.round((item.completedLessons / item.totalLessons) * 100);
    return `
      <article class="catalog-card card">
        <span class="badge">${item.tag}</span>
        <strong>${item.title}</strong>
        <p>${item.copy}</p>
        <div class="catalog-card__meta">
          <span>${item.completedLessons} з ${item.totalLessons} уроків</span>
          <span>${item.progress}</span>
          <span>${percent}% ready</span>
        </div>
        <button class="secondary-btn secondary-btn--full" type="button" data-course-id="${item.id}">${item.cta}</button>
      </article>
    `;
  }).join('');
}

function renderCourseDetail() {
  const course = getCourseById(state.selectedCourseId);
  const gameProgress = getGameProgress();
  const title = document.getElementById('course-title');
  if (!title) return;

  const percent = Math.round((course.completedLessons / course.totalLessons) * 100);
  const modules = document.getElementById('course-step-list');
  const perks = document.getElementById('course-perks');
  const continueBtn = document.getElementById('course-continue-btn');

  document.getElementById('course-badge').textContent = course.badge;
  title.textContent = course.title;
  document.getElementById('course-copy').textContent = course.copy;
  document.getElementById('course-progress').textContent = `${course.completedLessons} / ${course.totalLessons}`;
  document.getElementById('course-difficulty').textContent = course.difficulty;
  document.getElementById('course-reward').textContent = course.launchGame ? `Практика з 5 рівнів` : course.reward;
  document.getElementById('course-progress-label').textContent = `${percent}%`;
  document.getElementById('course-progress-fill').style.width = `${percent}%`;

  if (continueBtn) {
    continueBtn.textContent = course.launchGame ? 'Продовжити місію' : 'Трек у roadmap';
    continueBtn.disabled = !course.launchGame;
  }

  if (modules) {
    modules.innerHTML = course.modules.map((step, index) => `
      <article class="course-step ${index < course.completedLessons / Math.max(1, Math.ceil(course.totalLessons / course.modules.length)) ? 'course-step--done' : ''}">
        <span class="course-step__index">0${index + 1}</span>
        <div>
          <strong>${step}</strong>
          <p>${index === 0 && course.launchGame ? 'Доступно вже зараз через HTML Builder Quest.' : 'Готує наступний крок і допомагає краще зрозуміти тему.'}</p>
        </div>
      </article>
    `).join('');

    if (course.launchGame) {
      const firstCopy = modules.querySelector('.course-step p');
      if (firstCopy) firstCopy.textContent = 'Доступно вже зараз без лекцій, одразу до практики.';
    }
  }

  if (perks) {
    perks.innerHTML = course.perks.map((perk) => `
      <article class="course-perk">
        <strong>${perk}</strong>
        <p>Секція оформлена як частина готового продукту, а не академічний список.</p>
      </article>
    `).join('');
  }
}

function selectCourse(courseId) {
  state.selectedCourseId = courseId;
  state.previousScreen = state.activeScreen === 'course' ? 'courses' : state.activeScreen;
  renderCourseDetail();
  setScreen('course');
}

function renderGames() {
  const container = document.getElementById('games-list');
  if (!container) return;
  const db = getDb();
  const unlockedGames = Array.isArray(db.academy.unlockedGames) ? db.academy.unlockedGames : ['html-crash'];

  container.innerHTML = GAMES.map((game) => {
    const isUnlocked = unlockedGames.includes(game.id);
    const isLaunchable = Boolean(game.href) && isUnlocked;

    return `
      <article class="game-card card">
        <strong>${game.title}</strong>
        <p>${game.copy}</p>
        <div class="game-card__meta">
          ${game.meta.map((value) => `<span>${value}</span>`).join('')}
        </div>
        <button class="${isLaunchable ? 'primary-btn' : 'secondary-btn'} primary-btn--full" type="button" ${isLaunchable ? 'data-launch-game="true"' : 'disabled'}>${game.cta}</button>
      </article>
    `;
  }).join('');
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;
  const db = getDb();

  container.innerHTML = getLeaderboardRows(db).map((entry) => `
    <article class="leaderboard-item">
      <div class="leaderboard-rank">${entry.rank}</div>
      <div>
        <strong>${entry.name}</strong>
        <span>${entry.badge}</span>
      </div>
      <span>${entry.score}</span>
    </article>
  `).join('');
}

function renderAchievements() {
  const container = document.getElementById('achievement-grid');
  if (!container) return;
  const db = getDb();

  container.innerHTML = ACHIEVEMENTS.map((item) => `
    <article class="achievement-card${db.academy.achievements.includes(item.id) ? ' achievement-card--unlocked' : ''}">
      <span class="badge">${item.icon}</span>
      <strong>${item.title}</strong>
      <p>${item.copy}</p>
      <small>${db.academy.achievements.includes(item.id) ? 'Unlocked' : 'Locked'}</small>
    </article>
  `).join('');
}

function hydrateProfile(db) {
  const avatar = db.user.avatar || 'LC';
  const name = db.user.name || 'Студент';
  const handle = db.user.handle || '@guest';

  setTextIfExists('profile-avatar', avatar);
  setTextIfExists('profile-name', name);
  setTextIfExists('profile-screen-avatar', avatar);
  setTextIfExists('profile-screen-name', name);
  setTextIfExists('profile-screen-handle', handle);
}

function hydrateHero(db, gameProgress) {
  const totalLessons = Math.max(1, Number.parseInt(db.progress.totalLessons, 10) || TOTAL_GAME_LEVELS);
  const completedLessons = Math.min(totalLessons, Math.max(0, Number.parseInt(db.progress.completedLessons, 10) || 0));
  setTextIfExists('hero-progress-label', `${completedLessons} / ${totalLessons} уроків`);
  const fill = document.getElementById('hero-progress-fill');
  if (fill) fill.style.width = `${Math.round((completedLessons / totalLessons) * 100)}%`;
}

function hydrateGameLaunchPanel() {
  const panel = document.querySelector('.game-launch-panel');
  if (!panel) return;

  const kicker = panel.querySelector('.section-kicker');
  const title = panel.querySelector('h2');
  const text = panel.querySelector('p');
  const button = panel.querySelector('#launch-game-btn');

  if (kicker) kicker.textContent = 'Гра';
  if (title) title.textContent = 'Почати гру';
  if (text) text.textContent = 'Відкрий гру й одразу переходь до практики без лекцій та зайвих блоків.';
  if (button) button.textContent = 'Почати гру';
}

function hydrateApp() {
  const db = getDb();
  const gameProgress = getGameProgress();

  document.body.classList.toggle('reduce-motion', Boolean(db.settings.reduceMotion || systemPrefersReducedMotion()));
  document.body.classList.add('app-ready');

  hydrateProfile(db);
  hydrateHero(db, gameProgress);
  hydrateGameLaunchPanel();
  renderCatalog();
  renderCourseDetail();
  renderGames();
  renderLeaderboard();
  renderAchievements();
  updateHomeToast();
}

function handleSheetActions(event) {
  const toggleBtn = event.target.closest('[data-toggle-key]');
  const openSheetBtn = event.target.closest('[data-open-sheet]');

  if (toggleBtn) toggleSetting(toggleBtn.dataset.toggleKey);
  if (openSheetBtn) openSheet(openSheetBtn.dataset.openSheet);
}

function setupSplashGif() {
  const splashGif = document.getElementById('splash-gif');
  const splashFallback = document.getElementById('splash-loader-fallback');
  const splashCore = document.getElementById('splash-core');
  if (!splashGif || !splashFallback || !splashCore) return;

  const maybeStartTransition = () => {
    if (!pageFullyLoaded || !splashCanHide || !splashMediaReady || splashHidden || splashTransitionStarted) return;
    splashTransitionStarted = true;

    if (shouldReduceMotion()) {
      hideSplash();
      return;
    }

    splashPauseTimer = window.setTimeout(() => {
      hideSplash();
    }, SPLASH_POST_PAUSE_MS);
  };

  const showGif = () => {
    if (splashWatchdogTimer) {
      window.clearTimeout(splashWatchdogTimer);
      splashWatchdogTimer = 0;
    }
    splashMediaReady = true;
    splashGif.style.display = 'block';
    splashFallback.classList.add('is-hidden');
    splashCore.classList.remove('is-fallback');
    maybeStartTransition();
  };

  const showFallback = () => {
    if (splashWatchdogTimer) {
      window.clearTimeout(splashWatchdogTimer);
      splashWatchdogTimer = 0;
    }
    splashMediaReady = true;
    splashGif.style.display = 'none';
    splashFallback.classList.remove('is-hidden');
    splashCore.classList.add('is-fallback');
    maybeStartTransition();
  };

  const tryAltSource = () => {
    const altSrc = splashGif.dataset.altSrc;
    if (!altSrc || splashGif.dataset.altTried === '1' || splashGif.getAttribute('src') === altSrc) {
      showFallback();
      return;
    }

    splashGif.dataset.altTried = '1';
    splashGif.src = altSrc;
  };

  const handleLoad = () => {
    if (splashGif.naturalWidth > 0) {
      showGif();
      return;
    }
    tryAltSource();
  };

  const handleError = () => {
    if (splashGif.dataset.altTried === '1') {
      showFallback();
      return;
    }
    tryAltSource();
  };

  splashGif.style.display = 'block';
  splashFallback.classList.add('is-hidden');
  splashGif.addEventListener('load', handleLoad);
  splashGif.addEventListener('error', handleError);

  if (splashGif.complete) {
    handleLoad();
  } else {
    splashWatchdogTimer = window.setTimeout(() => {
      if (splashGif.complete && splashGif.naturalWidth > 0) {
        showGif();
        return;
      }
      handleError();
    }, SPLASH_FALLBACK_DELAY);
  }

  splashMinTimer = window.setTimeout(() => {
    splashCanHide = true;
    maybeStartTransition();
  }, getSplashMinPlayMs());
}

function hideSplash() {
  const splash = document.getElementById('splash-screen');
  if (!splash || splashHidden) return;
  splashHidden = true;
  if (splashWatchdogTimer) {
    window.clearTimeout(splashWatchdogTimer);
    splashWatchdogTimer = 0;
  }
  if (splashMinTimer) {
    window.clearTimeout(splashMinTimer);
    splashMinTimer = 0;
  }
  if (splashPauseTimer) {
    window.clearTimeout(splashPauseTimer);
    splashPauseTimer = 0;
  }
  splash.classList.add('is-exiting');
  document.body.classList.add('splash-transitioning');
  window.setTimeout(() => {
    splash.setAttribute('aria-hidden', 'true');
    splash.hidden = true;
    splash.style.display = 'none';
    splash.classList.add('hidden');
    document.body.classList.add('splash-complete');
    localStorage.setItem(APP_SPLASH_SEEN_KEY, '1');
  }, SPLASH_EXIT_MS);
}

function bindEvents() {
  document.querySelectorAll('[data-screen-target]').forEach((button) => {
    button.addEventListener('click', () => {
      state.previousScreen = state.activeScreen;
      setScreen(button.dataset.screenTarget);
    });
  });

  document.querySelectorAll('[data-sheet]').forEach((button) => {
    button.addEventListener('click', () => openSheet(button.dataset.sheet));
  });

  document.getElementById('launch-game-btn')?.addEventListener('click', launchGame);
  document.getElementById('sheet-close')?.addEventListener('click', closeSheet);
  document.getElementById('sheet-body')?.addEventListener('click', handleSheetActions);
  document.getElementById('course-back-btn')?.addEventListener('click', () => setScreen('courses'));
  document.getElementById('course-continue-btn')?.addEventListener('click', () => {
    const course = getCourseById(state.selectedCourseId);
    if (course.launchGame) {
      launchGame();
      return;
    }
    showToast('Цей трек уже в roadmap, але ще не підключений як інтерактивна гра.', 'warning');
  });

  const backdrop = document.getElementById('sheet-backdrop');
  backdrop?.addEventListener('click', (event) => {
    if (event.target === backdrop) closeSheet();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSheet();
  });

  document.getElementById('catalog-grid')?.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-course-id]');
    if (!trigger) return;
    selectCourse(trigger.dataset.courseId);
  });

  document.getElementById('games-list')?.addEventListener('click', (event) => {
    if (event.target.closest('[data-launch-game="true"]')) launchGame();
  });
}

function hydrateGameLaunchPanel() {
  const panel = document.querySelector('.game-launch-panel');
  if (!panel) return;

  const kicker = panel.querySelector('.section-kicker');
  const title = panel.querySelector('h2');
  const text = panel.querySelector('p');
  const button = panel.querySelector('#launch-game-btn');

  if (kicker) kicker.textContent = 'РџСЂР°РєС‚РёРєР°';
  if (title) title.textContent = 'РџРѕС‚С–Рј РѕРґСЂР°Р·Сѓ РіСЂР°';
  if (text) text.textContent = 'РџРѕСЃР»С– РєРѕСЂРѕС‚РєРѕС— Р»РµРєС†С–С— С‚Рё С‚РѕС‡РЅРѕ Р·РЅР°С”С€ С‰Рѕ Р±СѓРґРµС€ Р±СѓРґСѓРІР°С‚Рё, Р° РґР°Р»С– РјРѕР¶РЅР° РІС–РґСЂР°Р·Сѓ Р·Р±РёСЂР°С‚Рё HTML-СЃС‚СЂСѓРєС‚СѓСЂСѓ СЂСѓРєР°РјРё.';
  if (button) button.textContent = 'РџРѕС‡Р°С‚Рё РіСЂСѓ';
}

function scrollToLecture() {
  const lectureSection = document.getElementById('lecture-section');
  if (!lectureSection) return;

  lectureSection.scrollIntoView({
    behavior: shouldReduceMotion() ? 'auto' : 'smooth',
    block: 'start'
  });
}

setupSplashGif();
hydrateApp();
bindEvents();

document.getElementById('scroll-lecture-btn')?.addEventListener('click', scrollToLecture);

window.addEventListener('load', () => {
  pageFullyLoaded = true;
  if (splashCanHide && splashMediaReady && !splashTransitionStarted) {
    splashTransitionStarted = true;
    if (shouldReduceMotion()) {
      hideSplash();
      return;
    }
    splashPauseTimer = window.setTimeout(() => {
      hideSplash();
    }, SPLASH_POST_PAUSE_MS);
  }
});
