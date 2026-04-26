const registerI18n = {
  uk: {
    title: 'Створити акаунт',
    subtitle: 'Створіть надійний акаунт або увійдіть одразу через зручний провайдер.',
    username: 'Логін',
    tag: 'Тег профілю',
    email: 'Пошта',
    gender: 'Стать',
    gender_male: 'Чоловік',
    gender_female: 'Жінка',
    gender_hint: 'Це одразу застосує аватар і персонажа.',
    password: 'Пароль',
    confirm: 'Підтвердіть пароль',
    tag_hint: '3-24 символи: латиниця, цифри та _',
    email_hint: 'Ця пошта буде використовуватись для входу та відновлення',
    confirm_hint: 'Повторіть пароль без змін',
    button: 'Зареєструватися',
    divider: 'або зареєструватися через',
    bottom: 'Вже є акаунт?',
    link: 'Увійти!',
    fill_all: 'Заповніть усі поля',
    invalid_login: 'Логін має містити 3-20 символів: літери, цифри, _ . -',
    invalid_tag: 'Тег має містити 3-24 символи: латиниця, цифри та _',
    invalid_email: 'Введіть правильну електронну адресу',
    weak_password: 'Пароль має бути не коротшим за 8 символів, містити велику літеру та цифру',
    password_mismatch: 'Паролі не співпадають',
    confirm_match: 'Паролі співпадають',
    login_exists: 'Користувач з таким логіном уже існує',
    tag_exists: 'Такий тег уже зайнятий',
    tag_too_similar: 'Цей тег надто схожий на вже існуючий @{tag}',
    tag_ready: 'Тег буде збережено як @{tag}',
    email_exists: 'Користувач з такою поштою вже існує',
    failed: 'Не вдалося створити акаунт',
    success: 'Акаунт створено. Відкриваємо застосунок...'
  },
  en: {
    title: 'Create an Account',
    subtitle: 'Create a stronger account or continue instantly with your preferred provider.',
    username: 'Username',
    tag: 'Profile Tag',
    email: 'Email',
    gender: 'Gender',
    gender_male: 'Male',
    gender_female: 'Female',
    gender_hint: 'This immediately applies your avatar and character.',
    password: 'Password',
    confirm: 'Confirm Password',
    tag_hint: '3-24 chars: letters, numbers and _',
    email_hint: 'We will use this email for sign-in and recovery',
    confirm_hint: 'Repeat the password exactly',
    button: 'Sign Up',
    divider: 'or sign up with',
    bottom: 'Have an account?',
    link: 'Log In!',
    fill_all: 'Fill in all fields',
    invalid_login: 'Username must be 3-20 chars: letters, numbers, _ . -',
    invalid_tag: 'Tag must be 3-24 chars: letters, numbers and _',
    invalid_email: 'Enter a valid email address',
    weak_password: 'Password must be at least 8 chars and include an uppercase letter and a number',
    password_mismatch: 'Passwords do not match',
    confirm_match: 'Passwords match',
    login_exists: 'A user with this username already exists',
    tag_exists: 'This tag is already taken',
    tag_too_similar: 'This tag is too similar to existing @{tag}',
    tag_ready: 'The tag will be saved as @{tag}',
    email_exists: 'A user with this email already exists',
    failed: 'Failed to create account',
    success: 'Account created. Opening the app...'
  }
};

const registerElements = {
  title: document.querySelector('.card h2'),
  subtitle: document.getElementById('authSubtitle'),
  login: document.getElementById('login'),
  tag: document.getElementById('tag'),
  email: document.getElementById('email'),
  genderLabel: document.getElementById('genderLabel'),
  genderHint: document.getElementById('genderHint'),
  genderLabels: document.querySelectorAll('[data-gender-label]'),
  password: document.getElementById('password'),
  confirm: document.getElementById('confirm'),
  loginHint: document.getElementById('loginHint'),
  tagHint: document.getElementById('tagHint'),
  emailHint: document.getElementById('emailHint'),
  passwordHint: document.getElementById('passwordHint'),
  confirmHint: document.getElementById('confirmHint'),
  registerButton: document.getElementById('registerButton'),
  divider: document.querySelector('.divider'),
  bottom: document.querySelector('.bottom-text'),
  socialButtons: document.getElementById('socialButtons'),
  message: document.getElementById('message')
};

