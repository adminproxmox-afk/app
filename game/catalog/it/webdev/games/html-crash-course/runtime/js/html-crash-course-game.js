const TAGS = {
  html:    { color: '#ff8c1a', attrs: {}, canHave: ['head', 'body'] },
  head:    { color: '#8e64ff', attrs: {}, canHave: ['title', 'meta', 'link'] },
  title:   { color: '#a574ff', attrs: { text: 'Моя сторінка' }, canHave: [] },
  meta:    { color: '#b69cff', attrs: { charset: 'utf-8' }, canHave: [] },
  link:    { color: '#b69cff', attrs: { rel: 'stylesheet', href: '' }, canHave: [] },
  body:    { color: '#4c97ff', attrs: {}, canHave: ['*'] },
  header:  { color: '#59c059', attrs: {}, canHave: ['*'] },
  nav:     { color: '#43b581', attrs: {}, canHave: ['a', 'ul', 'li', 'div', 'span'] },
  main:    { color: '#59c059', attrs: {}, canHave: ['*'] },
  section: { color: '#5cb1d6', attrs: {}, canHave: ['*'] },
  article: { color: '#5cb1d6', attrs: {}, canHave: ['*'] },
  footer:  { color: '#0fbd8c', attrs: {}, canHave: ['*'] },
  div:     { color: '#ff6680', attrs: {}, canHave: ['*'] },
  h1:      { color: '#ffab19', attrs: { text: 'Заголовок' }, canHave: [] },
  h2:      { color: '#ffab19', attrs: { text: 'Підзаголовок' }, canHave: [] },
  h3:      { color: '#ffab19', attrs: { text: 'Менший заголовок' }, canHave: [] },
  p:       { color: '#ff6680', attrs: { text: 'Текст абзацу' }, canHave: [] },
  a:       { color: '#9966ff', attrs: { href: '#', text: 'Посилання' }, canHave: [] },
  img:     { color: '#ff8c1a', attrs: { src: '', alt: 'Зображення' }, canHave: [] },
  ul:      { color: '#59c059', attrs: {}, canHave: ['li'] },
  li:      { color: '#59c059', attrs: { text: 'Пункт списку' }, canHave: [] },
  span:    { color: '#ff6680', attrs: { text: 'Текст' }, canHave: [] },
  button:  { color: '#9966ff', attrs: { text: 'Кнопка' }, canHave: [] },
};

const LEVELS = [
  {
    id: 1,
    name: 'Привіт, HTML',
    xp: 4,
    desc: 'Побудуй найпростішу HTML-сторінку з заголовком і абзацом.',
    template: 'html → body → h1 + p',
    tags: ['html', 'body', 'h1', 'p'],
    validate(tree) {
      const html = tree.find(node => node.tag === 'html');
      const errs = [];
      if (!html) return ['Потрібен тег <html>.'];
      const body = html.ch.find(node => node.tag === 'body');
      if (!body) return ['Всередині <html> має бути <body>.'];
      if (!body.ch.find(node => node.tag === 'h1')) errs.push('У <body> потрібен тег <h1>.');
      if (!body.ch.find(node => node.tag === 'p')) errs.push('У <body> потрібен тег <p>.');
      return errs;
    },
  },
  {
    id: 2,
    name: 'Шапка сайту',
    xp: 5,
    desc: 'Додай структурні секції header і main.',
    template: 'html → body → header(h1) + main(p)',
    tags: ['html', 'body', 'header', 'main', 'h1', 'p'],
    validate(tree) {
      const html = tree.find(node => node.tag === 'html');
      const errs = [];
      if (!html) return ['Потрібен тег <html>.'];
      const body = html.ch.find(node => node.tag === 'body');
      if (!body) return ['Всередині <html> має бути <body>.'];
      const header = body.ch.find(node => node.tag === 'header');
      const main = body.ch.find(node => node.tag === 'main');
      if (!header) errs.push('У <body> потрібен <header>.');
      if (!main) errs.push('У <body> потрібен <main>.');
      if (header && !header.ch.find(node => node.tag === 'h1')) errs.push('У <header> потрібен <h1>.');
      if (main && !main.ch.find(node => node.tag === 'p')) errs.push('У <main> потрібен <p>.');
      return errs;
    },
  },
  {
    id: 3,
    name: 'Зображення',
    xp: 7,
    desc: 'Додай картинку, текст у main і footer внизу сторінки.',
    template: 'html → body → header(h1) + main(img + p) + footer(p)',
    tags: ['html', 'body', 'header', 'main', 'footer', 'h1', 'p', 'img'],
    validate(tree) {
      const html = tree.find(node => node.tag === 'html');
      const errs = [];
      if (!html) return ['Потрібен тег <html>.'];
      const body = html.ch.find(node => node.tag === 'body');
      if (!body) return ['Всередині <html> має бути <body>.'];
      const header = body.ch.find(node => node.tag === 'header');
      const main = body.ch.find(node => node.tag === 'main');
      const footer = body.ch.find(node => node.tag === 'footer');
      if (!header) errs.push('У <body> потрібен <header>.');
      if (!main) errs.push('У <body> потрібен <main>.');
      if (!footer) errs.push('У <body> потрібен <footer>.');
      if (main) {
        const img = main.ch.find(node => node.tag === 'img');
        if (!img) errs.push('У <main> потрібен тег <img>.');
        if (img && !img.attrs.src.trim()) errs.push('У <img> треба заповнити атрибут src.');
        if (!main.ch.find(node => node.tag === 'p')) errs.push('У <main> потрібен тег <p>.');
      }
      return errs;
    },
  },
  {
    id: 4,
    name: 'Навігація',
    xp: 9,
    desc: 'Створи head з title і меню навігації з двома посиланнями.',
    template: 'html → head(title) + body → header(nav[a,a]) + main(h1+p) + footer(p)',
    tags: ['html', 'head', 'title', 'body', 'header', 'nav', 'main', 'footer', 'h1', 'p', 'a'],
    validate(tree) {
      const html = tree.find(node => node.tag === 'html');
      const errs = [];
      if (!html) return ['Потрібен тег <html>.'];
      const head = html.ch.find(node => node.tag === 'head');
      const body = html.ch.find(node => node.tag === 'body');
      if (!head) errs.push('У <html> потрібен <head>.');
      if (head && !head.ch.find(node => node.tag === 'title')) errs.push('У <head> потрібен <title>.');
      if (!body) return [...errs, 'У <html> потрібен <body>.'];
      const header = body.ch.find(node => node.tag === 'header');
      const main = body.ch.find(node => node.tag === 'main');
      const footer = body.ch.find(node => node.tag === 'footer');
      if (!header) errs.push('У <body> потрібен <header>.');
      if (!main) errs.push('У <body> потрібен <main>.');
      if (!footer) errs.push('У <body> потрібен <footer>.');
      if (header) {
        const nav = header.ch.find(node => node.tag === 'nav');
        if (!nav) errs.push('У <header> потрібен <nav>.');
        if (nav && nav.ch.filter(node => node.tag === 'a').length < 2) errs.push('У <nav> потрібно мінімум 2 теги <a>.');
      }
      if (main) {
        if (!main.ch.find(node => node.tag === 'h1')) errs.push('У <main> потрібен <h1>.');
        if (!main.ch.find(node => node.tag === 'p')) errs.push('У <main> потрібен <p>.');
      }
      return errs;
    },
  },
  {
    id: 5,
    name: 'Повна сторінка',
    xp: 13,
    desc: 'Збери повну сторінку з header, section, картинкою та CTA-посиланням.',
    template: 'html → head(title) + body → header(nav+h1) + main(section:h2+p+img+a) + footer(p)',
    tags: ['html', 'head', 'title', 'body', 'header', 'nav', 'main', 'section', 'footer', 'h1', 'h2', 'p', 'a', 'img'],
    validate(tree) {
      const html = tree.find(node => node.tag === 'html');
      const errs = [];
      if (!html) return ['Потрібен тег <html>.'];
      const head = html.ch.find(node => node.tag === 'head');
      const body = html.ch.find(node => node.tag === 'body');
      if (!head || !head.ch.find(node => node.tag === 'title')) errs.push('У <head> потрібен тег <title>.');
      if (!body) return [...errs, 'У <html> потрібен <body>.'];
      const header = body.ch.find(node => node.tag === 'header');
      const main = body.ch.find(node => node.tag === 'main');
      const footer = body.ch.find(node => node.tag === 'footer');
      if (!header) errs.push('У <body> потрібен <header>.');
      if (!main) errs.push('У <body> потрібен <main>.');
      if (!footer) errs.push('У <body> потрібен <footer>.');
      if (header) {
        if (!header.ch.find(node => node.tag === 'nav')) errs.push('У <header> потрібен <nav>.');
        if (!header.ch.find(node => node.tag === 'h1')) errs.push('У <header> потрібен <h1>.');
      }
      if (main) {
        const section = main.ch.find(node => node.tag === 'section');
        if (!section) errs.push('У <main> потрібен <section>.');
        if (section) {
          if (!section.ch.find(node => node.tag === 'h2')) errs.push('У <section> потрібен <h2>.');
          if (!section.ch.find(node => node.tag === 'p')) errs.push('У <section> потрібен <p>.');
          if (!section.ch.find(node => node.tag === 'img')) errs.push('У <section> потрібен <img>.');
          if (!section.ch.find(node => node.tag === 'a')) errs.push('У <section> потрібен <a>.');
        }
      }
      return errs;
    },
  },
];

