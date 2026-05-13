(function () {
  'use strict';

  const APP_ROOT_PREFIX = '../../../../../../';
  const TOTAL_LEVELS = 10;
  const TOTAL_REWARD = { xp: 90, coins: 83 };
  const GAME_ID = 'html-crash';
  const GAME_NAME = 'HTML Crash Course';
  const CATEGORY_ID = 'it';
  const SUBCATEGORY_ID = 'webdev';

  const appDbAvailable = Boolean(window.AppDB);
  const currentUser = getCurrentUser();

  if (appDbAvailable && !currentUser) {
    window.location.href = appUrl('login.html');
    return;
  }

  const userId = currentUser || 'guest';
  const storagePrefix = `htmlCrashCourseDnd:${userId}:`;

  const els = {
    toast: document.getElementById('toast'),
    frame: document.getElementById('gameFrame'),
    frameShell: document.getElementById('frameShell'),
    frameLoading: document.getElementById('frameLoading'),
    levelBadge: document.getElementById('levelBadge'),
    progressBadge: document.getElementById('progressBadge'),
    xpBadge: document.getElementById('xpBadge'),
    backBtn: document.getElementById('backBtn')
  };

  let toastTimer = 0;
  let lastFrameHeight = 700;

  function getCurrentUser() {
    try {
      return window.AppDB?.getCurrentUser?.() || null;
    } catch {
      return null;
    }
  }

  function appUrl(relativePath) {
    return new URL(`${APP_ROOT_PREFIX}${relativePath}`, window.location.href).href;
  }

  function storageKey(name) {
    return `${storagePrefix}${name}`;
  }

  function safeJson(keyName, fallback) {
    try {
      const raw = localStorage.getItem(keyName);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      localStorage.removeItem(keyName);
      return fallback;
    }
  }

  function readLocalProgress() {
    const completed = Array.from(new Set((safeJson(storageKey('completedLevels'), []))
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item >= 0 && item < TOTAL_LEVELS)))
      .sort((left, right) => left - right);
    const current = Math.min(
      Math.max(Number.parseInt(localStorage.getItem(storageKey('currentLevel')), 10) || completed.length || 0, 0),
      TOTAL_LEVELS - 1
    );
    const xp = Math.max(0, Number.parseInt(localStorage.getItem(storageKey('earnedXp')), 10) || 0);
    return {
      currentLevel: current + 1,
      doneCount: completed.length,
      earnedXp: xp,
      courseCompleted: localStorage.getItem(storageKey('courseCompleted')) === 'true' || completed.length >= TOTAL_LEVELS,
      rewardsSynced: localStorage.getItem(storageKey('rewardsSynced')) === 'true'
    };
  }

  function writeRewardsSynced() {
    localStorage.setItem(storageKey('rewardsSynced'), 'true');
  }

  function updateBadges(progress = readLocalProgress()) {
    const currentLevel = Math.min(Math.max(progress.currentLevel || 1, 1), TOTAL_LEVELS);
    const doneCount = Math.min(Math.max(progress.doneCount || 0, 0), TOTAL_LEVELS);
    els.levelBadge.textContent = progress.courseCompleted ? 'Курс завершено' : `Рівень ${currentLevel} / ${TOTAL_LEVELS}`;
    els.progressBadge.textContent = `${doneCount} / ${TOTAL_LEVELS} пройдено`;
    els.xpBadge.textContent = `${Math.max(0, progress.earnedXp || 0)} XP`;
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  function createProgressState(progress) {
    const scores = {
      it: 0,
      economy: 0,
      softskills: 0,
      agro: 0,
      ...(progress?.categoryScores || {})
    };
    return {
      xp: Number(progress?.xp || 0),
      gamesPlayed: Number(progress?.gamesPlayed || 0),
      categoryScores: scores,
      favoriteCategory: progress?.favoriteCategory || 'it',
      recentGames: Array.isArray(progress?.recentGames) ? progress.recentGames : []
    };
  }

  function syncCourseReward(payload = {}) {
    const local = readLocalProgress();
    if (!local.courseCompleted || local.rewardsSynced || !currentUser || !window.AppDB?.update) return false;

    try {
      window.AppDB.update((db) => {
        db.profile = db.profile || {};
        db.profile.coins = Number(db.profile.coins || 0) + TOTAL_REWARD.coins;
        db.progress = createProgressState(db.progress);
        db.progress.xp += TOTAL_REWARD.xp;
        db.progress.categoryScores[CATEGORY_ID] = Number(db.progress.categoryScores[CATEGORY_ID] || 0) + TOTAL_REWARD.xp;
        db.progress.favoriteCategory = CATEGORY_ID;
        db.progress.gamesPlayed += 1;
        db.progress.recentGames.unshift({
          id: GAME_ID,
          name: GAME_NAME,
          categoryId: CATEGORY_ID,
          subcategoryId: SUBCATEGORY_ID,
          xp: TOTAL_REWARD.xp,
          reward: TOTAL_REWARD.coins,
          playedAt: Date.now()
        });
        db.progress.recentGames = db.progress.recentGames.slice(0, 6);
      });

      writeRewardsSynced();
      updateBadges({ ...payload, rewardsSynced: true });
      postToFrame('rewards-synced', { reward: TOTAL_REWARD });
      showToast(`До профілю додано +${TOTAL_REWARD.xp} XP і +${TOTAL_REWARD.coins} монет`);
      return true;
    } catch {
      return false;
    }
  }

  function setFrameReady() {
    els.frameShell.classList.add('is-ready');
  }

  function syncFrameHeight(height) {
    const viewport = window.innerHeight || document.documentElement.clientHeight || 760;
    const minHeight = window.innerWidth <= 520 ? 620 : 700;
    const maxHeight = window.innerWidth <= 520 ? 860 : 1100;
    const desired = Math.max(minHeight, Math.min(maxHeight, Number(height) || Math.round(viewport * 0.78)));
    lastFrameHeight = desired;
    els.frame.style.height = `${desired}px`;
    els.frame.style.minHeight = `${desired}px`;
    els.frameShell.style.minHeight = `${desired}px`;
  }

  function postToFrame(type, payload = {}) {
    try {
      els.frame.contentWindow?.postMessage({ source: 'html-crash-host', type, payload }, '*');
    } catch {
      // The iframe can be unavailable during navigation; ignore.
    }
  }

  function navigateTo(relativePath) {
    window.location.href = appUrl(relativePath);
  }

  function handleFrameMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'html-crash-course') return;

    setFrameReady();

    if (data.type === 'content-size') {
      syncFrameHeight(data.payload?.height);
      return;
    }

    if (data.type === 'ready' || data.type === 'progress' || data.type === 'level-complete') {
      updateBadges(data.payload || readLocalProgress());
      return;
    }

    if (data.type === 'course-complete') {
      updateBadges(data.payload || readLocalProgress());
      if (!syncCourseReward(data.payload)) {
        const local = readLocalProgress();
        if (!local.rewardsSynced) showToast('Курс завершено. Прогрес збережено локально.');
      }
      return;
    }

    if (data.type === 'navigate-home') {
      navigateTo('index.html');
    }
  }

  function bindNavigation() {
    els.backBtn.addEventListener('click', () => navigateTo('index.html'));
    document.querySelectorAll('.bottom-nav__item').forEach((item) => {
      item.addEventListener('click', () => {
        const nav = item.dataset.nav;
        if (nav === 'home') navigateTo('index.html');
        if (nav === 'profile') navigateTo('pages/character.html');
        if (nav === 'shop') navigateTo('pages/shop.html');
        if (nav === 'settings') navigateTo('pages/setting.html');
      });
    });
  }

  els.frame.addEventListener('load', () => {
    window.setTimeout(() => {
      setFrameReady();
      syncFrameHeight(lastFrameHeight);
      updateBadges();
      syncCourseReward();
    }, 150);
  });

  window.addEventListener('message', handleFrameMessage);
  window.addEventListener('resize', () => syncFrameHeight(lastFrameHeight));
  window.addEventListener('focus', () => {
    updateBadges();
    syncCourseReward();
  });

  bindNavigation();
  syncFrameHeight();
  updateBadges();
})();
