(function () {
  const STORAGE_KEY = 'miniAppDb';

  const TEXT = {
    uk: {
      pageTitle: 'Про додаток | Life Capital Academy',
      backLoggedIn: 'До налаштувань',
      backGuest: 'До входу',
      privacy: 'Політика',
      terms: 'Умови',
      appLoggedIn: 'На головну',
      appGuest: 'Увійти',
      kicker: 'Life Capital Academy',
      title: 'Про додаток',
      lead: 'Life Capital Academy це навчальний вебдодаток із мінііграми, профілем користувача, прогресом і тематичними добірками для практики навичок у зручному форматі.',
      metricOneLabel: 'Формат',
      metricOneValue: 'Вебверсія з локальним профілем',
      metricTwoLabel: 'Навчання',
      metricTwoValue: 'Мініігри, прогрес і практика',
      metricThreeLabel: 'Доступ',
      metricThreeValue: 'Локальний акаунт, Google, Telegram'
    },
    en: {
      pageTitle: 'About App | Life Capital Academy',
      backLoggedIn: 'Back to settings',
      backGuest: 'Back to sign in',
      privacy: 'Privacy',
      terms: 'Terms',
      appLoggedIn: 'Open app',
      appGuest: 'Sign in',
      kicker: 'Life Capital Academy',
      title: 'About App',
      lead: 'Life Capital Academy is a learning web app with mini-games, a user profile, progress tracking, and themed practice collections in a compact, friendly format.',
      metricOneLabel: 'Format',
      metricOneValue: 'Web version with a local profile',
      metricTwoLabel: 'Learning',
      metricTwoValue: 'Mini-games, progress, and practice',
      metricThreeLabel: 'Access',
      metricThreeValue: 'Local account, Google, Telegram'
    }
  };

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function getStoredDb() {
    return safeParse(localStorage.getItem(STORAGE_KEY)) || {};
  }

  function getCurrentUser() {
    const db = getStoredDb();
    return String(db?.session?.user || localStorage.getItem('user') || '').trim();
  }

  function getLanguage() {
    const db = getStoredDb();
    const dbLanguage = db?.settings?.language;
    const legacyLanguage = localStorage.getItem('language');
    if (dbLanguage === 'en' || legacyLanguage === 'en') return 'en';
    return 'uk';
  }

  function isDarkMode() {
    const db = getStoredDb();
    if (typeof db?.settings?.darkMode === 'boolean') return db.settings.darkMode;
    return localStorage.getItem('darkMode') !== 'false';
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function applyLanguageBlocks(language) {
    document.querySelectorAll('[data-lang-block]').forEach((block) => {
      block.hidden = block.dataset.langBlock !== language;
    });
  }

  function applyLinks(language) {
    const currentUser = getCurrentUser();
    const backLink = document.getElementById('aboutBackLink');
    const privacyLink = document.getElementById('aboutPrivacyLink');
    const termsLink = document.getElementById('aboutTermsLink');
    const appLink = document.getElementById('aboutAppLink');

    if (!backLink || !privacyLink || !termsLink || !appLink) return;

    privacyLink.textContent = TEXT[language].privacy;
    termsLink.textContent = TEXT[language].terms;

    if (currentUser) {
      backLink.href = 'pages/setting.html';
      appLink.href = 'index.html';
      setText('aboutBackLabel', TEXT[language].backLoggedIn);
      appLink.textContent = TEXT[language].appLoggedIn;
      return;
    }

    backLink.href = 'login.html';
    appLink.href = 'login.html';
    setText('aboutBackLabel', TEXT[language].backGuest);
    appLink.textContent = TEXT[language].appGuest;
  }

  function applyTheme() {
    document.body.classList.toggle('theme-light', !isDarkMode());
    document.body.classList.toggle('theme-dark', isDarkMode());
  }

  function applyPageCopy() {
    const language = getLanguage();
    const copy = TEXT[language];

    document.documentElement.lang = language;
    document.title = copy.pageTitle;

    setText('aboutKicker', copy.kicker);
    setText('aboutTitle', copy.title);
    setText('aboutLead', copy.lead);
    setText('aboutMetricOneLabel', copy.metricOneLabel);
    setText('aboutMetricOneValue', copy.metricOneValue);
    setText('aboutMetricTwoLabel', copy.metricTwoLabel);
    setText('aboutMetricTwoValue', copy.metricTwoValue);
    setText('aboutMetricThreeLabel', copy.metricThreeLabel);
    setText('aboutMetricThreeValue', copy.metricThreeValue);

    applyTheme();
    applyLanguageBlocks(language);
    applyLinks(language);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPageCopy);
  } else {
    applyPageCopy();
  }
})();