const APP_GAME_ID = 'html-crash';
const APP_GAME_NAME = 'HTML Crash Course';
const APP_GAME_CATEGORY = 'it';
const APP_GAME_SUBCATEGORY = 'webdev';
const APP_ROOT_PREFIX = '../../../../../../../';
const APP_PROGRESS_TEMPLATE = {
  xp: 0,
  gamesPlayed: 0,
  categoryScores: {
    it: 0,
    economy: 0,
    softskills: 0,
    agro: 0
  },
  favoriteCategory: 'it',
  recentGames: []
};
const APP_LEVEL_REWARDS = [
  { xp: 4, coins: 4 },
  { xp: 5, coins: 5 },
  { xp: 7, coins: 7 },
  { xp: 9, coins: 8 },
  { xp: 13, coins: 11 }
];
const APP_TOTAL_REWARD = APP_LEVEL_REWARDS.reduce((acc, reward) => ({
  xp: acc.xp + reward.xp,
  coins: acc.coins + reward.coins
}), { xp: 0, coins: 0 });
const APP_HOME_TOAST_KEY = 'appHomeToast';
const APP_COMPLETION_REDIRECT_DELAY = 1500;
const TEXT_TAGS = new Set(['title', 'h1', 'h2', 'h3', 'p', 'a', 'li', 'span', 'button']);
const VOID_TAGS = new Set(['img', 'br', 'hr', 'meta', 'link', 'input']);

function redirectToLogin() {
  const target = new URL(`${APP_ROOT_PREFIX}login.html`, window.location.href).href;
  if (window.top && window.top !== window) {
    window.top.location.href = target;
    return;
  }
  window.location.href = target;
}

const currentUser = window.AppDB?.getCurrentUser?.() || '';
if (!currentUser) {
  redirectToLogin();
  throw new Error('AUTH_REQUIRED');
}

const STORAGE_SCOPE = currentUser;
const LEGACY_STORAGE_KEYS = {
  level: 'hbg2_level',
  xp: 'hbg2_xp',
  done: 'hbg2_done',
  treePrefix: 'hbg2_tree_',
  theme: 'hbg2_theme'
};
const STORAGE_KEY_PREFIX = `hbg2_${STORAGE_SCOPE}_`;
const LEVEL_KEY = `${STORAGE_KEY_PREFIX}level`;
const XP_KEY = `${STORAGE_KEY_PREFIX}xp`;
const DONE_KEY = `${STORAGE_KEY_PREFIX}done`;
const TREE_KEY_PREFIX = `${STORAGE_KEY_PREFIX}tree_`;
const THEME_KEY = `${STORAGE_KEY_PREFIX}theme`;
const APP_SYNC_KEY = `htmlCrashCourseAppSync:${STORAGE_SCOPE}`;
const ghost = document.getElementById('drag-ghost');

function readJsonStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return fallback;
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function normalizeLevelIndex(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), LEVELS.length - 1);
}

function normalizeDoneList(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(
    value
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item >= 0 && item < LEVELS.length)
  )).sort((a, b) => a - b);
}

