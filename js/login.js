const loginI18n = {
  uk: {
    title: 'Увійдіть в акаунт',
    subtitle: 'Використайте логін, email або підключений провайдер, щоб продовжити.',
    username: 'Логін або пошта',
    password: 'Пароль',
    button: 'Увійти',
    divider: 'або увійти через',
    bottom: 'Ще немає акаунта?',
    link: 'Зареєструватися!',
    need_both: 'Введіть логін або пошту та пароль',
    need_register: 'Спочатку створіть акаунт',
    invalid_identity: 'Перевірте логін або пошту: щонайменше 3 символи',
    invalid: 'Невірний логін, пошта або пароль',
    success: 'Вхід успішний. Відкриваємо застосунок...',
    use_social_login: 'Цей акаунт входить через {providers}. Скористайтеся соцкнопкою.'
  },
  en: {
    title: 'Sign into your account',
    subtitle: 'Use your username, email, or a connected provider to continue.',
    username: 'Username or Email',
    password: 'Password',
    button: 'Log In',
    divider: 'or sign in with',
    bottom: "Don't have an account?",
    link: 'Sign up!',
    need_both: 'Enter your username or email and password',
    need_register: 'Create an account first',
    invalid_identity: 'Check username or email: at least 3 characters',
    invalid: 'Invalid username, email, or password',
    success: 'Sign-in successful. Opening the app...',
    use_social_login: 'This account signs in via {providers}. Use the provider button.'
  }
};

const loginElements = {
  title: document.querySelector('.card h2'),
  subtitle: document.getElementById('authSubtitle'),
  identity: document.getElementById('login'),
  password: document.getElementById('password'),
  loginHint: document.getElementById('loginHint'),
  passwordHint: document.getElementById('passwordHint'),
  loginButton: document.getElementById('loginButton'),
  divider: document.querySelector('.divider'),
  bottom: document.querySelector('.bottom-text'),
  socialButtons: document.getElementById('socialButtons'),
  message: document.getElementById('message')
};

function getLoginLang() {
  return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
}

function loginText() {
  return loginI18n[getLoginLang()];
}

function fillTemplate(text, params = {}) {
  let result = text;
  Object.keys(params).forEach((key) => {
    result = result.replace(`{${key}}`, String(params[key]));
  });
  return result;
}

function showLoginMessage(text, type = 'error') {
  window.AuthUX?.setMessage?.(loginElements.message, text, type);
}

function goToApp() {
  window.location.href = 'index.html';
}

function applyLoginTranslations() {
  const t = loginText();
  if (loginElements.title) loginElements.title.textContent = t.title;
  if (loginElements.subtitle) loginElements.subtitle.textContent = t.subtitle;
  if (loginElements.identity) loginElements.identity.placeholder = t.username;
  if (loginElements.password) loginElements.password.placeholder = t.password;
  window.AuthUX?.setHint?.(loginElements.loginHint, window.AuthUX?.t?.('login_hint') || '');
  window.AuthUX?.setHint?.(loginElements.passwordHint, window.AuthUX?.t?.('password_requirements') || '');
  if (loginElements.loginButton) loginElements.loginButton.textContent = t.button;
  if (loginElements.divider) loginElements.divider.textContent = t.divider;
  if (loginElements.bottom) {
    loginElements.bottom.innerHTML = `${t.bottom} <a href="regist.html">${t.link}</a>`;
  }
}

function getSocialPrefill() {
  const identity = String(loginElements.identity?.value || '').trim();
  return {
    displayName: identity.includes('@') ? '' : identity,
    email: identity.includes('@') ? identity : ''
  };
}

function handleSocialLogin(result) {
  showLoginMessage(result.message, 'success');
  setTimeout(goToApp, 450);
}

function login() {
  const identity = String(loginElements.identity?.value || '').trim();
  const password = String(loginElements.password?.value || '');
  const t = loginText();

  showLoginMessage('', 'info');

  if (!identity || !password) {
    showLoginMessage(t.need_both, 'error');
    return;
  }

  const identityValidation = window.AuthUX?.validateLoginValue?.(identity);
  if (!identityValidation?.ok) {
    showLoginMessage(t.invalid_identity, 'error');
    return;
  }

  const lockState = window.AuthUX?.getLoginAttemptState?.(identity);
  if (lockState?.isLocked) {
    showLoginMessage(window.AuthUX?.t?.('login_locked', { seconds: lockState.seconds }) || '', 'warning');
    return;
  }

  const users = window.AppDB?.getUsers?.() || [];
  if (users.length === 0) {
    showLoginMessage(t.need_register, 'warning');
    return;
  }

  const result = window.AppDB?.authenticateUser?.(identity, password);

  if (result?.ok) {
    window.AuthUX?.clearLoginAttempts?.(identity);
    showLoginMessage(t.success, 'success');
    setTimeout(goToApp, 450);
    return;
  }

  if (result?.code === 'USE_SOCIAL_LOGIN') {
    const providers = window.AuthUX?.formatProviderList?.(result.providers || []) || '';
    showLoginMessage(fillTemplate(t.use_social_login, { providers }), 'warning');
    return;
  }

  const attempt = window.AuthUX?.registerFailedLoginAttempt?.(identity);
  if (attempt?.isLocked) {
    showLoginMessage(window.AuthUX?.t?.('login_locked', { seconds: attempt.seconds }) || '', 'warning');
    return;
  }

  if (typeof attempt?.remaining === 'number' && attempt.remaining < 5) {
    showLoginMessage(window.AuthUX?.t?.('login_attempts_left', { count: attempt.remaining }) || t.invalid, 'error');
    return;
  }

  showLoginMessage(t.invalid, 'error');
}

if (window.AppDB?.getCurrentUser?.()) {
  goToApp();
}

applyLoginTranslations();

loginElements.loginButton?.addEventListener('click', login);
loginElements.identity?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') login();
});
loginElements.password?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') login();
});

window.AuthUX?.bindSocialButtons?.(loginElements.socialButtons, {
  mode: 'signin',
  getPrefill: getSocialPrefill,
  onSuccess: handleSocialLogin
});

window.login = login;
