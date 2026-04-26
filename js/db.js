(function () {
  const STORAGE_KEY = 'miniAppDb';
  const LEGACY_CHARACTER_KEY = 'characterPageStateV2';
  const DEFAULT_AVATAR = '👨‍🎓';
  const FEMALE_AVATAR = '👩‍🎓';
  const DEFAULT_COINS = 125;
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
  const DEFAULT_PROGRESS = {
    xp: 0,
    gamesPlayed: 0,
    categoryScores: {
      it: 0,
      economy: 0,
      softskills: 0,
      agro: 0
    },
    favoriteCategory: 'it',
    recentGames: []
  };
  const SOCIAL_PROVIDERS = ['google', 'telegram', 'discord', 'facebook'];
  const DEFAULT_DB = {
    meta: { version: 2, name: 'mini-app-db' },
    session: { user: null },
    users: [],
    profile: {
      name: 'Авантюрист',
      username: 'adventurer',
      phone: '',
      email: '',
      bio: 'Web Developer',
      gender: 'unknown',
      statusText: 'Online',
      avatarImage: '',
      avatar: DEFAULT_AVATAR,
      currentAvatar: DEFAULT_AVATAR,
      coins: DEFAULT_COINS
    },
    settings: {
      darkMode: true,
      notifications: true,
      musicEnabled: true,
      soundEnabled: true,
      volume: 70,
      language: 'uk'
    },
    progress: DEFAULT_PROGRESS,
    character: {
      activeCategory: DEFAULT_CHARACTER.activeCategory,
      selected: { ...DEFAULT_CHARACTER.selected },
      owned: [...DEFAULT_CHARACTER.owned]
    },
    shop: {
      inventory: [],
      avatars: [DEFAULT_AVATAR, FEMALE_AVATAR],
      achievements: [],
      lastDaily: 0,
      dailyClaimCount: 0,
      totalSpent: 0,
      purchaseHistory: []
    }
  };

  let cache = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function unique(array) {
    return Array.from(new Set((array || []).filter(Boolean)));
  }

  function normalizePublicTag(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^@+/, '')
      .replace(/[\s.-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function validatePublicTagValue(value) {
    const normalizedValue = normalizePublicTag(value);
    return /^[a-z0-9_]{3,24}$/.test(normalizedValue);
  }

  function getTagCore(value) {
    return normalizePublicTag(value).replace(/_/g, '');
  }

  function getUserPublicTag(user) {
    return normalizePublicTag(user?.profile?.username || user?.login || '');
  }

  function levenshteinDistance(source, target) {
    const a = String(source || '');
    const b = String(target || '');
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const previous = new Array(b.length + 1).fill(0).map((_, index) => index);

    for (let i = 1; i <= a.length; i += 1) {
      let diagonal = previous[0];
      previous[0] = i;

      for (let j = 1; j <= b.length; j += 1) {
        const cached = previous[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        previous[j] = Math.min(
          previous[j] + 1,
          previous[j - 1] + 1,
          diagonal + cost
        );
        diagonal = cached;
      }
    }

    return previous[b.length];
  }

  function getSimilarPublicTagMatch(db, candidateTag, excludeLogin = '') {
    const normalizedCandidate = normalizePublicTag(candidateTag);
    const candidateCore = getTagCore(normalizedCandidate);
    const excludedLogin = String(excludeLogin || '').trim().toLowerCase();

    if (!normalizedCandidate || !candidateCore) return null;

    return db.users.find((user) => {
      if (!user) return false;
      if (String(user.login || '').trim().toLowerCase() === excludedLogin) return false;

      const existingTag = getUserPublicTag(user);
      const existingCore = getTagCore(existingTag);
      if (!existingTag || !existingCore) return false;

      if (existingTag === normalizedCandidate) return true;
      if (existingCore === candidateCore) return true;

      if (candidateCore.length >= 5 && existingCore.length >= 5) {
        return levenshteinDistance(existingCore, candidateCore) <= 1;
      }

      return false;
    }) || null;
  }

  function checkPublicTagAvailability(db, tag, excludeLogin = '') {
    const normalizedTag = normalizePublicTag(tag);
    if (!validatePublicTagValue(normalizedTag)) {
      return { ok: false, code: 'TAG_INVALID', normalizedTag };
    }

    const similarUser = getSimilarPublicTagMatch(db, normalizedTag, excludeLogin);
    if (!similarUser) {
      return { ok: true, normalizedTag };
    }

    const similarTag = getUserPublicTag(similarUser);
    if (similarTag === normalizedTag) {
      return { ok: false, code: 'TAG_EXISTS', normalizedTag, similarTag };
    }

    return { ok: false, code: 'TAG_TOO_SIMILAR', normalizedTag, similarTag };
  }

  function normalizeProvider(value) {
    const normalizedValue = String(value || '').trim().toLowerCase();
    return SOCIAL_PROVIDERS.includes(normalizedValue) ? normalizedValue : 'local';
  }

  function getUserAuthProviders(user) {
    const providers = Array.isArray(user?.authProviders) ? user.authProviders : [];
    const fallbackProvider = user?.authProvider || (String(user?.password || '').trim() ? 'local' : '');
    return unique(
      [...providers, fallbackProvider]
        .filter(Boolean)
        .map((provider) => normalizeProvider(provider))
    );
  }

  function slugifyLogin(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/@.*$/, '')
      .replace(/[^a-zа-яіїєґ0-9_.-]+/gi, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '') || 'player';
  }

  function createUniqueLogin(db, baseLogin) {
    const safeBase = slugifyLogin(baseLogin).slice(0, 18) || 'player';
    let candidate = safeBase;
    let index = 1;

    while (db.users.some((user) => user.login.toLowerCase() === candidate.toLowerCase())) {
      const suffix = `_${index}`;
      candidate = `${safeBase.slice(0, Math.max(3, 20 - suffix.length))}${suffix}`;
      index += 1;
    }

    return candidate;
  }

  function createUniquePublicTag(db, baseTag, excludeLogin = '') {
    const latinFallback = String(slugifyLogin(baseTag) || '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    const normalizedBase = validatePublicTagValue(baseTag)
      ? normalizePublicTag(baseTag)
      : normalizePublicTag(latinFallback) || 'player';
    const safeBase = normalizedBase.slice(0, 24) || 'player';
    let candidate = safeBase;
    let index = 1;

    while (!checkPublicTagAvailability(db, candidate, excludeLogin).ok) {
      const suffix = `_${index}`;
      candidate = `${safeBase.slice(0, Math.max(3, 24 - suffix.length))}${suffix}`;
      index += 1;
    }

    return candidate;
  }

  function normalizeGender(value) {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (normalizedValue === 'female' || normalizedValue === 'жінка') return 'female';
    if (normalizedValue === 'male' || normalizedValue === 'чоловік') return 'male';
    return 'unknown';
  }

  function getDefaultAvatarForGender(gender) {
    return normalizeGender(gender) === 'female' ? FEMALE_AVATAR : DEFAULT_AVATAR;
  }

  function getDefaultCharacterForGender(gender) {
    const template = normalizeGender(gender) === 'female' ? FEMALE_CHARACTER : DEFAULT_CHARACTER;
    return clone(template);
  }

  function selectedMatchesTemplate(selected, template) {
    const current = selected || {};
    return Object.keys(template.selected).every((key) => current[key] === template.selected[key]);
  }

  function ownedMatchesTemplate(owned, template) {
    const current = unique(owned || []);
    const required = unique(template?.owned || []);
    return required.every((itemId) => current.includes(itemId)) && current.length === required.length;
  }

  function isWardrobeItemId(value) {
    return /^(skin|hair|accessory|shirt|pants|shoes|extra)-/.test(String(value || ''));
  }

  function getWardrobePurchasesFromHistory(history) {
    return unique(
      (history || []).flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const candidateId = String(entry.itemId || entry.id || '').trim();
        if (!candidateId || !isWardrobeItemId(candidateId)) return [];
        if (!entry.type || entry.type === 'wardrobe') return [candidateId];
        return [];
      })
    );
  }

  function isStarterCharacter(character) {
    const selected = character?.selected || {};
    const owned = character?.owned || [];
    return (
      (selectedMatchesTemplate(selected, DEFAULT_CHARACTER) && ownedMatchesTemplate(owned, DEFAULT_CHARACTER))
      || (selectedMatchesTemplate(selected, FEMALE_CHARACTER) && ownedMatchesTemplate(owned, FEMALE_CHARACTER))
    );
  }

  function applyCharacterGenderDefaults(character, gender, purchaseHistory = []) {
    const defaultCharacter = getDefaultCharacterForGender(gender);
    const recoveredOwned = getWardrobePurchasesFromHistory(purchaseHistory);
    if (!character || !character.selected || isStarterCharacter(character)) {
      return {
        ...defaultCharacter,
        owned: unique([...(defaultCharacter.owned || []), ...recoveredOwned])
      };
    }

    const merged = mergeDefaults(defaultCharacter, character);
    merged.owned = unique([
      ...(character.owned || []),
      ...defaultCharacter.owned,
      ...Object.values(merged.selected || {}),
      ...recoveredOwned
    ]);
    return merged;
  }

  function isBuiltInAvatar(value) {
    const avatar = String(value || '').trim();
    return !avatar || avatar === DEFAULT_AVATAR || avatar === FEMALE_AVATAR;
  }

  function applyProfileGenderDefaults(profile) {
    const gender = normalizeGender(profile.gender);
    const defaultAvatar = getDefaultAvatarForGender(gender);
    profile.gender = gender;

    if (!String(profile.avatarImage || '').trim()) {
      if (isBuiltInAvatar(profile.avatar)) profile.avatar = defaultAvatar;
      if (isBuiltInAvatar(profile.currentAvatar)) profile.currentAvatar = defaultAvatar;
    }

    profile.avatar = profile.avatar || defaultAvatar;
    profile.currentAvatar = profile.currentAvatar || profile.avatar || defaultAvatar;
    return profile;
  }

  function mergeDefaults(target, source) {
    const base = clone(target);
    if (!source || typeof source !== 'object') return base;
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      if (Array.isArray(sourceValue)) {
        base[key] = clone(sourceValue);
      } else if (sourceValue && typeof sourceValue === 'object') {
        base[key] = mergeDefaults(base[key] || {}, sourceValue);
      } else if (sourceValue !== undefined) {
        base[key] = sourceValue;
      }
    });
    return base;
  }

  function migrateLegacy(db) {
    const legacyUsers = safeParse(localStorage.getItem('users'));
    if (Array.isArray(legacyUsers) && legacyUsers.length) {
      db.users = legacyUsers.map((user) => mergeDefaults(createUserRecord(user), user));
    }

    const sessionUser = localStorage.getItem('user');
    if (sessionUser) db.session.user = sessionUser;

    const userName = localStorage.getItem('userName');
    if (userName) db.profile.name = userName;
    if (db.session.user && !userName) db.profile.name = db.session.user;

    const userAvatar = localStorage.getItem('userAvatar');
    const currentAvatar = localStorage.getItem('currentAvatar');
    if (userAvatar) db.profile.avatar = userAvatar;
    if (currentAvatar) db.profile.currentAvatar = currentAvatar;
    if (!db.profile.currentAvatar) db.profile.currentAvatar = db.profile.avatar;
    if (!db.profile.avatar) db.profile.avatar = db.profile.currentAvatar;

    const userCoins = parseInt(localStorage.getItem('userCoins') || '', 10);
    if (Number.isFinite(userCoins)) db.profile.coins = userCoins;

    const settingsKeys = ['darkMode', 'notifications', 'musicEnabled', 'soundEnabled', 'language'];
    settingsKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        db.settings[key] = value === 'true' ? true : value === 'false' ? false : value;
      }
    });
    const volume = parseInt(localStorage.getItem('volume') || '', 10);
    if (Number.isFinite(volume)) db.settings.volume = volume;

    const legacyCharacter = safeParse(localStorage.getItem(LEGACY_CHARACTER_KEY));
    if (legacyCharacter) {
      db.character.activeCategory = legacyCharacter.activeCategory || db.character.activeCategory;
      db.character.selected = mergeDefaults(db.character.selected, legacyCharacter.selected || {});
      db.character.owned = unique([...(db.character.owned || []), ...((legacyCharacter.owned || []))]);
    }

    const inventory = safeParse(localStorage.getItem('inventory'));
    if (Array.isArray(inventory)) db.shop.inventory = inventory;
    const avatars = safeParse(localStorage.getItem('avatars'));
    if (Array.isArray(avatars) && avatars.length) db.shop.avatars = unique(avatars);
    const achievements = safeParse(localStorage.getItem('achievements'));
    if (Array.isArray(achievements)) db.shop.achievements = unique(achievements);
    const purchaseHistory = safeParse(localStorage.getItem('purchaseHistory'));
    if (Array.isArray(purchaseHistory)) db.shop.purchaseHistory = purchaseHistory;

    const lastDaily = parseInt(localStorage.getItem('lastDaily') || '', 10);
    if (Number.isFinite(lastDaily)) db.shop.lastDaily = lastDaily;
    const dailyClaimCount = parseInt(localStorage.getItem('dailyClaimCount') || '', 10);
    if (Number.isFinite(dailyClaimCount)) db.shop.dailyClaimCount = dailyClaimCount;
    const totalSpent = parseInt(localStorage.getItem('totalSpent') || '', 10);
    if (Number.isFinite(totalSpent)) db.shop.totalSpent = totalSpent;
  }

  function normalize(db) {
    db.users = Array.isArray(db.users) ? db.users : [];
    db.profile.coins = Number.isFinite(Number(db.profile.coins)) ? Number(db.profile.coins) : DEFAULT_COINS;
    applyProfileGenderDefaults(db.profile);
    db.profile.avatar = db.profile.avatar || getDefaultAvatarForGender(db.profile.gender);
    db.profile.currentAvatar = db.profile.currentAvatar || db.profile.avatar || getDefaultAvatarForGender(db.profile.gender);
    db.shop = mergeDefaults(DEFAULT_DB.shop, db.shop || {});
    const storedAvatars = Array.isArray(db.shop.avatars) ? db.shop.avatars : [];
    db.shop.avatars = unique([
      ...(storedAvatars.length ? storedAvatars : [DEFAULT_AVATAR, FEMALE_AVATAR]),
      getDefaultAvatarForGender(db.profile.gender)
    ]);
    db.shop.achievements = unique(db.shop.achievements);
    db.shop.inventory = Array.isArray(db.shop.inventory) ? db.shop.inventory : [];
    db.shop.purchaseHistory = Array.isArray(db.shop.purchaseHistory) ? db.shop.purchaseHistory : [];
    db.character = applyCharacterGenderDefaults(db.character, db.profile.gender, db.shop.purchaseHistory);
    db.character.owned = unique(db.character.owned);
    db.progress = mergeDefaults(DEFAULT_PROGRESS, db.progress || {});
    db.progress.recentGames = Array.isArray(db.progress.recentGames) ? db.progress.recentGames : [];

    db.users = db.users.map((user) => {
      const normalizedUser = mergeDefaults(createUserRecord(user), user);
      normalizedUser.login = String(normalizedUser.login || '').trim();
      normalizedUser.email = String(normalizedUser.email || '').trim().toLowerCase();
      normalizedUser.password = String(normalizedUser.password || '');
      normalizedUser.authIdentities = (normalizedUser.authIdentities && typeof normalizedUser.authIdentities === 'object')
        ? { ...normalizedUser.authIdentities }
        : {};
      normalizedUser.authProvider = normalizeProvider(normalizedUser.authProvider || (normalizedUser.password ? 'local' : ''));
      normalizedUser.authProviders = getUserAuthProviders(normalizedUser);
      normalizedUser.lastAuthMethod = normalizeProvider(normalizedUser.lastAuthMethod || normalizedUser.authProvider);
      normalizedUser.profile = applyProfileGenderDefaults(mergeDefaults(DEFAULT_DB.profile, normalizedUser.profile || {}));
      const preferredTag = normalizePublicTag(normalizedUser.profile.username || normalizedUser.login);
      const preferredTagCheck = checkPublicTagAvailability(db, preferredTag, normalizedUser.login);
      normalizedUser.profile.username = preferredTagCheck.ok
        ? preferredTagCheck.normalizedTag
        : createUniquePublicTag(db, normalizedUser.login, normalizedUser.login);
      normalizedUser.progress = mergeDefaults(DEFAULT_PROGRESS, normalizedUser.progress || {});
      normalizedUser.progress.recentGames = Array.isArray(normalizedUser.progress.recentGames) ? normalizedUser.progress.recentGames : [];
      normalizedUser.character = applyCharacterGenderDefaults(normalizedUser.character, normalizedUser.profile.gender);
      normalizedUser.character.owned = unique(normalizedUser.character.owned);
      return normalizedUser;
    }).filter((user) => user.login);
  }

  function mirrorLegacy(db) {
    syncCurrentUserProfile(db);
    localStorage.setItem('users', JSON.stringify(db.users));
    if (db.session.user) localStorage.setItem('user', db.session.user);
    else localStorage.removeItem('user');

    localStorage.setItem('userName', db.profile.name);
    localStorage.setItem('userAvatar', db.profile.avatar);
    localStorage.setItem('currentAvatar', db.profile.currentAvatar);
    localStorage.setItem('userCoins', String(db.profile.coins));

    localStorage.setItem('darkMode', String(Boolean(db.settings.darkMode)));
    localStorage.setItem('notifications', String(Boolean(db.settings.notifications)));
    localStorage.setItem('musicEnabled', String(Boolean(db.settings.musicEnabled)));
    localStorage.setItem('soundEnabled', String(Boolean(db.settings.soundEnabled)));
    localStorage.setItem('volume', String(db.settings.volume));
    localStorage.setItem('language', String(db.settings.language));

    localStorage.setItem(LEGACY_CHARACTER_KEY, JSON.stringify({
      activeCategory: db.character.activeCategory,
      selected: db.character.selected,
      owned: db.character.owned
    }));

    localStorage.setItem('inventory', JSON.stringify(db.shop.inventory));
    localStorage.setItem('avatars', JSON.stringify(db.shop.avatars));
    localStorage.setItem('achievements', JSON.stringify(db.shop.achievements));
    localStorage.setItem('purchaseHistory', JSON.stringify(db.shop.purchaseHistory));
    localStorage.setItem('lastDaily', String(db.shop.lastDaily));
    localStorage.setItem('dailyClaimCount', String(db.shop.dailyClaimCount));
    localStorage.setItem('totalSpent', String(db.shop.totalSpent));
  }

  function load() {
    if (cache) return cache;
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    cache = mergeDefaults(DEFAULT_DB, stored || {});
    migrateLegacy(cache);
    normalize(cache);
    syncCurrentUserProfile(cache);
    save();
    return cache;
  }

  function save() {
    normalize(cache);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    mirrorLegacy(cache);
  }

  function createUserRecord(input) {
    const login = String(input.login || '').trim();
    const email = String(input.email || '').trim().toLowerCase();
    const password = String(input.password || '');
    const authProvider = normalizeProvider(input.authProvider || (password ? 'local' : ''));
    const authProviders = unique(
      [...(Array.isArray(input.authProviders) ? input.authProviders : []), authProvider]
        .filter(Boolean)
        .map((provider) => normalizeProvider(provider))
    );
    const gender = normalizeGender(input.gender || input.profile?.gender);
    const defaultAvatar = getDefaultAvatarForGender(gender);
    const displayName = String(input.displayName || input.name || login || email.split('@')[0] || 'Користувач').trim();
    const username = normalizePublicTag(
      input.username || slugifyLogin(login || email.split('@')[0] || displayName).replace(/-/g, '_')
    ).slice(0, 24) || 'player';
    const now = new Date().toISOString();

    return {
      id: `user_${Date.now()}`,
      login,
      email,
      password,
      authProvider,
      authProviders: authProviders.length ? authProviders : ['local'],
      authIdentities: input.authIdentities && typeof input.authIdentities === 'object' ? { ...input.authIdentities } : {},
      lastAuthMethod: authProvider,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      profile: {
        name: displayName || login,
        username,
        phone: '',
        email,
        bio: authProvider === 'local' ? 'Новий користувач' : `Вхід через ${authProvider}`,
        gender,
        statusText: 'Online',
        avatarImage: '',
        avatar: defaultAvatar,
        currentAvatar: defaultAvatar,
        coins: DEFAULT_COINS
      },
      progress: clone(DEFAULT_PROGRESS),
      character: getDefaultCharacterForGender(gender)
    };
  }

  function applyUserProfile(db, user) {
    if (!user) {
      db.profile = clone(DEFAULT_DB.profile);
      db.progress = clone(DEFAULT_PROGRESS);
      db.character = clone(DEFAULT_DB.character);
      return;
    }

    const userProfile = applyProfileGenderDefaults(mergeDefaults(DEFAULT_DB.profile, user.profile || {}));
    const defaultAvatar = getDefaultAvatarForGender(userProfile.gender);
    db.profile = {
      ...userProfile,
      name: userProfile.name || user.login,
      username: normalizePublicTag(userProfile.username || user.login) || normalizePublicTag(user.login) || 'player',
      email: userProfile.email || user.email || '',
      avatar: userProfile.avatar || defaultAvatar,
      currentAvatar: userProfile.currentAvatar || userProfile.avatar || defaultAvatar,
      avatarImage: userProfile.avatarImage || '',
      coins: Number.isFinite(Number(userProfile.coins)) ? Number(userProfile.coins) : DEFAULT_COINS
    };
    applyProfileGenderDefaults(db.profile);
    user.profile = clone(db.profile);
    user.progress = mergeDefaults(DEFAULT_PROGRESS, user.progress || {});
    db.progress = clone(user.progress);
    user.character = applyCharacterGenderDefaults(user.character, db.profile.gender, db.shop?.purchaseHistory);
    user.character.owned = unique(user.character.owned);
    db.character = clone(user.character);
    db.shop.avatars = unique([...(db.shop.avatars || []), getDefaultAvatarForGender(db.profile.gender)]);
  }

  function syncCurrentUserProfile(db) {
    if (!db.session.user) return;

    const user = db.users.find((entry) => entry.login === db.session.user);
    if (!user) return;

    const profileGender = normalizeGender(db.profile.gender || user.profile?.gender);
    const defaultAvatar = getDefaultAvatarForGender(profileGender);
    user.profile = applyProfileGenderDefaults(mergeDefaults(DEFAULT_DB.profile, {
      ...user.profile,
      ...db.profile,
      name: db.profile.name || user.login,
      username: normalizePublicTag(db.profile.username || user.profile?.username || user.login) || normalizePublicTag(user.login) || 'player',
      email: db.profile.email || user.email || '',
      gender: profileGender,
      avatar: db.profile.avatar || defaultAvatar,
      currentAvatar: db.profile.currentAvatar || db.profile.avatar || defaultAvatar,
      avatarImage: db.profile.avatarImage || '',
      coins: Number.isFinite(Number(db.profile.coins)) ? Number(db.profile.coins) : DEFAULT_COINS
    }));
    user.progress = mergeDefaults(DEFAULT_PROGRESS, db.progress || {});
    user.character = applyCharacterGenderDefaults(db.character || user.character, user.profile.gender, db.shop?.purchaseHistory);
    user.character.owned = unique(user.character.owned);
    user.updatedAt = new Date().toISOString();
  }

  window.AppDB = {
    getData() {
      return clone(load());
    },
    update(mutator) {
      const db = load();
      mutator(db);
      syncCurrentUserProfile(db);
      save();
      return clone(db);
    },
    getUsers() {
      return clone(load().users);
    },
    findUserByLogin(login) {
      const normalizedLogin = String(login || '').trim().toLowerCase();
      const user = load().users.find((entry) => entry.login.toLowerCase() === normalizedLogin);
      return user ? clone(user) : null;
    },
    findUserByEmail(email) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const user = load().users.find((entry) => String(entry.email || '').toLowerCase() === normalizedEmail);
      return user ? clone(user) : null;
    },
    getCurrentUser() {
      return load().session.user;
    },
    setCurrentUser(login) {
      const db = load();
      db.session.user = login || null;
      const user = db.users.find((entry) => entry.login === login);
      applyUserProfile(db, user || null);
      save();
    },
    clearCurrentUser() {
      const db = load();
      db.session.user = null;
      applyUserProfile(db, null);
      save();
    },
    registerUser(input) {
      const db = load();
      const normalizedLogin = String(input.login || '').trim().toLowerCase();
      const normalizedEmail = String(input.email || '').trim().toLowerCase();
      const tagCheck = checkPublicTagAvailability(db, input.username || normalizedLogin);
      const hasLogin = db.users.some((user) => user.login.toLowerCase() === normalizedLogin);
      const hasEmail = db.users.some((user) => String(user.email || '').toLowerCase() === normalizedEmail);

      if (hasLogin) return { ok: false, code: 'LOGIN_EXISTS' };
      if (hasEmail) return { ok: false, code: 'EMAIL_EXISTS' };
      if (!tagCheck.ok) {
        return { ok: false, code: tagCheck.code, tag: tagCheck.normalizedTag, similarTag: tagCheck.similarTag };
      }

      const user = createUserRecord({
        ...input,
        username: tagCheck.normalizedTag,
        authProvider: 'local',
        authProviders: ['local']
      });
      db.users.push(user);
      if (input.autoLogin) {
        user.lastLoginAt = new Date().toISOString();
        user.lastAuthMethod = 'local';
        db.session.user = user.login;
        applyUserProfile(db, user);
      }
      save();

      return { ok: true, user: clone(user), autoLoggedIn: Boolean(input.autoLogin) };
    },
    authenticateUser(login, password) {
      const normalizedLogin = String(login || '').trim().toLowerCase();
      const db = load();
      const user = db.users.find((entry) => (
        entry.login.toLowerCase() === normalizedLogin
        || String(entry.email || '').toLowerCase() === normalizedLogin
      ));

      if (!user) return { ok: false, code: 'INVALID_CREDENTIALS' };
      if (!String(user.password || '').trim()) {
        return {
          ok: false,
          code: 'USE_SOCIAL_LOGIN',
          providers: getUserAuthProviders(user).filter((provider) => provider !== 'local')
        };
      }
      if (user.password !== password) return { ok: false, code: 'INVALID_CREDENTIALS' };

      user.lastLoginAt = new Date().toISOString();
      user.lastAuthMethod = 'local';
      db.session.user = user.login;
      applyUserProfile(db, user);
      save();

      return { ok: true, user: clone(user) };
    },
    registerOrLoginWithProvider(provider, input = {}) {
      const normalizedProvider = normalizeProvider(provider);
      if (normalizedProvider === 'local') {
        return { ok: false, code: 'INVALID_PROVIDER' };
      }

      const normalizedEmail = String(input.email || '').trim().toLowerCase();
      const displayName = String(input.displayName || input.name || '').trim();
      const providerUserId = String(input.providerUserId || '').trim();
      const db = load();
      let user = null;
      let linked = false;
      let isNew = false;

      if (providerUserId) {
        user = db.users.find((entry) => String(entry.authIdentities?.[normalizedProvider] || '') === providerUserId);
      }

      if (normalizedEmail) {
        user = user || db.users.find((entry) => (
          getUserAuthProviders(entry).includes(normalizedProvider)
          && String(entry.email || '').toLowerCase() === normalizedEmail
        ));
        if (!user) {
          user = db.users.find((entry) => String(entry.email || '').toLowerCase() === normalizedEmail);
        }
      }

      if (!user) {
        const login = createUniqueLogin(
          db,
          `${slugifyLogin(displayName || normalizedEmail.split('@')[0] || normalizedProvider)}_${normalizedProvider}`
        );
        const requestedTag = normalizePublicTag(input.username || displayName || normalizedEmail.split('@')[0] || login);
        const tagCheck = requestedTag
          ? checkPublicTagAvailability(db, requestedTag)
          : { ok: true, normalizedTag: createUniquePublicTag(db, login) };
        if (!tagCheck.ok) {
          return { ok: false, code: tagCheck.code, tag: tagCheck.normalizedTag, similarTag: tagCheck.similarTag };
        }
        user = createUserRecord({
          login,
          email: normalizedEmail || `${login}@${normalizedProvider}.local`,
          password: '',
          authProvider: normalizedProvider,
          authProviders: [normalizedProvider],
          authIdentities: providerUserId ? { [normalizedProvider]: providerUserId } : {},
          displayName: displayName || login,
          username: tagCheck.normalizedTag,
          gender: input.gender
        });
        db.users.push(user);
        isNew = true;
      } else {
        const incomingGender = normalizeGender(input.gender);
        const currentProviders = getUserAuthProviders(user);
        linked = !currentProviders.includes(normalizedProvider);
        user.authProviders = linked ? unique([...currentProviders, normalizedProvider]) : currentProviders;
        user.authIdentities = (user.authIdentities && typeof user.authIdentities === 'object') ? user.authIdentities : {};
        if (providerUserId) {
          user.authIdentities[normalizedProvider] = providerUserId;
        }
        user.authProvider = user.authProvider === 'local' && !String(user.password || '').trim()
          ? normalizedProvider
          : user.authProvider || normalizedProvider;
        user.email = normalizedEmail || user.email;
        user.profile = mergeDefaults(DEFAULT_DB.profile, user.profile || {});
        if (displayName && (!user.profile.name || user.profile.name === user.login)) {
          user.profile.name = displayName;
        }
        if (normalizedEmail) {
          user.profile.email = normalizedEmail;
        }
        if (input.username) {
          const tagCheck = checkPublicTagAvailability(db, input.username, user.login);
          if (!tagCheck.ok) {
            return { ok: false, code: tagCheck.code, tag: tagCheck.normalizedTag, similarTag: tagCheck.similarTag };
          }
          user.profile.username = tagCheck.normalizedTag;
        }
        if (incomingGender !== 'unknown' && normalizeGender(user.profile.gender) === 'unknown') {
          user.profile.gender = incomingGender;
        }
        applyProfileGenderDefaults(user.profile);
      }

      user.updatedAt = new Date().toISOString();
      user.lastLoginAt = user.updatedAt;
      user.lastAuthMethod = normalizedProvider;
      db.session.user = user.login;
      applyUserProfile(db, user);
      save();

      return {
        ok: true,
        user: clone(user),
        provider: normalizedProvider,
        linked,
        isNew
      };
    },
    normalizePublicTag(value) {
      return normalizePublicTag(value);
    },
    checkPublicTagAvailability(tag, excludeLogin = '') {
      const db = load();
      return checkPublicTagAvailability(db, tag, excludeLogin);
    },
    reset() {
      cache = clone(DEFAULT_DB);
      save();
      return clone(cache);
    }
  };
})();
