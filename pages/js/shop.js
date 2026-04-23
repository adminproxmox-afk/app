const currentUser = window.AppDB?.getCurrentUser?.();
if (!currentUser) {
  window.location.href = '../login.html';
}

const lang = window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
const t = {
  uk: {
    items: 'Товари',
    wardrobe: 'Одяг',
    achievements: 'Досягнення',
    daily: 'Бонуси',
    owned: 'Власність',
    bought: 'Придбано',
    buy: 'Купити',
    free: 'Безкоштовно',
    shopTitle: 'Магазин',
    noPurchases: 'Ще немає покупок',
    wardrobeHint: 'Після покупки річ зʼявиться у персонажі',
    alreadyInWardrobe: 'Вже у гардеробі'
  },
  en: {
    items: 'Items',
    wardrobe: 'Wardrobe',
    achievements: 'Achievements',
    daily: 'Bonuses',
    owned: 'Owned',
    bought: 'Purchased',
    buy: 'Buy',
    free: 'Free',
    shopTitle: 'Shop',
    noPurchases: 'No purchases yet',
    wardrobeHint: 'After purchase the item appears on the character page',
    alreadyInWardrobe: 'Already in wardrobe'
  }
}[lang];

const shopMap = {
  'Подвійний досвід': 'Double XP',
  '2x досвіду на 1 годину': '2x experience for 1 hour',
  'Додаткове життя': 'Extra lives',
  '+3 життя для завдань': '+3 lives for challenges',
  'Заморозка часу': 'Time freeze',
  'Стоп таймер на 30 сек': 'Stop the timer for 30 sec',
  'Підказки': 'Hints',
  'Пакет з 5 підказок': 'Pack of 5 hints',
  'Золота тема': 'Golden theme',
  'Преміальна палітра інтерфейсу': 'Premium interface palette',
  'Значок Експерта': 'Expert badge',
  'Статусний бейдж профілю': 'Profile status badge',
  'Студент': 'Student',
  'Студентка': 'Student',
  'Програміст': 'Developer',
  'Програмістка': 'Developer',
  'Котик': 'Cat',
  'Ракета': 'Rocket',
  'Зірка': 'Star',
  'Геймер': 'Gamer',
  'Супергерой': 'Superhero',
  'Маг': 'Mage',
  'Дракон': 'Dragon',
  'Король': 'King',
  'Перша покупка': 'First purchase',
  'Здійсніть першу покупку': 'Make your first purchase',
  'Великий витратник': 'Big spender',
  'Витратьте 500 монет': 'Spend 500 coins',
  'Колекціонер': 'Collector',
  'Купіть 5 речей': 'Buy 5 wardrobe items',
  'Щоденний чемпіон': 'Daily champion',
  'Отримайте 7 щоденних бонусів': 'Claim 7 daily bonuses',
  'Досягнення': 'Achievement',
  'Ви отримали': 'You received',
  'та': 'and',
  'монет': 'coins',
  'Недостатньо монет': 'Not enough coins',
  'Потрібно': 'Need',
  'а зараз у вас': 'you currently have',
  'Куплено': 'Purchased',
  'Активовано': 'Activated',
  'Для аватара потрібно': 'This avatar costs',
  'Новий аватар': 'New avatar',
  'Бонус уже отримано': 'Bonus already claimed',
  'Поверніться завтра за новою нагородою.': 'Come back tomorrow for a new reward.',
  'Щоденний бонус': 'Daily bonus',
  'Забирайте нагороду щодня, щоб швидше відкривати нові предмети та одяг.': 'Claim a reward every day to unlock new items and wardrobe faster.',
  'Отримати бонус': 'Claim bonus',
  'Бонус уже забрано': 'Bonus already claimed',
  'Історія покупок': 'Purchase history',
  'Останні придбання у вашому профілі.': 'Recent purchases in your profile.',
  'Ще немає покупок': 'No purchases yet',
  'Міграцію локальних даних завершено': 'Local data migration completed',
  'Одяг': 'Wardrobe',
  'Річ уже є у гардеробі': 'This item is already in the wardrobe',
  'Доступно у персонажі': 'Available on the character page'
};

function trShop(value) {
  return lang === 'en' ? (shopMap[value] || value) : value;
}

