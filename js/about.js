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
      lead: 'Life Capital Academy це навчальний застосунок, клієнтська частина якого використовує спільну фронтенд-основу з сайтом для єдиного інтерфейсу, профілю, прогресу та мініігор.',
      metricOneLabel: 'Формат',
      metricOneValue: 'Застосунок зі спільним фронтендом на базі сайту',
      metricTwoLabel: 'Навчання',
      metricTwoValue: 'Мініігри, прогрес, персонаж і магазин',
      metricThreeLabel: 'Безпека',
      metricThreeValue: 'Захищені з’єднання та сервісні обмеження доступу'
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
      lead: 'Life Capital Academy is a learning app whose client layer uses the same frontend foundation as the website to keep the interface, profile, progress, and mini-games consistent.',
      metricOneLabel: 'Format',
      metricOneValue: 'App with a shared website-based frontend',
      metricTwoLabel: 'Learning',
      metricTwoValue: 'Mini-games, progress, character, and shop',
      metricThreeLabel: 'Security',
      metricThreeValue: 'Protected connections and service access controls'
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
    const darkMode = isDarkMode();
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    document.body.classList.toggle('theme-light', !darkMode);
    document.body.classList.toggle('theme-dark', darkMode);
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