function getRegisterLang() {
  return window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
}

function registerText() {
  return registerI18n[getRegisterLang()];
}

function showRegisterMessage(text, type = 'error') {
  window.AuthUX?.setMessage?.(registerElements.message, text, type);
}

function getSelectedGender() {
  const selected = document.querySelector('input[name="gender"]:checked')?.value;
  return selected === 'female' ? 'female' : 'male';
}

function goToApp() {
  window.location.href = 'index.html';
}

function getTagState() {
  return window.AuthUX?.getPublicTagState?.(registerElements.tag?.value || '') || { ok: false, code: 'TAG_INVALID', normalizedTag: '' };
}

function getTagMessage(tagState, t) {
  if (!tagState?.ok) {
    if (tagState?.code === 'TAG_EXISTS') return t.tag_exists;
    if (tagState?.code === 'TAG_TOO_SIMILAR') return t.tag_too_similar.replace('{tag}', tagState.similarTag || '');
    return t.invalid_tag;
  }

  return t.tag_ready.replace('{tag}', tagState.normalizedTag || '');
}

function updateTagHint() {
  const t = registerText();
  const rawTag = String(registerElements.tag?.value || '').trim();

  if (!rawTag) {
    window.AuthUX?.setHint?.(registerElements.tagHint, t.tag_hint);
    return;
  }

  const tagState = getTagState();
  window.AuthUX?.setHint?.(
    registerElements.tagHint,
    getTagMessage(tagState, t),
    tagState.ok ? 'success' : 'error'
  );
}

function updatePasswordHint() {
  const passwordState = window.AuthUX?.assessPassword?.(registerElements.password?.value || '');
  const fallbackHint = window.AuthUX?.t?.('password_requirements') || '';

  if (!registerElements.password?.value) {
    window.AuthUX?.setHint?.(registerElements.passwordHint, fallbackHint);
    return;
  }

  const strengthText = window.AuthUX?.getPasswordStrengthText?.(passwordState?.level || 'weak') || fallbackHint;
  window.AuthUX?.setHint?.(
    registerElements.passwordHint,
    `${strengthText}. ${fallbackHint}`,
    passwordState?.level || 'weak'
  );
}

function updateConfirmHint() {
  const t = registerText();
  if (!registerElements.confirm?.value) {
    window.AuthUX?.setHint?.(registerElements.confirmHint, t.confirm_hint);
    return;
  }

  if (registerElements.password?.value && registerElements.confirm.value === registerElements.password.value) {
    window.AuthUX?.setHint?.(registerElements.confirmHint, t.confirm_match, 'success');
    return;
  }

  window.AuthUX?.setHint?.(registerElements.confirmHint, t.password_mismatch, 'error');
}

function applyRegisterTranslations() {
  const t = registerText();
  if (registerElements.title) registerElements.title.textContent = t.title;
  if (registerElements.subtitle) registerElements.subtitle.textContent = t.subtitle;
  if (registerElements.login) registerElements.login.placeholder = t.username;
  if (registerElements.tag) registerElements.tag.placeholder = t.tag;
  if (registerElements.email) registerElements.email.placeholder = t.email;
  if (registerElements.genderLabel) registerElements.genderLabel.textContent = t.gender;
  if (registerElements.genderHint) window.AuthUX?.setHint?.(registerElements.genderHint, t.gender_hint);
  registerElements.genderLabels?.forEach((label) => {
    label.textContent = label.dataset.genderLabel === 'female' ? t.gender_female : t.gender_male;
  });
  if (registerElements.password) registerElements.password.placeholder = t.password;
  if (registerElements.confirm) registerElements.confirm.placeholder = t.confirm;
  window.AuthUX?.setHint?.(registerElements.loginHint, window.AuthUX?.t?.('register_login_hint') || '');
  window.AuthUX?.setHint?.(registerElements.tagHint, t.tag_hint);
  window.AuthUX?.setHint?.(registerElements.emailHint, t.email_hint);
  if (registerElements.registerButton) registerElements.registerButton.textContent = t.button;
  if (registerElements.divider) registerElements.divider.textContent = t.divider;
  if (registerElements.bottom) {
    registerElements.bottom.innerHTML = `${t.bottom} <a href="login.html">${t.link}</a>`;
  }
  updatePasswordHint();
  updateConfirmHint();
  updateTagHint();
}