function hasScopedGameState() {
  if ([LEVEL_KEY, XP_KEY, DONE_KEY, THEME_KEY].some((key) => localStorage.getItem(key) !== null)) {
    return true;
  }

  return LEVELS.some((_, index) => localStorage.getItem(`${TREE_KEY_PREFIX}${index}`) !== null);
}

function migrateLegacyStorage() {
  if (hasScopedGameState()) return;

  const keyPairs = [
    [LEGACY_STORAGE_KEYS.level, LEVEL_KEY],
    [LEGACY_STORAGE_KEYS.xp, XP_KEY],
    [LEGACY_STORAGE_KEYS.done, DONE_KEY],
    [LEGACY_STORAGE_KEYS.theme, THEME_KEY]
  ];

  keyPairs.forEach(([legacyKey, scopedKey]) => {
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue !== null) localStorage.setItem(scopedKey, legacyValue);
  });

  LEVELS.forEach((_, index) => {
    const legacyTree = localStorage.getItem(`${LEGACY_STORAGE_KEYS.treePrefix}${index}`);
    if (legacyTree !== null) {
      localStorage.setItem(`${TREE_KEY_PREFIX}${index}`, legacyTree);
    }
  });
}

migrateLegacyStorage();

const S = {
  level: normalizeLevelIndex(localStorage.getItem(LEVEL_KEY) || localStorage.getItem(LEGACY_STORAGE_KEYS.level) || '0'),
  xp: Number.parseInt(localStorage.getItem(XP_KEY) || localStorage.getItem(LEGACY_STORAGE_KEYS.xp) || '0', 10) || 0,
  done: normalizeDoneList(readJsonStorage(DONE_KEY, readJsonStorage(LEGACY_STORAGE_KEYS.done, []))),
  tree: [],
  nodeSeq: 0,
  dragSrc: null,
  activeTab: 'preview',
  lastErrors: [],
  collapsed: {},
};

const levelTabsDrag = {
  active: false,
  moved: false,
  startX: 0,
  startScrollLeft: 0
};
let completionRedirectTimer = 0;

function treeKey(level = S.level) {
  return `${TREE_KEY_PREFIX}${level}`;
}

function getSyncState() {
  const parsed = readJsonStorage(APP_SYNC_KEY, {});
  return {
    syncedLevels: normalizeDoneList(parsed?.syncedLevels),
    courseComplete: Boolean(parsed?.courseComplete)
  };
}

function saveSyncState(state) {
  localStorage.setItem(APP_SYNC_KEY, JSON.stringify({
    syncedLevels: normalizeDoneList(state?.syncedLevels),
    courseComplete: Boolean(state?.courseComplete)
  }));
}

function createProgressState(progress) {
  return {
    ...APP_PROGRESS_TEMPLATE,
    ...(progress || {}),
    categoryScores: {
      ...APP_PROGRESS_TEMPLATE.categoryScores,
      ...((progress || {}).categoryScores || {})
    },
    recentGames: Array.isArray(progress?.recentGames) ? progress.recentGames : []
  };
}

function getStrongestCategoryId(scores) {
  return Object.entries({
    ...APP_PROGRESS_TEMPLATE.categoryScores,
    ...(scores || {})
  }).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] || APP_GAME_CATEGORY;
}

function buildProgressPayload(syncState = getSyncState()) {
  return {
    currentLevel: Math.min(LEVELS.length, Math.max(1, Number(S.level || 0) + 1)),
    doneCount: S.done.length,
    totalLevels: LEVELS.length,
    localXp: S.xp,
    totalReward: APP_TOTAL_REWARD,
    courseComplete: Boolean(syncState.courseComplete),
    syncedLevels: [...syncState.syncedLevels],
    theme: document.body.dataset.theme || 'dark'
  };
}

function getLang() {
  return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
}

function getHomeCompletionToast() {
  return getLang() === 'en'
    ? 'Nice work, you completed the whole HTML Crash Course!'
    : 'Ми молодці, пройшли всю гру!';
}

function getHomeUrl() {
  return new URL(`${APP_ROOT_PREFIX}index.html`, window.location.href).href;
}

function stopCompletionRedirect() {
  if (!completionRedirectTimer) return;
  window.clearTimeout(completionRedirectTimer);
  completionRedirectTimer = 0;
}

function redirectToHomeAfterCompletion(immediate = false) {
  stopCompletionRedirect();
  localStorage.setItem(APP_HOME_TOAST_KEY, getHomeCompletionToast());

  const navigate = () => {
    const target = getHomeUrl();
    if (window.top && window.top !== window) {
      window.top.location.href = target;
      return;
    }
    window.location.href = target;
  };

  if (immediate) {
    navigate();
    return;
  }

  completionRedirectTimer = window.setTimeout(navigate, APP_COMPLETION_REDIRECT_DELAY);
}

function postHostMessage(type, payload = {}) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      source: 'html-crash-course',
      type,
      payload
    }, '*');
  }
}

let resizeSyncFrame = 0;
let sidebarFollowFrame = 0;
let lastHostViewport = null;

function scheduleHostResize() {
  if (resizeSyncFrame) return;

  resizeSyncFrame = window.requestAnimationFrame(() => {
    resizeSyncFrame = 0;
    const app = document.getElementById('app');
    const nextHeight = Math.max(
      app?.scrollHeight || 0,
      document.body.scrollHeight || 0,
      document.documentElement.scrollHeight || 0,
      window.innerHeight || 0
    );

    postHostMessage('content-size', {
      height: nextHeight
    });
  });
}

function clearSidebarFollowState() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.style.removeProperty('--sidebar-follow-offset');
}

function getFrameTopFromHost() {
  if (typeof lastHostViewport?.frameTop === 'number') {
    return lastHostViewport.frameTop;
  }

  try {
    if (window.frameElement) {
      return window.frameElement.getBoundingClientRect().top;
    }
  } catch {
    return null;
  }

  return null;
}

function syncSidebarWithHostScroll() {
  const sidebar = document.getElementById('sidebar');
  const app = document.getElementById('app');
  if (!sidebar || !app) return;

  if (window.innerWidth <= 820) {
    clearSidebarFollowState();
    return;
  }

  try {
    if (!window.parent || window.parent === window) {
      clearSidebarFollowState();
      return;
    }

    const frameTop = getFrameTopFromHost();
    if (typeof frameTop !== 'number') {
      clearSidebarFollowState();
      return;
    }

    const sidebarBaseTop = sidebar.offsetTop;
    const topGap = 18;
    const bottomGap = 24;
    const maxTranslate = Math.max(0, app.scrollHeight - sidebarBaseTop - sidebar.offsetHeight - bottomGap);
    const translate = Math.max(0, Math.min(maxTranslate, topGap - (frameTop + sidebarBaseTop)));

    sidebar.style.setProperty('--sidebar-follow-offset', `${Math.round(translate)}px`);
  } catch {
    clearSidebarFollowState();
  }
}

