(function () {
  function getDb() {
    return window.AppDB?.getData?.() || { settings: { darkMode: true, language: 'uk' } };
  }

  function getSettings() {
    const settings = getDb().settings || {};
    return {
      darkMode: settings.darkMode !== false,
      language: settings.language === 'en' ? 'en' : 'uk'
    };
  }

  function applyTheme() {
    const { darkMode } = getSettings();
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    document.body.classList.toggle('theme-light', !darkMode);
    document.body.classList.toggle('theme-dark', darkMode);
  }

  function getPageKey() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.endsWith('/index.html') || path.endsWith('/')) return 'index';
    if (path.endsWith('/login.html')) return 'login';
    if (path.endsWith('/regist.html')) return 'register';
    if (path.endsWith('/pages/setting.html')) return 'settings';
    if (path.endsWith('/pages/shop.html')) return 'shop';
    if (path.endsWith('/pages/character.html')) return 'character';
    return '';
  }

  const translations = {
    uk: {
      common: {
        nav_home: 'Головна',
        nav_profile: 'Аватар',
        nav_shop: 'Магазин',
        nav_settings: 'Налаштування'
      },
      settings: {
        title: 'Налаштування',
        section_account: 'Акаунт',
        section_preferences: 'Параметри',
        section_actions: 'Дії',
        field_name: "Ім'я",
        field_phone: 'Номер',
        field_username: 'Тег профілю',
        field_email: 'Пошта',
        field_bio: 'Про себе',
        field_gender: 'Стать',
        field_status: 'Статус',
        dark_mode: 'Темна тема',
        dark_mode_desc: 'Загальний вигляд застосунку',
        notifications: 'Сповіщення',
        notifications_desc: 'Нагадування та активність',
        music: 'Музика',
        music_desc: 'Фонова музика в інтерфейсі',
        sounds: 'Звукові ефекти',
        sounds_desc: 'Кліки та системні звуки',
        volume: 'Гучність',
        language: 'Мова',
        language_desc: 'Мова інтерфейсу',
        change_password: 'Змінити пароль',
        clear_cache: 'Очистити кеш',
        reset_settings: 'Скинути налаштування',
        about: 'Про додаток',
        privacy: 'Конфіденційність',
        terms: 'Умови надання послуг',
        logout: 'Вийти'
      }
    },
    en: {
      common: {
        nav_home: 'Home',
        nav_profile: 'Avatar',
        nav_shop: 'Shop',
        nav_settings: 'Settings'
      },
      settings: {
        title: 'Settings',
        section_account: 'Account',
        section_preferences: 'Preferences',
        section_actions: 'Actions',
        field_name: 'Name',
        field_phone: 'Phone',
        field_username: 'Profile tag',
        field_email: 'Email',
        field_bio: 'About',
        field_gender: 'Gender',
        field_status: 'Status',
        dark_mode: 'Dark theme',
        dark_mode_desc: 'App appearance',
        notifications: 'Notifications',
        notifications_desc: 'Reminders and activity',
        music: 'Music',
        music_desc: 'Background interface music',
        sounds: 'Sound effects',
        sounds_desc: 'Clicks and system sounds',
        volume: 'Volume',
        language: 'Language',
        language_desc: 'Interface language',
        change_password: 'Change password',
        clear_cache: 'Clear cache',
        reset_settings: 'Reset settings',
        about: 'About app',
        privacy: 'Privacy',
        terms: 'Terms of Service',
        logout: 'Log out'
      }
    }
  };

  function translateNav(language) {
    const common = translations[language].common;
    document.querySelectorAll('.bottom-nav__item').forEach((item) => {
      const label = item.querySelector('span:last-child');
      if (!label) return;
      if (item.dataset.nav === 'home') label.textContent = common.nav_home;
      if (item.dataset.nav === 'profile') label.textContent = common.nav_profile;
      if (item.dataset.nav === 'shop') label.textContent = common.nav_shop;
      if (item.dataset.nav === 'settings') label.textContent = common.nav_settings;
    });
  }

  function translateSettings(language) {
    const t = translations[language].settings;
    const title = document.querySelector('.topbar__title');
    if (title) title.textContent = t.title;

    const headers = document.querySelectorAll('.detail-card__header span');
    if (headers[0]) headers[0].textContent = t.section_account;
    if (headers[1]) headers[1].textContent = t.section_preferences;
    if (headers[2]) headers[2].textContent = t.section_actions;

    const labels = {
      fieldName: t.field_name,
      fieldPhone: t.field_phone,
      fieldUsername: t.field_username,
      fieldEmail: t.field_email,
      fieldBio: t.field_bio,
      fieldGender: t.field_gender,
      fieldStatusText: t.field_status
    };

    Object.entries(labels).forEach(([id, text]) => {
      const valueNode = document.getElementById(id);
      const row = valueNode?.closest('.detail-row');
      const label = row?.querySelector('.detail-row__label');
      if (label) label.textContent = text;
    });

    const prefRows = document.querySelectorAll('.pref-row, .pref-range, .pref-select');
    const prefTexts = [
      [t.dark_mode, t.dark_mode_desc],
      [t.notifications, t.notifications_desc],
      [t.music, t.music_desc],
      [t.sounds, t.sounds_desc],
      [t.volume, null],
      [t.language, t.language_desc]
    ];

    prefRows.forEach((row, index) => {
      const strong = row.querySelector('strong');
      const small = row.querySelector('.pref-row__copy small');
      if (strong && prefTexts[index]?.[0]) strong.textContent = prefTexts[index][0];
      if (small && prefTexts[index]?.[1]) small.textContent = prefTexts[index][1];
    });

    const actions = {
      changePasswordItem: t.change_password,
      clearDataItem: t.clear_cache,
      resetDefaultsBtn: t.reset_settings,
      aboutItem: t.about,
      privacyItem: t.privacy,
      termsItem: t.terms,
      logoutBtn: t.logout
    };

    Object.entries(actions).forEach(([id, text]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = text;
    });
  }

  function applyLanguage() {
    const { language } = getSettings();
    document.documentElement.lang = language;
    translateNav(language);
    if (getPageKey() === 'settings') {
      translateSettings(language);
    }
  }

  function refresh() {
    applyTheme();
    applyLanguage();
  }

  window.AppUI = {
    getLanguage() {
      return getSettings().language;
    },
    refresh
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh);
  } else {
    refresh();
  }
})();
