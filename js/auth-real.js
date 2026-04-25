(function () {
  const CONFIG_PATH = 'js/auth-provider-config.js';
  const TELEGRAM_REDIRECT_PROVIDER_KEY = 'auth_provider';
  const TELEGRAM_REDIRECT_PROVIDER_VALUE = 'telegram';
  const TELEGRAM_AUTH_PARAM_KEYS = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash'];
  const scriptCache = {};
  let modalState = null;
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
      noIdentity: 'Провайдер не повернув достатньо даних для входу.'
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
      noIdentity: 'The provider did not return enough identity data.'
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
    const prefill = typeof opts?.getPrefill === 'function' ? opts.getPrefill() : {};
    const result = window.AppDB?.registerOrLoginWithProvider?.(provider, {
      displayName: profile.displayName || '',
      email: profile.email || '',
      providerUserId: profile.providerUserId || '',
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
    const message = result.isNew ? text('created', { provider: label(provider) }) : result.linked ? text('linked', { provider: label(provider) }) : text('signed', { provider: label(provider) });
    opts?.onSuccess?.({ ...result, message });
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
    clearTelegramRedirectParams();
    finish('telegram', telegramRedirectProfile, { onSuccess: handleTelegramRedirectResult });
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
