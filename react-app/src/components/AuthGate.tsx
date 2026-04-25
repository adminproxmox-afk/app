import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Gender } from '../types';
import type { AuthMode, AuthProvider, BrowserAuthResult, BrowserAuthUser } from '../auth';

type AuthGateProps = {
  mode: AuthMode;
  users: BrowserAuthUser[];
  onModeChange: (mode: AuthMode) => void;
  onLogin: (identity: string, password: string) => BrowserAuthResult;
  onRegister: (input: { login: string; email: string; password: string; gender: Gender }) => BrowserAuthResult;
  onQuickLogin: (login: string) => void;
};

type MessageTone = 'error' | 'warning' | 'success' | 'info';

function providerLabel(provider: AuthProvider) {
  if (provider === 'google') return 'Google';
  if (provider === 'telegram') return 'Telegram';
  if (provider === 'discord') return 'Discord';
  if (provider === 'facebook') return 'Facebook';
  return 'Local';
}

function resultMessage(result: BrowserAuthResult) {
  if (result.ok) return { tone: 'success' as MessageTone, text: '' };
  if (result.code === 'MISSING_FIELDS') return { tone: 'error' as MessageTone, text: 'Заповни всі потрібні поля.' };
  if (result.code === 'INVALID_LOGIN') return { tone: 'error' as MessageTone, text: 'Логін має містити 3-20 символів: літери, цифри, `_`, `.`, `-`.' };
  if (result.code === 'INVALID_EMAIL') return { tone: 'error' as MessageTone, text: 'Введи коректну електронну адресу.' };
  if (result.code === 'WEAK_PASSWORD') return { tone: 'error' as MessageTone, text: 'Пароль має бути не коротшим за 8 символів і містити велику літеру та цифру.' };
  if (result.code === 'LOGIN_EXISTS') return { tone: 'error' as MessageTone, text: 'Такий логін уже існує у цьому браузері.' };
  if (result.code === 'EMAIL_EXISTS') return { tone: 'error' as MessageTone, text: 'Така пошта вже прив’язана до іншого акаунта.' };
  if (result.code === 'USE_BROWSER_ACCOUNT') {
    const providers = (result.providers || []).map((provider) => providerLabel(provider)).join(', ');
    return {
      tone: 'warning' as MessageTone,
      text: providers
        ? `Цей акаунт імпортовано без локального пароля. Увійди через швидкий список нижче: ${providers}.`
        : 'Цей акаунт імпортовано без локального пароля. Увійди через швидкий список нижче.'
    };
  }
  return { tone: 'error' as MessageTone, text: 'Невірний логін, пошта або пароль.' };
}

export default function AuthGate({
  mode,
  users,
  onModeChange,
  onLogin,
  onRegister,
  onQuickLogin
}: AuthGateProps) {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<MessageTone>('info');

  const quickAccounts = useMemo(
    () => users.slice().sort((left, right) => (right.lastLoginAt || '').localeCompare(left.lastLoginAt || '')),
    [users]
  );

  function updateValue(setter: (value: string) => void) {
    return (event: { target: { value: string } }) => setter(event.target.value);
  }

  function submitLogin() {
    const result = onLogin(identity, password);
    const feedback = resultMessage(result);
    setMessage(feedback.text);
    setMessageTone(feedback.tone);
  }

  function submitRegister() {
    if (registerPassword !== confirmPassword) {
      setMessage('Паролі не співпадають.');
      setMessageTone('error');
      return;
    }

    const result = onRegister({
      login,
      email,
      password: registerPassword,
      gender
    });
    const feedback = resultMessage(result);
    setMessage(feedback.text);
    setMessageTone(result.ok ? 'success' : feedback.tone);
  }

  function switchMode(nextMode: AuthMode) {
    setMessage('');
    setMessageTone('info');
    onModeChange(nextMode);
  }

  return (
    <div className="auth-foundation">
      <div className="auth-foundation__ambient auth-foundation__ambient--blue" aria-hidden="true" />
      <div className="auth-foundation__ambient auth-foundation__ambient--mint" aria-hidden="true" />

      <motion.main
        className="auth-panel shell-card"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
      >
        <section className="auth-panel__copy">
          <span className="section-kicker">Skill Play Access</span>
          <h1>React-основа вже головна. Залишився тільки вхід.</h1>
          <p>
            Тут тепер живе фінальний старт сайту для GitHub Pages: локальний акаунт,
            відновлення старих браузерних профілів і швидкий перехід у сам застосунок.
          </p>

          <div className="auth-panel__chips">
            <span>React</span>
            <span>Zustand</span>
            <span>Framer Motion</span>
            <span>Three + Phaser</span>
          </div>
        </section>

        <section className="auth-card-foundation">
          <div className="segmented segmented--wide auth-segmented" role="tablist" aria-label="Auth mode">
            <button className={mode === 'signin' ? 'is-active' : ''} type="button" onClick={() => switchMode('signin')}>
              Увійти
            </button>
            <button className={mode === 'signup' ? 'is-active' : ''} type="button" onClick={() => switchMode('signup')}>
              Реєстрація
            </button>
          </div>

          {mode === 'signin' ? (
            <div className="auth-form-grid">
              <label className="field">
                <span>Логін або пошта</span>
                <input value={identity} onChange={updateValue(setIdentity)} />
              </label>
              <label className="field">
                <span>Пароль</span>
                <input type="password" value={password} onChange={updateValue(setPassword)} />
              </label>
              <button className="primary-button auth-submit" type="button" onClick={submitLogin}>
                Увійти в застосунок
              </button>
            </div>
          ) : (
            <div className="auth-form-grid">
              <label className="field">
                <span>Логін</span>
                <input value={login} onChange={updateValue(setLogin)} />
              </label>
              <label className="field">
                <span>Пошта</span>
                <input type="email" value={email} onChange={updateValue(setEmail)} />
              </label>
              <div className="segmented segmented--wide auth-gender-switch" role="radiogroup" aria-label="Стать">
                <button className={gender === 'male' ? 'is-active' : ''} type="button" onClick={() => setGender('male')}>
                  Чоловік
                </button>
                <button className={gender === 'female' ? 'is-active' : ''} type="button" onClick={() => setGender('female')}>
                  Жінка
                </button>
              </div>
              <label className="field">
                <span>Пароль</span>
                <input type="password" value={registerPassword} onChange={updateValue(setRegisterPassword)} />
              </label>
              <label className="field">
                <span>Підтвердження</span>
                <input type="password" value={confirmPassword} onChange={updateValue(setConfirmPassword)} />
              </label>
              <button className="primary-button auth-submit" type="button" onClick={submitRegister}>
                Створити локальний акаунт
              </button>
            </div>
          )}

          {message && (
            <article className={`auth-message-card auth-message-card--${messageTone}`}>
              <p>{message}</p>
            </article>
          )}

          {quickAccounts.length > 0 && (
            <div className="auth-browser-accounts">
              <div className="section-head auth-browser-accounts__head">
                <div>
                  <span className="section-kicker">Browser Accounts</span>
                  <h2>Швидке продовження</h2>
                </div>
              </div>

              <div className="auth-browser-list">
                {quickAccounts.map((user) => (
                  <button className="auth-browser-row" key={user.login} type="button" onClick={() => onQuickLogin(user.login)}>
                    <div>
                      <strong>{user.login}</strong>
                      <p>{user.email || 'Локальний браузерний акаунт'}</p>
                    </div>
                    <small>{user.providers.map((provider) => providerLabel(provider)).join(' / ')}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </motion.main>
    </div>
  );
}