function scheduleSidebarFollowSync() {
  if (sidebarFollowFrame) return;

  sidebarFollowFrame = window.requestAnimationFrame(() => {
    sidebarFollowFrame = 0;
    syncSidebarWithHostScroll();
  });
}

function bindHostViewportSync() {
  try {
    if (!window.parent || window.parent === window) return;
    window.parent.addEventListener('scroll', scheduleSidebarFollowSync, { passive: true });
    window.parent.addEventListener('resize', scheduleSidebarFollowSync);
  } catch {
    // Ignore environments where the parent viewport is not accessible.
  }
}

function handleHostViewportMessage(event) {
  const data = event.data;
  if (!data || data.source !== 'html-crash-host') return;

  if (data.type === 'viewport-sync') {
    lastHostViewport = data.payload || null;
    scheduleSidebarFollowSync();
  }
}

function saveMeta() {
  localStorage.setItem(LEVEL_KEY, String(normalizeLevelIndex(S.level)));
  localStorage.setItem(XP_KEY, String(Math.max(0, Number.parseInt(S.xp, 10) || 0)));
  localStorage.setItem(DONE_KEY, JSON.stringify(normalizeDoneList(S.done)));
}

function getInitialTheme() {
  const projectDarkMode = window.AppDB?.getData?.()?.settings?.darkMode;
  if (typeof projectDarkMode === 'boolean') {
    return projectDarkMode ? 'dark' : 'light';
  }

  const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_STORAGE_KEYS.theme);
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body.dataset.theme = theme;
  const btn = document.getElementById('btn-theme');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀' : '◐';
    btn.title = theme === 'dark' ? 'Світла тема' : 'Темна тема';
    btn.setAttribute('aria-label', btn.title);
  }
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
  window.AppDB?.update?.((db) => {
    db.settings = db.settings || {};
    db.settings.darkMode = nextTheme === 'dark';
  });
  postHostMessage('theme-change', { theme: nextTheme });
}

function saveTree() {
  localStorage.setItem(treeKey(), JSON.stringify(S.tree));
}

function clearAllTrees() {
  LEVELS.forEach((_, index) => localStorage.removeItem(treeKey(index)));
}

function syncCompletedLevelsWithProject(options = {}) {
  const syncState = getSyncState();
  const completedLevels = normalizeDoneList(S.done);
  const unsyncedLevels = completedLevels.filter((levelIndex) => !syncState.syncedLevels.includes(levelIndex));
  const shouldMarkCourseComplete = completedLevels.length === LEVELS.length && !syncState.courseComplete;

  if (!unsyncedLevels.length && !shouldMarkCourseComplete) {
    if (!options.silent) postHostMessage('progress', buildProgressPayload(syncState));
    return null;
  }

  const reward = unsyncedLevels.reduce((totals, levelIndex) => {
    const levelReward = APP_LEVEL_REWARDS[levelIndex] || { xp: 0, coins: 0 };
    return {
      xp: totals.xp + levelReward.xp,
      coins: totals.coins + levelReward.coins
    };
  }, { xp: 0, coins: 0 });

  let completedCourse = false;

  window.AppDB?.update?.((db) => {
    db.profile = db.profile || {};
    db.profile.coins = Number(db.profile.coins || 125) + reward.coins;
    db.progress = createProgressState(db.progress);
    db.progress.xp = Number(db.progress.xp || 0) + reward.xp;
    db.progress.categoryScores[APP_GAME_CATEGORY] = Number(db.progress.categoryScores[APP_GAME_CATEGORY] || 0) + reward.xp;

    syncState.syncedLevels = normalizeDoneList([...syncState.syncedLevels, ...unsyncedLevels]);

    if (shouldMarkCourseComplete) {
      completedCourse = true;
      syncState.courseComplete = true;
      db.progress.gamesPlayed = Number(db.progress.gamesPlayed || 0) + 1;
      db.progress.recentGames = Array.isArray(db.progress.recentGames) ? db.progress.recentGames : [];
      db.progress.recentGames.unshift({
        id: APP_GAME_ID,
        name: APP_GAME_NAME,
        categoryId: APP_GAME_CATEGORY,
        subcategoryId: APP_GAME_SUBCATEGORY,
        xp: APP_TOTAL_REWARD.xp,
        reward: APP_TOTAL_REWARD.coins,
        playedAt: Date.now()
      });
      db.progress.recentGames = db.progress.recentGames.slice(0, 6);
    }

    db.progress.favoriteCategory = getStrongestCategoryId(db.progress.categoryScores);
  });

  saveSyncState(syncState);

  if (!options.silent && (reward.xp || reward.coins || completedCourse)) {
    postHostMessage('reward', {
      level: completedLevels[completedLevels.length - 1] + 1,
      reward,
      unlockedLevels: unsyncedLevels.map((levelIndex) => levelIndex + 1),
      completedCourse
    });
  }

  postHostMessage('progress', buildProgressPayload(syncState));
  return { reward, completedCourse, syncState };
}

function mkNode(tag) {
  const meta = TAGS[tag] || { attrs: {} };
  return {
    id: ++S.nodeSeq,
    tag,
    attrs: JSON.parse(JSON.stringify(meta.attrs || {})),
    ch: [],
  };
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object' || !node.tag) return null;
  const meta = TAGS[node.tag] || { attrs: {}, canHave: [] };
  const normalized = {
    id: typeof node.id === 'number' ? node.id : ++S.nodeSeq,
    tag: node.tag,
    attrs: { ...(meta.attrs || {}), ...(node.attrs || {}) },
    ch: Array.isArray(node.ch) ? node.ch.map(normalizeNode).filter(Boolean) : [],
  };
  return normalized;
}

function refreshNodeSeq() {
  let maxId = 0;
  const walk = list => {
    list.forEach(node => {
      maxId = Math.max(maxId, node.id || 0);
      walk(node.ch || []);
    });
  };
  walk(S.tree);
  S.nodeSeq = maxId;
}