const shopItems = [
  { id: 'boost_x2', name: 'Подвійний досвід', icon: '⚡', desc: '2x досвіду на 1 годину', price: 50, type: 'boost' },
  { id: 'extra_lives', name: 'Додаткове життя', icon: '❤️', desc: '+3 життя для завдань', price: 30, type: 'consumable' },
  { id: 'time_freeze', name: 'Заморозка часу', icon: '⏸️', desc: 'Стоп таймер на 30 сек', price: 40, type: 'consumable' },
  { id: 'hint_pack', name: 'Підказки', icon: '💡', desc: 'Пакет з 5 підказок', price: 25, type: 'consumable' },
  { id: 'theme_gold', name: 'Золота тема', icon: '✨', desc: 'Преміальна палітра інтерфейсу', price: 100, type: 'skin' },
  { id: 'badge_expert', name: 'Значок Експерта', icon: '🏅', desc: 'Статусний бейдж профілю', price: 150, type: 'badge' }
];

const defaultCharacterSelected = {
  skin: 'skin-soft',
  hair: 'hair-classic',
  shirt: 'shirt-red',
  pants: 'pants-navy',
  shoes: 'shoes-black',
  extra: 'extra-soft'
};

const defaultCharacterOwned = ['skin-soft', 'hair-classic', 'shirt-red', 'pants-navy', 'shoes-black', 'extra-soft'];

const wardrobeCatalog = [
  {
    id: 'skin',
    label: 'Шкіра',
    icon: '🖐️',
    items: [
      { id: 'skin-soft', label: 'Світлий', price: 0 },
      { id: 'skin-beige', label: 'Бежевий', price: 8 },
      { id: 'skin-warm', label: 'Теплий', price: 10 },
      { id: 'skin-amber', label: 'Бурштин', price: 12 },
      { id: 'skin-deep', label: 'Глибокий', price: 16 },
      { id: 'skin-bronze', label: 'Бронза', price: 15 },
      { id: 'skin-sand', label: 'Пісок', price: 11 },
      { id: 'skin-cocoa', label: 'Какао', price: 18 }
    ]
  },
  {
    id: 'hair',
    label: 'Волосся',
    icon: '💇',
    items: [
      { id: 'hair-classic', label: 'Класика', price: 0 },
      { id: 'hair-dark', label: 'Темний', price: 12 },
      { id: 'hair-blonde', label: 'Блонд', price: 16 },
      { id: 'hair-copper', label: 'Мідний', price: 18 },
      { id: 'hair-blue', label: 'Синій', price: 22 },
      { id: 'hair-silver', label: 'Срібло', price: 20 },
      { id: 'hair-green', label: 'Зелений', price: 19 },
      { id: 'hair-plum', label: 'Слива', price: 21 }
    ]
  },
  {
    id: 'shirt',
    label: 'Одяг',
    icon: '👕',
    items: [
      { id: 'shirt-red', label: 'Марсала', price: 0 },
      { id: 'shirt-blue', label: 'Синій', price: 15 },
      { id: 'shirt-green', label: 'Хвоя', price: 15 },
      { id: 'shirt-black', label: 'Графіт', price: 18 },
      { id: 'shirt-violet', label: 'Фіалка', price: 17 },
      { id: 'shirt-sand', label: 'Пісочний', price: 16 },
      { id: 'shirt-steel', label: 'Сталь', price: 14 },
      { id: 'shirt-teal', label: 'Бірюза', price: 18 }
    ]
  },
  {
    id: 'pants',
    label: 'Штани',
    icon: '👖',
    items: [
      { id: 'pants-navy', label: 'Нічні', price: 0 },
      { id: 'pants-gray', label: 'Сірі', price: 13 },
      { id: 'pants-black', label: 'Чорні', price: 14 },
      { id: 'pants-olive', label: 'Олива', price: 14 },
      { id: 'pants-coffee', label: 'Кава', price: 13 },
      { id: 'pants-azure', label: 'Азур', price: 16 },
      { id: 'pants-plum', label: 'Пурпур', price: 17 },
      { id: 'pants-wine', label: 'Вино', price: 17 }
    ]
  },
  {
    id: 'shoes',
    label: 'Взуття',
    icon: '👟',
    items: [
      { id: 'shoes-black', label: 'Базові', price: 0 },
      { id: 'shoes-gray', label: 'Туман', price: 8 },
      { id: 'shoes-white', label: 'Світлі', price: 10 },
      { id: 'shoes-red', label: 'Рубін', price: 12 },
      { id: 'shoes-blue', label: 'Океан', price: 12 },
      { id: 'shoes-gold', label: 'Золото', price: 18 },
      { id: 'shoes-green', label: 'Лайм', price: 12 },
      { id: 'shoes-purple', label: 'Аметист', price: 14 }
    ]
  },
  {
    id: 'extra',
    label: 'Ефект',
    icon: '✨',
    items: [
      { id: 'extra-soft', label: 'Без ефекту', price: 0 },
      { id: 'extra-ice', label: 'Лід', price: 10 },
      { id: 'extra-fire', label: 'Вогонь', price: 12 },
      { id: 'extra-gold', label: 'Сонце', price: 12 },
      { id: 'extra-forest', label: 'Ліс', price: 10 },
      { id: 'extra-plasma', label: 'Плазма', price: 14 },
      { id: 'extra-rose', label: 'Рожевий', price: 12 },
      { id: 'extra-night', label: 'Неон', price: 14 }
    ]
  }
];

