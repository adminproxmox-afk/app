(function () {
  const STORAGE_KEY = 'miniAppDb';

  const TEXT = {
    uk: {
      pageTitle: 'Умови надання послуг | Life Capital Academy',
      backLoggedIn: 'До налаштувань',
      backGuest: 'До входу',
      about: 'Про додаток',
      privacy: 'Політика',
      appLoggedIn: 'На головну',
      appGuest: 'Увійти',
      kicker: 'Life Capital Academy',
      title: 'Умови надання послуг',
      lead: 'Ці умови регулюють доступ до поточної вебверсії Life Capital Academy, використання локального акаунта, інтерактивного контенту, навчальних матеріалів і підключених способів входу.',
      effectiveLabel: 'Чинні з',
      effectiveValue: '21 квітня 2026',
      formatLabel: 'Формат',
      formatValue: 'Поточна вебверсія сервісу',
      accessLabel: 'Доступ',
      accessValue: 'Локальний акаунт та підключені провайдери'
    },
    en: {
      pageTitle: 'Terms of Service | Life Capital Academy',
      backLoggedIn: 'Back to settings',
      backGuest: 'Back to sign in',
      about: 'About app',
      privacy: 'Privacy',
      appLoggedIn: 'Open app',
      appGuest: 'Sign in',
      kicker: 'Life Capital Academy',
      title: 'Terms of Service',
      lead: 'These terms govern access to the current web version of Life Capital Academy, use of the local account, interactive content, learning materials, and connected sign-in methods.',
      effectiveLabel: 'Effective',
      effectiveValue: 'April 21, 2026',
      formatLabel: 'Format',
      formatValue: 'Current web service version',
      accessLabel: 'Access',
      accessValue: 'Local account and connected providers'
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
    const backLink = document.getElementById('termsBackLink');
    const aboutLink = document.getElementById('termsAboutLink');
    const privacyLink = document.getElementById('termsPrivacyLink');
    const appLink = document.getElementById('termsAppLink');

    if (!backLink || !aboutLink || !privacyLink || !appLink) return;

    aboutLink.textContent = TEXT[language].about;
    privacyLink.textContent = TEXT[language].privacy;

    if (currentUser) {
      backLink.href = 'pages/setting.html';
      appLink.href = 'index.html';
      setText('termsBackLabel', TEXT[language].backLoggedIn);
      appLink.textContent = TEXT[language].appLoggedIn;
      return;
    }

    backLink.href = 'login.html';
    appLink.href = 'login.html';
    setText('termsBackLabel', TEXT[language].backGuest);
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

    setText('termsKicker', copy.kicker);
    setText('termsTitle', copy.title);
    setText('termsLead', copy.lead);
    setText('termsEffectiveLabel', copy.effectiveLabel);
    setText('termsEffectiveValue', copy.effectiveValue);
    setText('termsFormatLabel', copy.formatLabel);
    setText('termsFormatValue', copy.formatValue);
    setText('termsAccessLabel', copy.accessLabel);
    setText('termsAccessValue', copy.accessValue);

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
