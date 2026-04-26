(function () {
  const CONFIG_PATH = 'js/auth-provider-config.js';
  const TELEGRAM_REDIRECT_PROVIDER_KEY = 'auth_provider';
  const TELEGRAM_REDIRECT_PROVIDER_VALUE = 'telegram';
  const TELEGRAM_AUTH_PARAM_KEYS = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash'];
  const PROVIDER_PREFILL_KEY = 'auth_provider_prefill_v1';
  const scriptCache = {};
  let modalState = null;
  let profileCompletionState = null;
  let googleClientId = '';

  const copy = {
    uk: {
      googleTitleIn: 'Увійти через Google',
      googleTitleUp: 'Зареєструватися через Google',
      googleDesc: 'Нижче з’явиться офіційна кнопка Google. Після підтвердження ми відкриємо або створимо акаунт.',
      googleReady: 'Оберіть акаунт Google, щоб продовжити.',
      googleNoEmail: 'Google не повернув email. Вхід не завершено.',
      googleNote: 'Для справжнього Google Sign-In потрібен client ID типу Web application і запуск сторінки через localhost або HTTPS.',
      googleSecureOnly: 'Поточна сторінка відкрита з {origin}. Google Sign-In працює лише на HTTPS або http://localhost.',
      googleSetup: 'Якщо Google показує Access blocked або invalid_request, перевірте в Google Cloud Console точний Authorized JavaScript origin: {origin}. Для production також заповніть Branding, homepage URL, privacy policy URL і authorized domains.',
      telegramTitleIn: 'Увійти через Telegram',
      telegramTitleUp: 'Зареєструватися через Telegram',
      telegramDesc: 'Нижче з’явиться офіційний Telegram Login Widget. Після авторизації ми відкриємо ваш акаунт.',
      telegramReady: 'Підтвердіть вхід у Telegram, щоб продовжити.',
      telegramNote: 'Для Telegram потрібен bot username, домен через @BotFather і серверна перевірка hash для production.',
      loading: 'Завантажуємо офіційний віджет {provider}...',
      notConfigured: 'Справжній вхід через {provider} ще не налаштований. Заповніть {path}.',
      unavailable: 'Не вдалося відкрити вхід через {provider}.',
      wrongEnv: 'OAuth-кнопки нормально працюють лише на localhost або HTTPS.',
      created: 'Акаунт створено через {provider}. Вхід виконано.',
      linked: 'Провайдер {provider} прив’язано. Вхід виконано.',
      signed: 'Вхід через {provider} виконано.',
      cancel: 'Скасувати',
      noIdentity: 'Провайдер не повернув достатньо даних для входу.',
      completeProfileTitle: 'Завершіть профіль',
      completeProfileDesc: '{provider} не завжди повертає стать, тег або повну пошту. Підтвердіть дані один раз, і ми збережемо їх у профілі.',
      completeProfileNote: 'Ці дані потрібні для коректного профілю, аватара та відображення акаунта в застосунку.',
      completeProfileSave: 'Зберегти профіль',
      completeProfileSkip: 'Пізніше',
      completeProfileGenderLabel: 'Оберіть стать',
      completeProfileGenderUnknown: 'Стать',
      completeProfileGenderMale: 'Чоловік',
      completeProfileGenderFemale: 'Жінка',
      completeProfileEmailExists: 'Користувач з такою поштою вже існує',
      completeProfileNameRequired: "Введіть ім'я для профілю",
      completeProfileGenderRequired: 'Оберіть стать, щоб завершити профіль'
    },
    en: {
      googleTitleIn: 'Sign in with Google',
      googleTitleUp: 'Sign up with Google',
      googleDesc: 'The official Google button will appear below. After approval we will open or create your account.',
      googleReady: 'Choose a Google account to continue.',
      googleNoEmail: 'Google did not return an email.',
      googleNote: 'Real Google Sign-In requires a Web application client ID and localhost or HTTPS.',
      googleSecureOnly: 'This page is currently opened from {origin}. Google Sign-In works only on HTTPS or http://localhost.',
      googleSetup: 'If Google shows Access blocked or invalid_request, check Google Cloud Console and add this exact Authorized JavaScript origin: {origin}. For production, also complete Branding, homepage URL, privacy policy URL, and authorized domains.',
      telegramTitleIn: 'Sign in with Telegram',
      telegramTitleUp: 'Sign up with Telegram',
      telegramDesc: 'The official Telegram Login Widget will appear below. After authorization we will open your account.',
      telegramReady: 'Confirm the Telegram sign-in to continue.',
      telegramNote: 'Telegram requires a bot username, linked domain via @BotFather, and server-side hash verification in production.',
      loading: 'Loading the official {provider} widget...',
      notConfigured: 'Real {provider} sign-in is not configured yet. Fill in {path}.',
      unavailable: 'Could not open {provider} sign-in.',
      wrongEnv: 'OAuth works properly only on localhost or HTTPS.',
      created: 'Account created via {provider}. Signed in.',
      linked: '{provider} linked. Signed in.',
      signed: 'Signed in with {provider}.',
      cancel: 'Cancel',
      noIdentity: 'The provider did not return enough identity data.',
      completeProfileTitle: 'Complete your profile',
      completeProfileDesc: '{provider} does not always return gender, tag, or a full email. Confirm your details once and we will save them to your profile.',
      completeProfileNote: 'These details help keep your avatar, account card, and profile data consistent across the app.',
      completeProfileSave: 'Save profile',
      completeProfileSkip: 'Later',
      completeProfileGenderLabel: 'Choose gender',
      completeProfileGenderUnknown: 'Gender',
      completeProfileGenderMale: 'Male',
      completeProfileGenderFemale: 'Female',
      completeProfileEmailExists: 'An account with this email already exists',
      completeProfileNameRequired: 'Enter a profile name',
      completeProfileGenderRequired: 'Choose a gender to finish your profile'
    }
  };

  function lang() {
    return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
  }

  function text(key, params = {}) {
    let value = copy[lang()][key] || key;
    Object.keys(params).forEach((param) => {
      value = value.replace(`{${param}}`, String(params[param]));
    });
    return value;
  }

  function label(provider) {
    return window.AuthUX?.getProviderLabel?.(provider) || provider;
  }

  function cfg(provider) {
    const all = window.AUTH_PROVIDER_CONFIG && typeof window.AUTH_PROVIDER_CONFIG === 'object'
      ? window.AUTH_PROVIDER_CONFIG
      : {};
    return all[provider] || {};
  }

  function configured(provider) {
    const current = cfg(provider);
    if (provider === 'google') return Boolean(current.enabled && current.clientId);
    if (provider === 'telegram') return Boolean(current.enabled && current.botUsername);
    return false;
  }

  function secureContextLike() {
    const protocol = String(window.location.protocol || '').toLowerCase();
    const host = String(window.location.hostname || '').toLowerCase();
    return protocol === 'https:' || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
  }

  function currentOriginLabel() {
    const protocol = String(window.location.protocol || '').toLowerCase();
    if (protocol === 'file:') return 'file://';
    const origin = String(window.location.origin || '').trim();
    if (origin && origin !== 'null') return origin;
    const host = String(window.location.host || '').trim();
    return host ? `${protocol}//${host}` : protocol || 'unknown-origin';
  }

  function ensureScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(src));
      document.head.appendChild(script);
    });
    return scriptCache[src];
  }

  function parseJwt(token) {
    try {
      const payload = String(token || '').split('.')[1] || '';
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')));
    } catch (error) {
      return null;
    }
  }

  function normalizeGenderValue(value) {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (normalizedValue === 'female' || normalizedValue === 'жінка') return 'female';
    if (normalizedValue === 'male' || normalizedValue === 'чоловік') return 'male';
    return 'unknown';
  }

  function validateEmailValue(value) {
    if (typeof window.AuthUX?.validateEmailValue === 'function') {
      return window.AuthUX.validateEmailValue(value);
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());
  }

  function isSyntheticProviderEmail(value) {
    return /@(google|telegram|discord|facebook)\.local$/i.test(String(value || '').trim());
  }

  function getPrefillSnapshot(opts = {}) {
    try {
      const rawValue = typeof opts.getPrefill === 'function'
        ? opts.getPrefill()
        : (opts.prefill || {});
      return rawValue && typeof rawValue === 'object' ? { ...rawValue } : {};
    } catch (error) {
      return {};
    }
  }

  function savePendingProviderContext(provider, opts = {}) {
    try {
      sessionStorage.setItem(PROVIDER_PREFILL_KEY, JSON.stringify({
        provider,
        mode: opts.mode === 'signup' ? 'signup' : 'signin',
        prefill: getPrefillSnapshot(opts),
        savedAt: Date.now()
      }));
    } catch (error) {
      // Ignore storage failures; auth can still continue.
    }
  }

  function readPendingProviderContext(provider = '') {
    try {
      const rawValue = sessionStorage.getItem(PROVIDER_PREFILL_KEY);
      if (!rawValue) return null;

      const parsedValue = JSON.parse(rawValue);
      if (!parsedValue || typeof parsedValue !== 'object') return null;
      if (provider && parsedValue.provider !== provider) return null;
      return parsedValue;
    } catch (error) {
      return null;
    }
  }

  function clearPendingProviderContext() {
    try {
      sessionStorage.removeItem(PROVIDER_PREFILL_KEY);
    } catch (error) {
      // Ignore storage failures; auth can still continue.
    }
  }

  function finalizeProviderSuccess(result, opts) {
    opts?.onSuccess?.(result);
  }

  function getProfileCompletionError(code, similarTag = '') {
    if (code === 'NAME_INVALID') return text('completeProfileNameRequired');
    if (code === 'EMAIL_INVALID') return window.AuthUX?.t?.('social_email_required') || text('completeProfileEmailExists');
    if (code === 'EMAIL_EXISTS') return text('completeProfileEmailExists');
    if (code === 'TAG_EXISTS') return window.AuthUX?.t?.('tag_exists') || code;
    if (code === 'TAG_TOO_SIMILAR') {
      return window.AuthUX?.t?.('tag_too_similar', { tag: similarTag }) || code;
    }
    if (code === 'TAG_INVALID') return window.AuthUX?.t?.('tag_invalid') || code;
    if (code === 'GENDER_REQUIRED') return text('completeProfileGenderRequired');
    return text('unavailable', { provider: label(profileCompletionState?.provider || 'google') });
  }

  function getCompletionDraft(result, prefill = {}) {
    const user = result?.user || {};
    const profile = user.profile || {};
    const rawRequestedTag = String(prefill.tag || prefill.username || '').trim();
    const normalizedTag = window.AuthUX?.normalizePublicTagValue?.(
      rawRequestedTag || profile.username || user.login || ''
    ) || '';
    const rawEmail = isSyntheticProviderEmail(profile.email || user.email)
      ? String(prefill.email || '').trim().toLowerCase()
      : String(profile.email || user.email || prefill.email || '').trim().toLowerCase();
    const name = String(profile.name || prefill.displayName || user.login || '').trim();
    const gender = normalizeGenderValue(profile.gender || prefill.gender);
    const hasRequestedTag = Boolean(window.AuthUX?.validatePublicTagValue?.(rawRequestedTag || ''));

    const flags = {
      name: name.length < 2,
      username: !window.AuthUX?.validatePublicTagValue?.(normalizedTag) || (Boolean(result?.isNew) && !hasRequestedTag),
      email: !validateEmailValue(rawEmail),
      gender: gender === 'unknown'
    };

    return {
      name,
      username: normalizedTag,
      email: rawEmail,
      gender,
      flags,
      needsCompletion: Object.values(flags).some(Boolean)
    };
  }

  function ensureProfileCompletionModal() {
    let modal = document.getElementById('providerProfileModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'providerProfileModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="auth-modal__backdrop" data-close-profile-completion="true"></div>
      <div class="auth-modal__card" role="dialog" aria-modal="true" aria-labelledby="providerProfileTitle">
        <button class="auth-modal__close" id="providerProfileClose" type="button" aria-label="Close">×</button>
        <div class="auth-modal__provider" id="providerProfileBadge"></div>
        <h3 class="auth-modal__title" id="providerProfileTitle"></h3>
        <p class="auth-modal__description" id="providerProfileDescription"></p>
        <input class="auth-modal__input" id="providerProfileName" type="text" maxlength="40">
        <input class="auth-modal__input" id="providerProfileTag" type="text" maxlength="24">
        <input class="auth-modal__input" id="providerProfileEmail" type="email" maxlength="80">
        <select class="auth-modal__input" id="providerProfileGender">
          <option value="unknown"></option>
          <option value="male"></option>
          <option value="female"></option>
        </select>
        <p class="provider-auth__note" id="providerProfileNote"></p>
        <div class="auth-message auth-message--modal" id="providerProfileMessage"></div>
        <div class="auth-modal__actions">
          <button class="auth-modal__button auth-modal__button--ghost" id="providerProfileSkip" type="button"></button>
          <button class="auth-modal__button auth-modal__button--primary" id="providerProfileSave" type="button"></button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const attemptClose = () => {
      if (!profileCompletionState?.allowSkip) return;
      const fallbackResult = profileCompletionState.result;
      const fallbackOptions = profileCompletionState.opts;
      closeProfileCompletionModal();
      finalizeProviderSuccess(fallbackResult, fallbackOptions);
    };

    modal.querySelectorAll('[data-close-profile-completion="true"]').forEach((node) => {
      node.addEventListener('click', attemptClose);
    });
    modal.querySelector('#providerProfileClose').addEventListener('click', attemptClose);
    modal.querySelector('#providerProfileSkip').addEventListener('click', attemptClose);
    modal.querySelector('#providerProfileSave').addEventListener('click', submitProfileCompletion);
    modal.querySelector('#providerProfileName').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submitProfileCompletion();
    });
    modal.querySelector('#providerProfileTag').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submitProfileCompletion();
    });
    modal.querySelector('#providerProfileEmail').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submitProfileCompletion();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open') && profileCompletionState?.allowSkip) {
        attemptClose();
      }
    });

    return modal;
  }

  function closeProfileCompletionModal() {
    const modal = ensureProfileCompletionModal();
    modal.classList.remove('is-open');
    document.body.classList.remove('auth-modal-open');
    window.AuthUX?.setMessage?.(document.getElementById('providerProfileMessage'), '', 'info');
    profileCompletionState = null;
  }

  function openProfileCompletionModal(provider, result, opts, draft) {
    const modal = ensureProfileCompletionModal();
    profileCompletionState = {
      provider,
      result,
      opts,
      allowSkip: false
    };

    document.getElementById('providerProfileBadge').textContent = label(provider);
    document.getElementById('providerProfileTitle').textContent = text('completeProfileTitle');
    document.getElementById('providerProfileDescription').textContent = text('completeProfileDesc', {
      provider: label(provider)
    });
    document.getElementById('providerProfileName').placeholder = window.AuthUX?.t?.('social_name_placeholder') || 'Name';
    document.getElementById('providerProfileTag').placeholder = window.AuthUX?.t?.('social_tag_placeholder') || 'Tag';
    document.getElementById('providerProfileEmail').placeholder = window.AuthUX?.t?.('social_email_placeholder') || 'Email';
    document.getElementById('providerProfileName').value = draft.name || '';
    document.getElementById('providerProfileTag').value = draft.username || '';
    document.getElementById('providerProfileEmail').value = draft.email || '';

    const genderSelect = document.getElementById('providerProfileGender');
    genderSelect.options[0].textContent = text('completeProfileGenderUnknown');
    genderSelect.options[1].textContent = text('completeProfileGenderMale');
    genderSelect.options[2].textContent = text('completeProfileGenderFemale');
    genderSelect.setAttribute('aria-label', text('completeProfileGenderLabel'));
    genderSelect.value = draft.gender || 'unknown';

    document.getElementById('providerProfileNote').textContent = text('completeProfileNote');
    document.getElementById('providerProfileSave').textContent = text('completeProfileSave');
    document.getElementById('providerProfileSkip').textContent = text('completeProfileSkip');
    document.getElementById('providerProfileSkip').hidden = true;
    document.getElementById('providerProfileClose').hidden = true;
    window.AuthUX?.setMessage?.(document.getElementById('providerProfileMessage'), '', 'info');

    modal.classList.add('is-open');
    document.body.classList.add('auth-modal-open');

    const focusTarget = draft.flags.name
      ? document.getElementById('providerProfileName')
      : draft.flags.username
        ? document.getElementById('providerProfileTag')
        : draft.flags.email
          ? document.getElementById('providerProfileEmail')
          : draft.flags.gender
            ? document.getElementById('providerProfileGender')
            : document.getElementById('providerProfileTag');

    setTimeout(() => focusTarget?.focus(), 20);
  }

  function submitProfileCompletion() {
    if (!profileCompletionState) return;

    const name = String(document.getElementById('providerProfileName')?.value || '').trim();
    const username = String(document.getElementById('providerProfileTag')?.value || '').trim();
    const email = String(document.getElementById('providerProfileEmail')?.value || '').trim().toLowerCase();
    const gender = normalizeGenderValue(document.getElementById('providerProfileGender')?.value || '');
    const responseMessage = document.getElementById('providerProfileMessage');
    const currentLogin = window.AppDB?.getCurrentUser?.() || '';

    if (name.length < 2) {
      window.AuthUX?.setMessage?.(responseMessage, text('completeProfileNameRequired'), 'error');
      return;
    }

    const tagState = window.AuthUX?.getPublicTagState?.(username, currentLogin);
    if (!tagState?.ok) {
      window.AuthUX?.setMessage?.(
        responseMessage,
        getProfileCompletionError(tagState.code, tagState.similarTag),
        'error'
      );
      return;
    }

    if (!validateEmailValue(email)) {
      window.AuthUX?.setMessage?.(
        responseMessage,
        window.AuthUX?.t?.('social_email_required') || text('completeProfileEmailExists'),
        'error'
      );
      return;
    }

    if (gender === 'unknown') {
      window.AuthUX?.setMessage?.(responseMessage, text('completeProfileGenderRequired'), 'error');
      return;
    }

    const saveResult = window.AppDB?.completeCurrentUserProfile?.({
      displayName: name,
      username: tagState.normalizedTag,
      email,
      gender
    });

    if (!saveResult?.ok) {
      window.AuthUX?.setMessage?.(
        responseMessage,
        getProfileCompletionError(saveResult.code, saveResult.similarTag),
        'error'
      );
      return;
    }

    const nextResult = {
      ...profileCompletionState.result,
      user: saveResult.user
    };
    const nextOpts = profileCompletionState.opts;
    closeProfileCompletionModal();
    finalizeProviderSuccess(nextResult, nextOpts);
  }

  function ensureModal() {
    let modal = document.getElementById('providerAuthModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'providerAuthModal';
    modal.className = 'auth-modal';
    modal.innerHTML = '<div class="auth-modal__backdrop" data-close-provider="true"></div><div class="auth-modal__card" role="dialog" aria-modal="true" aria-labelledby="providerTitle"><button class="auth-modal__close" id="providerClose" type="button" aria-label="Close">×</button><div class="auth-modal__provider" id="providerBadge"></div><h3 class="auth-modal__title" id="providerTitle"></h3><p class="auth-modal__description" id="providerDesc"></p><div class="provider-auth__body" id="providerBody"></div><p class="provider-auth__note" id="providerNote"></p><div class="auth-message auth-message--modal" id="providerMsg"></div><div class="auth-modal__actions"><button class="auth-modal__button auth-modal__button--ghost" id="providerCancel" type="button"></button></div></div>';
    document.body.appendChild(modal);
    const close = () => closeModal();
    modal.querySelectorAll('[data-close-provider="true"]').forEach((node) => node.addEventListener('click', close));
    modal.querySelector('#providerClose').addEventListener('click', close);
    modal.querySelector('#providerCancel').addEventListener('click', close);
    return modal;
  }

  function openModal(provider, title, desc, note, body, opts) {
    modalState = { provider, opts };
    ensureModal();
    document.getElementById('providerBadge').textContent = label(provider);
    document.getElementById('providerTitle').textContent = title;
    document.getElementById('providerDesc').textContent = desc;
    document.getElementById('providerNote').textContent = note;
    document.getElementById('providerBody').innerHTML = body;
    document.getElementById('providerCancel').textContent = text('cancel');
    window.AuthUX?.setMessage?.(document.getElementById('providerMsg'), '', 'info');
    document.getElementById('providerAuthModal').classList.add('is-open');
    document.body.classList.add('auth-modal-open');
  }

  function closeModal() {
    const modal = document.getElementById('providerAuthModal');
    if (!modal) {
      modalState = null;
      return;
    }
    modal.classList.remove('is-open');
    document.body.classList.remove('auth-modal-open');
    document.getElementById('providerBody').innerHTML = '';
    window.AuthUX?.setMessage?.(document.getElementById('providerMsg'), '', 'info');
    modalState = null;
  }

  function pageMessage(message, type) {
    window.AuthUX?.setMessage?.(document.getElementById('message'), message, type);
  }

  function modalMessage(message, type) {
    window.AuthUX?.setMessage?.(document.getElementById('providerMsg'), message, type);
  }

  function showProviderFeedback(message, type) {
    const modal = document.getElementById('providerAuthModal');
    if (modal?.classList.contains('is-open')) {
      modalMessage(message, type);
      return;
    }
    pageMessage(message, type);
  }

  function buildTelegramRedirectUrl() {
    try {
      const url = new URL(window.location.href);
      TELEGRAM_AUTH_PARAM_KEYS.forEach((key) => url.searchParams.delete(key));
      url.searchParams.set(TELEGRAM_REDIRECT_PROVIDER_KEY, TELEGRAM_REDIRECT_PROVIDER_VALUE);
      return url.toString();
    } catch (error) {
      return '';
    }
  }

  function clearTelegramRedirectParams() {
    try {
      const url = new URL(window.location.href);
      TELEGRAM_AUTH_PARAM_KEYS.forEach((key) => url.searchParams.delete(key));
      url.searchParams.delete(TELEGRAM_REDIRECT_PROVIDER_KEY);
      window.history.replaceState({}, document.title, url.toString());
    } catch (error) {
      // Ignore URL cleanup failures; auth can still continue.
    }
  }

  function getTelegramRedirectProfile() {
    try {
      const url = new URL(window.location.href);
      const provider = String(url.searchParams.get(TELEGRAM_REDIRECT_PROVIDER_KEY) || '').trim().toLowerCase();
      const providerUserId = String(url.searchParams.get('id') || '').trim();
      const hash = String(url.searchParams.get('hash') || '').trim();
      if (provider !== TELEGRAM_REDIRECT_PROVIDER_VALUE || !providerUserId || !hash) {
        return null;
      }

      const firstName = String(url.searchParams.get('first_name') || '').trim();
      const lastName = String(url.searchParams.get('last_name') || '').trim();
      const username = String(url.searchParams.get('username') || '').trim();

      return {
        displayName: [firstName, lastName].filter(Boolean).join(' ') || username || 'Telegram User',
        providerUserId,
        avatarImage: String(url.searchParams.get('photo_url') || '').trim()
      };
    } catch (error) {
      return null;
    }
  }

  function handleTelegramRedirectResult(result) {
    pageMessage(result.message, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 450);
  }

  function finish(provider, profile, opts) {
    const unavailableMessage = text('unavailable', { provider: label(provider) });
    if (!profile?.displayName && !profile?.email && !profile?.providerUserId) {
      showProviderFeedback(text('noIdentity'), 'error');
      return;
    }
    const prefill = getPrefillSnapshot(opts);
    const result = window.AppDB?.registerOrLoginWithProvider?.(provider, {
      displayName: profile.displayName || prefill.displayName || '',
      email: profile.email || prefill.email || '',
      providerUserId: profile.providerUserId || '',
      username: prefill.tag || prefill.username || '',
      gender: prefill.gender || ''
    });
    if (!result?.ok) {
      showProviderFeedback(unavailableMessage, 'error');
      return;
    }
    if (profile.avatarImage) {
      window.AppDB?.update?.((db) => { db.profile.avatarImage = profile.avatarImage; });
    }
    closeModal();
    const message = result.isNew
      ? text('created', { provider: label(provider) })
      : result.linked
        ? text('linked', { provider: label(provider) })
        : text('signed', { provider: label(provider) });
    const finalResult = { ...result, message };
    const completionDraft = getCompletionDraft(finalResult, prefill);

    if (completionDraft.needsCompletion) {
      openProfileCompletionModal(provider, finalResult, opts, completionDraft);
      return;
    }

    finalizeProviderSuccess(finalResult, opts);
  }

  function openGoogle(opts = {}) {
    if (!configured('google')) return pageMessage(text('notConfigured', { provider: label('google'), path: CONFIG_PATH }), 'warning');
    const originLabel = currentOriginLabel();
    if (!secureContextLike()) {
      return pageMessage(text('googleSecureOnly', { origin: originLabel }), 'warning');
    }
    const note = `${text('googleNote')} ${text('googleSetup', { origin: originLabel })}`.trim();
    openModal('google', text(opts.mode === 'signup' ? 'googleTitleUp' : 'googleTitleIn'), text('googleDesc'), note, '<div class="provider-widget provider-widget--google" id="googleProviderButton"></div>', opts);
    modalMessage(text('loading', { provider: label('google') }), 'info');
    ensureScript(`https://accounts.google.com/gsi/client?hl=${lang()}`).then(() => {
      const config = cfg('google');
      if (googleClientId !== config.clientId) {
        window.google.accounts.id.initialize({
          client_id: config.clientId,
          callback: (response) => {
            const payload = parseJwt(response?.credential || '');
            if (!payload?.email) return modalMessage(text('googleNoEmail'), 'error');
            finish('google', { displayName: payload.name || payload.email, email: payload.email, providerUserId: payload.sub || '', avatarImage: payload.picture || '' }, modalState?.opts || opts);
          }
        });
        googleClientId = config.clientId;
      }
      const buttonRoot = document.getElementById('googleProviderButton');
      if (!buttonRoot) return;
      buttonRoot.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRoot, { theme: 'outline', size: 'large', width: 300 });
      modalMessage(text('googleReady'), 'info');
    }).catch(() => modalMessage(`${text('unavailable', { provider: label('google') })} ${text('googleSetup', { origin: originLabel })}`, 'error'));
  }

  function openTelegram(opts = {}) {
    if (!configured('telegram')) return pageMessage(text('notConfigured', { provider: label('telegram'), path: CONFIG_PATH }), 'warning');
    const note = `${text('telegramNote')} ${secureContextLike() ? '' : text('wrongEnv')}`.trim();
    openModal('telegram', text(opts.mode === 'signup' ? 'telegramTitleUp' : 'telegramTitleIn'), text('telegramDesc'), note, '<div class="provider-widget provider-widget--telegram" id="telegramProviderWidget"></div>', opts);
    modalMessage(text('loading', { provider: label('telegram') }), 'info');
    savePendingProviderContext('telegram', opts);
    const config = cfg('telegram');
    const widgetRoot = document.getElementById('telegramProviderWidget');
    if (!widgetRoot) return;
    const script = document.createElement('script');
    const redirectUrl = buildTelegramRedirectUrl();
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', config.botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '14');
    script.setAttribute('data-request-access', config.requestAccess || 'write');
    script.setAttribute('data-userpic', config.showUserPhoto ? 'true' : 'false');
    if (redirectUrl) {
      script.setAttribute('data-auth-url', redirectUrl);
    }
    script.onload = () => modalMessage(text('telegramReady'), 'info');
    script.onerror = () => modalMessage(text('unavailable', { provider: label('telegram') }), 'error');
    widgetRoot.innerHTML = '';
    widgetRoot.appendChild(script);
  }

  window.AuthUX = window.AuthUX || {};
  const telegramRedirectProfile = getTelegramRedirectProfile();
  if (telegramRedirectProfile) {
    const pendingContext = readPendingProviderContext('telegram');
    clearPendingProviderContext();
    clearTelegramRedirectParams();
    finish('telegram', telegramRedirectProfile, {
      mode: pendingContext?.mode,
      getPrefill: () => pendingContext?.prefill || {},
      onSuccess: handleTelegramRedirectResult
    });
  }
  window.AuthUX.bindSocialButtons = function (container, options = {}) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!root) return;
    root.querySelectorAll('[data-provider]').forEach((button) => {
      const provider = String(button.dataset.provider || '').trim().toLowerCase();
      const labelNode = button.querySelector('.social-btn__label');
      if (labelNode) labelNode.textContent = label(provider);
      button.classList.toggle('is-configured', configured(provider));
      button.onclick = () => {
        pageMessage('', 'info');
        if (provider === 'google') openGoogle(options);
        if (provider === 'telegram') openTelegram(options);
      };
    });
  };
})();
