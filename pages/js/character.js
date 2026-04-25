(function () {
  const currentUser = window.AppDB?.getCurrentUser?.() || localStorage.getItem('user');
  if (!currentUser) {
    window.location.href = '../login.html';
    return;
  }

  const lang = window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
  const text = {
    uk: {
      defaultTitle: 'Категорія',
      defaultHint: 'Оберіть куплену річ, щоб застосувати її до персонажа.',
      ownedItems: 'елементів у гардеробі',
      active: 'Активно',
      available: 'Доступно',
      emptyTitle: 'У цій категорії ще немає куплених речей',
      emptyHint: 'Відкрий магазин, купи елемент у цій категорії і він одразу зʼявиться тут.',
      selected: 'Вибрано',
      ownedAria: 'власний',
      coins: 'монет',
      openShop: 'Ця річ доступна у магазині',
      alreadyActive: 'вже активний',
      selectedToast: 'Обрано',
      pageTitle: 'Персонаж',
      wardrobe: 'Гардероб'
    },
    en: {
      defaultTitle: 'Category',
      defaultHint: 'Choose a purchased item to apply it to the character.',
      ownedItems: 'items in wardrobe',
      active: 'Active',
      available: 'Available',
      emptyTitle: 'No purchased items in this category yet',
      emptyHint: 'Open the shop, buy an item in this category, and it will appear here right away.',
      selected: 'Selected',
      ownedAria: 'owned',
      coins: 'coins',
      openShop: 'This item is available in the shop',
      alreadyActive: 'is already active',
      selectedToast: 'Selected',
      pageTitle: 'Character',
      wardrobe: 'Wardrobe'
    }
  }[lang];
  const charMap = {
    'Шкіра': 'Skin',
    'Волосся': 'Hair',
    'Аксесуар': 'Accessory',
    'Одяг': 'Clothes',
    'Штани': 'Pants',
    'Взуття': 'Shoes',
    'Ефект': 'Effect',
    'Оновіть тон шкіри персонажа.': 'Adjust the character skin tone.',
    'Змініть колір зачіски.': 'Change the hair color.',
    'Додайте деталь до образу персонажа.': 'Add a detail to the character look.',
    'Підберіть верх під образ.': 'Choose the top for the look.',
    'Налаштуйте нижню частину образу.': 'Adjust the lower part of the look.',
    'Оберіть комфортне взуття.': 'Pick comfortable shoes.',
    'Додайте м’яке світіння навколо персонажа.': 'Add a soft glow around the character.'
  };
  const itemMap = {
    'Світлий': 'Light',
    'Бежевий': 'Beige',
    'Теплий': 'Warm',
    'Бурштин': 'Amber',
    'Глибокий': 'Deep',
    'Бронза': 'Bronze',
    'Пісок': 'Sand',
    'Какао': 'Cocoa',
    'Класика': 'Classic',
    'Темний': 'Dark',
    'Блонд': 'Blonde',
    'Мідний': 'Copper',
    'Синій': 'Blue',
    'Срібло': 'Silver',
    'Зелений': 'Green',
    'Слива': 'Plum',
    'Без аксесуару': 'No accessory',
    'Окуляри': 'Glasses',
    'Гарнітура': 'Headset',
    'Корона': 'Crown',
    'Візор': 'Visor',
    'Маска': 'Mask',
    'Марсала': 'Marsala',
    'Хвоя': 'Pine',
    'Графіт': 'Graphite',
    'Фіалка': 'Violet',
    'Пісочний': 'Sand',
    'Сталь': 'Steel',
    'Бірюза': 'Teal',
    'Нічні': 'Navy',
    'Сірі': 'Gray',
    'Чорні': 'Black',
    'Олива': 'Olive',
    'Кава': 'Coffee',
    'Азур': 'Azure',
    'Пурпур': 'Purple',
    'Вино': 'Wine',
    'Базові': 'Basic',
    'Туман': 'Mist',
    'Світлі': 'Light',
    'Рубін': 'Ruby',
    'Океан': 'Ocean',
    'Золото': 'Gold',
    'Лайм': 'Lime',
    'Аметист': 'Amethyst',
    'Без ефекту': 'No effect',
    'Лід': 'Ice',
    'Вогонь': 'Fire',
    'Сонце': 'Sun',
    'Ліс': 'Forest',
    'Плазма': 'Plasma',
    'Рожевий': 'Rose',
    'Неон': 'Neon'
  };
  function trChar(value) {
    return lang === 'en' ? (charMap[value] || value) : value;
  }
  function trItem(value) {
    return lang === 'en' ? (itemMap[value] || value) : value;
  }

  const STORAGE_KEY = 'characterPageStateV2';
  const categories = [
    { id: 'skin', side: 'left', label: 'Шкіра', hint: 'Оновіть тон шкіри персонажа.', icon: 'hand' },
    { id: 'hair', side: 'left', label: 'Волосся', hint: 'Змініть колір зачіски.', icon: 'hair' },
    { id: 'accessory', side: 'left', label: 'Аксесуар', hint: 'Додайте деталь до образу персонажа.', icon: 'accessory' },
    { id: 'shirt', side: 'left', label: 'Одяг', hint: 'Підберіть верх під образ.', icon: 'shirt' },
    { id: 'pants', side: 'right', label: 'Штани', hint: 'Налаштуйте нижню частину образу.', icon: 'pants' },
    { id: 'shoes', side: 'right', label: 'Взуття', hint: 'Оберіть комфортне взуття.', icon: 'shoes' },
    { id: 'extra', side: 'right', label: 'Ефект', hint: 'Додайте м’яке світіння навколо персонажа.', icon: 'spark' }
  ];

  const items = {
    skin: [
      { id: 'skin-soft', label: 'Світлий', value: '#f2bb7b', price: 0 },
      { id: 'skin-beige', label: 'Бежевий', value: '#e4ab72', price: 8 },
      { id: 'skin-warm', label: 'Теплий', value: '#cf9865', price: 10 },
      { id: 'skin-amber', label: 'Бурштин', value: '#bb7e55', price: 12 },
      { id: 'skin-deep', label: 'Глибокий', value: '#955c3c', price: 16 },
      { id: 'skin-bronze', label: 'Бронза', value: '#b17547', price: 15 },
      { id: 'skin-sand', label: 'Пісок', value: '#d5a06d', price: 11 },
      { id: 'skin-cocoa', label: 'Какао', value: '#7b4b32', price: 18 }
    ],
    hair: [
      { id: 'hair-classic', label: 'Класика', value: '#95694b', price: 0 },
      { id: 'hair-dark', label: 'Темний', value: '#3a2d2b', price: 12 },
      { id: 'hair-blonde', label: 'Блонд', value: '#c8a16c', price: 16 },
      { id: 'hair-copper', label: 'Мідний', value: '#a75f41', price: 18 },
      { id: 'hair-blue', label: 'Синій', value: '#4b66a8', price: 22 },
      { id: 'hair-silver', label: 'Срібло', value: '#a9afb8', price: 20 },
      { id: 'hair-green', label: 'Зелений', value: '#52785f', price: 19 },
      { id: 'hair-plum', label: 'Слива', value: '#755191', price: 21 }
    ],
    accessory: [
      { id: 'accessory-none', label: 'Без аксесуару', variant: 'none', color: 'transparent', accent: 'transparent', preview: '○', price: 0 },
      { id: 'accessory-glasses', label: 'Окуляри', variant: 'glasses', color: '#203247', accent: '#8fb9ff', preview: '◔', price: 14 },
      { id: 'accessory-headset', label: 'Гарнітура', variant: 'headset', color: '#3d4f77', accent: '#95d8ff', preview: '⌐', price: 16 },
      { id: 'accessory-crown', label: 'Корона', variant: 'crown', color: '#d2a43f', accent: '#fff0a8', preview: '▲', price: 18 },
      { id: 'accessory-visor', label: 'Візор', variant: 'visor', color: '#4c7ad2', accent: '#d6f0ff', preview: '▬', price: 17 },
      { id: 'accessory-mask', label: 'Маска', variant: 'mask', color: '#5d668f', accent: '#c4cbff', preview: '▭', price: 15 }
    ],
    shirt: [
      { id: 'shirt-red', label: 'Марсала', value: '#8a2d31', price: 0 },
      { id: 'shirt-blue', label: 'Синій', value: '#315ea4', price: 15 },
      { id: 'shirt-green', label: 'Хвоя', value: '#356346', price: 15 },
      { id: 'shirt-black', label: 'Графіт', value: '#262a31', price: 18 },
      { id: 'shirt-violet', label: 'Фіалка', value: '#604582', price: 17 },
      { id: 'shirt-sand', label: 'Пісочний', value: '#a86a39', price: 16 },
      { id: 'shirt-steel', label: 'Сталь', value: '#5c6573', price: 14 },
      { id: 'shirt-teal', label: 'Бірюза', value: '#2c7a82', price: 18 }
    ],
    pants: [
      { id: 'pants-navy', label: 'Нічні', value: '#27323e', price: 0 },
      { id: 'pants-gray', label: 'Сірі', value: '#515b66', price: 13 },
      { id: 'pants-black', label: 'Чорні', value: '#181e25', price: 14 },
      { id: 'pants-olive', label: 'Олива', value: '#4c5644', price: 14 },
      { id: 'pants-coffee', label: 'Кава', value: '#5e4739', price: 13 },
      { id: 'pants-azure', label: 'Азур', value: '#3d6190', price: 16 },
      { id: 'pants-plum', label: 'Пурпур', value: '#584977', price: 17 },
      { id: 'pants-wine', label: 'Вино', value: '#6f3339', price: 17 }
    ],
    shoes: [
      { id: 'shoes-black', label: 'Базові', value: '#151d25', price: 0 },
      { id: 'shoes-gray', label: 'Туман', value: '#404852', price: 8 },
      { id: 'shoes-white', label: 'Світлі', value: '#d9dde3', price: 10 },
      { id: 'shoes-red', label: 'Рубін', value: '#8b333a', price: 12 },
      { id: 'shoes-blue', label: 'Океан', value: '#3563a6', price: 12 },
      { id: 'shoes-gold', label: 'Золото', value: '#c59a35', price: 18 },
      { id: 'shoes-green', label: 'Лайм', value: '#3d714e', price: 12 },
      { id: 'shoes-purple', label: 'Аметист', value: '#6a53a1', price: 14 }
    ],
    extra: [
      { id: 'extra-soft', label: 'Без ефекту', value: 'transparent', price: 0 },
      { id: 'extra-ice', label: 'Лід', value: '#78a8ff', price: 10 },
      { id: 'extra-fire', label: 'Вогонь', value: '#ff7c56', price: 12 },
      { id: 'extra-gold', label: 'Сонце', value: '#f5c14f', price: 12 },
      { id: 'extra-forest', label: 'Ліс', value: '#64b27d', price: 10 },
      { id: 'extra-plasma', label: 'Плазма', value: '#9a79ff', price: 14 },
      { id: 'extra-rose', label: 'Рожевий', value: '#ff7daa', price: 12 },
      { id: 'extra-night', label: 'Неон', value: '#5fd4ff', price: 14 }
    ]
  };

  const defaultState = {
    activeCategory: 'skin',
    coins: 125,
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

  const femaleDefaultState = {
    ...defaultState,
    selected: {
      ...defaultState.selected,
      hair: 'hair-blonde',
      shirt: 'shirt-violet',
      shoes: 'shoes-white'
    },
    owned: ['skin-soft', 'hair-blonde', 'accessory-none', 'shirt-violet', 'pants-navy', 'shoes-white', 'extra-soft']
  };

  function normalizeGender(value) {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (normalizedValue === 'female' || normalizedValue === 'жінка') return 'female';
    if (normalizedValue === 'male' || normalizedValue === 'чоловік') return 'male';
    return 'unknown';
  }

  function getDefaultStateForGender(gender) {
    const template = normalizeGender(gender) === 'female' ? femaleDefaultState : defaultState;
    return {
      ...template,
      selected: { ...template.selected },
      owned: [...template.owned]
    };
  }

  const icons = {
    hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.7 11.9V5.5a1.4 1.4 0 1 1 2.8 0v4.3h.8V4.6a1.4 1.4 0 1 1 2.8 0v5.2h.8V5.8a1.4 1.4 0 1 1 2.8 0v6.7c0 4-2.7 7.2-6.2 7.2h-2.3a5 5 0 0 1-5-5v-2a1.4 1.4 0 1 1 2.8 0v1h.7z"/></svg>',
    hair: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.7c4.7 0 7.6 2.8 7.6 6.8v1.4h-2v-1.1c0-2.1-1.4-3.8-3.8-4.4-.4 1.5-1.5 2.2-3.8 2.5-1.1.1-2 .4-2.8.8-1 .5-1.6 1.3-1.7 2.2v3H3.4v-3.3c0-4.7 3.2-7.9 8.6-7.9z"/></svg>',
    accessory: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a3 3 0 0 1 3-3h2.4l1.3 1.4h2.6L14.6 9H17a3 3 0 1 1 0 6h-2.4l-1.3-1.4h-2.6L9.4 15H7a3 3 0 0 1-3-3zm3-1.2a1.2 1.2 0 1 0 0 2.4h2.7l1.4-1.2-1.4-1.2zm10 0h-2.7l-1.4 1.2 1.4 1.2H17a1.2 1.2 0 1 0 0-2.4z"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 4h5.6l2.3 2.2 2.9 1.5-2 4.4-2.3-.9v8.7H8.3v-8.7l-2.3.9-2-4.4 2.9-1.5z"/></svg>',
    pants: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10l-1.2 7.7 1.3 8.3h-4l-.9-6.2L11.3 20h-4l1.3-8.3z"/></svg>',
    shoes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15.5h6.1l2.2 1.7c.6.5 1.4.8 2.2.8H20V20H4zm9.4-5.4 1.4 4H20v2h-6.6c-1 0-1.9-.3-2.7-.9l-2.4-1.8H4v-2.3h6.3l1.4-4.1z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zm6 11 1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1zM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8z"/></svg>'
  };

  const elements = {
    leftTools: document.getElementById('leftTools'),
    rightTools: document.getElementById('rightTools'),
    itemsGrid: document.getElementById('itemsGrid'),
    coinBalance: document.getElementById('coinBalance'),
    categoryTitle: document.getElementById('categoryTitle'),
    categoryHint: document.getElementById('categoryHint'),
    profileName: document.getElementById('profileName'),
    profileStatus: document.getElementById('profileStatus'),
    avatarPreview: document.getElementById('avatarPreview'),
    avatarAccessory: document.getElementById('avatarAccessory'),
    toast: document.getElementById('toast'),
    backBtn: document.getElementById('backBtn'),
    avatarAuraLeft: document.getElementById('avatarAuraLeft'),
    avatarAuraRight: document.getElementById('avatarAuraRight')
  };

  let toastTimer = null;
  const state = loadState();

  function loadState() {
    const db = window.AppDB?.getData?.() || {};
    const profile = db.profile || {};
    const character = db.character || {};
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    const userName = profile.name || localStorage.getItem('userName') || currentUser || 'Авантюрист';
    const gender = normalizeGender(profile.gender);
    const genderDefaultState = getDefaultStateForGender(gender);
    const base = {
      ...genderDefaultState,
      selected: { ...genderDefaultState.selected },
      owned: [...genderDefaultState.owned],
      gender,
      profileName: userName
    };

    if (saved) {
      base.activeCategory = saved.activeCategory || base.activeCategory;
      base.selected = { ...base.selected, ...(saved.selected || {}) };
      base.owned = Array.isArray(saved.owned) ? [...base.owned, ...saved.owned] : base.owned;
    }

    if (character && typeof character === 'object') {
      base.activeCategory = character.activeCategory || base.activeCategory;
      base.selected = { ...base.selected, ...(character.selected || {}) };
      base.owned = Array.isArray(character.owned) ? [...base.owned, ...character.owned] : base.owned;
    }

    base.coins = Number.isFinite(Number(profile.coins)) ? Number(profile.coins) : base.coins;

    base.owned = Array.from(new Set(base.owned));
    return base;
  }

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState() {
    const payload = {
      activeCategory: state.activeCategory,
      selected: state.selected,
      owned: Array.from(new Set(state.owned))
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    window.AppDB?.update?.((db) => {
      db.character = {
        ...(db.character || {}),
        ...payload
      };
    });
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('is-visible');
    }, 1700);
  }

  function getCategoryMeta(categoryId) {
    return categories.find((category) => category.id === categoryId);
  }

  function getItem(categoryId, itemId) {
    return (items[categoryId] || []).find((item) => item.id === itemId);
  }

  function isOwned(itemId) {
    return state.owned.includes(itemId);
  }

  function renderToolbars() {
    elements.leftTools.innerHTML = '';
    elements.rightTools.innerHTML = '';

    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `tool-button${state.activeCategory === category.id ? ' is-active' : ''}`;
      button.setAttribute('aria-label', trChar(category.label));
      button.title = trChar(category.label);
      button.innerHTML = `${icons[category.icon] || ''}<span class="tool-button__label">${trChar(category.label)}</span>`;
      button.addEventListener('click', () => {
        state.activeCategory = category.id;
        saveState();
        renderToolbars();
        renderItems();
      });

      if (category.side === 'left') {
        elements.leftTools.appendChild(button);
      } else {
        elements.rightTools.appendChild(button);
      }
    });
  }

  function createPreview(categoryId, item) {
    const preview = document.createElement('div');
    preview.className = 'item-card__preview';

    const shape = document.createElement('div');
    shape.className = 'item-card__shape';
    if (categoryId === 'accessory') {
      shape.classList.add('item-card__shape--accessory');
      shape.textContent = item.preview || '○';
    } else if (categoryId === 'skin' || categoryId === 'hair') {
      shape.classList.add('item-card__shape--circle');
    } else if (categoryId === 'shoes') {
      shape.classList.add('item-card__shape--line');
    } else {
      shape.classList.add('item-card__shape--square');
    }
    if (categoryId !== 'accessory') {
      shape.style.background = item.value;
    }
    preview.appendChild(shape);

    return preview;
  }

  function renderItems() {
    const category = getCategoryMeta(state.activeCategory);
    const categoryItems = (items[state.activeCategory] || []).filter((item) => isOwned(item.id));

    elements.categoryTitle.textContent = category ? trChar(category.label) : text.defaultTitle;
    elements.categoryHint.textContent = category ? trChar(category.hint) : text.defaultHint;
    elements.itemsGrid.innerHTML = '';

    if (!categoryItems.length) {
      elements.itemsGrid.innerHTML = `
        <div class="inventory-empty">
          <div class="inventory-empty__icon">🛍️</div>
          <div class="inventory-empty__title">${text.emptyTitle}</div>
          <div class="inventory-empty__hint">${text.emptyHint}</div>
        </div>
      `;
      window.AppEnhancements?.refresh?.();
      return;
    }

    categoryItems.forEach((item) => {
      const selectedId = state.selected[state.activeCategory];
      const active = selectedId === item.id;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `item-card is-owned${active ? ' is-active' : ''}`;
      card.setAttribute('aria-label', `${trItem(item.label)} ${text.ownedAria}`);
      card.appendChild(createPreview(state.activeCategory, item));

      const label = document.createElement('div');
      label.className = 'item-card__label';
      label.textContent = trItem(item.label);
      card.appendChild(label);

      const price = document.createElement('div');
      price.className = 'item-card__price';
      price.textContent = active ? text.active : text.available;
      card.appendChild(price);

      if (active) {
        const badge = document.createElement('div');
        badge.className = 'item-card__badge';
        badge.textContent = text.selected;
        card.appendChild(badge);
      }

      card.addEventListener('click', () => onItemSelect(state.activeCategory, item.id));
      elements.itemsGrid.appendChild(card);
    });

    window.AppEnhancements?.refresh?.();
  }

  function applyAvatar() {
    const skin = getItem('skin', state.selected.skin)?.value || '#f2bb7b';
    const hair = getItem('hair', state.selected.hair)?.value || '#95694b';
    const accessory = getItem('accessory', state.selected.accessory) || items.accessory[0];
    const shirt = getItem('shirt', state.selected.shirt)?.value || '#8a2d31';
    const pants = getItem('pants', state.selected.pants)?.value || '#27323e';
    const shoes = getItem('shoes', state.selected.shoes)?.value || '#151d25';
    const extra = getItem('extra', state.selected.extra)?.value || 'transparent';

    document.documentElement.style.setProperty('--skin-color', skin);
    document.documentElement.style.setProperty('--hair-color', hair);
    document.documentElement.style.setProperty('--accessory-color', accessory?.color || 'transparent');
    document.documentElement.style.setProperty('--accessory-shine', accessory?.accent || 'transparent');
    document.documentElement.style.setProperty('--shirt-color', shirt);
    document.documentElement.style.setProperty('--pants-color', pants);
    document.documentElement.style.setProperty('--shoe-color', shoes);
    document.documentElement.style.setProperty('--accent-color', extra);

    if (elements.avatarAccessory) {
      const variant = accessory?.variant || 'none';
      elements.avatarAccessory.dataset.variant = variant;
      elements.avatarAccessory.classList.toggle('is-visible', variant !== 'none');
    }

    const glow = extra === 'transparent' ? 'transparent' : `${extra}55`;
    const shadow = extra === 'transparent' ? 'transparent' : `${extra}aa`;
    elements.avatarAuraLeft.style.background = glow;
    elements.avatarAuraRight.style.background = glow;
    elements.avatarAuraLeft.style.boxShadow = `0 0 14px ${shadow}`;
    elements.avatarAuraRight.style.boxShadow = `0 0 14px ${shadow}`;

    const profile = window.AppDB?.getData?.()?.profile || {};
    const gender = normalizeGender(profile.gender);
    elements.avatarPreview?.classList.toggle('avatar-figure--female', gender === 'female');
    document.body.classList.toggle('character-page--female', gender === 'female');
    elements.coinBalance.textContent = String(Number(profile.coins || state.coins || 125));
    elements.profileName.textContent = profile.name || localStorage.getItem('userName') || state.profileName;
    elements.profileStatus.textContent = `${countOwnedItems()} ${text.ownedItems}`;
  }

  function countOwnedItems() {
    return Array.from(new Set(state.owned)).length;
  }

  function onItemSelect(categoryId, itemId) {
    const item = getItem(categoryId, itemId);
    if (!item) {
      return;
    }

    if (!isOwned(item.id)) {
      showToast(text.openShop);
      return;
    } else if (state.selected[categoryId] === item.id) {
      showToast(`${trItem(item.label)} ${text.alreadyActive}`);
      return;
    } else {
      showToast(`${text.selectedToast}: ${trItem(item.label)}`);
    }

    state.selected[categoryId] = item.id;
    saveState();
    applyAvatar();
    renderItems();
  }

  function bindNavigation() {
    elements.backBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });

    document.querySelectorAll('.bottom-nav__item').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.nav;
        if (target === 'home') {
          window.location.href = '../index.html';
        } else if (target === 'profile') {
          window.location.href = 'character.html';
        } else if (target === 'settings') {
          window.location.href = 'setting.html';
        } else if (target === 'shop') {
          window.location.href = 'shop.html';
        }
      });
    });
  }

  function init() {
    const title = document.querySelector('.topbar__title');
    if (title && lang === 'en') title.textContent = text.pageTitle;
    const wardrobe = document.querySelector('.inventory-panel__eyebrow');
    if (wardrobe && lang === 'en') wardrobe.textContent = text.wardrobe;
    renderToolbars();
    renderItems();
    applyAvatar();
    bindNavigation();
  }

  init();
})();