const wardrobeItems = wardrobeCatalog.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    type: 'wardrobe',
    categoryId: category.id,
    categoryLabel: category.label,
    icon: category.icon
  }))
);

const allAvatars = [
  { emoji: '👨‍🎓', name: 'Студент', price: 0 },
  { emoji: '👩‍🎓', name: 'Студентка', price: 0 },
  { emoji: '👨‍💻', name: 'Програміст', price: 50 },
  { emoji: '👩‍💻', name: 'Програмістка', price: 50 },
  { emoji: '🐱', name: 'Котик', price: 30 },
  { emoji: '🚀', name: 'Ракета', price: 80 },
  { emoji: '⭐', name: 'Зірка', price: 40 },
  { emoji: '🎮', name: 'Геймер', price: 60 },
  { emoji: '🦸', name: 'Супергерой', price: 120 },
  { emoji: '🧙', name: 'Маг', price: 100 },
  { emoji: '🐉', name: 'Дракон', price: 200 },
  { emoji: '👑', name: 'Король', price: 150 }
];

const achievements = [
  { id: 'first_purchase', name: 'Перша покупка', desc: 'Здійсніть першу покупку', icon: '🛍️', reward: 25, requirement: 1 },
  { id: 'big_spender', name: 'Великий витратник', desc: 'Витратьте 500 монет', icon: '💰', reward: 100, requirement: 500 },
  { id: 'collector', name: 'Колекціонер', desc: 'Купіть 5 речей', icon: '📦', reward: 75, requirement: 5 },
  { id: 'daily_champ', name: 'Щоденний чемпіон', desc: 'Отримайте 7 щоденних бонусів', icon: '📅', reward: 150, requirement: 7 }
];

let toastTimer;

function getDb() {
  return window.AppDB?.getData?.() || {};
}

function getProfile() {
  return getDb().profile || {};
}

function getShop() {
  return getDb().shop || {};
}

function getInventory() {
  return Array.isArray(getShop().inventory) ? getShop().inventory : [];
}

function getAvatars() {
  return Array.isArray(getShop().avatars) && getShop().avatars.length ? getShop().avatars : ['👨‍🎓', '👩‍🎓'];
}

function getAchievementsState() {
  return Array.isArray(getShop().achievements) ? getShop().achievements : [];
}

function getPurchaseHistory() {
  return Array.isArray(getShop().purchaseHistory) ? getShop().purchaseHistory : [];
}

function buildNameAliasMap() {
  const map = new Map();

  shopItems.forEach((item) => {
    map.set(item.name, item.name);
    const translatedName = shopMap[item.name];
    if (translatedName) map.set(translatedName, item.name);
  });

  allAvatars.forEach((avatar) => {
    map.set(avatar.name, avatar.name);
    const translatedName = shopMap[avatar.name];
    if (translatedName) map.set(translatedName, avatar.name);
  });

  achievements.forEach((achievement) => {
    map.set(achievement.name, achievement.name);
    const translatedName = shopMap[achievement.name];
    if (translatedName) map.set(translatedName, achievement.name);
  });

  return map;
}

const nameAliasMap = buildNameAliasMap();

function toCanonicalName(name) {
  return nameAliasMap.get(name) || name;
}

function findItemById(id) {
  return shopItems.find((item) => item.id === id) || null;
}

