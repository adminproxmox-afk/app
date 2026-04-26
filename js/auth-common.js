(function () {
  const RATE_LIMIT_KEY = 'authLoginRateLimitV2';
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOGIN_LOCK_MS = 30000;
  const PROVIDERS = {
    google: {
      label: { uk: 'Google', en: 'Google' }
    },
    telegram: {
      label: { uk: 'Telegram', en: 'Telegram' }
    },
    discord: {
      label: { uk: 'Discord', en: 'Discord' }
    },
    facebook: {
      label: { uk: 'Facebook', en: 'Facebook' }
    }
  };

  const I18N = {
    uk: {
      login_hint: 'Введіть логін або email',
      register_login_hint: '3-20 символів: літери, цифри, _ . -',
      register_tag_hint: '3-24 символи: латиниця, цифри та _',
      password_requirements: 'Мінімум 8 символів, велика літера та цифра',
      password_strength_weak: 'Слабкий пароль',
      password_strength_medium: 'Нормальний пароль',
      password_strength_strong: 'Сильний пароль',
      social_title_signin: 'Увійти через {provider}',
      social_title_signup: 'Продовжити через {provider}',
      social_description: 'Вкажіть ім’я та пошту. Якщо акаунт уже існує, ми увійдемо в нього. Якщо ні, створимо новий.',
      social_name_placeholder: "Ім'я в профілі",
      social_email_placeholder: 'Пошта провайдера',
      social_tag_placeholder: 'Тег профілю',
      social_name_required: "Введіть ім'я для продовження",
      social_email_required: 'Введіть коректну пошту',
      social_tag_required: 'Введіть тег профілю',
      tag_invalid: 'Тег має містити 3-24 символи: латиниця, цифри та _',
      tag_exists: 'Такий тег уже зайнятий',
      tag_too_similar: 'Цей тег надто схожий на вже існуючий @{tag}',
      social_cancel: 'Скасувати',
      social_continue_signin: 'Увійти',
      social_continue_signup: 'Створити акаунт',
      social_account_created: 'Акаунт створено через {provider}. Вхід виконано.',
      social_account_linked: 'Провайдер {provider} прив’язано, вхід виконано.',
      social_signin_success: 'Вхід через {provider} виконано.',
      social_error: 'Не вдалося виконати вхід через провайдера',
      login_locked: 'Забагато невдалих спроб. Спробуйте через {seconds} с.',
      login_attempts_left: 'Невірні дані. Залишилось спроб: {count}.'
    },
    en: {
      login_hint: 'Use username or email',
      register_login_hint: '3-20 chars: letters, numbers, _ . -',
      register_tag_hint: '3-24 chars: letters, numbers and _',
      password_requirements: 'At least 8 characters, one uppercase letter and one number',
      password_strength_weak: 'Weak password',
      password_strength_medium: 'Good password',
      password_strength_strong: 'Strong password',
      social_title_signin: 'Sign in with {provider}',
      social_title_signup: 'Continue with {provider}',
      social_description: 'Enter your name and email. If the account exists, we will sign you in. Otherwise we will create a new one.',
      social_name_placeholder: 'Profile name',
      social_email_placeholder: 'Provider email',
      social_tag_placeholder: 'Profile tag',
      social_name_required: 'Enter a name to continue',
      social_email_required: 'Enter a valid email address',
      social_tag_required: 'Enter a profile tag',
      tag_invalid: 'Tag must be 3-24 chars: letters, numbers and _',
      tag_exists: 'This tag is already taken',
      tag_too_similar: 'This tag is too similar to existing @{tag}',
      social_cancel: 'Cancel',
      social_continue_signin: 'Sign In',
      social_continue_signup: 'Create Account',
      social_account_created: 'Account created via {provider}. Signed in successfully.',
      social_account_linked: '{provider} has been linked and signed in.',
      social_signin_success: 'Signed in with {provider}.',
      social_error: 'Could not sign in with this provider',
      login_locked: 'Too many failed attempts. Try again in {seconds}s.',
      login_attempts_left: 'Invalid credentials. Attempts left: {count}.'
    }
  };

  function unique(array) {
    return Array.from(new Set((array || []).filter(Boolean)));
  }

  function getLang() {
    return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
  }

  function t(key, params = {}) {
    const dictionary = I18N[getLang()] || I18N.uk;
    let text = dictionary[key] || key;
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, String(params[param]));
    });
    return text;
  }

  function normalizeProvider(provider) {
    const normalizedProvider = String(provider || '').trim().toLowerCase();
    return PROVIDERS[normalizedProvider] ? normalizedProvider : 'google';
  }

  function getProviderLabel(provider) {
    const normalizedProvider = normalizeProvider(provider);
    return PROVIDERS[normalizedProvider].label[getLang()];
  }

  function formatProviderList(providers) {
    return unique((providers || []).map((provider) => getProviderLabel(provider))).join(', ');
  }

  function validateLoginValue(value) {
    const trimmedValue = String(value || '').trim();
    if (!trimmedValue) return { ok: false, code: 'EMPTY' };
    const isEmail = trimmedValue.includes('@');
    if (isEmail) {
      return validateEmailValue(trimmedValue)
        ? { ok: true, code: 'EMAIL' }
        : { ok: false, code: 'EMAIL' };
    }
    if (trimmedValue.length < 3 || trimmedValue.length > 20) return { ok: false, code: 'LENGTH' };
    if (!isEmail && !/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9_.-]+$/.test(trimmedValue)) {
      return { ok: false, code: 'FORMAT' };
    }
    return { ok: true };
  }

  function validateEmailValue(value) {
    const trimmedValue = String(value || '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
  }

  function normalizePublicTagValue(value) {
    if (typeof window.AppDB?.normalizePublicTag === 'function') {
      return window.AppDB.normalizePublicTag(value);
    }

    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^@+/, '')
      .replace(/[\s.-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function validatePublicTagValue(value) {
    return /^[a-z0-9_]{3,24}$/.test(normalizePublicTagValue(value));
  }

  function getPublicTagState(value, excludeLogin = '') {
    const normalizedTag = normalizePublicTagValue(value);
    if (!validatePublicTagValue(normalizedTag)) {
      return { ok: false, code: 'TAG_INVALID', normalizedTag };
    }

    if (typeof window.AppDB?.checkPublicTagAvailability === 'function') {
      return window.AppDB.checkPublicTagAvailability(normalizedTag, excludeLogin);
    }

    return { ok: true, normalizedTag };
  }

  function assessPassword(value) {
    const password = String(value || '');
    const checks = {
      hasLength: password.length >= 8,
      hasUpper: /[A-ZА-ЯІЇЄҐ]/.test(password),
      hasLower: /[a-zа-яіїєґ]/.test(password),
      hasDigit: /\d/.test(password),
      hasSymbol: /[^A-Za-zА-Яа-яІЇЄҐіїєґ0-9]/.test(password)
    };
    const score = Object.values(checks).filter(Boolean).length;
    let level = 'weak';

    if (checks.hasLength && score >= 4) level = 'strong';
    else if (checks.hasLength && score >= 3) level = 'medium';

    return {
      valid: checks.hasLength && checks.hasUpper && checks.hasDigit,
      level,
      checks
    };
  }

  function getPasswordStrengthText(level) {
    return t(`password_strength_${level}`);
  }

  function setMessage(element, text, type = 'info') {
    if (!element) return;
    element.textContent = text || '';
    element.classList.remove('is-error', 'is-success', 'is-info', 'is-warning');
    if (text) {
      element.classList.add(`is-${type}`);
    }
  }

  function setHint(element, text, state = '') {
    if (!element) return;
    element.textContent = text || '';
    element.classList.remove('is-error', 'is-weak', 'is-medium', 'is-strong', 'is-success');
    if (state) {
      element.classList.add(`is-${state}`);
    }
  }

  function getAttemptStore() {
    try {
      return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveAttemptStore(store) {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
  }

  function getIdentityKey(identity) {
    return String(identity || '').trim().toLowerCase() || 'anonymous';
  }

  function getLoginAttemptState(identity) {
    const store = getAttemptStore();
    const entry = store[getIdentityKey(identity)] || { count: 0, lockedUntil: 0 };
    const remainingMs = Math.max(0, Number(entry.lockedUntil || 0) - Date.now());
    return {
      isLocked: remainingMs > 0,
      seconds: Math.ceil(remainingMs / 1000),
      count: Number(entry.count || 0)
    };
  }

  function registerFailedLoginAttempt(identity) {
    const key = getIdentityKey(identity);
    const store = getAttemptStore();
    const current = store[key] || { count: 0, lockedUntil: 0 };
    const remainingMs = Math.max(0, Number(current.lockedUntil || 0) - Date.now());
    if (remainingMs > 0) {
      return {
        isLocked: true,
        seconds: Math.ceil(remainingMs / 1000),
        remaining: 0
      };
    }

    const count = Number(current.count || 0) + 1;
    const shouldLock = count >= MAX_LOGIN_ATTEMPTS;
    store[key] = shouldLock
      ? { count: 0, lockedUntil: Date.now() + LOGIN_LOCK_MS }
      : { count, lockedUntil: 0 };
    saveAttemptStore(store);

    return {
      isLocked: shouldLock,
      seconds: shouldLock ? Math.ceil(LOGIN_LOCK_MS / 1000) : 0,
      remaining: shouldLock ? 0 : Math.max(0, MAX_LOGIN_ATTEMPTS - count)
    };
  }

  function clearLoginAttempts(identity) {
    const key = getIdentityKey(identity);
    const store = getAttemptStore();
    delete store[key];
    saveAttemptStore(store);
  }

  let modalState = null;

  function ensureSocialModal() {
    let modal = document.getElementById('socialAuthModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'socialAuthModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="auth-modal__backdrop" data-social-close="true"></div>
      <div class="auth-modal__card" role="dialog" aria-modal="true" aria-labelledby="socialAuthTitle">
        <button class="auth-modal__close" id="socialAuthClose" type="button" aria-label="Close">×</button>
        <div class="auth-modal__provider" id="socialAuthProvider"></div>
        <h3 class="auth-modal__title" id="socialAuthTitle"></h3>
        <p class="auth-modal__description" id="socialAuthDescription"></p>
        <input class="auth-modal__input" id="socialAuthName" type="text" maxlength="40">
        <input class="auth-modal__input" id="socialAuthEmail" type="email" maxlength="80">
        <input class="auth-modal__input" id="socialAuthTag" type="text" maxlength="24" hidden>
        <div class="auth-message auth-message--modal" id="socialAuthMessage"></div>
        <div class="auth-modal__actions">
          <button class="auth-modal__button auth-modal__button--ghost" id="socialAuthCancel" type="button"></button>
          <button class="auth-modal__button auth-modal__button--primary" id="socialAuthSubmit" type="button"></button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => closeSocialModal();
    modal.querySelectorAll('[data-social-close="true"]').forEach((element) => {
      element.addEventListener('click', close);
    });
    modal.querySelector('#socialAuthClose').addEventListener('click', close);
    modal.querySelector('#socialAuthCancel').addEventListener('click', close);
    modal.querySelector('#socialAuthSubmit').addEventListener('click', submitSocialModal);
    modal.querySelector('#socialAuthName').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitSocialModal();
      }
    });
    modal.querySelector('#socialAuthEmail').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitSocialModal();
      }
    });
    modal.querySelector('#socialAuthTag').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitSocialModal();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeSocialModal();
      }
    });

    return modal;
  }

  function closeSocialModal() {
    const modal = ensureSocialModal();
    modal.classList.remove('is-open');
    document.body.classList.remove('auth-modal-open');
    modalState = null;
    setMessage(document.getElementById('socialAuthMessage'), '', 'info');
  }

  function getSocialSuccessMessage(result) {
    const providerLabel = getProviderLabel(result.provider);
    if (result.isNew) return t('social_account_created', { provider: providerLabel });
    if (result.linked) return t('social_account_linked', { provider: providerLabel });
    return t('social_signin_success', { provider: providerLabel });
  }

  function submitSocialModal() {
    if (!modalState) return;
    const currentState = modalState;

    const nameInput = document.getElementById('socialAuthName');
    const emailInput = document.getElementById('socialAuthEmail');
    const tagInput = document.getElementById('socialAuthTag');
    const modalMessage = document.getElementById('socialAuthMessage');
    const displayName = String(nameInput?.value || '').trim();
    const email = String(emailInput?.value || '').trim().toLowerCase();
    const rawTag = String(tagInput?.value || '').trim();
    const shouldValidateTag = currentState.mode === 'signup' || rawTag;

    if (displayName.length < 2) {
      setMessage(modalMessage, t('social_name_required'), 'error');
      return;
    }

    if (!validateEmailValue(email)) {
      setMessage(modalMessage, t('social_email_required'), 'error');
      return;
    }

    let normalizedTag = '';
    if (shouldValidateTag) {
      if (!rawTag) {
        setMessage(modalMessage, t('social_tag_required'), 'error');
        return;
      }

      const tagState = getPublicTagState(rawTag);
      if (!tagState.ok) {
        const messageKey = tagState.code === 'TAG_EXISTS'
          ? 'tag_exists'
          : tagState.code === 'TAG_TOO_SIMILAR'
            ? 'tag_too_similar'
            : 'tag_invalid';
        setMessage(modalMessage, t(messageKey, { tag: tagState.similarTag }), 'error');
        return;
      }

      normalizedTag = tagState.normalizedTag;
    }

    const result = window.AppDB?.registerOrLoginWithProvider?.(currentState.provider, {
      displayName,
      email,
      username: normalizedTag,
      gender: currentState.gender || ''
    });

    if (!result?.ok) {
      const messageKey = result.code === 'TAG_EXISTS'
        ? 'tag_exists'
        : result.code === 'TAG_TOO_SIMILAR'
          ? 'tag_too_similar'
          : result.code === 'TAG_INVALID'
            ? 'tag_invalid'
            : 'social_error';
      setMessage(modalMessage, t(messageKey, { tag: result.similarTag }), 'error');
      return;
    }

    closeSocialModal();
    if (typeof currentState.onSuccess === 'function') {
      currentState.onSuccess({
        ...result,
        message: getSocialSuccessMessage(result)
      });
    }
  }

  function openSocialModal(options = {}) {
    const modal = ensureSocialModal();
    const provider = normalizeProvider(options.provider);
    const providerLabel = getProviderLabel(provider);
    const prefill = typeof options.getPrefill === 'function' ? options.getPrefill() : (options.prefill || {});
    modalState = {
      provider,
      mode: options.mode === 'signup' ? 'signup' : 'signin',
      gender: prefill.gender || '',
      onSuccess: options.onSuccess
    };

    document.getElementById('socialAuthProvider').textContent = providerLabel;
    document.getElementById('socialAuthTitle').textContent = t(
      modalState.mode === 'signup' ? 'social_title_signup' : 'social_title_signin',
      { provider: providerLabel }
    );
    document.getElementById('socialAuthDescription').textContent = t('social_description');
    document.getElementById('socialAuthName').placeholder = t('social_name_placeholder');
    document.getElementById('socialAuthEmail').placeholder = t('social_email_placeholder');
    document.getElementById('socialAuthTag').placeholder = t('social_tag_placeholder');
    document.getElementById('socialAuthCancel').textContent = t('social_cancel');
    document.getElementById('socialAuthSubmit').textContent = t(
      modalState.mode === 'signup' ? 'social_continue_signup' : 'social_continue_signin'
    );
    document.getElementById('socialAuthTag').hidden = modalState.mode !== 'signup';
    document.getElementById('socialAuthName').value = String(prefill.displayName || '').trim();
    document.getElementById('socialAuthEmail').value = String(prefill.email || '').trim();
    document.getElementById('socialAuthTag').value = String(
      prefill.tag || normalizePublicTagValue(prefill.displayName || prefill.email || '')
    ).trim();
    setMessage(document.getElementById('socialAuthMessage'), '', 'info');

    modal.classList.add('is-open');
    document.body.classList.add('auth-modal-open');

    setTimeout(() => {
      const target = document.getElementById(
        document.getElementById('socialAuthName').value
          ? (modalState.mode === 'signup' && !document.getElementById('socialAuthTag').value ? 'socialAuthTag' : 'socialAuthEmail')
          : 'socialAuthName'
      );
      target?.focus();
    }, 20);
  }

  function bindSocialButtons(container, options = {}) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!root) return;

    root.querySelectorAll('[data-provider]').forEach((button) => {
      const provider = normalizeProvider(button.dataset.provider);
      const labelNode = button.querySelector('.social-btn__label');
      const label = getProviderLabel(provider);
      if (labelNode) labelNode.textContent = label;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', () => {
        openSocialModal({
          provider,
          mode: options.mode,
          getPrefill: options.getPrefill,
          onSuccess: options.onSuccess
        });
      });
    });
  }

  window.AuthUX = {
    t,
    getProviderLabel,
    formatProviderList,
    validateLoginValue,
    validateEmailValue,
    validatePublicTagValue,
    normalizePublicTagValue,
    getPublicTagState,
    assessPassword,
    getPasswordStrengthText,
    setMessage,
    setHint,
    getLoginAttemptState,
    registerFailedLoginAttempt,
    clearLoginAttempts,
    bindSocialButtons
  };
})();
