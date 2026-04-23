(function () {
  const STORAGE_KEY = 'miniAppDb';

  const TEXT = {
    uk: {
      pageTitle: 'Політика конфіденційності | Life Capital Academy',
      backLoggedIn: 'До налаштувань',
      backGuest: 'До входу',
      about: 'Про додаток',
      terms: 'Умови',
      appLoggedIn: 'На головну',
      appGuest: 'Увійти',
      kicker: 'Life Capital Academy',
      title: 'Політика конфіденційності',
      lead: 'Ця сторінка описує, як поточна вебверсія Life Capital Academy працює з даними профілю, локальним зберіганням і входом через зовнішніх провайдерів.',
      updatedLabel: 'Оновлено',
      updatedValue: '21 квітня 2026',
      storageLabel: 'Зберігання',
      storageValue: 'Локально у браузері',
      scopeLabel: 'Сфера дії',
      scopeValue: 'Поточна вебверсія застосунку'
    },
    en: {
      pageTitle: 'Privacy Policy | Life Capital Academy',
      backLoggedIn: 'Back to settings',
      backGuest: 'Back to sign in',
      about: 'About app',
      terms: 'Terms',
      appLoggedIn: 'Open app',
      appGuest: 'Sign in',
      kicker: 'Life Capital Academy',
      title: 'Privacy Policy',
      lead: 'This page describes how the current web version of Life Capital Academy handles profile data, local storage, and sign-in through external providers.',
      updatedLabel: 'Updated',
      updatedValue: 'April 21, 2026',
      storageLabel: 'Storage',
      storageValue: 'Local browser storage',
      scopeLabel: 'Scope',
      scopeValue: 'Current web app version'
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
    const backLink = document.getElementById('policyBackLink');
    const aboutLink = document.getElementById('policyAboutLink');
    const termsLink = document.getElementById('policyTermsLink');
    const appLink = document.getElementById('policyAppLink');

    if (!backLink || !aboutLink || !termsLink || !appLink) return;

    aboutLink.textContent = TEXT[language].about;
    termsLink.textContent = TEXT[language].terms;

    if (currentUser) {
      backLink.href = 'pages/setting.html';
      appLink.href = 'index.html';
      setText('policyBackLabel', TEXT[language].backLoggedIn);
      appLink.textContent = TEXT[language].appLoggedIn;
      return;
    }

    backLink.href = 'login.html';
    appLink.href = 'login.html';
    setText('policyBackLabel', TEXT[language].backGuest);
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

    setText('policyKicker', copy.kicker);
    setText('policyTitle', copy.title);
    setText('policyLead', copy.lead);
    setText('updatedLabel', copy.updatedLabel);
    setText('updatedValue', copy.updatedValue);
    setText('storageLabel', copy.storageLabel);
    setText('storageValue', copy.storageValue);
    setText('scopeLabel', copy.scopeLabel);
    setText('scopeValue', copy.scopeValue);

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