function loadTree(level = S.level) {
  try {
    const raw = localStorage.getItem(treeKey(level));
    const parsed = raw ? JSON.parse(raw) : [];
    S.tree = Array.isArray(parsed) ? parsed.map(normalizeNode).filter(Boolean) : [];
  } catch {
    S.tree = [];
  }
  refreshNodeSeq();
}

function findNode(list, id) {
  for (const node of list) {
    if (node.id === id) return node;
    const found = findNode(node.ch, id);
    if (found) return found;
  }
  return null;
}

function removeNode(list, id) {
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].id === id) {
      list.splice(i, 1);
      return true;
    }
    if (removeNode(list[i].ch, id)) return true;
  }
  return false;
}

function countNodes(list) {
  return list.reduce((sum, node) => sum + 1 + countNodes(node.ch), 0);
}

function nodeContainsId(node, targetId) {
  if (!node) return false;
  if (node.id === targetId) return true;
  return node.ch.some(child => nodeContainsId(child, targetId));
}

function getAllowedChildren(parentTag) {
  if (!parentTag) return ['html'];
  const meta = TAGS[parentTag] || { canHave: [] };
  return meta.canHave || [];
}

function canAcceptChild(parentTag, childTag) {
  const allowed = getAllowedChildren(parentTag);
  return allowed.includes('*') || allowed.includes(childTag);
}

function validateDropTarget(pid, source) {
  const draggedTag = source.type === 'chip'
    ? source.tag
    : (findNode(S.tree, source.id) || {}).tag;

  if (!draggedTag) return 'Не вдалося визначити тег для перенесення.';

  if (pid === 'root') {
    if (draggedTag !== 'html') return 'У корінь можна покласти тільки тег <html>.';
    const otherHtml = S.tree.find(node => node.tag === 'html' && node.id !== source.id);
    if (otherHtml) return 'На сцені вже є один тег <html>.';
    return null;
  }

  const parent = findNode(S.tree, Number(pid));
  if (!parent) return 'Батьківський вузол не знайдено.';

  if (source.type === 'node') {
    if (parent.id === source.id) return 'Не можна вкласти тег у самого себе.';
    const movingNode = findNode(S.tree, source.id);
    if (movingNode && nodeContainsId(movingNode, parent.id)) {
      return 'Не можна перенести тег у власний дочірній вузол.';
    }
  }

  if (!canAcceptChild(parent.tag, draggedTag)) {
    return `<${draggedTag}> не можна вкладати в <${parent.tag}>.`;
  }

  return null;
}

function getStructureIssues() {
  const issues = new Map();

  const addIssue = (id, text) => {
    if (!issues.has(id)) issues.set(id, []);
    issues.get(id).push(text);
  };

  if (S.tree.length > 1) {
    S.tree.forEach(node => addIssue(node.id, 'На кореневому рівні має бути лише один тег <html>.'));
  }

  const walk = (list, parentTag = null) => {
    list.forEach(node => {
      if (!canAcceptChild(parentTag, node.tag)) {
        const where = parentTag ? `<${parentTag}>` : 'корінь';
        addIssue(node.id, `Тег <${node.tag}> не може бути всередині ${where}.`);
      }
      walk(node.ch, node.tag);
    });
  };

  walk(S.tree, null);
  return issues;
}

function getGlobalErrors() {
  const flat = [];
  getStructureIssues().forEach(values => {
    values.forEach(value => {
      if (!flat.includes(value)) flat.push(value);
    });
  });
  return flat;
}

function escAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function nodeToHTML(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const attrString = Object.entries(node.attrs)
    .filter(([key, value]) => key !== 'text' && String(value).trim())
    .map(([key, value]) => ` ${key}="${escAttr(value)}"`)
    .join('');
  const text = TEXT_TAGS.has(node.tag) && node.attrs.text ? escText(node.attrs.text) : '';

  if (VOID_TAGS.has(node.tag)) return `${indent}<${node.tag}${attrString}>`;
  if (node.ch.length === 0) return `${indent}<${node.tag}${attrString}>${text}</${node.tag}>`;

  const textLine = text ? `${text}\n` : '';
  const inner = node.ch.map(child => nodeToHTML(child, depth + 1)).join('\n');
  return `${indent}<${node.tag}${attrString}>${textLine}${inner}\n${indent}</${node.tag}>`;
}

function buildHTML() {
  return S.tree.map(node => nodeToHTML(node)).join('\n');
}