function findAvatarByEmoji(emoji) {
  return allAvatars.find((avatar) => avatar.emoji === emoji) || null;
}

function findItemByName(name) {
  const canonicalName = toCanonicalName(name);
  return shopItems.find((item) => item.name === canonicalName) || null;
}

function findWardrobeItemById(id) {
  return wardrobeItems.find((item) => item.id === id) || null;
}

function findAvatarByName(name) {
  const canonicalName = toCanonicalName(name);
  return allAvatars.find((avatar) => avatar.name === canonicalName) || null;
}

function getCharacterState() {
  const character = getDb().character || {};
  return {
    activeCategory: character.activeCategory || 'skin',
    selected: { ...defaultCharacterSelected, ...(character.selected || {}) },
    owned: Array.from(new Set([...(character.owned || []), ...defaultCharacterOwned]))
  };
}

function createHistoryEntry(itemId, type, price, timestamp) {
  return {
    id: `purchase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    itemId,
    type,
    price,
    timestamp: Number.isFinite(Number(timestamp)) ? Number(timestamp) : Date.now()
  };
}

function normalizeHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (entry.itemId && entry.type && Number.isFinite(Number(entry.timestamp))) {
    return {
      id: entry.id || `purchase_${entry.timestamp}`,
      itemId: entry.itemId,
      type: entry.type,
      price: Number(entry.price || 0),
      timestamp: Number(entry.timestamp)
    };
  }

  const item = findItemById(entry.id) || findItemByName(entry.name);
  if (item) {
    return createHistoryEntry(item.id, entry.type || item.type || 'item', entry.price || item.price || 0, entry.boughtAt || entry.timestamp || Date.parse(entry.date || '') || Date.now());
  }

  const wardrobeItem = findWardrobeItemById(entry.id) || findWardrobeItemById(entry.itemId);
  if (wardrobeItem) {
    return createHistoryEntry(wardrobeItem.id, 'wardrobe', entry.price || wardrobeItem.price || 0, entry.boughtAt || entry.timestamp || Date.parse(entry.date || '') || Date.now());
  }

  const avatar = findAvatarByEmoji(entry.itemId) || findAvatarByEmoji(entry.emoji) || findAvatarByName(entry.name);
  if (avatar) {
    return createHistoryEntry(avatar.emoji, 'avatar', entry.price || avatar.price || 0, entry.boughtAt || entry.timestamp || Date.parse(entry.date || '') || Date.now());
  }

  return null;
}

function normalizeInventoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const item = findItemById(entry.id) || findItemByName(entry.name);
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    type: item.type,
    boughtAt: Number.isFinite(Number(entry.boughtAt)) ? Number(entry.boughtAt) : Date.now()
  };
}

function migrateLegacyLocalizedData() {
  let migrated = false;

  window.AppDB?.update?.((db) => {
    db.shop = db.shop || {};
    db.shop.inventory = Array.isArray(db.shop.inventory) ? db.shop.inventory : [];
    db.shop.purchaseHistory = Array.isArray(db.shop.purchaseHistory) ? db.shop.purchaseHistory : [];
    db.shop.avatars = Array.isArray(db.shop.avatars) && db.shop.avatars.length ? db.shop.avatars : ['👨‍🎓', '👩‍🎓'];
    db.shop.achievements = Array.isArray(db.shop.achievements) ? db.shop.achievements : [];

    const migratedInventory = db.shop.inventory
      .map(normalizeInventoryEntry)
      .filter(Boolean);

    const migratedHistory = db.shop.purchaseHistory
      .map(normalizeHistoryEntry)
      .filter(Boolean)
      .slice(-20);

    if (JSON.stringify(migratedInventory) !== JSON.stringify(db.shop.inventory)) {
      db.shop.inventory = migratedInventory;
      migrated = true;
    }

    if (JSON.stringify(migratedHistory) !== JSON.stringify(db.shop.purchaseHistory)) {
      db.shop.purchaseHistory = migratedHistory;
      migrated = true;
    }
  });

  return migrated;
}

function updateBalance() {
  document.getElementById('coinBalance').innerText = String(getProfile().coins || 125);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function showModal(title, message) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalMessage').innerText = message;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function addToHistory(db, itemId, type, price) {
  db.shop.purchaseHistory = Array.isArray(db.shop.purchaseHistory) ? db.shop.purchaseHistory : [];
  db.shop.purchaseHistory.push(createHistoryEntry(itemId, type, price));
  db.shop.purchaseHistory = db.shop.purchaseHistory.slice(-20);
}

function ensureCharacterDbState(db) {
  db.character = db.character || {};
  db.character.activeCategory = db.character.activeCategory || 'skin';
  db.character.selected = {
    ...defaultCharacterSelected,
    ...(db.character.selected || {})
  };
  db.character.owned = Array.from(new Set([...(db.character.owned || []), ...defaultCharacterOwned]));
}

function updateAchievements(db, spentAmount) {
  db.shop.achievements = Array.isArray(db.shop.achievements) ? db.shop.achievements : [];
  db.shop.totalSpent = Number.isFinite(Number(db.shop.totalSpent)) ? Number(db.shop.totalSpent) : 0;
  db.profile.coins = Number.isFinite(Number(db.profile.coins)) ? Number(db.profile.coins) : 125;
  ensureCharacterDbState(db);

  if (spentAmount) {
    db.shop.totalSpent += spentAmount;
  }

  const unlocked = new Set(db.shop.achievements);
  const purchaseCount = Array.isArray(db.shop.purchaseHistory) ? db.shop.purchaseHistory.length : 0;
  const dailyCount = Number(db.shop.dailyClaimCount || 0);
  const wardrobeCount = db.character.owned.filter((itemId) => !defaultCharacterOwned.includes(itemId)).length;
  const newUnlocks = [];

  achievements.forEach((achievement) => {
    let current = 0;
    if (achievement.id === 'first_purchase') current = purchaseCount >= 1 ? 1 : 0;
    if (achievement.id === 'big_spender') current = db.shop.totalSpent;
    if (achievement.id === 'collector') current = wardrobeCount;
    if (achievement.id === 'daily_champ') current = dailyCount;

    if (current >= achievement.requirement && !unlocked.has(achievement.id)) {
      unlocked.add(achievement.id);
      db.shop.achievements.push(achievement.id);
      db.profile.coins += achievement.reward;
      newUnlocks.push(achievement);
    }
  });

  return newUnlocks;
}

function buyItem(item) {
  let modalState = null;
  let toastMessage = '';
  let unlockedAchievements = [];

  window.AppDB?.update?.((db) => {
    db.profile = db.profile || {};
    db.shop = db.shop || {};
    db.shop.inventory = Array.isArray(db.shop.inventory) ? db.shop.inventory : [];

    const coins = Number(db.profile.coins || 0);
    const alreadyOwned = db.shop.inventory.some((entry) => entry.id === item.id);
    if (alreadyOwned) return;

    if (coins < item.price) {
      modalState = {
        title: trShop('Недостатньо монет'),
        message: `${trShop('Потрібно')} ${item.price} ${trShop('монет')}, ${trShop('а зараз у вас')} ${coins}.`
      };
      return;
    }

    db.profile.coins = coins - item.price;
    db.shop.inventory.push({
      id: item.id,
      name: item.name,
      type: item.type,
      boughtAt: Date.now()
    });
    addToHistory(db, item.id, item.type, item.price);
    unlockedAchievements = updateAchievements(db, item.price);
    toastMessage = `${trShop('Куплено')}: ${trShop(item.name)}`;
  });

  if (modalState) {
    showModal(modalState.title, modalState.message);
    return;
  }

  updateBalance();
  renderCurrentTab();
  if (toastMessage) showToast(toastMessage);
  unlockedAchievements.forEach((achievement) => {
    showModal(trShop('Досягнення'), `${trShop('Ви отримали')} "${trShop(achievement.name)}" ${trShop('та')} ${achievement.reward} ${trShop('монет')}!`);
  });
}

function buyWardrobeItem(itemId) {
  const item = findWardrobeItemById(itemId);
  if (!item) return;

  let modalState = null;
  let toastMessage = '';
  let unlockedAchievements = [];

  window.AppDB?.update?.((db) => {
    db.profile = db.profile || {};
    db.shop = db.shop || {};
    ensureCharacterDbState(db);

    const owned = new Set(db.character.owned);
    const coins = Number(db.profile.coins || 0);

    if (owned.has(item.id)) {
      toastMessage = `${trShop('Річ уже є у гардеробі')}: ${item.label}`;
      return;
    }

    if (coins < item.price) {
      modalState = {
        title: trShop('Недостатньо монет'),
        message: `${trShop('Потрібно')} ${item.price} ${trShop('монет')}, ${trShop('а зараз у вас')} ${coins}.`
      };
      return;
    }

    db.profile.coins = coins - item.price;
    db.character.owned = Array.from(new Set([...db.character.owned, item.id]));
    addToHistory(db, item.id, 'wardrobe', item.price);
    unlockedAchievements = updateAchievements(db, item.price);
    toastMessage = `${trShop('Куплено')}: ${item.label}`;
  });

  if (modalState) {
    showModal(modalState.title, modalState.message);
    return;
  }

  updateBalance();
  renderCurrentTab();
  if (toastMessage) showToast(toastMessage);
  unlockedAchievements.forEach((achievement) => {
    showModal(trShop('Досягнення'), `${trShop('Ви отримали')} "${trShop(achievement.name)}" ${trShop('та')} ${achievement.reward} ${trShop('монет')}!`);
  });
}

function buyAvatar(avatar) {
  let modalState = null;
  let toastMessage = '';
  let unlockedAchievements = [];

  window.AppDB?.update?.((db) => {
    db.profile = db.profile || {};
    db.shop = db.shop || {};
    db.shop.avatars = Array.isArray(db.shop.avatars) && db.shop.avatars.length ? db.shop.avatars : ['👨‍🎓', '👩‍🎓'];

    const owned = db.shop.avatars;
    const coins = Number(db.profile.coins || 0);

    if (owned.includes(avatar.emoji)) {
      db.profile.currentAvatar = avatar.emoji;
      db.profile.avatar = avatar.emoji;
      toastMessage = `${trShop('Активовано')}: ${trShop(avatar.name)}`;
      return;
    }

    if (coins < avatar.price) {
      modalState = {
        title: trShop('Недостатньо монет'),
        message: `${trShop('Для аватара потрібно')} ${avatar.price} ${trShop('монет')}.`
      };
      return;
    }

    db.profile.coins = coins - avatar.price;
    db.shop.avatars.push(avatar.emoji);
    db.profile.currentAvatar = avatar.emoji;
    db.profile.avatar = avatar.emoji;
    addToHistory(db, avatar.emoji, 'avatar', avatar.price);
    unlockedAchievements = updateAchievements(db, avatar.price);
    toastMessage = `${trShop('Новий аватар')}: ${trShop(avatar.name)}`;
  });

  if (modalState) {
    showModal(modalState.title, modalState.message);
    return;
  }

  updateBalance();
  renderCurrentTab();
  if (toastMessage) showToast(toastMessage);
  unlockedAchievements.forEach((achievement) => {
    showModal(trShop('Досягнення'), `${trShop('Ви отримали')} "${trShop(achievement.name)}" ${trShop('та')} ${achievement.reward} ${trShop('монет')}!`);
  });
}

function claimDaily() {
  let modalState = null;
  let toastMessage = '';
  let unlockedAchievements = [];

  window.AppDB?.update?.((db) => {
    db.profile = db.profile || {};
    db.shop = db.shop || {};

    const lastDaily = Number(db.shop.lastDaily || 0);
    const today = new Date().toDateString();
    const lastDate = new Date(lastDaily).toDateString();
    if (lastDate === today) {
      modalState = {
        title: trShop('Бонус уже отримано'),
        message: trShop('Поверніться завтра за новою нагородою.')
      };
      return;
    }

    const reward = 50;
    db.profile.coins = Number(db.profile.coins || 0) + reward;
    db.shop.lastDaily = Date.now();
    db.shop.dailyClaimCount = Number(db.shop.dailyClaimCount || 0) + 1;
    unlockedAchievements = updateAchievements(db, 0);
    toastMessage = `${trShop('Щоденний бонус')} +${reward}`;
  });

  if (modalState) {
    showModal(modalState.title, modalState.message);
    return;
  }

  updateBalance();
  renderCurrentTab();
  if (toastMessage) showToast(toastMessage);
  unlockedAchievements.forEach((achievement) => {
    showModal(trShop('Досягнення'), `${trShop('Ви отримали')} "${trShop(achievement.name)}" ${trShop('та')} ${achievement.reward} ${trShop('монет')}!`);
  });
}

function renderItems() {
  const coins = Number(getProfile().coins || 0);
  const ownedIds = getInventory().map((item) => item.id);
  let html = '<div class="products-grid">';
  shopItems.forEach((item) => {
    const owned = ownedIds.includes(item.id);
    html += `<article class="product-card">${owned ? `<div class="owned-badge">${t.owned}</div>` : ''}<div class="product-icon">${item.icon}</div><div class="product-name">${trShop(item.name)}</div><div class="product-desc">${trShop(item.desc)}</div><div class="product-price"><span>🪙</span><span>${item.price}</span></div><button class="buy-button" type="button" onclick='buyItem(${JSON.stringify(item)})' ${owned || coins < item.price ? 'disabled' : ''}>${owned ? t.bought : t.buy}</button></article>`;
  });
  html += '</div>';
  document.getElementById('shopContent').innerHTML = html;
}

function renderWardrobe() {
  const coins = Number(getProfile().coins || 0);
  const character = getCharacterState();
  const ownedIds = new Set(character.owned);
  let html = '<div class="products-grid">';

  wardrobeItems.forEach((item) => {
    const owned = ownedIds.has(item.id);
    html += `<article class="product-card">${owned ? `<div class="owned-badge">${t.owned}</div>` : ''}<div class="product-icon">${item.icon}</div><div class="product-name">${item.label}</div><div class="product-desc">${item.categoryLabel} • ${t.wardrobeHint}</div><div class="product-price"><span>🪙</span><span>${item.price}</span></div><button class="buy-button" type="button" onclick="buyWardrobeItem('${item.id}')" ${owned || coins < item.price ? 'disabled' : ''}>${owned ? t.alreadyInWardrobe : t.buy}</button></article>`;
  });

  html += '</div>';
  document.getElementById('shopContent').innerHTML = html;
}

function renderAvatars() {
  const owned = getAvatars();
  const currentAvatar = getProfile().currentAvatar;
  let html = '<div class="avatars-grid">';
  allAvatars.forEach((avatar) => {
    const hasAvatar = owned.includes(avatar.emoji);
    const current = currentAvatar === avatar.emoji;
    html += `<button class="avatar-item ${current ? 'selected' : ''}" type="button" onclick='buyAvatar(${JSON.stringify(avatar)})'>${hasAvatar ? '<div class="avatar-owned">✓</div>' : ''}<div class="avatar-emoji">${avatar.emoji}</div><div class="avatar-name">${trShop(avatar.name)}</div><div class="avatar-price">${avatar.price === 0 ? t.free : `🪙 ${avatar.price}`}</div></button>`;
  });
  html += '</div>';
  document.getElementById('shopContent').innerHTML = html;
}

function renderAchievements() {
  const unlocked = getAchievementsState();
  const shop = getShop();
  const totalSpent = Number(shop.totalSpent || 0);
  const purchaseCount = getPurchaseHistory().length;
  const dailyCount = Number(shop.dailyClaimCount || 0);
  const wardrobeCount = getCharacterState().owned.filter((itemId) => !defaultCharacterOwned.includes(itemId)).length;
  let html = '<div class="achievements-list">';
  achievements.forEach((achievement) => {
    let current = 0;
    if (achievement.id === 'first_purchase') current = purchaseCount;
    if (achievement.id === 'big_spender') current = totalSpent;
    if (achievement.id === 'collector') current = wardrobeCount;
    if (achievement.id === 'daily_champ') current = dailyCount;
    const progress = Math.min(100, (current / achievement.requirement) * 100);
    html += `<article class="achievement-item"><div class="achievement-icon">${achievement.icon}</div><div class="achievement-info"><div class="achievement-name">${trShop(achievement.name)}${unlocked.includes(achievement.id) ? ' ✓' : ''}</div><div class="achievement-desc">${trShop(achievement.desc)}</div><div class="achievement-progress"><div class="achievement-bar" style="width:${progress}%"></div></div><div class="achievement-desc">${current}/${achievement.requirement}</div></div><div class="achievement-reward">+${achievement.reward} 🪙</div></article>`;
  });
  html += '</div>';
  document.getElementById('shopContent').innerHTML = html;
}

function getHistoryLabel(entry) {
  if (entry.type === 'avatar') {
    return trShop(findAvatarByEmoji(entry.itemId)?.name || entry.itemId);
  }
  if (entry.type === 'wardrobe') {
    return findWardrobeItemById(entry.itemId)?.label || entry.itemId;
  }
  return trShop(findItemById(entry.itemId)?.name || entry.itemId);
}

function formatHistoryDate(timestamp) {
  const locale = lang === 'en' ? 'en-US' : 'uk-UA';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(timestamp));
}

function renderDaily() {
  const shop = getShop();
  const lastDaily = Number(shop.lastDaily || 0);
  const today = new Date().toDateString();
  const canClaim = new Date(lastDaily).toDateString() !== today;
  const history = getPurchaseHistory();
  let html = `<div class="daily-stack"><section class="daily-card"><div class="daily-icon">🎁</div><div class="daily-title">${trShop('Щоденний бонус')}</div><div class="daily-desc">${trShop('Забирайте нагороду щодня, щоб швидше відкривати нові предмети та одяг.')}</div><div class="daily-reward">+50 🪙</div><button class="claim-button" type="button" onclick="claimDaily()" ${!canClaim ? 'disabled' : ''}>${canClaim ? trShop('Отримати бонус') : trShop('Бонус уже забрано')}</button></section><section class="daily-card"><div class="daily-title">${trShop('Історія покупок')}</div><div class="daily-desc">${trShop('Останні придбання у вашому профілі.')}</div><div id="historyList"></div></section></div>`;
  document.getElementById('shopContent').innerHTML = html;
  const historyDiv = document.getElementById('historyList');
  if (!history.length) {
    historyDiv.innerHTML = `<div class="empty-history">${t.noPurchases}</div>`;
    return;
  }
  let historyHtml = '<div class="history-list">';
  history.slice().reverse().forEach((item) => {
    historyHtml += `<div class="history-item"><div class="history-icon">🛒</div><div class="history-details"><div class="history-name">${getHistoryLabel(item)}</div><div class="history-date">${formatHistoryDate(item.timestamp)}</div></div><div class="history-price">-${item.price} 🪙</div></div>`;
  });
  historyHtml += '</div>';
  historyDiv.innerHTML = historyHtml;
}

function renderCurrentTab() {
  const activeTab = document.querySelector('.tab.active').dataset.tab;
  const shopContent = document.getElementById('shopContent');
  if (shopContent) {
    shopContent.dataset.view = activeTab;
  }
  if (activeTab === 'items') renderItems();
  if (activeTab === 'wardrobe') renderWardrobe();
  if (activeTab === 'achievements') renderAchievements();
  if (activeTab === 'daily') renderDaily();
}

window.buyItem = buyItem;
window.buyWardrobeItem = buyWardrobeItem;
window.claimDaily = claimDaily;
window.closeModal = closeModal;

function initTabs() {
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tabNode) => tabNode.classList.remove('active'));
    tab.classList.add('active');
    renderCurrentTab();
  }));
}

function initBottomNav() {
  document.querySelectorAll('.bottom-nav__item').forEach((item) => item.addEventListener('click', () => {
    const navType = item.dataset.nav;
    document.querySelectorAll('.bottom-nav__item').forEach((el) => el.classList.remove('active'));
    item.classList.add('active');
    if (navType === 'home') window.location.href = '../index.html';
    if (navType === 'profile') window.location.href = 'character.html';
    if (navType === 'shop') window.location.href = 'shop.html';
    if (navType === 'settings') window.location.href = 'setting.html';
  }));
}

document.getElementById('backBtn').addEventListener('click', () => window.location.href = '../index.html');
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
const didMigrate = migrateLegacyLocalizedData();
updateBalance();
initTabs();
initBottomNav();
renderCurrentTab();
if (didMigrate) showToast(trShop('Міграцію локальних даних завершено'));

const shopTitleNode = document.querySelector('.page-title');
if (shopTitleNode && lang === 'en') shopTitleNode.textContent = t.shopTitle;
const tabNodes = document.querySelectorAll('.tab');
if (tabNodes[0]) tabNodes[0].textContent = t.items;
if (tabNodes[1]) tabNodes[1].textContent = t.wardrobe;
if (tabNodes[2]) tabNodes[2].textContent = t.achievements;
if (tabNodes[3]) tabNodes[3].textContent = t.daily;

window.addEventListener('click', (event) => {
  if (event.target.id === 'modal') {
    closeModal();
  }
});
