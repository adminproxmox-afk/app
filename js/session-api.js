(function () {
  const API_BASE = '/api';
  const nativeAppDB = window.AppDB || null;
  const originalUpdate = nativeAppDB?.update?.bind(nativeAppDB) || null;
  const originalClearCurrentUser = nativeAppDB?.clearCurrentUser?.bind(nativeAppDB) || null;
  const originalNormalizePublicTag = nativeAppDB?.normalizePublicTag?.bind(nativeAppDB) || null;
  const state = {
    session: null
  };

  let syncTimer = null;

  function normalizeText(value) {
    return String(value || '').trim();
  }

  function cloneJson(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return value && typeof value === 'object' ? { ...value } : value;
    }
  }

  function parseJson(responseText) {
    if (!responseText) return {};
    try {
      return JSON.parse(responseText);
    } catch (error) {
      const parseError = new Error('Invalid JSON response');
      parseError.status = 0;
      parseError.data = { raw: responseText };
      throw parseError;
    }
  }

  function csrfToken() {
    const match = document.cookie.match(/(?:^|; )lca_csrf=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function requestSync(path, { method = 'GET', json = undefined } = {}) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_BASE}${path}`, false);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    const token = csrfToken();
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    let body = null;

    if (json !== undefined) {
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      body = JSON.stringify(json);
    }

    try {
      xhr.send(body);
    } catch (error) {
      const requestError = new Error('Network request failed');
      requestError.status = 0;
      requestError.data = null;
      throw requestError;
    }

    const data = parseJson(xhr.responseText || '');
    if (xhr.status >= 200 && xhr.status < 300 && data.ok !== false) {
      return data;
    }

    const requestError = new Error(data.error || 'Request failed');
    requestError.status = xhr.status;
    requestError.data = data;
    throw requestError;
  }

  function requestAsync(path, { method = 'POST', json = undefined } = {}) {
    const payload = json === undefined ? null : JSON.stringify(json);
    if (window.fetch) {
      fetch(`${API_BASE}${path}`, {
        method,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(payload === null ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
          ...(csrfToken() ? { 'X-CSRF-Token': csrfToken() } : {})
        },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }

  function clearAuthLocalState() {
    const authKeys = ['user', 'userName', 'userAvatar', 'currentAvatar'];
    authKeys.forEach((key) => {
      try {
        LCAMemoryStorage.removeItem(key);
      } catch (error) {
        void error;
      }
    });
  }

  function syncAuthLocalState(bundle) {
    const user = bundle?.user || null;
    const profile = user?.profile || {};
    const settings = user?.settings || {};
    const character = user?.character || {};
    const avatar = normalizeText(profile.avatarEmoji || profile.avatarUrl || character.avatarEmoji || '👨‍🎓') || '👨‍🎓';

    if (!user) {
      clearAuthLocalState();
      return;
    }

    try {
      LCAMemoryStorage.setItem('user', normalizeText(user.username));
      LCAMemoryStorage.setItem('userName', normalizeText(profile.displayName || user.username));
      LCAMemoryStorage.setItem('userAvatar', avatar);
      LCAMemoryStorage.setItem('currentAvatar', avatar);
      if (settings.language) {
        LCAMemoryStorage.setItem('language', settings.language === 'en' ? 'en' : 'uk');
      }
      if (typeof settings.theme !== 'undefined') {
        LCAMemoryStorage.setItem('darkMode', String(settings.theme !== 'light'));
      }
      if (typeof settings.notificationsEnabled !== 'undefined') {
        LCAMemoryStorage.setItem('notifications', String(Boolean(settings.notificationsEnabled)));
      }
      if (typeof settings.musicEnabled !== 'undefined') {
        LCAMemoryStorage.setItem('musicEnabled', String(Boolean(settings.musicEnabled)));
      }
      if (typeof settings.soundEnabled !== 'undefined') {
        LCAMemoryStorage.setItem('soundEnabled', String(Boolean(settings.soundEnabled)));
      }
      if (typeof settings.volume !== 'undefined') {
        LCAMemoryStorage.setItem('volume', String(Number(settings.volume) || 0));
      }
      if (typeof character.coins !== 'undefined') {
        LCAMemoryStorage.setItem('userCoins', String(Number(character.coins) || 0));
      }
    } catch (error) {
      void error;
    }
  }

  function buildLocalUserRecord(bundle) {
    const user = bundle?.user || {};
    const profile = user.profile || {};
    const settings = user.settings || {};
    const character = user.character || {};
    const avatar = normalizeText(profile.avatarEmoji || profile.avatarUrl || character.avatarEmoji || '👨‍🎓') || '👨‍🎓';
    const displayName = normalizeText(profile.displayName || user.username) || user.username || 'User';
    const publicTag = normalizeText(profile.publicTag || user.username);

    return {
      login: normalizeText(user.username),
      email: normalizeText(user.email),
      password: '',
      authProvider: 'local',
      authProviders: ['local'],
      authIdentities: {},
      lastLoginAt: user.lastLoginAt || new Date().toISOString(),
      lastAuthMethod: 'local',
      updatedAt: new Date().toISOString(),
      profile: {
        name: displayName,
        username: publicTag,
        email: normalizeText(user.email),
        phone: normalizeText(profile.phone),
        bio: normalizeText(profile.bio),
        gender: normalizeText(profile.gender) || 'unknown',
        avatar,
        currentAvatar: avatar,
        avatarImage: normalizeText(profile.avatarUrl),
        coins: Number(character.coins || 0) || 0
      },
      settings: {
        darkMode: settings.theme !== 'light',
        notifications: Boolean(settings.notificationsEnabled),
        musicEnabled: Boolean(settings.musicEnabled),
        soundEnabled: Boolean(settings.soundEnabled),
        volume: Number(settings.volume || 70) || 70,
        language: settings.language === 'en' ? 'en' : 'uk'
      },
      character: {
        level: Number(character.level || 1) || 1,
        xp: Number(character.xp || 0) || 0,
        coins: Number(character.coins || 0) || 0,
        avatarEmoji: normalizeText(character.avatarEmoji || avatar) || avatar,
        activeCategory: normalizeText(character.activeCategory || 'skin') || 'skin',
        selected: character.selected && typeof character.selected === 'object' && !Array.isArray(character.selected) ? cloneJson(character.selected) : {},
        owned: Array.isArray(user.shop?.inventory) ? user.shop.inventory.map((item) => item.id).filter(Boolean) : [],
        equipped: {
          skin: character.equipped?.skin ?? null,
          hair: character.equipped?.hair ?? null,
          accessory: character.equipped?.accessory ?? null,
          shirt: character.equipped?.shirt ?? null,
          pants: character.equipped?.pants ?? null,
          shoes: character.equipped?.shoes ?? null,
          extra: character.equipped?.extra ?? null
        }
      },
      shop: user.shop && typeof user.shop === 'object' ? cloneJson(user.shop) : null
    };
  }

  function importBundleToNativeDb(bundle) {
    if (!nativeAppDB || !originalUpdate || !bundle?.user) {
      return;
    }

    const localUser = buildLocalUserRecord(bundle);
    const extraState = bundle?.state || bundle?.settings?.uiState || null;

    try {
      originalUpdate((db) => {
        db.users = Array.isArray(db.users) ? db.users.filter((entry) => entry.login !== localUser.login) : [];
        db.users.push(localUser);
        db.session = db.session || {};
        db.session.user = localUser.login;
        db.profile = {
          ...(db.profile || {}),
          ...localUser.profile
        };
        db.settings = {
          ...(db.settings || {}),
          ...localUser.settings
        };
        db.character = {
          ...(db.character || {}),
          ...localUser.character
        };
        if (localUser.shop) {
          db.shop = {
            ...(db.shop || {}),
            ...localUser.shop
          };
        }

        if (extraState && typeof extraState === 'object' && !Array.isArray(extraState)) {
          Object.entries(extraState).forEach(([key, value]) => {
            if (key === 'character' && value && typeof value === 'object' && !Array.isArray(value)) {
              const characterExtras = cloneJson(value);
              delete characterExtras.level;
              delete characterExtras.xp;
              delete characterExtras.coins;
              delete characterExtras.avatarEmoji;
              db.character = { ...(db.character || {}), ...characterExtras };
              return;
            }
            if (key === 'profile' || key === 'settings' || key === 'users' || key === 'session') {
              return;
            }
            db[key] = cloneJson(value);
          });
        }
      });
    } catch (error) {
      void error;
    }
  }

  function serializeState(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
      return {};
    }

    const stateSnapshot = cloneJson(snapshot) || {};
    delete stateSnapshot.users;
    delete stateSnapshot.session;
    return stateSnapshot;
  }

  function syncStateToServer(snapshot) {
    const payload = { state: serializeState(snapshot) };
    requestAsync('/sync-state.php', { method: 'POST', json: payload });
  }

  function changePassword(currentPassword, newPassword) {
    try {
      const data = requestSync('/change-password.php', {
        method: 'POST',
        json: { currentPassword, newPassword }
      });
      return { ok: true, user: data.user };
    } catch (error) {
      return mapAuthError(error, 'PASSWORD_CHANGE_FAILED');
    }
  }

  function purchase(itemId) {
    try {
      const data = requestSync('/purchase.php', {
        method: 'POST',
        json: { itemId }
      });
      state.session = data;
      syncAuthLocalState(data);
      importBundleToNativeDb(data);
      return { ok: true, user: data.user };
    } catch (error) {
      return mapAuthError(error, 'PURCHASE_FAILED');
    }
  }

  function claimDaily() {
    try {
      const data = requestSync('/daily-bonus.php', { method: 'POST', json: {} });
      state.session = data;
      syncAuthLocalState(data);
      importBundleToNativeDb(data);
      return { ok: true, user: data.user };
    } catch (error) {
      return mapAuthError(error, 'REWARD_FAILED');
    }
  }

  function completeLesson(lessonId, score = 0) {
    try {
      const data = requestSync('/complete-lesson.php', {
        method: 'POST',
        json: { lessonId, score }
      });
      state.session = data;
      syncAuthLocalState(data);
      importBundleToNativeDb(data);
      return { ok: true, user: data.user };
    } catch (error) {
      return mapAuthError(error, 'LESSON_FAILED');
    }
  }

  function mapAuthError(error, fallbackCode) {
    const code = normalizeText(error?.data?.code);
    const message = normalizeText(error?.data?.error || error?.message);

    if (code) {
      return { ok: false, code, error: message };
    }

    if (/invalid credentials/i.test(message)) {
      return { ok: false, code: 'INVALID_CREDENTIALS', error: message };
    }

    if (/already taken/i.test(message) && /username/i.test(message)) {
      return { ok: false, code: 'LOGIN_EXISTS', error: message };
    }

    if (/already taken/i.test(message) && /email/i.test(message)) {
      return { ok: false, code: 'EMAIL_EXISTS', error: message };
    }

    if (/public tag/i.test(message) && /taken/i.test(message)) {
      return { ok: false, code: 'TAG_EXISTS', error: message };
    }

    if (/invalid public tag/i.test(message)) {
      return { ok: false, code: 'TAG_INVALID', error: message };
    }

    return { ok: false, code: fallbackCode, error: message || fallbackCode };
  }

  function bootstrapSession() {
    try {
      state.session = requestSync('/me.php');
      syncAuthLocalState(state.session);
      importBundleToNativeDb(state.session);
    } catch (error) {
      state.session = null;
      clearAuthLocalState();
      try {
        originalClearCurrentUser?.();
      } catch (resetError) {
        void resetError;
      }
    }
  }

  function getCurrentLogin() {
    return normalizeText(state.session?.user?.username) || null;
  }

  function normalizePublicTagValue(value) {
    if (typeof originalNormalizePublicTag === 'function') {
      return originalNormalizePublicTag(value);
    }

    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^@+/, '')
      .replace(/[\s.-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function patchNativeAppDb() {
    if (!nativeAppDB) {
      return;
    }

    nativeAppDB.getCurrentUser = function getCurrentUser() {
      return getCurrentLogin();
    };

    nativeAppDB.clearCurrentUser = function clearCurrentUser() {
      try {
        requestSync('/logout.php', { method: 'POST' });
      } catch (error) {
        void error;
      }

      state.session = null;
      clearAuthLocalState();
      try {
        originalClearCurrentUser?.();
      } catch (error) {
        void error;
      }
      return { ok: true };
    };

    nativeAppDB.authenticateUser = function authenticateUser(login, password) {
      try {
        const data = requestSync('/login.php', {
          method: 'POST',
          json: {
            login,
            password
          }
        });
        state.session = data;
        syncAuthLocalState(data);
        importBundleToNativeDb(data);
        return { ok: true, user: data.user, session: data.session };
      } catch (error) {
        return mapAuthError(error, 'INVALID_CREDENTIALS');
      }
    };

    nativeAppDB.registerUser = function registerUser(input = {}) {
      const login = normalizeText(input.login || input.username);
      const email = normalizeText(input.email).toLowerCase();
      const password = String(input.password || '');
      const displayName = normalizeText(input.displayName || input.name || login) || login;
      const publicTag = normalizeText(input.tag || input.publicTag || login);
      const gender = normalizeText(input.gender || 'unknown');
      const avatarEmoji = normalizeText(input.avatarEmoji || (gender === 'female' ? '👩‍🎓' : '👨‍🎓')) || '👨‍🎓';

      try {
        const data = requestSync('/register.php', {
          method: 'POST',
          json: {
            username: login,
            email,
            password,
            displayName,
            publicTag,
            gender,
            avatarEmoji
          }
        });
        state.session = data;
        syncAuthLocalState(data);
        importBundleToNativeDb(data);
        return { ok: true, user: data.user, autoLoggedIn: true };
      } catch (error) {
        return mapAuthError(error, 'REGISTRATION_FAILED');
      }
    };

    nativeAppDB.checkPublicTagAvailability = function checkPublicTagAvailability(tag) {
      const normalizedTag = normalizePublicTagValue(tag);
      try {
        const data = requestSync(`/check-public-tag.php?tag=${encodeURIComponent(normalizedTag || tag || '')}`);
        return { ok: true, normalizedTag: data.normalizedTag || normalizedTag };
      } catch (error) {
        const code = normalizeText(error?.data?.code);
        const message = normalizeText(error?.data?.error || error?.message);
        if (code === 'TAG_EXISTS') {
          return { ok: false, code: 'TAG_EXISTS', normalizedTag, error: message };
        }
        if (code === 'TAG_INVALID' || /invalid public tag/i.test(message)) {
          return { ok: false, code: 'TAG_INVALID', normalizedTag, error: message };
        }
        if (!/^[a-z0-9_]{3,24}$/.test(normalizedTag)) {
          return { ok: false, code: 'TAG_INVALID', normalizedTag };
        }
        return { ok: true, normalizedTag };
      }
    };

    nativeAppDB.normalizePublicTag = function normalizePublicTag(value) {
      return normalizePublicTagValue(value);
    };

    if (originalUpdate) {
      nativeAppDB.update = function update(mutator) {
        const result = originalUpdate(mutator);
        try {
          syncStateToServer(result);
        } catch (error) {
          void error;
        }
        return result;
      };
    }
  }

  bootstrapSession();
  patchNativeAppDb();

  window.LCAApi = {
    refreshSession: bootstrapSession,
    getCurrentLogin,
    changePassword,
    purchase,
    claimDaily,
    completeLesson,
    isAuthenticated() {
      return Boolean(getCurrentLogin());
    },
    logout() {
      return nativeAppDB?.clearCurrentUser?.() || { ok: true };
    }
  };
})();