function buildPreviewDoc() {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 16px; color: #1f2937; line-height: 1.45; }
    header { padding: 12px 16px; background: #eef6ff; border-radius: 12px; margin-bottom: 12px; }
    nav { margin-bottom: 8px; }
    nav a { margin-right: 10px; color: #2563eb; text-decoration: none; }
    main, section, article { margin-bottom: 12px; }
    img { max-width: 100%; min-height: 48px; border-radius: 8px; background: #e5eef7; display: inline-block; }
    footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid #d9e6f2; color: #64748b; }
    ul { padding-left: 18px; }
  </style>
</head>
<body>
${buildHTML()}
</body>
</html>`;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function syntaxHL(line) {
  if (!line) return '<span class="code-token code-token--blank">&nbsp;</span>';

  const trimmed = line.trim();
  const escaped = escapeHTML(line);
  if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
    return `<span class="code-token code-token--comment">${escaped}</span>`;
  }

  return escaped.replace(/&lt;(\/?)([\w-]+)([\s\S]*?)(&gt;)/g, (_, slash, tagName, attrs, closeToken) => {
    const highlightedAttrs = attrs.replace(
      /([\w:-]+)=(&quot;.*?&quot;)/g,
      '<span class="code-token code-token--attr">$1</span>=<span class="code-token code-token--string">$2</span>'
    );

    return `<span class="code-token code-token--angle">&lt;${slash}</span><span class="code-token code-token--tag">${tagName}</span>${highlightedAttrs}<span class="code-token code-token--angle">${closeToken}</span>`;
  });
}

function buildCodePanelMarkup(html) {
  const source = html || '<!-- тут поки порожньо -->';
  const lines = source.split('\n');
  const level = LEVELS[S.level];

  return `
    <div class="code-shell">
      <div class="code-shell__top">
        <div class="code-shell__activity" aria-hidden="true">
          <span class="code-shell__activity-bar"></span>
          <span class="code-shell__activity-bar"></span>
          <span class="code-shell__activity-bar"></span>
        </div>
        <div class="code-shell__tab">
          <span class="code-shell__tab-dot"></span>
          <span class="code-shell__title">index.html</span>
        </div>
        <div class="code-shell__meta">HTML CRASH COURSE · level ${level.id}</div>
      </div>
      <div class="code-shell__body">
        ${lines.map((line, index) => `
          <div class="code-line">
            <span class="code-line__no">${index + 1}</span>
            <span class="code-line__content">${syntaxHL(line)}</span>
          </div>
        `).join('')}
      </div>
      <div class="code-shell__status">
        <span class="code-shell__status-item code-shell__status-item--brand">HTML</span>
        <span class="code-shell__status-item">Spaces: 2</span>
        <span class="code-shell__status-item">UTF-8</span>
        <span class="code-shell__status-item">LF</span>
        <span class="code-shell__status-item">Ln ${lines.length}</span>
      </div>
    </div>
  `;
}

function createEmptyHint() {
  const hint = document.createElement('div');
  hint.className = 'empty-hint';
  hint.id = 'empty-hint';
  hint.innerHTML = `
    <div class="empty-hint-icon">⬡</div>
    <div class="empty-hint-text">Перетягни HTML-блоки сюди</div>
  `;
  return hint;
}

function renderSidebar() {
  const lvl = LEVELS[S.level];
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '<div class="sb-label">Теги</div>';

  lvl.tags.forEach(tag => {
    const meta = TAGS[tag] || {};
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.draggable = true;
    chip.dataset.tag = tag;
    chip.innerHTML = `<span class="chip-dot" style="background:${meta.color || '#999'}"></span>&lt;${tag}&gt;`;

    chip.addEventListener('dragstart', event => {
      S.dragSrc = { type: 'chip', tag };
      chip.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'copy';
    });

    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    chip.addEventListener('touchstart', onTouchStart, { passive: true });
    sidebar.appendChild(chip);
  });

  scheduleSidebarFollowSync();
}

function renderTask() {
  const lvl = LEVELS[S.level];
  document.getElementById('task-title').textContent = `Рівень ${lvl.id}: ${lvl.name}`;
  document.getElementById('task-desc').textContent = lvl.desc;
  document.getElementById('task-template').textContent = `📘 ${lvl.template}`;
}

function renderLevelTabs() {
  const wrap = document.getElementById('level-tabs');
  wrap.innerHTML = '';

  LEVELS.forEach((lvl, index) => {
    const btn = document.createElement('button');
    btn.className = `ltab${index === S.level ? ' active' : ''}${S.done.includes(index) ? ' done' : ''}`;
    btn.textContent = `${lvl.id}. ${lvl.name}`;
    btn.addEventListener('click', () => {
      S.level = index;
      S.lastErrors = [];
      loadTree();
      saveMeta();
      fullRender();
    });
    wrap.appendChild(btn);
  });

  bindLevelTabsScroller(wrap);
  revealActiveLevelTab(wrap);
}

function revealActiveLevelTab(wrap = document.getElementById('level-tabs')) {
  const activeTab = wrap?.querySelector('.ltab.active');
  if (!activeTab) return;

  activeTab.scrollIntoView({
    inline: 'center',
    block: 'nearest',
    behavior: 'smooth'
  });
}

function stopLevelTabsDrag(wrap) {
  levelTabsDrag.active = false;
  wrap.classList.remove('is-dragging');

  if (levelTabsDrag.moved) {
    wrap.dataset.dragSuppressUntil = String(Date.now() + 160);
  }
}

function bindLevelTabsScroller(wrap = document.getElementById('level-tabs')) {
  if (!wrap || wrap.dataset.scrollBound === 'yes') return;
  wrap.dataset.scrollBound = 'yes';

  wrap.addEventListener('wheel', (event) => {
    const hasHorizontalOverflow = wrap.scrollWidth > wrap.clientWidth + 1;
    if (!hasHorizontalOverflow) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    event.preventDefault();
    wrap.scrollLeft += event.deltaY;
  }, { passive: false });

  wrap.addEventListener('pointerdown', (event) => {
    const hasHorizontalOverflow = wrap.scrollWidth > wrap.clientWidth + 1;
    if (!hasHorizontalOverflow) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    levelTabsDrag.active = true;
    levelTabsDrag.moved = false;
    levelTabsDrag.startX = event.clientX;
    levelTabsDrag.startScrollLeft = wrap.scrollLeft;
    wrap.setPointerCapture?.(event.pointerId);
  });

  wrap.addEventListener('pointermove', (event) => {
    if (!levelTabsDrag.active) return;

    const deltaX = event.clientX - levelTabsDrag.startX;
    if (!levelTabsDrag.moved && Math.abs(deltaX) > 6) {
      levelTabsDrag.moved = true;
      wrap.classList.add('is-dragging');
    }

    if (!levelTabsDrag.moved) return;

    wrap.scrollLeft = levelTabsDrag.startScrollLeft - deltaX;
    event.preventDefault();
  });

  wrap.addEventListener('pointerup', () => stopLevelTabsDrag(wrap));
  wrap.addEventListener('pointercancel', () => stopLevelTabsDrag(wrap));
  wrap.addEventListener('lostpointercapture', () => stopLevelTabsDrag(wrap));

  wrap.addEventListener('click', (event) => {
    const suppressUntil = Number(wrap.dataset.dragSuppressUntil || 0);
    if (suppressUntil <= Date.now()) return;

    event.preventDefault();
    event.stopPropagation();
  }, true);
}

function renderXP() {
  const maxXP = LEVELS.reduce((sum, lvl) => sum + lvl.xp, 0);
  document.getElementById('xp-num').textContent = `${S.xp} XP`;
  document.getElementById('xp-fill').style.width = `${Math.round(Math.min(100, (S.xp / maxXP) * 100))}%`;
}

function buildAttrPreview(node) {
  return Object.entries(node.attrs)
    .filter(([key, value]) => key !== 'text' && String(value).trim())
    .map(([key, value]) => `<span style="color:#9966ff">${key}</span>=<span style="color:#5cb1d6">"${escAttr(value)}"</span>`)
    .join(' ');
}

function buildNodeEl(node, issueMap) {
  const meta = TAGS[node.tag] || { color: '#999', canHave: [] };
  const issues = issueMap.get(node.id) || [];
  const hasChildrenArea = !VOID_TAGS.has(node.tag) && (meta.canHave || []).length > 0;
  const collapsed = Boolean(S.collapsed[node.id]);

  const wrap = document.createElement('div');
  wrap.className = `dom-node${issues.length ? ' state-error' : ''}`;
  wrap.dataset.id = String(node.id);

  const header = document.createElement('div');
  header.className = 'node-header';
  header.draggable = true;
  header.innerHTML = `
    <span class="node-caret">${hasChildrenArea ? (collapsed ? '▸' : '▾') : ''}</span>
    <span class="node-tag-open" style="color:${meta.color}">&lt;${node.tag}&gt;</span>
    <span class="node-attrs-inline" id="ai-${node.id}">${buildAttrPreview(node)}</span>
    ${!VOID_TAGS.has(node.tag) ? `<span class="node-tag-close">&lt;/${node.tag}&gt;</span>` : ''}
    <button class="node-del" title="Видалити">✕</button>
  `;

  header.addEventListener('dragstart', event => {
    S.dragSrc = { type: 'node', id: node.id };
    event.dataTransfer.effectAllowed = 'move';
    event.stopPropagation();
  });

  header.addEventListener('touchstart', onTouchStart, { passive: true });

  const caret = header.querySelector('.node-caret');
  if (caret && hasChildrenArea) {
    caret.addEventListener('click', event => {
      event.stopPropagation();
      S.collapsed[node.id] = !S.collapsed[node.id];
      renderCanvas();
    });
  }

  header.querySelector('.node-del').addEventListener('click', event => {
    event.stopPropagation();
    removeNode(S.tree, node.id);
    delete S.collapsed[node.id];
    S.lastErrors = [];
    saveTree();
    renderCanvas();
    setStatus(null, 'Тег видалено.');
  });

  wrap.appendChild(header);

  const editableAttrs = Object.entries(node.attrs).filter(([key]) => key !== 'text' || TEXT_TAGS.has(node.tag));
  if (editableAttrs.length > 0) {
    const form = document.createElement('div');
    form.className = 'node-attrs-form';

    editableAttrs.forEach(([key, value]) => {
      const field = document.createElement('div');
      field.className = 'attr-field';

      const label = document.createElement('span');
      label.className = 'attr-key';
      label.textContent = key;

      const eq1 = document.createElement('span');
      eq1.className = 'attr-eq';
      eq1.textContent = '="';

      const input = document.createElement('input');
      input.className = 'attr-val';
      input.value = value;
      input.placeholder = key === 'src' || key === 'href' ? 'https://...' : '';
      input.addEventListener('input', () => {
        node.attrs[key] = input.value;
        const preview = document.getElementById(`ai-${node.id}`);
        if (preview) preview.innerHTML = buildAttrPreview(node);
        saveTree();
        updatePanel();
      });
      input.addEventListener('click', event => event.stopPropagation());

      const eq2 = document.createElement('span');
      eq2.className = 'attr-eq';
      eq2.textContent = '"';

      field.append(label, eq1, input, eq2);
      form.appendChild(field);
    });

    wrap.appendChild(form);
  }

  if (issues.length) {
    const err = document.createElement('div');
    err.className = 'node-error-msg';
    err.textContent = issues[0];
    wrap.appendChild(err);
  }

  if (hasChildrenArea && !collapsed) {
    const childrenWrap = document.createElement('div');
    childrenWrap.className = 'node-children-wrap';

    const dropZone = document.createElement('div');
    dropZone.className = 'node-drop-zone';
    dropZone.dataset.pid = String(node.id);
    node.ch.forEach(child => dropZone.appendChild(buildNodeEl(child, issueMap)));
    setupDropZone(dropZone, node.id);

    childrenWrap.appendChild(dropZone);
    wrap.appendChild(childrenWrap);
  }

  return wrap;
}

function renderCanvas() {
  const root = document.getElementById('drop-root');
  const issueMap = getStructureIssues();
  root.innerHTML = '';

  if (S.tree.length === 0) {
    root.appendChild(createEmptyHint());
  } else {
    S.tree.forEach(node => root.appendChild(buildNodeEl(node, issueMap)));
  }

  setupDropZone(root, 'root');
  updateStatus();
  updatePanel();
  scheduleHostResize();
}

function updatePreview() {
  document.getElementById('preview-frame').srcdoc = buildPreviewDoc();
}

function updateCode() {
  const raw = buildHTML();
  document.getElementById('code-output').innerHTML = buildCodePanelMarkup(raw);
}

function showValidation(errs) {
  const out = document.getElementById('val-output');
  if (errs.length === 0) {
    out.innerHTML = `
      <div class="val-item ok">
        <span class="val-item-icon">✓</span>
        <span class="val-item-text">Усі перевірки пройдено!</span>
      </div>
    `;
    return;
  }

  out.innerHTML = errs.map(err => `
    <div class="val-item err">
      <span class="val-item-icon">✕</span>
      <span class="val-item-text">${err}</span>
    </div>
  `).join('');
}

function switchTab(name) {
  S.activeTab = name;
  document.querySelectorAll('.ptab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  document.querySelectorAll('.panel-view').forEach(view => {
    view.classList.toggle('active', view.id === `tab-${name}`);
  });
  updatePanel();
  scheduleHostResize();
}

function updatePanel() {
  if (S.activeTab === 'preview') updatePreview();
  if (S.activeTab === 'code') updateCode();
}

function setupDropZone(el, pid) {
  if (el.dataset.dropBound === 'yes') return;
  el.dataset.dropBound = 'yes';

  el.addEventListener('dragover', event => {
    event.preventDefault();
    event.stopPropagation();
    el.classList.add('drag-over');
    event.dataTransfer.dropEffect = S.dragSrc?.type === 'node' ? 'move' : 'copy';
  });

  el.addEventListener('dragleave', event => {
    if (!el.contains(event.relatedTarget)) el.classList.remove('drag-over');
  });

  el.addEventListener('drop', event => {
    event.preventDefault();
    event.stopPropagation();
    el.classList.remove('drag-over');
    handleDrop(pid);
  });
}

function handleDrop(pid) {
  if (!S.dragSrc) return;

  const error = validateDropTarget(pid, S.dragSrc);
  if (error) {
    setStatus(false, error);
    toast(error, 'err');
    S.dragSrc = null;
    return;
  }

  if (S.dragSrc.type === 'chip') {
    const newNode = mkNode(S.dragSrc.tag);
    if (pid === 'root') {
      S.tree.push(newNode);
    } else {
      const parent = findNode(S.tree, Number(pid));
      if (parent) parent.ch.push(newNode);
    }
  } else {
    const movingNode = findNode(S.tree, S.dragSrc.id);
    if (!movingNode) {
      S.dragSrc = null;
      return;
    }
    const clone = JSON.parse(JSON.stringify(movingNode));
    removeNode(S.tree, S.dragSrc.id);
    if (pid === 'root') {
      S.tree.push(clone);
    } else {
      const parent = findNode(S.tree, Number(pid));
      if (parent) parent.ch.push(clone);
    }
  }

  S.dragSrc = null;
  S.lastErrors = [];
  saveTree();
  renderCanvas();
  setStatus(null, 'Блок додано на сцену.');
  toast('Блок додано', 'info');
}

function onTouchStart(event) {
  const chip = event.target.closest('.tag-chip');
  const header = event.target.closest('.node-header');
  if (!chip && !header) return;

  if (chip) {
    S.dragSrc = { type: 'chip', tag: chip.dataset.tag };
    ghost.textContent = `<${chip.dataset.tag}>`;
  } else {
    const nodeEl = header.closest('.dom-node');
    const nodeId = Number(nodeEl.dataset.id);
    S.dragSrc = { type: 'node', id: nodeId };
    const node = findNode(S.tree, nodeId);
    ghost.textContent = `<${node?.tag || '?'}>`;
  }

  ghost.style.display = 'block';
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
  document.addEventListener('touchcancel', onTouchEnd);
}

function onTouchMove(event) {
  event.preventDefault();
  const touch = event.touches[0];
  ghost.style.left = `${touch.clientX + 12}px`;
  ghost.style.top = `${touch.clientY + 12}px`;

  document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
  const underFinger = document.elementFromPoint(touch.clientX, touch.clientY);
  const zone = underFinger?.closest('.node-drop-zone, #drop-root');
  if (zone) zone.classList.add('drag-over');
}

function onTouchEnd(event) {
  ghost.style.display = 'none';
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
  document.removeEventListener('touchcancel', onTouchEnd);
  document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));

  const touch = event.changedTouches[0];
  const underFinger = document.elementFromPoint(touch.clientX, touch.clientY);
  const zone = underFinger?.closest('.node-drop-zone, #drop-root');
  if (zone) handleDrop(zone.dataset.pid || 'root');

  S.dragSrc = null;
}

function updateStatus() {
  document.getElementById('node-count').textContent = String(countNodes(S.tree));
}

function setStatus(ok, text) {
  const dot = document.getElementById('status-dot');
  const label = document.getElementById('status-text');
  dot.className = `status-dot${ok === null ? '' : ok ? ' ok' : ' err'}`;
  label.textContent = text;
}

function check() {
  const globalErrors = getGlobalErrors();
  const levelErrors = LEVELS[S.level].validate(S.tree);
  const errs = [...globalErrors, ...levelErrors];
  S.lastErrors = errs;

  switchTab('validate');
  showValidation(errs);

  if (errs.length === 0) {
    setStatus(true, 'Правильно! Рівень пройдено.');
    toast('Чудово! Структура вірна.', 'ok');

    if (!S.done.includes(S.level)) {
      S.xp += LEVELS[S.level].xp;
      S.done.push(S.level);
      saveMeta();
      renderXP();
      renderLevelTabs();
      syncCompletedLevelsWithProject();
    }

    setTimeout(() => showLevelUp(), 350);
  } else {
    setStatus(false, `Знайдено ${errs.length} помилок.`);
    toast(`Є ${errs.length} помилок`, 'err');
    renderCanvas();
  }

  scheduleHostResize();
}

function showLevelUp() {
  const lvl = LEVELS[S.level];
  const isLast = S.done.length >= LEVELS.length;

  document.getElementById('lu-emoji').textContent = isLast ? '🏆' : '🎉';
  document.getElementById('lu-title').textContent = isLast ? 'Усі рівні пройдено!' : `Рівень ${lvl.id} завершено!`;
  document.getElementById('lu-subtitle').textContent = isLast
    ? 'Ти зібрав повний HTML-маршрут. Зараз повернемося в головне меню.'
    : `${lvl.name} виконано без помилок.`;
  document.getElementById('lu-xp').textContent = `+${lvl.xp} XP · Всього: ${S.xp} XP`;
  document.getElementById('lu-btn').textContent = isLast ? 'На головну →' : 'Наступний рівень →';
  document.getElementById('levelup-overlay').classList.add('show');

  if (isLast) {
    redirectToHomeAfterCompletion(false);
  }
}

function toast(msg, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function fullRender() {
  loadTree();
  renderLevelTabs();
  renderSidebar();
  renderTask();
  renderCanvas();
  renderXP();
  setStatus(null, `Рівень ${S.level + 1}: ${LEVELS[S.level].name}`);
  postHostMessage('progress', buildProgressPayload());
  scheduleHostResize();
}

document.querySelectorAll('.ptab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('btn-check').addEventListener('click', check);

document.getElementById('btn-reset').addEventListener('click', () => {
  S.tree = [];
  S.lastErrors = [];
  S.collapsed = {};
  saveTree();
  renderCanvas();
  setStatus(null, 'Сцену очищено. Можна збирати заново.');
  toast('Сцену очищено', 'info');
  scheduleHostResize();
});

document.getElementById('lu-btn').addEventListener('click', () => {
  document.getElementById('levelup-overlay').classList.remove('show');
  const isLast = S.done.length >= LEVELS.length;

  if (isLast) {
    redirectToHomeAfterCompletion(true);
    return;
  } else {
    S.level += 1;
    S.lastErrors = [];
    S.collapsed = {};
  }

  saveMeta();
  fullRender();
});

applyTheme(getInitialTheme());
syncCompletedLevelsWithProject({ silent: true });
bindHostViewportSync();
window.addEventListener('message', handleHostViewportMessage);
window.addEventListener('resize', scheduleHostResize);
window.addEventListener('resize', scheduleSidebarFollowSync);
window.addEventListener('beforeunload', stopCompletionRedirect);
fullRender();
postHostMessage('ready', buildProgressPayload());
scheduleHostResize();
scheduleSidebarFollowSync();
