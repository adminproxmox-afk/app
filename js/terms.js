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
      lead: 'Ці умови регулюють доступ до застосунку Life Capital Academy, його спільної з сайтом фронтенд-основи, акаунта користувача, навчального контенту та підключених способів входу.',
      effectiveLabel: 'Чинні з',
      effectiveValue: '26 квітня 2026',
      formatLabel: 'Формат',
      formatValue: 'Застосунок та пов’язаний вебклієнт',
      accessLabel: 'Доступ',
      accessValue: 'Акаунт користувача, контент і сервісні інтеграції'
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
      lead: 'These terms govern access to the Life Capital Academy app, its shared website-based frontend, the user account, learning content, and connected sign-in methods.',
      effectiveLabel: 'Effective',
      effectiveValue: 'April 26, 2026',
      formatLabel: 'Format',
      formatValue: 'App and related web client',
      accessLabel: 'Access',
      accessValue: 'User account, content, and service integrations'
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