function getSocialPrefill() {
  return {
    displayName: String(registerElements.login?.value || '').trim(),
    tag: String(registerElements.tag?.value || '').trim(),
    email: String(registerElements.email?.value || '').trim(),
    gender: getSelectedGender()
  };
}

function handleSocialRegister(result) {
  showRegisterMessage(result.message, 'success');
  setTimeout(goToApp, 450);
}

function register() {
  const login = String(registerElements.login?.value || '').trim();
  const tag = String(registerElements.tag?.value || '').trim();
  const email = String(registerElements.email?.value || '').trim().toLowerCase();
  const gender = getSelectedGender();
  const password = String(registerElements.password?.value || '');
  const confirm = String(registerElements.confirm?.value || '');
  const t = registerText();
  const loginValidation = window.AuthUX?.validateLoginValue?.(login);
  const tagState = getTagState();
  const passwordState = window.AuthUX?.assessPassword?.(password);

  showRegisterMessage('', 'info');

  if (!login || !tag || !email || !password || !confirm) {
    showRegisterMessage(t.fill_all, 'error');
    return;
  }

  if (!loginValidation?.ok || login.includes('@')) {
    showRegisterMessage(t.invalid_login, 'error');
    return;
  }

  if (!window.AuthUX?.validateEmailValue?.(email)) {
    showRegisterMessage(t.invalid_email, 'error');
    return;
  }

  if (!tagState?.ok) {
    showRegisterMessage(getTagMessage(tagState, t), 'error');
    return;
  }

  if (!passwordState?.valid) {
    showRegisterMessage(t.weak_password, 'error');
    return;
  }

  if (password !== confirm) {
    showRegisterMessage(t.password_mismatch, 'error');
    return;
  }

  const result = window.AppDB?.registerUser?.({
    login,
    username: tagState.normalizedTag,
    email,
    password,
    gender,
    autoLogin: true
  });

  if (result?.code === 'LOGIN_EXISTS') {
    showRegisterMessage(t.login_exists, 'error');
    return;
  }

  if (result?.code === 'TAG_EXISTS' || result?.code === 'TAG_TOO_SIMILAR' || result?.code === 'TAG_INVALID') {
    showRegisterMessage(getTagMessage(result, t), 'error');
    updateTagHint();
    return;
  }

  if (result?.code === 'EMAIL_EXISTS') {
    showRegisterMessage(t.email_exists, 'error');
    return;
  }

  if (!result?.ok) {
    showRegisterMessage(t.failed, 'error');
    return;
  }

  showRegisterMessage(t.success, 'success');
  setTimeout(goToApp, 450);
}

if (window.AppDB?.getCurrentUser?.()) {
  goToApp();
}

applyRegisterTranslations();

registerElements.registerButton?.addEventListener('click', register);
registerElements.password?.addEventListener('input', () => {
  updatePasswordHint();
  updateConfirmHint();
});
registerElements.tag?.addEventListener('input', updateTagHint);
registerElements.confirm?.addEventListener('input', updateConfirmHint);
registerElements.tag?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    register();
  }
});
registerElements.confirm?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    register();
  }
});
registerElements.password?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    register();
  }
});

window.AuthUX?.bindSocialButtons?.(registerElements.socialButtons, {
  mode: 'signup',
  getPrefill: getSocialPrefill,
  onSuccess: handleSocialRegister
});

window.register = register;
