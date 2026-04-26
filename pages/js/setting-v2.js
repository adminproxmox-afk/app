(function () {
  const currentUser = window.AppDB?.getCurrentUser?.() || localStorage.getItem('user');
  if (!currentUser) {
    window.location.href = '../login.html';
    return;
  }

  const DEFAULT_SETTINGS = {
    darkMode: true,
    notifications: true,
    musicEnabled: true,
    soundEnabled: true,
    volume: 70,
    language: 'uk'
  };

  const DEFAULT_MALE_AVATAR = '👨‍🎓';
  const DEFAULT_FEMALE_AVATAR = '👩‍🎓';

  const DEFAULT_PROFILE = {
    name: currentUser,
    phone: '',
    phoneCountry: 'UA',
    username: currentUser.toLowerCase(),
    email: '',
    bio: 'Web Developer',
    gender: 'unknown',
    statusText: 'Online',
    avatar: DEFAULT_MALE_AVATAR,
    currentAvatar: DEFAULT_MALE_AVATAR,
    avatarImage: '',
    coins: 125
  };

  const DEFAULT_CHARACTER = {
    activeCategory: 'skin',
    selected: {
      skin: 'skin-soft',
      hair: 'hair-classic',
      accessory: 'accessory-none',
      shirt: 'shirt-red',
      pants: 'pants-navy',
      shoes: 'shoes-black',
      extra: 'extra-soft'
    },
    owned: ['skin-soft', 'hair-classic', 'accessory-none', 'shirt-red', 'pants-navy', 'shoes-black', 'extra-soft']
  };

  const FEMALE_CHARACTER = {
    activeCategory: 'skin',
    selected: {
      skin: 'skin-soft',
      hair: 'hair-blonde',
      accessory: 'accessory-none',
      shirt: 'shirt-violet',
      pants: 'pants-navy',
      shoes: 'shoes-white',
      extra: 'extra-soft'
    },
    owned: ['skin-soft', 'hair-blonde', 'accessory-none', 'shirt-violet', 'pants-navy', 'shoes-white', 'extra-soft']
  };

  const PHONE_COUNTRIES = [
    { code: 'UA', dialCode: '+380', trunkPrefix: '0', minDigits: 9, maxDigits: 9, groups: [2, 3, 2, 2], names: { uk: 'Україна', en: 'Ukraine' }, example: '67 123 45 67' },
    { code: 'PL', dialCode: '+48', trunkPrefix: '0', minDigits: 9, maxDigits: 9, groups: [3, 3, 3], names: { uk: 'Польща', en: 'Poland' }, example: '512 345 678' },
    { code: 'DE', dialCode: '+49', trunkPrefix: '0', minDigits: 10, maxDigits: 11, groups: [3, 3, 4], names: { uk: 'Німеччина', en: 'Germany' }, example: '151 234 5678' },
    { code: 'GB', dialCode: '+44', trunkPrefix: '0', minDigits: 10, maxDigits: 10, groups: [4, 3, 3], names: { uk: 'Велика Британія', en: 'United Kingdom' }, example: '7400 123 456' },
    { code: 'US', dialCode: '+1', minDigits: 10, maxDigits: 10, groups: [3, 3, 4], names: { uk: 'США', en: 'United States' }, example: '202 555 0147' },
    { code: 'CA', dialCode: '+1', minDigits: 10, maxDigits: 10, groups: [3, 3, 4], names: { uk: 'Канада', en: 'Canada' }, example: '416 555 0188' },
    { code: 'CZ', dialCode: '+420', minDigits: 9, maxDigits: 9, groups: [3, 3, 3], names: { uk: 'Чехія', en: 'Czechia' }, example: '601 234 567' },
    { code: 'SK', dialCode: '+421', trunkPrefix: '0', minDigits: 9, maxDigits: 9, groups: [3, 3, 3], names: { uk: 'Словаччина', en: 'Slovakia' }, example: '901 234 567' },
    { code: 'RO', dialCode: '+40', trunkPrefix: '0', minDigits: 9, maxDigits: 9, groups: [3, 3, 3], names: { uk: 'Румунія', en: 'Romania' }, example: '721 234 567' },
    { code: 'MD', dialCode: '+373', trunkPrefix: '0', minDigits: 8, maxDigits: 8, groups: [2, 3, 3], names: { uk: 'Молдова', en: 'Moldova' }, example: '60 123 456' },
    { code: 'LT', dialCode: '+370', trunkPrefix: '0', minDigits: 8, maxDigits: 8, groups: [3, 2, 3], names: { uk: 'Литва', en: 'Lithuania' }, example: '612 34 567' },
    { code: 'LV', dialCode: '+371', minDigits: 8, maxDigits: 8, groups: [2, 3, 3], names: { uk: 'Латвія', en: 'Latvia' }, example: '21 234 567' },
    { code: 'EE', dialCode: '+372', minDigits: 7, maxDigits: 8, groups: [4, 4], names: { uk: 'Естонія', en: 'Estonia' }, example: '5123 4567' },
    { code: 'FR', dialCode: '+33', trunkPrefix: '0', minDigits: 9, maxDigits: 9, groups: [1, 2, 2, 2, 2], names: { uk: 'Франція', en: 'France' }, example: '6 12 34 56 78' },
    { code: 'ES', dialCode: '+34', minDigits: 9, maxDigits: 9, groups: [3, 2, 2, 2], names: { uk: 'Іспанія', en: 'Spain' }, example: '612 34 56 78' },
    { code: 'IT', dialCode: '+39', minDigits: 10, maxDigits: 10, groups: [3, 3, 4], names: { uk: 'Італія', en: 'Italy' }, example: '312 345 6789' },
    { code: 'TR', dialCode: '+90', trunkPrefix: '0', minDigits: 10, maxDigits: 10, groups: [3, 3, 4], names: { uk: 'Туреччина', en: 'Turkey' }, example: '532 123 4567' },
    { code: 'GE', dialCode: '+995', trunkPrefix: '0', minDigits: 9, maxDigits: 9, groups: [3, 2, 2, 2], names: { uk: 'Грузія', en: 'Georgia' }, example: '555 12 34 56' }
  ].map((country) => ({
    ...country,
    dialDigits: country.dialCode.replace(/\D/g, '')
  }));

  function getLanguage() {
    return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
  }

  const I18N = {
    uk: {
      fallbackUnknown: 'Не вказано',
      fallbackStatus: 'Online',
      profileUpdated: 'Профіль оновлено',
      avatarChanged: 'Аватар змінено',
      avatarPhotoUpdated: 'Фото профілю оновлено',
      avatarReset: 'Стандартну аву відновлено',
      settingsReset: 'Налаштування скинуто',
      cacheCleared: 'Тимчасові дані очищено',
      currentPasswordInvalid: 'Поточний пароль невірний',
      newPasswordShort: 'Новий пароль має містити хоча б 4 символи',
      passwordsMismatch: 'Паролі не співпадають',
      passwordChanged: 'Пароль змінено',
      themeUpdated: 'Тему оновлено',
      notificationsUpdated: 'Сповіщення оновлено',
      musicUpdated: 'Музику оновлено',
      soundsUpdated: 'Звуки оновлено',
      volumeUpdated: 'Гучність оновлено',
      languageUpdated: 'Мову оновлено',
      resetTitle: 'Скидання',
      resetMessage: 'Повернути налаштування до стандартних значень?',
      clearCacheTitle: 'Очищення кешу',
      clearCacheMessage: 'Очистити тимчасові дані магазину, гардероба та історії?',
      logoutTitle: 'Вихід',
      logoutMessage: 'Ви впевнені, що хочете вийти з акаунта?',
      aboutMessage: 'Версія 2.1.0 | Локальний JSON-профіль активний',
      privacyMessage: 'Дані зберігаються локально у браузері цього пристрою',
      summaryTitle: 'Швидкий огляд',
      summaryTheme: 'Тема',
      summaryLanguage: 'Мова',
      summaryCoins: 'Баланс',
      summaryStatus: 'Статус',
      themeDark: 'Темна',
      themeLight: 'Світла',
      languageUk: 'Українська',
      languageEn: 'English',
      validationName: "Ім'я має містити хоча б 2 символи",
      validationPhone: 'Введіть коректний номер. Напр.: {example}',
      validationUsername: 'Тег: 3-24 символи, латиниця, цифри та _',
      validationUsernameExists: 'Такий тег уже зайнятий',
      validationUsernameSimilar: 'Цей тег надто схожий на вже існуючий @{tag}',
      validationEmail: 'Введіть правильну пошту',
      validationEmailExists: 'Користувач з такою поштою вже існує',
      validationBio: 'Напишіть короткий опис профілю',
      phoneModalTitle: 'Номер телефону',
      phoneModalHint: 'Оберіть країну та введіть номер у національному форматі. Ми одразу покажемо міжнародний вигляд.',
      phoneCountryLabel: 'Країна',
      phoneLocalLabel: 'Номер',
      phonePreviewLabel: 'Міжнародний формат',
      phoneExample: 'Напр.: {example}',
      phoneSave: 'Зберегти',
      phoneCancel: 'Скасувати',
      genderFemale: 'Жінка',
      genderMale: 'Чоловік',
      genderUnknown: 'Не вказано',
      genderOptions: {
        female: 'Жінка',
        male: 'Чоловік',
        unknown: 'Не вказано'
      },
      fieldMeta: {
        name: { title: "Ім'я", hint: "Введіть відображуване ім'я" },
        phone: { title: 'Номер', hint: 'Телефон для профілю' },
        username: { title: 'Тег профілю', hint: 'Без @, 3-24 символи: латиниця, цифри та _' },
        email: { title: 'Пошта', hint: 'Електронна адреса акаунта' },
        bio: { title: 'Про себе', hint: 'Короткий опис профілю' },
        gender: { title: 'Стать', hint: 'Оберіть значення' },
        statusText: { title: 'Статус', hint: 'Оберіть статус профілю' }
      }
    },
    en: {
      fallbackUnknown: 'Not specified',
      fallbackStatus: 'Online',
      profileUpdated: 'Profile updated',
      avatarChanged: 'Avatar updated',
      avatarPhotoUpdated: 'Profile photo updated',
      avatarReset: 'Default avatar restored',
      settingsReset: 'Settings reset',
      cacheCleared: 'Temporary data cleared',
      currentPasswordInvalid: 'Current password is incorrect',
      newPasswordShort: 'New password must be at least 4 characters',
      passwordsMismatch: 'Passwords do not match',
      passwordChanged: 'Password changed',
      themeUpdated: 'Theme updated',
      notificationsUpdated: 'Notifications updated',
      musicUpdated: 'Music updated',
      soundsUpdated: 'Sound updated',
      volumeUpdated: 'Volume updated',
      languageUpdated: 'Language updated',
      resetTitle: 'Reset',
      resetMessage: 'Return settings to default values?',
      clearCacheTitle: 'Clear cache',
      clearCacheMessage: 'Clear temporary shop, wardrobe, and history data?',
      logoutTitle: 'Sign out',
      logoutMessage: 'Are you sure you want to sign out?',
      aboutMessage: 'Version 2.1.0 | Local JSON profile is active',
      privacyMessage: 'Data is stored locally in this browser',
      summaryTitle: 'Quick Overview',
      summaryTheme: 'Theme',
      summaryLanguage: 'Language',
      summaryCoins: 'Balance',
      summaryStatus: 'Status',
      themeDark: 'Dark',
      themeLight: 'Light',
      languageUk: 'Ukrainian',
      languageEn: 'English',
      validationName: 'Name must be at least 2 characters',
      validationPhone: 'Enter a valid phone number. Example: {example}',
      validationUsername: 'Tag: 3-24 chars, letters, numbers and _',
      validationUsernameExists: 'This tag is already taken',
      validationUsernameSimilar: 'This tag is too similar to existing @{tag}',
      validationEmail: 'Enter a valid email address',
      validationEmailExists: 'An account with this email already exists',
      validationBio: 'Write a short profile description',
      phoneModalTitle: 'Phone number',
      phoneModalHint: 'Choose a country and enter the number in local format. We will show the international version instantly.',
      phoneCountryLabel: 'Country',
      phoneLocalLabel: 'Number',
      phonePreviewLabel: 'International format',
      phoneExample: 'Example: {example}',
      phoneSave: 'Save',
      phoneCancel: 'Cancel',
      genderFemale: 'Female',
      genderMale: 'Male',
      genderUnknown: 'Not specified',
      genderOptions: {
        female: 'Female',
        male: 'Male',
        unknown: 'Not specified'
      },
      fieldMeta: {
        name: { title: 'Name', hint: 'Enter a display name' },
        phone: { title: 'Phone', hint: 'Phone number for the profile' },
        username: { title: 'Profile tag', hint: 'No @, 3-24 chars: letters, numbers and _' },
        email: { title: 'Email', hint: 'Account email address' },
        bio: { title: 'About', hint: 'Short profile description' },
        gender: { title: 'Gender', hint: 'Choose an option' },
        statusText: { title: 'Status', hint: 'Choose profile status' }
      }
    }
  };

  function tr(key) {
    return I18N[getLanguage()][key];
  }

  function getGenderLabel(value) {
    return I18N[getLanguage()].genderOptions[value] || tr('genderUnknown');
  }

  function normalizeGender(value) {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (normalizedValue === 'female' || normalizedValue === 'жінка') return 'female';
    if (normalizedValue === 'male' || normalizedValue === 'чоловік') return 'male';
    return 'unknown';
  }

  function getPhoneCountry(code = 'UA') {
    return PHONE_COUNTRIES.find((country) => country.code === String(code || '').trim().toUpperCase()) || PHONE_COUNTRIES[0];
  }

  function getPhoneCountryLabel(country) {
    const language = getLanguage();
    return country?.names?.[language] || country?.names?.uk || country?.code || '';
  }

  function getPhoneExample(country) {
    return `${country.dialCode} ${country.example}`.trim();
  }

  function formatTemplate(template, params = {}) {
    let output = template;
    Object.keys(params).forEach((key) => {
      output = output.replace(`{${key}}`, String(params[key]));
    });
    return output;
  }

  function keepDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatPhoneByGroups(digits, groups = []) {
    const cleanDigits = keepDigits(digits);
    if (!cleanDigits) return '';

    const parts = [];
    let offset = 0;

    groups.forEach((groupSize) => {
      if (offset >= cleanDigits.length) return;
      parts.push(cleanDigits.slice(offset, offset + groupSize));
      offset += groupSize;
    });

    if (offset < cleanDigits.length) {
      parts.push(cleanDigits.slice(offset));
    }

    return parts.filter(Boolean).join(' ');
  }

  function normalizePhoneNationalDigits(rawValue, country) {
    const targetCountry = getPhoneCountry(country?.code || 'UA');
    let digits = keepDigits(rawValue);

    if (!digits) return '';

    if (digits.startsWith(targetCountry.dialDigits)) {
      digits = digits.slice(targetCountry.dialDigits.length);
    }

    if (targetCountry.trunkPrefix && digits.startsWith(targetCountry.trunkPrefix) && digits.length > targetCountry.maxDigits) {
      digits = digits.slice(targetCountry.trunkPrefix.length);
    }

    return digits.slice(0, targetCountry.maxDigits);
  }

  function buildInternationalPhone(country, digits) {
    const targetCountry = getPhoneCountry(country?.code || 'UA');
    const normalizedDigits = normalizePhoneNationalDigits(digits, targetCountry);
    const formattedNational = formatPhoneByGroups(normalizedDigits, targetCountry.groups);
    return normalizedDigits ? `${targetCountry.dialCode} ${formattedNational}`.trim() : targetCountry.dialCode;
  }

  function parseStoredPhone(phoneValue, countryCode = 'UA') {
    const fallbackCountry = getPhoneCountry(countryCode);
    const rawPhone = String(phoneValue || '').trim();
    const allDigits = keepDigits(rawPhone);

    if (!allDigits) {
      return {
        country: fallbackCountry,
        nationalDigits: '',
        localValue: '',
        internationalValue: ''
      };
    }

    const matchedCountry = PHONE_COUNTRIES
      .slice()
      .sort((left, right) => right.dialDigits.length - left.dialDigits.length)
      .find((country) => allDigits.startsWith(country.dialDigits));
    const resolvedCountry = matchedCountry || fallbackCountry;
    const nationalDigits = normalizePhoneNationalDigits(allDigits, resolvedCountry);

    return {
      country: resolvedCountry,
      nationalDigits,
      localValue: formatPhoneByGroups(nationalDigits, resolvedCountry.groups),
      internationalValue: buildInternationalPhone(resolvedCountry, nationalDigits)
    };
  }

  function validatePhoneDraft(countryCode, rawValue) {
    const country = getPhoneCountry(countryCode);
    const nationalDigits = normalizePhoneNationalDigits(rawValue, country);
    const isLengthValid = nationalDigits.length >= country.minDigits && nationalDigits.length <= country.maxDigits;

    return {
      ok: isLengthValid,
      country,
      nationalDigits,
      localValue: formatPhoneByGroups(nationalDigits, country.groups),
      internationalValue: buildInternationalPhone(country, nationalDigits),
      example: getPhoneExample(country)
    };
  }

  function getDefaultAvatarForGender(gender) {
    return normalizeGender(gender) === 'female' ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;
  }

  function getDefaultCharacterForGender(gender) {
    const template = normalizeGender(gender) === 'female' ? FEMALE_CHARACTER : DEFAULT_CHARACTER;
    return {
      ...template,
      selected: { ...template.selected },
      owned: [...template.owned]
    };
  }

  function isBuiltInAvatar(value) {
    const avatar = String(value || '').trim();
    return !avatar || avatar === DEFAULT_MALE_AVATAR || avatar === DEFAULT_FEMALE_AVATAR;
  }

  function selectedMatchesTemplate(selected, template) {
    const current = selected || {};
    return Object.keys(template.selected).every((key) => current[key] === template.selected[key]);
  }

  function ownedMatchesTemplate(owned, template) {
    const current = Array.from(new Set(owned || []));
    const required = Array.from(new Set(template?.owned || []));
    return required.every((itemId) => current.includes(itemId)) && current.length === required.length;
  }

  function isStarterCharacter(character) {
    const selected = character?.selected || {};
    const owned = character?.owned || [];
    return (
      (selectedMatchesTemplate(selected, DEFAULT_CHARACTER) && ownedMatchesTemplate(owned, DEFAULT_CHARACTER))
      || (selectedMatchesTemplate(selected, FEMALE_CHARACTER) && ownedMatchesTemplate(owned, FEMALE_CHARACTER))
    );
  }

  function applyGenderProfileDefaults(profile, db, syncCharacter = false) {
    profile.gender = normalizeGender(profile.gender);
    const defaultAvatar = getDefaultAvatarForGender(profile.gender);

    if (!String(profile.avatarImage || '').trim()) {
      if (isBuiltInAvatar(profile.avatar)) profile.avatar = defaultAvatar;
      if (isBuiltInAvatar(profile.currentAvatar)) profile.currentAvatar = defaultAvatar;
    }

    profile.avatar = profile.avatar || defaultAvatar;
    profile.currentAvatar = profile.currentAvatar || profile.avatar || defaultAvatar;

    if (db?.shop) {
      db.shop.avatars = Array.from(new Set([...(db.shop.avatars || []), defaultAvatar]));
    }

    if (syncCharacter && db) {
      const genderCharacter = getDefaultCharacterForGender(profile.gender);
      const currentCharacter = db.character || {};
      if (!currentCharacter.selected || isStarterCharacter(currentCharacter)) {
        db.character = genderCharacter;
      } else {
        db.character = {
          ...genderCharacter,
          ...currentCharacter,
          selected: {
            ...genderCharacter.selected,
            ...(currentCharacter.selected || {})
          },
          owned: Array.from(new Set([
            ...(currentCharacter.owned || []),
            ...genderCharacter.owned,
            ...Object.values(currentCharacter.selected || {})
          ]))
        };
      }
    }
  }

  function getFieldMeta() {
    const localized = I18N[getLanguage()].fieldMeta;
    return {
      name: { ...localized.name, type: 'text', max: 24 },
      phone: { ...localized.phone, type: 'tel', max: 22 },
      username: { ...localized.username, type: 'text', max: 24 },
      email: { ...localized.email, type: 'email', max: 50 },
      bio: { ...localized.bio, type: 'text', max: 60 },
      gender: { ...localized.gender, type: 'select' },
      statusText: { ...localized.statusText, type: 'status-select' }
    };
  }

  const elements = {
    toast: document.getElementById('toast'),
    coinBalance: document.getElementById('coinBalance'),
    profileDisplayName: document.getElementById('profileDisplayName'),
    profileStatusText: document.getElementById('profileStatusText'),
    avatarShell: document.getElementById('avatarShell'),
    profileAvatarImage: document.getElementById('profileAvatarImage'),
    profileAvatarEmoji: document.getElementById('profileAvatarEmoji'),
    volumeValue: document.getElementById('volumeValue'),
    languageSelect: document.getElementById('languageSelect'),
    volumeSlider: document.getElementById('volumeSlider'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    notificationsToggle: document.getElementById('notificationsToggle'),
    musicToggle: document.getElementById('musicToggle'),
    soundToggle: document.getElementById('soundToggle'),
    editModal: document.getElementById('editModal'),
    editModalTitle: document.getElementById('editModalTitle'),
    editModalHint: document.getElementById('editModalHint'),
    editFieldInput: document.getElementById('editFieldInput'),
    editFieldSelect: document.getElementById('editFieldSelect'),
    avatarModal: document.getElementById('avatarModal'),
    avatarUploadInput: document.getElementById('avatarUploadInput'),
    phoneModal: document.getElementById('phoneModal'),
    phoneModalTitle: document.getElementById('phoneModalTitle'),
    phoneModalHint: document.getElementById('phoneModalHint'),
    phoneCountryLabel: document.getElementById('phoneCountryLabel'),
    phoneCountrySelect: document.getElementById('phoneCountrySelect'),
    phoneLocalLabel: document.getElementById('phoneLocalLabel'),
    phoneLocalInput: document.getElementById('phoneLocalInput'),
    phonePreviewLabel: document.getElementById('phonePreviewLabel'),
    phonePreviewValue: document.getElementById('phonePreviewValue'),
    phoneExampleText: document.getElementById('phoneExampleText'),
    confirmModal: document.getElementById('confirmModal'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    passwordModal: document.getElementById('passwordModal'),
    currentPasswordInput: document.getElementById('currentPasswordInput'),
    newPasswordInput: document.getElementById('newPasswordInput'),
    confirmPasswordInput: document.getElementById('confirmPasswordInput'),
    summaryTitle: document.getElementById('summaryTitle'),
    summaryThemeLabel: document.getElementById('summaryThemeLabel'),
    summaryThemeValue: document.getElementById('summaryThemeValue'),
    summaryLanguageLabel: document.getElementById('summaryLanguageLabel'),
    summaryLanguageValue: document.getElementById('summaryLanguageValue'),
    summaryCoinsLabel: document.getElementById('summaryCoinsLabel'),
    summaryCoinsValue: document.getElementById('summaryCoinsValue'),
    summaryStatusLabel: document.getElementById('summaryStatusLabel'),
    summaryStatusValue: document.getElementById('summaryStatusValue')
  };

  let activeField = null;
  let activePhoneCountryCode = 'UA';
  let confirmAction = null;
  let toastTimer = null;

  function getData() {
    return window.AppDB?.getData?.() || { profile: { ...DEFAULT_PROFILE }, settings: { ...DEFAULT_SETTINGS } };
  }

  function getProfile() {
    const profile = getData().profile || {};
    return { ...DEFAULT_PROFILE, ...profile };
  }

  function getSettings() {
    const settings = getData().settings || {};
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      language: settings.language === 'en' ? 'en' : 'uk'
    };
  }

  function getPhoneValidationMessage(country) {
    return formatTemplate(tr('validationPhone'), {
      example: getPhoneExample(country)
    });
  }

  function syncPhoneModalCopy() {
    if (elements.phoneModalTitle) elements.phoneModalTitle.textContent = tr('phoneModalTitle');
    if (elements.phoneModalHint) elements.phoneModalHint.textContent = tr('phoneModalHint');
    if (elements.phoneCountryLabel) elements.phoneCountryLabel.textContent = tr('phoneCountryLabel');
    if (elements.phoneLocalLabel) elements.phoneLocalLabel.textContent = tr('phoneLocalLabel');
    if (elements.phonePreviewLabel) elements.phonePreviewLabel.textContent = tr('phonePreviewLabel');
    const cancelButton = document.getElementById('cancelPhoneBtn');
    const saveButton = document.getElementById('savePhoneBtn');
    if (cancelButton) cancelButton.textContent = tr('phoneCancel');
    if (saveButton) saveButton.textContent = tr('phoneSave');
  }

  function populatePhoneCountryOptions(selectedCode = 'UA') {
    const targetCode = getPhoneCountry(selectedCode).code;
    elements.phoneCountrySelect.innerHTML = PHONE_COUNTRIES.map((country) => {
      const isSelected = country.code === targetCode ? ' selected' : '';
      return `<option value="${country.code}"${isSelected}>${getPhoneCountryLabel(country)} (${country.dialCode})</option>`;
    }).join('');
    activePhoneCountryCode = targetCode;
  }

  function updatePhonePreview() {
    const validation = validatePhoneDraft(activePhoneCountryCode, elements.phoneLocalInput.value || '');
    elements.phoneLocalInput.value = validation.localValue;
    elements.phonePreviewValue.textContent = validation.internationalValue || validation.country.dialCode;
    elements.phoneExampleText.textContent = formatTemplate(tr('phoneExample'), {
      example: validation.example
    });
    return validation;
  }

  function openPhoneModal() {
    const profile = getProfile();
    const parsedPhone = parseStoredPhone(profile.phone, profile.phoneCountry || 'UA');

    syncPhoneModalCopy();
    populatePhoneCountryOptions(parsedPhone.country.code);
    elements.phoneLocalInput.value = parsedPhone.localValue;
    updatePhonePreview();
    openModal(elements.phoneModal);
    setTimeout(() => elements.phoneLocalInput.focus(), 30);
  }

  function savePhone() {
    const validation = validatePhoneDraft(activePhoneCountryCode, elements.phoneLocalInput.value || '');
    if (!validation.ok) {
      showToast(getPhoneValidationMessage(validation.country));
      return;
    }

    updateProfile((profile) => {
      profile.phone = validation.internationalValue;
      profile.phoneCountry = validation.country.code;
    });

    closeModal(elements.phoneModal);
    renderAll();
    window.AppUI?.refresh?.();
    showToast(tr('profileUpdated'));
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 1800);
  }

  function formatValue(value, fallback) {
    const stringValue = String(value || '').trim();
    return stringValue || fallback;
  }

  function updateProfile(mutator) {
    window.AppDB?.update?.((db) => {
      db.profile = { ...DEFAULT_PROFILE, ...db.profile };
      mutator(db.profile, db);
    });
  }

  function updateSettings(mutator) {
    window.AppDB?.update?.((db) => {
      db.settings = { ...DEFAULT_SETTINGS, ...db.settings };
      mutator(db.settings, db);
    });
  }

  function setBodyTheme(settings) {
    document.body.style.filter = '';
    document.body.classList.toggle('theme-dark', Boolean(settings.darkMode));
    document.body.classList.toggle('theme-light', !settings.darkMode);
  }

  function renderProfile() {
    const profile = getProfile();
    const parsedPhone = parseStoredPhone(profile.phone, profile.phoneCountry || 'UA');
    const phoneText = parsedPhone.internationalValue || formatValue(profile.phone, tr('fallbackUnknown'));
    elements.coinBalance.textContent = String(profile.coins || 125);
    elements.profileDisplayName.textContent = formatValue(profile.name, currentUser);
    elements.profileStatusText.textContent = formatValue(profile.statusText, tr('fallbackStatus'));

    document.getElementById('fieldName').textContent = formatValue(profile.name, tr('fallbackUnknown'));
    document.getElementById('fieldPhone').textContent = phoneText || tr('fallbackUnknown');
    document.getElementById('fieldUsername').textContent = `@${formatValue(profile.username, currentUser.toLowerCase())}`;
    document.getElementById('fieldEmail').textContent = formatValue(profile.email, tr('fallbackUnknown'));
    document.getElementById('fieldBio').textContent = formatValue(profile.bio, tr('fallbackUnknown'));
    document.getElementById('fieldGender').textContent = getGenderLabel(profile.gender);
    document.getElementById('fieldStatusText').textContent = formatValue(profile.statusText, tr('fallbackStatus'));

    const avatarImage = String(profile.avatarImage || '').trim();
    elements.profileAvatarEmoji.textContent = profile.currentAvatar || profile.avatar || getDefaultAvatarForGender(profile.gender);
    if (avatarImage) {
      elements.avatarShell.classList.add('has-image');
      elements.profileAvatarImage.src = avatarImage;
    } else {
      elements.avatarShell.classList.remove('has-image');
      elements.profileAvatarImage.removeAttribute('src');
    }
  }

  function renderSettings() {
    const settings = getSettings();
    elements.darkModeToggle.classList.toggle('active', Boolean(settings.darkMode));
    elements.notificationsToggle.classList.toggle('active', Boolean(settings.notifications));
    elements.musicToggle.classList.toggle('active', Boolean(settings.musicEnabled));
    elements.soundToggle.classList.toggle('active', Boolean(settings.soundEnabled));
    elements.languageSelect.value = settings.language || 'uk';
    elements.volumeSlider.value = String(settings.volume ?? 70);
    elements.volumeValue.textContent = `${settings.volume ?? 70}%`;
    setBodyTheme(settings);

    if (elements.summaryTitle) elements.summaryTitle.textContent = tr('summaryTitle');
    if (elements.summaryThemeLabel) elements.summaryThemeLabel.textContent = tr('summaryTheme');
    if (elements.summaryLanguageLabel) elements.summaryLanguageLabel.textContent = tr('summaryLanguage');
    if (elements.summaryCoinsLabel) elements.summaryCoinsLabel.textContent = tr('summaryCoins');
    if (elements.summaryStatusLabel) elements.summaryStatusLabel.textContent = tr('summaryStatus');
    if (elements.summaryThemeValue) elements.summaryThemeValue.textContent = settings.darkMode ? tr('themeDark') : tr('themeLight');
    if (elements.summaryLanguageValue) elements.summaryLanguageValue.textContent = settings.language === 'en' ? tr('languageEn') : tr('languageUk');
    if (elements.summaryCoinsValue) elements.summaryCoinsValue.textContent = String(getProfile().coins || 125);
    if (elements.summaryStatusValue) elements.summaryStatusValue.textContent = formatValue(getProfile().statusText, tr('fallbackStatus'));
  }

  function renderAll() {
    renderProfile();
    renderSettings();
    syncPhoneModalCopy();
    if (elements.phoneCountrySelect) {
      const currentLocalValue = elements.phoneLocalInput?.value || '';
      populatePhoneCountryOptions(activePhoneCountryCode);
      elements.phoneLocalInput.value = currentLocalValue;
      updatePhonePreview();
    }
    window.AppEnhancements?.refresh?.();
    window.AppEnhancements?.refreshAudio?.();
  }

  function closeModal(modal) {
    modal.style.display = 'none';
  }

  function openModal(modal) {
    modal.style.display = 'flex';
  }

  function validateField(field, value) {
    const cleanValue = String(value || '').trim();

    if (field === 'name') {
      if (cleanValue.length < 2) return tr('validationName');
    }

    if (field === 'phone') {
      const phoneValidation = validatePhoneDraft(getProfile().phoneCountry || 'UA', cleanValue);
      if (!phoneValidation.ok) return getPhoneValidationMessage(phoneValidation.country);
    }

    if (field === 'username') {
      const tagState = window.AppDB?.checkPublicTagAvailability?.(cleanValue, currentUser) || { ok: false, code: 'TAG_INVALID' };
      if (!tagState.ok) {
        if (tagState.code === 'TAG_EXISTS') return tr('validationUsernameExists');
        if (tagState.code === 'TAG_TOO_SIMILAR') return tr('validationUsernameSimilar').replace('{tag}', tagState.similarTag || '');
        return tr('validationUsername');
      }
    }

    if (field === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) return tr('validationEmail');
      const emailExists = (window.AppDB?.getUsers?.() || []).some((user) => (
        user.login !== currentUser
        && String(user.email || '').trim().toLowerCase() === cleanValue.toLowerCase()
      ));
      if (emailExists) return tr('validationEmailExists');
    }

    if (field === 'bio' && cleanValue.length < 2) {
      return tr('validationBio');
    }

    return '';
  }

  function openEditModal(field) {
    if (field === 'phone') {
      activeField = null;
      openPhoneModal();
      return;
    }

    const profile = getProfile();
    const meta = getFieldMeta()[field];
    if (!meta) return;

    activeField = field;
    elements.editModalTitle.textContent = meta.title;
    elements.editModalHint.textContent = meta.hint;

    if (meta.type === 'select' || meta.type === 'status-select') {
      elements.editFieldInput.hidden = true;
      elements.editFieldSelect.hidden = false;
      if (meta.type === 'status-select') {
        elements.editFieldSelect.innerHTML = '<option value="Online">Online</option><option value="Offline">Offline</option>';
        elements.editFieldSelect.value = profile[field] || 'Online';
      } else {
        elements.editFieldSelect.innerHTML = `<option value="female">${tr('genderFemale')}</option><option value="male">${tr('genderMale')}</option><option value="unknown">${tr('genderUnknown')}</option>`;
        elements.editFieldSelect.value = normalizeGender(profile[field]);
      }
    } else {
      elements.editFieldSelect.hidden = true;
      elements.editFieldInput.hidden = false;
      elements.editFieldInput.type = meta.type;
      elements.editFieldInput.maxLength = meta.max || 80;
      elements.editFieldInput.value = profile[field] || '';
      setTimeout(() => elements.editFieldInput.focus(), 30);
    }

    openModal(elements.editModal);
  }

  function saveActiveField() {
    if (!activeField) return;
    const meta = getFieldMeta()[activeField];
    const rawValue = (meta.type === 'select' || meta.type === 'status-select')
      ? elements.editFieldSelect.value
      : elements.editFieldInput.value;
    const value = String(rawValue || '').trim();
    const error = validateField(activeField, value);

    if (error) {
      showToast(error);
      return;
    }

    updateProfile((profile, db) => {
      profile[activeField] = activeField === 'gender'
        ? normalizeGender(value)
        : activeField === 'username'
          ? (window.AppDB?.normalizePublicTag?.(value) || value)
          : value;
      if (activeField === 'gender') {
        applyGenderProfileDefaults(profile, db, true);
      }
      if (activeField === 'name' && !profile.username) {
        profile.username = currentUser.toLowerCase();
      }
      if (activeField === 'email') {
        const user = db.users.find((entry) => entry.login === currentUser);
        if (user) user.email = value.toLowerCase();
      }
    });

    closeModal(elements.editModal);
    renderAll();
    window.AppUI?.refresh?.();
    showToast(tr('profileUpdated'));
  }

  function applyAvatarEmoji(emoji) {
    updateProfile((profile) => {
      profile.avatar = emoji;
      profile.currentAvatar = emoji;
      profile.avatarImage = '';
    });
    closeModal(elements.avatarModal);
    renderAll();
    window.AppUI?.refresh?.();
    showToast(tr('avatarChanged'));
  }

  function resetProfileAvatar() {
    updateProfile((profile) => {
      const defaultAvatar = getDefaultAvatarForGender(profile.gender);
      profile.avatar = defaultAvatar;
      profile.currentAvatar = defaultAvatar;
      profile.avatarImage = '';
    });
    closeModal(elements.avatarModal);
    renderAll();
    window.AppUI?.refresh?.();
    showToast(tr('avatarReset'));
  }

  function handleAvatarUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile((profile) => {
        const defaultAvatar = getDefaultAvatarForGender(profile.gender);
        profile.avatar = defaultAvatar;
        profile.currentAvatar = defaultAvatar;
        profile.avatarImage = String(reader.result || '');
      });
      closeModal(elements.avatarModal);
      renderAll();
      window.AppUI?.refresh?.();
      showToast(tr('avatarPhotoUpdated'));
    };
    reader.readAsDataURL(file);
  }

  function showConfirm(title, message, onConfirm) {
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    confirmAction = onConfirm;
    openModal(elements.confirmModal);
  }

  function resetSettings() {
    updateSettings((settings) => {
      Object.assign(settings, DEFAULT_SETTINGS);
    });
    renderAll();
    window.AppUI?.refresh?.();
    showToast(tr('settingsReset'));
  }

  function clearCache() {
    window.AppDB?.update?.((db) => {
      const defaultCharacter = getDefaultCharacterForGender(db.profile?.gender);
      const defaultAvatar = getDefaultAvatarForGender(db.profile?.gender);
      db.shop.inventory = [];
      db.shop.avatars = Array.from(new Set([DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR, defaultAvatar]));
      db.shop.achievements = [];
      db.shop.purchaseHistory = [];
      db.shop.lastDaily = 0;
      db.shop.dailyClaimCount = 0;
      db.shop.totalSpent = 0;
      db.character = {
        ...defaultCharacter,
        selected: { ...defaultCharacter.selected },
        owned: [...defaultCharacter.owned]
      };
    });
    renderAll();
    showToast(tr('cacheCleared'));
  }

  function openPasswordModal() {
    elements.currentPasswordInput.value = '';
    elements.newPasswordInput.value = '';
    elements.confirmPasswordInput.value = '';
    openModal(elements.passwordModal);
  }

  function savePassword() {
    const currentPassword = elements.currentPasswordInput.value;
    const newPassword = elements.newPasswordInput.value;
    const confirmPassword = elements.confirmPasswordInput.value;
    const user = window.AppDB?.findUserByLogin?.(currentUser);

    if (!user || user.password !== currentPassword) {
      showToast(tr('currentPasswordInvalid'));
      return;
    }

    if (newPassword.length < 4) {
      showToast(tr('newPasswordShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(tr('passwordsMismatch'));
      return;
    }

    window.AppDB?.update?.((db) => {
      const target = db.users.find((entry) => entry.login === currentUser);
      if (target) target.password = newPassword;
    });

    closeModal(elements.passwordModal);
    showToast(tr('passwordChanged'));
  }

  function logout() {
    window.AppDB?.clearCurrentUser?.();
    window.location.href = '../login.html';
  }

  function bindFieldEditors() {
    document.querySelectorAll('[data-field]').forEach((button) => {
      button.addEventListener('click', () => openEditModal(button.dataset.field));
    });
  }

  function bindSettings() {
    document.getElementById('darkModeItem').addEventListener('click', () => {
      updateSettings((settings) => { settings.darkMode = !settings.darkMode; });
      renderSettings();
      window.AppUI?.refresh?.();
      showToast(tr('themeUpdated'));
    });

    document.getElementById('notificationsItem').addEventListener('click', () => {
      updateSettings((settings) => { settings.notifications = !settings.notifications; });
      renderSettings();
      showToast(tr('notificationsUpdated'));
    });

    document.getElementById('musicItem').addEventListener('click', () => {
      updateSettings((settings) => { settings.musicEnabled = !settings.musicEnabled; });
      renderSettings();
      window.AppEnhancements?.refreshAudio?.();
      showToast(tr('musicUpdated'));
    });

    document.getElementById('soundItem').addEventListener('click', () => {
      updateSettings((settings) => { settings.soundEnabled = !settings.soundEnabled; });
      renderSettings();
      window.AppEnhancements?.refreshAudio?.();
      showToast(tr('soundsUpdated'));
    });

    elements.volumeSlider.addEventListener('input', (event) => {
      const value = Number(event.target.value || 70);
      updateSettings((settings) => { settings.volume = value; });
      elements.volumeValue.textContent = `${value}%`;
      window.AppEnhancements?.refreshAudio?.();
    });

    elements.volumeSlider.addEventListener('change', () => showToast(tr('volumeUpdated')));

    elements.languageSelect.addEventListener('change', (event) => {
      const value = event.target.value === 'en' ? 'en' : 'uk';
      updateSettings((settings) => { settings.language = value; });
      renderAll();
      window.AppUI?.refresh?.();
      showToast(tr('languageUpdated'));
    });
  }

  function bindActions() {
    document.getElementById('backBtn').addEventListener('click', () => window.location.href = '../index.html');
    document.getElementById('changeAvatarItem').addEventListener('click', () => openModal(elements.avatarModal));
    document.getElementById('uploadAvatarBtn').addEventListener('click', () => elements.avatarUploadInput.click());
    document.getElementById('resetAvatarBtn').addEventListener('click', resetProfileAvatar);
    elements.avatarUploadInput.addEventListener('change', (event) => handleAvatarUpload(event.target.files?.[0]));

    document.getElementById('cancelEditBtn').addEventListener('click', () => closeModal(elements.editModal));
    document.getElementById('saveEditBtn').addEventListener('click', saveActiveField);
    document.getElementById('closeAvatarModal').addEventListener('click', () => closeModal(elements.avatarModal));
    document.getElementById('cancelPhoneBtn').addEventListener('click', () => closeModal(elements.phoneModal));
    document.getElementById('savePhoneBtn').addEventListener('click', savePhone);
    elements.phoneCountrySelect.addEventListener('change', (event) => {
      activePhoneCountryCode = getPhoneCountry(event.target.value).code;
      updatePhonePreview();
    });
    elements.phoneLocalInput.addEventListener('input', updatePhonePreview);
    elements.phoneLocalInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        savePhone();
      }
    });

    document.getElementById('changePasswordItem').addEventListener('click', openPasswordModal);
    document.getElementById('cancelPasswordBtn').addEventListener('click', () => closeModal(elements.passwordModal));
    document.getElementById('savePasswordBtn').addEventListener('click', savePassword);

    document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
      showConfirm(tr('resetTitle'), tr('resetMessage'), resetSettings);
    });

    document.getElementById('clearDataItem').addEventListener('click', () => {
      showConfirm(tr('clearCacheTitle'), tr('clearCacheMessage'), clearCache);
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      showConfirm(tr('logoutTitle'), tr('logoutMessage'), logout);
    });

    document.getElementById('aboutItem').addEventListener('click', () => {
      window.location.href = '../about.html';
    });

    document.getElementById('privacyItem').addEventListener('click', () => {
      window.location.href = '../privacy.html';
    });

    document.getElementById('termsItem').addEventListener('click', () => {
      window.location.href = '../terms.html';
    });

    document.getElementById('cancelConfirmBtn').addEventListener('click', () => closeModal(elements.confirmModal));
    document.getElementById('confirmActionBtn').addEventListener('click', () => {
      if (typeof confirmAction === 'function') confirmAction();
      confirmAction = null;
      closeModal(elements.confirmModal);
    });

    window.addEventListener('click', (event) => {
      if (event.target.classList.contains('modal')) {
        closeModal(event.target);
      }
    });
  }

  function bindNav() {
    document.querySelectorAll('.bottom-nav__item').forEach((item) => {
      item.addEventListener('click', () => {
        const navType = item.dataset.nav;
        if (navType === 'home') window.location.href = '../index.html';
        if (navType === 'profile') window.location.href = 'character.html';
        if (navType === 'shop') window.location.href = 'shop.html';
        if (navType === 'settings') window.location.href = 'setting.html';
      });
    });
  }

  function ensureProfileDefaults() {
    updateProfile((profile, db) => {
      Object.assign(profile, {
        ...DEFAULT_PROFILE,
        ...profile,
        name: profile.name || currentUser,
        phoneCountry: profile.phoneCountry || 'UA',
        username: profile.username || currentUser.toLowerCase(),
        gender: normalizeGender(profile.gender),
        email: profile.email || db.users.find((entry) => entry.login === currentUser)?.email || ''
      });
      applyGenderProfileDefaults(profile, db, true);
    });
    updateSettings((settings) => {
      settings.language = settings.language === 'en' ? 'en' : 'uk';
    });
  }

  function init() {
    ensureProfileDefaults();
    renderAll();
    bindFieldEditors();
    bindSettings();
    bindActions();
    bindNav();
  }

  init();
})();
