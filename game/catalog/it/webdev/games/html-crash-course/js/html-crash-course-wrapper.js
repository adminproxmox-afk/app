(function () {
  const APP_ROOT_PREFIX = '../../../../../../';

  function appUrl(relativePath) {
    return new URL(`${APP_ROOT_PREFIX}${relativePath}`, window.location.href).href;
  }

  const currentUser = window.AppDB?.getCurrentUser?.();
  if (!currentUser) {
    window.location.href = appUrl('login.html');
    return;
  }

  const TOTAL_LEVELS = 5;
  const TOTAL_REWARD = { xp: 38, coins: 35 };
  const STORAGE_PREFIX = `hbg2_${currentUser}_`;
  const SYNC_KEY = `htmlCrashCourseAppSync:${currentUser}`;
  const LEGACY_KEYS = {
    level: 'hbg2_level',
    xp: 'hbg2_xp',
    done: 'hbg2_done'
  };
  const KEY_LEVEL = `${STORAGE_PREFIX}level`;
  const KEY_XP = `${STORAGE_PREFIX}xp`;
  const KEY_DONE = `${STORAGE_PREFIX}done`;

  const copy = {
    uk: {
      pageTitle: 'HTML Crash Course',
      backLabel: 'Вийти',
      heroEyebrow: 'Веб-розробка',
      heroLead: 'Практична міні-гра з drag and drop редактором, live preview і покроковими HTML-рівнями прямо всередині твого застосунку.',
      chipLevels: '5 рівнів',
      chipBuilder: 'Drag & Drop',
      chipPreview: 'Live Preview',
      progressStatLabel: 'Прогрес курсу',
      progressStart: 'Готово до старту',
      progressMeta: 'Пройдено {done} з {total} · зараз рівень {level}',
      xpStatLabel: 'Локальний XP',
      xpStatMeta: 'Показує темп проходження рівнів',
      xpStatDone: 'Курс завершено, можна проходити знову',
      rewardStatLabel: 'Нагорода профілю',
      rewardStatValue: '+{xp} XP · +{coins} монет',
      rewardStatMeta: 'Монети та рейтинг підуть у профіль',
      rewardStatSynced: 'Нагороди вже синхронізовано з акаунтом',
      stageLevel: 'Рівень {level} / {total}',
      stageStatusStart: 'Готово до старту',
      stageStatusProgress: 'Пройдено {done} / {total}',
      stageStatusDone: 'Курс завершено',
      loading: 'Завантажуємо гру...',
      toastReward: 'До профілю додано +{xp} XP і +{coins} монет',
      toastCourse: 'Курс завершено, результат збережено в профілі'
    },
    en: {
      pageTitle: 'HTML Crash Course',
      backLabel: 'Exit',
      heroEyebrow: 'Web Development',
      heroLead: 'A practical mini-game with a drag-and-drop editor, live preview, and step-by-step HTML levels inside your app.',
      chipLevels: '5 levels',
      chipBuilder: 'Drag & Drop',
      chipPreview: 'Live Preview',
      progressStatLabel: 'Course progress',
      progressStart: 'Ready to start',
      progressMeta: 'Completed {done} of {total} · current level {level}',
      xpStatLabel: 'Local XP',
      xpStatMeta: 'Tracks momentum inside the game',
      xpStatDone: 'Course finished, you can replay it',
      rewardStatLabel: 'Profile reward',
      rewardStatValue: '+{xp} XP · +{coins} coins',
      rewardStatMeta: 'Coins and rating go straight to your profile',
      rewardStatSynced: 'Rewards are already synced with your account',
      stageLevel: 'Level {level} / {total}',
      stageStatusStart: 'Ready to start',
      stageStatusProgress: 'Completed {done} / {total}',
      stageStatusDone: 'Course completed',
      loading: 'Loading the game...',
      toastReward: '+{xp} XP and +{coins} coins were added to your profile',
      toastCourse: 'Course completed and saved to your profile'
    }
  };

  const toastNode = document.getElementById('toast');
  const frame = document.getElementById('gameFrame');
  const frameShell = document.getElementById('gameFrameShell');
  const frameLoading = document.getElementById('frameLoading');
  let frameContentHeight = 0;
  let detachFrameWheelBridge = null;
  let toastTimer = 0;
  let viewportSyncFrame = 0;

  function getLang() {
    return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
  }

  function getCopy() {
    return copy[getLang()];
  }

  function format(template, values = {}) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
  }

  function readJsonStorage(key, fallback) {
    try {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) return fallback;
      return JSON.parse(rawValue);
    } catch {
      return fallback;
    }
  }

  function readLocalGameState() {
    const rawLevel = localStorage.getItem(KEY_LEVEL) || localStorage.getItem(LEGACY_KEYS.level) || '0';
    const rawXp = localStorage.getItem(KEY_XP) || localStorage.getItem(LEGACY_KEYS.xp) || '0';
    const done = readJsonStorage(KEY_DONE, readJsonStorage(LEGACY_KEYS.done, []));
    const normalizedDone = Array.from(new Set(
      (Array.isArray(done) ? done : [])
        .map((item) => Number.parseInt(item, 10))
        .filter((item) => Number.isInteger(item) && item >= 0 && item < TOTAL_LEVELS)
    )).sort((left, right) => left - right);

    return {
      level: Math.min(TOTAL_LEVELS - 1, Math.max(0, Number.parseInt(rawLevel, 10) || 0)),
      xp: Math.max(0, Number.parseInt(rawXp, 10) || 0),
      doneCount: normalizedDone.length
    };
  }

  function readSyncState() {
    const parsed = readJsonStorage(SYNC_KEY, {});
    return {
      courseComplete: Boolean(parsed?.courseComplete)
    };
  }

  function updateBalance() {
    const balanceNode = document.getElementById('coinBalance');
    const coins = Number(window.AppDB?.getData?.()?.profile?.coins || 125);
    balanceNode.textContent = String(coins);
  }

  function updateProgressCards() {
    const t = getCopy();
    const localState = readLocalGameState();
    const syncState = readSyncState();
    const currentLevel = Math.min(TOTAL_LEVELS, Math.max(1, localState.level + 1));
    const isDone = localState.doneCount >= TOTAL_LEVELS;

    document.getElementById('progressStatValue').textContent = `${localState.doneCount} / ${TOTAL_LEVELS}`;
    document.getElementById('progressStatMeta').textContent = localState.doneCount
      ? format(t.progressMeta, { done: localState.doneCount, total: TOTAL_LEVELS, level: currentLevel })
      : t.progressStart;

    document.getElementById('xpStatValue').textContent = `${localState.xp} XP`;
    document.getElementById('xpStatMeta').textContent = isDone ? t.xpStatDone : t.xpStatMeta;

    document.getElementById('rewardStatValue').textContent = format(t.rewardStatValue, TOTAL_REWARD);
    document.getElementById('rewardStatMeta').textContent = syncState.courseComplete ? t.rewardStatSynced : t.rewardStatMeta;

    document.getElementById('stageLevelBadge').textContent = format(t.stageLevel, { level: currentLevel, total: TOTAL_LEVELS });
    document.getElementById('stageStatusBadge').textContent = isDone
      ? t.stageStatusDone
      : localState.doneCount
        ? format(t.stageStatusProgress, { done: localState.doneCount, total: TOTAL_LEVELS })
        : t.stageStatusStart;
  }

  function applyCopy() {
    const t = getCopy();

    document.documentElement.lang = getLang();
    document.title = t.pageTitle;
    document.getElementById('pageTitle').textContent = t.pageTitle;
    document.getElementById('backBtn').setAttribute('aria-label', t.backLabel);
    document.getElementById('backBtnText').textContent = t.backLabel;
    document.getElementById('heroEyebrow').textContent = t.heroEyebrow;
    document.getElementById('heroLead').textContent = t.heroLead;
    document.getElementById('chipLevels').textContent = t.chipLevels;
    document.getElementById('chipBuilder').textContent = t.chipBuilder;
    document.getElementById('chipPreview').textContent = t.chipPreview;
    document.getElementById('progressStatLabel').textContent = t.progressStatLabel;
    document.getElementById('xpStatLabel').textContent = t.xpStatLabel;
    document.getElementById('rewardStatLabel').textContent = t.rewardStatLabel;
    frameLoading.textContent = t.loading;
    updateProgressCards();
  }

  function showToast(message) {
    toastNode.textContent = message;
    toastNode.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastNode.classList.remove('show'), 2600);
  }

  function syncFrameHeight() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 390;
    let desiredHeight = Math.round(viewportHeight * 0.8);
    let minHeight = 700;
    let maxHeight = 980;

    if (viewportWidth <= 390) {
      minHeight = 560;
      maxHeight = 760;
      desiredHeight = Math.round(viewportHeight * 0.72);
    } else if (viewportWidth <= 519) {
      minHeight = 620;
      maxHeight = 860;
      desiredHeight = Math.round(viewportHeight * 0.74);
    } else if (viewportWidth <= 840) {
      minHeight = 640;
      maxHeight = 900;
      desiredHeight = Math.round(viewportHeight * 0.76);
    }

    const naturalHeight = Math.max(minHeight, Math.min(maxHeight, desiredHeight));
    const resolvedHeight = Math.max(naturalHeight, Math.ceil(frameContentHeight || 0));
    frame.style.height = `${resolvedHeight}px`;
    frame.style.minHeight = `${resolvedHeight}px`;
    frameShell.style.minHeight = `${resolvedHeight}px`;
  }

  function isScrollableNode(node) {
    if (!(node instanceof Element)) return false;
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY || style.overflow;
    return /(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight + 1;
  }

  function canNodeConsumeScroll(startNode, deltaY, frameDoc) {
    let node = startNode instanceof Element ? startNode : null;

    while (node && node !== frameDoc.body && node !== frameDoc.documentElement) {
      if (isScrollableNode(node)) {
        if (deltaY < 0 && node.scrollTop > 0) return true;
        if (deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
      }
      node = node.parentElement;
    }

    const scrollingRoot = frameDoc.scrollingElement || frameDoc.documentElement;
    if (!scrollingRoot) return false;
    if (deltaY < 0 && scrollingRoot.scrollTop > 0) return true;
    if (deltaY > 0 && scrollingRoot.scrollTop + scrollingRoot.clientHeight < scrollingRoot.scrollHeight - 1) return true;
    return false;
  }

  function bindFrameWheelBridge() {
    if (detachFrameWheelBridge) {
      detachFrameWheelBridge();
      detachFrameWheelBridge = null;
    }

    let frameWindow;
    let frameDocument;
    try {
      frameWindow = frame.contentWindow;
      frameDocument = frame.contentDocument || frameWindow?.document;
    } catch {
      return;
    }

    if (!frameWindow || !frameDocument) return;

    const onWheel = (event) => {
      if (canNodeConsumeScroll(event.target, event.deltaY, frameDocument)) return;

      event.preventDefault();
      window.scrollBy({
        top: event.deltaY,
        behavior: 'auto'
      });
    };

    frameWindow.addEventListener('wheel', onWheel, { passive: false });
    detachFrameWheelBridge = () => frameWindow.removeEventListener('wheel', onWheel);
  }

  function sendViewportSync() {
    let frameWindow;
    try {
      frameWindow = frame.contentWindow;
    } catch {
      return;
    }

    if (!frameWindow) return;

    const rect = frame.getBoundingClientRect();
    frameWindow.postMessage({
      source: 'html-crash-host',
      type: 'viewport-sync',
      payload: {
        frameTop: rect.top,
        frameHeight: rect.height,
        viewportHeight: window.innerHeight || document.documentElement.clientHeight || 0
      }
    }, '*');
  }

  function scheduleViewportSync() {
    if (viewportSyncFrame) return;

    viewportSyncFrame = window.requestAnimationFrame(() => {
      viewportSyncFrame = 0;
      sendViewportSync();
    });
  }

  function setFrameReady() {
    frameShell.classList.add('is-ready');
  }

  function navigateTo(target) {
    window.location.href = target;
  }

  function initNavigation() {
    document.getElementById('backBtn').addEventListener('click', () => navigateTo(appUrl('index.html')));
    document.querySelectorAll('.bottom-nav__item').forEach((item) => {
      item.addEventListener('click', () => {
        const nav = item.dataset.nav;
        if (nav === 'home') navigateTo(appUrl('index.html'));
        if (nav === 'profile') navigateTo(appUrl('pages/character.html'));
        if (nav === 'shop') navigateTo(appUrl('pages/shop.html'));
        if (nav === 'settings') navigateTo(appUrl('pages/setting.html'));
      });
    });
  }

  function refreshShell() {
    window.AppUI?.refresh?.();
    updateBalance();
    applyCopy();
  }

  function handleFrameMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'html-crash-course') return;

    setFrameReady();
    refreshShell();

    if (data.type === 'theme-change') {
      return;
    }

    if (data.type === 'content-size') {
      frameContentHeight = Math.max(0, Number(data.payload?.height) || 0);
      syncFrameHeight();
      scheduleViewportSync();
      return;
    }

    if (data.type === 'reward') {
      const reward = data.payload?.reward || { xp: 0, coins: 0 };
      if (data.payload?.completedCourse) {
        showToast(getCopy().toastCourse);
        return;
      }
      if (reward.xp || reward.coins) {
        showToast(format(getCopy().toastReward, reward));
      }
    }
  }

  frame.addEventListener('load', () => {
    window.setTimeout(() => {
      setFrameReady();
      syncFrameHeight();
      bindFrameWheelBridge();
      refreshShell();
      scheduleViewportSync();
    }, 200);
  });

  window.addEventListener('message', handleFrameMessage);
  window.addEventListener('focus', refreshShell);
  window.addEventListener('resize', () => {
    syncFrameHeight();
    scheduleViewportSync();
  });
  window.addEventListener('scroll', scheduleViewportSync, { passive: true });
  document.addEventListener('scroll', scheduleViewportSync, { passive: true });

  syncFrameHeight();
  refreshShell();
  initNavigation();
  scheduleViewportSync();
})();
