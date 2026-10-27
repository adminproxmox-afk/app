(function () {
  'use strict';

  const TOTAL_REWARD = { xp: 90, coins: 83 };
  const LEVEL_REWARDS = [
    { xp: 4, coins: 4 },
    { xp: 5, coins: 5 },
    { xp: 7, coins: 7 },
    { xp: 8, coins: 7 },
    { xp: 9, coins: 8 },
    { xp: 10, coins: 9 },
    { xp: 10, coins: 9 },
    { xp: 11, coins: 10 },
    { xp: 12, coins: 11 },
    { xp: 14, coins: 13 }
  ];

  const TAGS = {
    html: { text: '', attrs: [] },
    head: { text: '', attrs: [] },
    title: { text: 'FinWay', attrs: [] },
    body: { text: '', attrs: [] },
    header: { text: '', attrs: [] },
    main: { text: '', attrs: [] },
    footer: { text: 'FinWay. Навчайся через дію.', attrs: [] },
    nav: { text: '', attrs: [] },
    section: { text: '', attrs: [] },
    div: { text: '', attrs: [] },
    h1: { text: 'FinWay', attrs: [] },
    h2: { text: 'HTML-місія', attrs: [] },
    h3: { text: 'Картка навички', attrs: [] },
    p: { text: 'Коротко опиши, що побачить студент.', attrs: [] },
    img: { text: '', attrs: ['src', 'alt'], void: true },
    a: { text: 'Перейти', attrs: ['href'] },
    ul: { text: '', attrs: [] },
    li: { text: 'HTML-блок', attrs: [] },
    button: { text: 'Готово', attrs: [] }
  };

  const TEXT_TAGS = new Set(['title', 'h1', 'h2', 'h3', 'p', 'a', 'li', 'button', 'footer']);
  const VOID_TAGS = new Set(['img', 'meta', 'link', 'br', 'hr', 'input']);
  const CONTAINER_TAGS = new Set(['html', 'head', 'body', 'header', 'main', 'footer', 'nav', 'section', 'div', 'ul']);
  const BODY_CHILDREN = ['header', 'main', 'footer', 'nav', 'section', 'div', 'h1', 'h2', 'h3', 'p', 'img', 'a', 'ul', 'button'];
  const RULES = {
    html: ['head', 'body'],
    head: ['title'],
    body: BODY_CHILDREN,
    header: ['nav', 'h1', 'h2', 'p', 'a', 'div', 'img'],
    main: ['section', 'div', 'h1', 'h2', 'h3', 'p', 'img', 'a', 'ul', 'button'],
    footer: ['p', 'a', 'nav', 'div'],
    nav: ['a'],
    section: ['h2', 'h3', 'p', 'button', 'img', 'a', 'ul', 'div', 'section'],
    div: ['h2', 'h3', 'p', 'button', 'img', 'a', 'ul', 'div', 'section'],
    ul: ['li']
  };

  const LEVELS = [
    {
      badge: 'Місія 01 · Старт',
      title: 'Каркас сторінки',
      scene: 'Запусти порожній документ FinWay.',
      task: 'Додай <html>, а всередину нього <head> і <body>. У <head> поклади <title>.',
      hint: 'Перетягни <html> у поле. Потім кидай <head> і <body> всередину нього.',
      tags: ['html', 'head', 'title', 'body'],
      validate: () => {
        const html = first('html');
        const head = child(html, 'head');
        const body = child(html, 'body');
        const title = child(head, 'title');
        return [
          !html && 'Немає тегу <html>.',
          html && !head && '<head> має бути всередині <html>.',
          html && !body && '<body> має бути всередині <html>.',
          head && !title && '<title> має бути всередині <head>.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 02 · Голос',
      title: 'Заголовок і текст',
      scene: 'Дай сторінці перший зміст.',
      task: 'Додай <h1> і <p>. Якщо є <body>, поклади їх всередину.',
      hint: 'Робоча зона може бути простим body для маленьких рівнів.',
      tags: ['body', 'h1', 'p'],
      validate: () => {
        const body = first('body');
        const host = body || { children: state.tree };
        return [
          !descendantOrChild(host, 'h1') && 'Додай <h1>.',
          !descendantOrChild(host, 'p') && 'Додай <p>.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 03 · Скелет',
      title: 'Структура сторінки',
      scene: 'Розділи сторінку на верх, центр і низ.',
      task: 'Додай три блоки: <header>, <main>, <footer>.',
      hint: 'Кинь блоки поруч у робочій зоні або всередину <body>.',
      tags: ['header', 'main', 'footer'],
      validate: () => [
        !first('header') && 'Немає тегу <header>.',
        !first('main') && 'Немає тегу <main>.',
        !first('footer') && 'Немає тегу <footer>.'
      ].filter(Boolean)
    },
    {
      badge: 'Місія 04 · Візуал',
      title: 'Зображення',
      scene: 'Додай картинку, яку браузер зможе прочитати.',
      task: 'Додай <img> з src і alt.',
      hint: 'У <img> вже є стартові атрибути. Їх можна змінити через ✎.',
      tags: ['img'],
      validate: () => {
        const img = first('img');
        return [
          !img && 'Немає тегу <img>.',
          img && !textValue(img.attrs.src) && 'Картинка має мати src.',
          img && !textValue(img.attrs.alt) && 'Картинка має мати alt.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 05 · Перехід',
      title: 'Посилання',
      scene: 'Створи шлях на іншу сторінку.',
      task: 'Додай <a> з href і текстом.',
      hint: 'Текст і href редагуються через ✎.',
      tags: ['a'],
      validate: () => {
        const link = first('a');
        return [
          !link && 'Немає тегу <a>.',
          link && !textValue(link.attrs.href) && '<a> має мати href.',
          link && !textValue(link.text) && '<a> має мати текст.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 06 · Список',
      title: 'Список',
      scene: 'Збери три короткі пункти навчального плану.',
      task: 'Створи <ul> і додай у нього 3 <li>.',
      hint: '<li> можна кидати тільки всередину <ul>.',
      tags: ['ul', 'li'],
      validate: () => {
        const ul = first('ul');
        const items = children(ul, 'li');
        return [
          !ul && 'Немає тегу <ul>.',
          ul && items.length < 3 && 'Додай хоча б 3 пункти <li>.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 07 · Навігація',
      title: 'Навігація',
      scene: 'Зроби меню з двома переходами.',
      task: 'Додай <nav> і два посилання <a>.',
      hint: 'Посилання мають бути всередині <nav>.',
      tags: ['nav', 'a'],
      validate: () => {
        const nav = first('nav');
        const links = descendants(nav, 'a');
        return [
          !nav && 'Немає тегу <nav>.',
          nav && links.length < 2 && 'Додай у <nav> два посилання <a>.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 08 · Секція',
      title: 'Секція курсу',
      scene: 'Оформи один блок майбутнього курсу.',
      task: 'Збери <section> з <h2>, <p> і <button>.',
      hint: 'Кинь <h2>, <p> і <button> всередину секції.',
      tags: ['section', 'h2', 'p', 'button'],
      validate: () => {
        const section = first('section');
        return [
          !section && 'Немає тегу <section>.',
          section && !child(section, 'h2') && 'У <section> немає <h2>.',
          section && !child(section, 'p') && 'У <section> немає <p>.',
          section && !child(section, 'button') && 'У <section> немає <button>.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 09 · Картка',
      title: 'Картка',
      scene: 'Побудуй компактну картку навички.',
      task: 'Зроби <div>-картку з <h3>, <p> і <button>.',
      hint: 'Всі три елементи мають бути всередині <div>.',
      tags: ['div', 'h3', 'p', 'button'],
      validate: () => {
        const card = all('div').find((node) => child(node, 'h3') || child(node, 'p') || child(node, 'button')) || first('div');
        return [
          !card && 'Немає тегу <div>.',
          card && !child(card, 'h3') && 'У картці немає <h3>.',
          card && !child(card, 'p') && 'У картці немає <p>.',
          card && !child(card, 'button') && 'У картці немає <button>.'
        ].filter(Boolean);
      }
    },
    {
      badge: 'Місія 10 · Фінал',
      title: 'Міні-сторінка FinWay',
      scene: 'Склади маленьку сторінку FinWay.',
      task: 'Збери сторінку: <header>, <main>, <section> у main, <footer>.',
      hint: 'У <section> додай хоча б <h2> і <p>.',
      tags: ['header', 'main', 'section', 'h2', 'p', 'footer'],
      validate: () => {
        const header = first('header');
        const main = first('main');
        const section = descendant(main, 'section');
        const footer = first('footer');
        return [
          !header && 'Немає тегу <header>.',
          !main && 'Немає тегу <main>.',
          main && !section && '<section> має бути всередині <main>.',
          section && !descendantOrChild(section, 'h2') && 'У <section> немає <h2>.',
          section && !descendantOrChild(section, 'p') && 'У <section> немає <p>.',
          !footer && 'Немає тегу <footer>.'
        ].filter(Boolean);
      }
    }
  ];

  const APP_ROOT_PREFIX = '../../../../../../../';
  const userId = getUserId();
  const storagePrefix = `htmlCrashCourseDnd:${userId}:`;
  const state = loadState();
  let selectedId = null;
  let editorNode = null;
  let dragged = null;
  let reviewingCompletedCourse = false;
  let nodeSeq = Date.now();

  const els = {
    game: document.getElementById('game'),
    levelMeta: document.getElementById('levelMeta'),
    xpValue: document.getElementById('xpValue'),
    coinValue: document.getElementById('coinValue'),
    progressFill: document.getElementById('progressFill'),
    levelTabs: document.getElementById('levelTabs'),
    taskTitle: document.getElementById('taskTitle'),
    missionBadge: document.getElementById('missionBadge'),
    missionReward: document.getElementById('missionReward'),
    missionLine: document.getElementById('missionLine'),
    taskText: document.getElementById('taskText'),
    taskHint: document.getElementById('taskHint'),
    neededTags: document.getElementById('neededTags'),
    tagGrid: document.getElementById('tagGrid'),
    targetName: document.getElementById('targetName'),
    workspace: document.getElementById('workspace'),
    emptyState: document.getElementById('emptyState'),
    previewFrame: document.getElementById('previewFrame'),
    codeOutput: document.getElementById('codeOutput'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    feedback: document.getElementById('feedback'),
    checkBtn: document.getElementById('checkBtn'),
    nextBtn: document.getElementById('nextBtn'),
    clearBtn: document.getElementById('clearBtn'),
    selectRootBtn: document.getElementById('selectRootBtn'),
    finishScreen: document.getElementById('finishScreen'),
    finishXp: document.getElementById('finishXp'),
    finishCoins: document.getElementById('finishCoins'),
    replayBtn: document.getElementById('replayBtn'),
    homeBtn: document.getElementById('homeBtn'),
    backBtn: document.getElementById('backBtn'),
    editor: document.getElementById('editor'),
    editorTitle: document.getElementById('editorTitle'),
    editorFields: document.getElementById('editorFields'),
    saveEditorBtn: document.getElementById('saveEditorBtn')
  };

  function getUserId() {
    try {
      return window.AppDB?.getCurrentUser?.() || window.parent?.AppDB?.getCurrentUser?.() || 'guest';
    } catch {
      return 'guest';
    }
  }

  function key(name) {
    return `${storagePrefix}${name}`;
  }

  function safeJson(keyName, fallback) {
    try {
      const raw = localStorage.getItem(keyName);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      try { localStorage.removeItem(keyName); } catch {}
      return fallback;
    }
  }

  function normalizeCompleted(value) {
    return Array.from(new Set((Array.isArray(value) ? value : [])
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item >= 0 && item < LEVELS.length)))
      .sort((left, right) => left - right);
  }

  function normalizeLevel(value, completed) {
    const parsed = Number.parseInt(value, 10);
    const latest = completed.length >= LEVELS.length ? LEVELS.length - 1 : completed.length;
    if (!Number.isInteger(parsed)) return Math.min(latest, LEVELS.length - 1);
    return Math.min(Math.max(parsed, 0), Math.min(latest, LEVELS.length - 1));
  }

  function loadState() {
    const completed = normalizeCompleted(safeJson(key('completedLevels'), []));
    const currentLevel = normalizeLevel(localStorage.getItem(key('currentLevel')), completed);
    return {
      currentLevel,
      completedLevels: completed,
      earnedXp: Math.max(0, Number.parseInt(localStorage.getItem(key('earnedXp')), 10) || rewardSum(completed).xp),
      courseCompleted: localStorage.getItem(key('courseCompleted')) === 'true' || completed.length === LEVELS.length,
      rewardsSynced: localStorage.getItem(key('rewardsSynced')) === 'true',
      tree: loadTree(currentLevel)
    };
  }

  function saveState() {
    try {
      localStorage.setItem(key('currentLevel'), String(state.currentLevel));
      localStorage.setItem(key('completedLevels'), JSON.stringify(normalizeCompleted(state.completedLevels)));
      localStorage.setItem(key('earnedXp'), String(Math.max(0, state.earnedXp || 0)));
      localStorage.setItem(key('courseCompleted'), String(Boolean(state.courseCompleted)));
      localStorage.setItem(key('rewardsSynced'), String(Boolean(state.rewardsSynced)));
    } catch {}
  }

  function rewardSum(levels) {
    return levels.reduce((sum, levelIndex) => ({
      xp: sum.xp + (LEVEL_REWARDS[levelIndex]?.xp || 0),
      coins: sum.coins + (LEVEL_REWARDS[levelIndex]?.coins || 0)
    }), { xp: 0, coins: 0 });
  }

  function treeKey(levelIndex = state.currentLevel) {
    return key(`tree:${levelIndex}`);
  }

  function loadTree(levelIndex) {
    const parsed = safeJson(treeKey(levelIndex), []);
    return normalizeTree(Array.isArray(parsed) ? parsed : []);
  }

  function saveTree() {
    try {
      localStorage.setItem(treeKey(), JSON.stringify(state.tree));
    } catch {}
  }

  function normalizeTree(nodes) {
    return nodes
      .filter((node) => node && TAGS[node.tag])
      .map((node) => ({
        id: String(node.id || nextId()),
        tag: node.tag,
        text: typeof node.text === 'string' ? node.text : defaultText(node.tag),
        attrs: normalizeAttrs(node.tag, node.attrs),
        children: canHaveChildren(node.tag) ? normalizeTree(Array.isArray(node.children) ? node.children : []) : []
      }));
  }

  function normalizeAttrs(tag, attrs = {}) {
    const result = {};
    (TAGS[tag]?.attrs || []).forEach((name) => {
      result[name] = typeof attrs[name] === 'string' && attrs[name].trim()
        ? attrs[name]
        : defaultAttr(tag, name);
    });
    return result;
  }

  function defaultText(tag) {
    return TAGS[tag]?.text || '';
  }

  function defaultAttr(tag, name) {
    if (tag === 'img' && name === 'src') return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
    if (tag === 'img' && name === 'alt') return 'Ноутбук з кодом';
    if (tag === 'a' && name === 'href') return 'https://techlifeacademys.pp.ua';
    return '';
  }

  function nextId() {
    nodeSeq += 1;
    return `node-${nodeSeq}`;
  }

  function makeNode(tag) {
    return {
      id: nextId(),
      tag,
      text: defaultText(tag),
      attrs: normalizeAttrs(tag),
      children: []
    };
  }

  function walk(nodes = state.tree, list = []) {
    nodes.forEach((node) => {
      list.push(node);
      walk(node.children, list);
    });
    return list;
  }

  function all(tag) {
    return walk().filter((node) => node.tag === tag);
  }

  function first(tag) {
    return all(tag)[0] || null;
  }

  function child(parent, tag) {
    return parent?.children?.find((node) => node.tag === tag) || null;
  }

  function children(parent, tag) {
    return parent?.children?.filter((node) => node.tag === tag) || [];
  }

  function descendant(parent, tag) {
    return parent ? walk(parent.children, []).find((node) => node.tag === tag) || null : null;
  }

  function descendants(parent, tag) {
    return parent ? walk(parent.children, []).filter((node) => node.tag === tag) : [];
  }

  function descendantOrChild(parent, tag) {
    return child(parent, tag) || descendant(parent, tag);
  }

  function findNode(id, nodes = state.tree) {
    for (const node of nodes) {
      if (node.id === id) return node;
      const nested = findNode(id, node.children);
      if (nested) return nested;
    }
    return null;
  }

  function findParentInfo(id, nodes = state.tree, parent = null, list = state.tree) {
    for (const node of nodes) {
      if (node.id === id) return { node, parent, list };
      const nested = findParentInfo(id, node.children, node, node.children);
      if (nested) return nested;
    }
    return null;
  }

  function isDescendant(node, targetId) {
    return Boolean(node?.children?.some((childNode) => childNode.id === targetId || isDescendant(childNode, targetId)));
  }

  function detachNode(id) {
    const info = findParentInfo(id);
    if (!info) return null;
    const index = info.list.findIndex((node) => node.id === id);
    if (index < 0) return null;
    return info.list.splice(index, 1)[0];
  }

  function removeNode(id) {
    const removed = detachNode(id);
    return Boolean(removed);
  }

  function textValue(value) {
    return String(value || '').trim();
  }

  function canHaveChildren(tag) {
    return CONTAINER_TAGS.has(tag) && !VOID_TAGS.has(tag);
  }

  function rootCanAccept(tag, movingId = '') {
    if (tag === 'html') return !first('html') || first('html')?.id === movingId;
    if (tag === 'head' || tag === 'title' || tag === 'li') return false;
    return BODY_CHILDREN.includes(tag) || tag === 'body';
  }

  function canContain(parent, tag, movingId = '') {
    if (!parent) return rootCanAccept(tag, movingId);
    if (!canHaveChildren(parent.tag)) return false;
    if (parent.id === movingId) return false;
    if (tag === 'html') return false;
    if ((tag === 'head' || tag === 'body') && parent.tag !== 'html') return false;
    if (tag === 'title' && parent.tag !== 'head') return false;
    if (tag === 'li' && parent.tag !== 'ul') return false;
    return (RULES[parent.tag] || []).includes(tag);
  }

  function getDropProblem(parent, nodeOrTag) {
    const tag = typeof nodeOrTag === 'string' ? nodeOrTag : nodeOrTag?.tag;
    const movingId = typeof nodeOrTag === 'string' ? '' : nodeOrTag?.id;
    if (!tag) return 'Невідомий тег.';
    if (parent && movingId && isDescendant(nodeOrTag, parent.id)) return 'Не можна вставити блок у самого себе.';
    if (!parent && tag === 'html' && first('html') && first('html').id !== movingId) return '<html> може бути тільки один.';
    if (canContain(parent, tag, movingId)) return '';
    if (tag === 'li') return '<li> можна кидати тільки в <ul>.';
    if (tag === 'head' || tag === 'body') return `<${tag}> має бути всередині <html>.`;
    if (tag === 'title') return '<title> має бути всередині <head>.';
    if (parent && VOID_TAGS.has(parent.tag)) return `<${parent.tag}> не має дітей.`;
    return `Не можна додати <${tag}> сюди.`;
  }

  function smartParentId(tag) {
    let info = selectedId ? findParentInfo(selectedId) : null;
    while (info?.node) {
      if (!getDropProblem(info.node, tag)) return info.node.id;
      info = info.parent ? findParentInfo(info.parent.id) : null;
    }
    return '';
  }

  function addNode(tag, parentId = selectedId) {
    const parent = parentId ? findNode(parentId) : null;
    const problem = getDropProblem(parent, tag);
    if (problem) {
      setFeedback('err', problem);
      pulseDrop(parentId);
      return false;
    }

    const node = makeNode(tag);
    if (parent) parent.children.push(node);
    else state.tree.push(node);
    selectedId = canHaveChildren(node.tag) ? node.id : (parent?.id || null);
    saveTree();
    render();
    setFeedback('idle', `Додано <${tag}>.`);
    return true;
  }

  function moveNode(nodeId, parentId = '') {
    const node = findNode(nodeId);
    const parent = parentId ? findNode(parentId) : null;
    const problem = getDropProblem(parent, node);
    if (problem) {
      setFeedback('err', problem);
      pulseDrop(parentId);
      return false;
    }
    const moved = detachNode(nodeId);
    if (!moved) return false;
    if (parent) parent.children.push(moved);
    else state.tree.push(moved);
    selectedId = canHaveChildren(moved.tag) ? moved.id : (parent?.id || null);
    saveTree();
    render();
    setFeedback('idle', `Переміщено <${moved.tag}>.`);
    return true;
  }

  function pulseDrop(parentId) {
    const selector = parentId ? `[data-drop-parent="${parentId}"]` : '[data-drop-root]';
    const target = document.querySelector(selector);
    if (!target) return;
    target.classList.add('drop-denied');
    window.setTimeout(() => target.classList.remove('drop-denied'), 420);
  }

  function setLevel(levelIndex, options = {}) {
    const completedCount = normalizeCompleted(state.completedLevels).length;
    const maxUnlocked = completedCount >= LEVELS.length ? LEVELS.length - 1 : completedCount;
    state.currentLevel = Math.min(Math.max(levelIndex, 0), maxUnlocked);
    state.tree = loadTree(state.currentLevel);
    selectedId = null;
    saveState();
    render();
    if (!options.quiet) setFeedback('idle', `${LEVELS[state.currentLevel].badge}: готово до збірки.`);
  }

  function checkLevel() {
    const errors = LEVELS[state.currentLevel].validate().slice(0, 3);
    const checkedLevel = state.currentLevel;
    if (errors.length) {
      setFeedback('err', errors.join(' '));
      if (!isCompleted(state.currentLevel)) els.nextBtn.hidden = true;
      return;
    }

    const alreadyDone = isCompleted(checkedLevel);
    if (!alreadyDone) {
      state.completedLevels = normalizeCompleted([...state.completedLevels, checkedLevel]);
      state.earnedXp += LEVEL_REWARDS[checkedLevel]?.xp || 0;
      if (state.completedLevels.length >= LEVELS.length) state.courseCompleted = true;
      else state.currentLevel = Math.min(checkedLevel + 1, LEVELS.length - 1);
      saveState();
      postHost('level-complete', progressPayload({
        completedLevel: checkedLevel + 1,
        reward: LEVEL_REWARDS[checkedLevel] || { xp: 0, coins: 0 }
      }));
    }

    if (state.courseCompleted) {
      showFinish();
      return;
    }

    setFeedback('ok', alreadyDone ? 'Місія вже зарахована. Можеш перейти далі.' : `Місію завершено. +${LEVEL_REWARDS[checkedLevel]?.xp || 0} XP і +${LEVEL_REWARDS[checkedLevel]?.coins || 0} монет.`);
    els.nextBtn.hidden = false;
    els.nextBtn.textContent = 'Наступний рівень';
    renderHeader();
    renderLevelTabs();
    postProgress();
  }

  function isCompleted(levelIndex) {
    return state.completedLevels.includes(levelIndex);
  }

  function goNext() {
    if (state.currentLevel >= LEVELS.length - 1 && state.courseCompleted) {
      showFinish();
      return;
    }
    const nextLevel = isCompleted(state.currentLevel)
      ? Math.min(state.currentLevel + 1, LEVELS.length - 1)
      : state.currentLevel;
    setLevel(nextLevel, { quiet: true });
    setFeedback('idle', `${LEVELS[state.currentLevel].badge}: ${LEVELS[state.currentLevel].title}`);
  }

  function showFinish() {
    reviewingCompletedCourse = false;
    state.courseCompleted = true;
    state.completedLevels = normalizeCompleted([...Array(LEVELS.length).keys()]);
    state.currentLevel = LEVELS.length - 1;
    saveState();
    els.finishXp.textContent = `${TOTAL_REWARD.xp} XP`;
    els.finishCoins.textContent = `${TOTAL_REWARD.coins} монети`;
    els.finishScreen.hidden = false;
    els.nextBtn.hidden = true;
    setFeedback('ok', 'Курс завершено. FinWay прийняв твою сторінку.');
    renderHeader();
    renderLevelTabs();
    postProgress();
    postHost('course-complete', progressPayload({ reward: TOTAL_REWARD }));
  }

  function render() {
    document.body.dataset.mobileView = document.body.dataset.mobileView || 'task';
    els.finishScreen.hidden = !state.courseCompleted || reviewingCompletedCourse;
    renderHeader();
    renderLevelTabs();
    renderTask();
    renderTags();
    renderWorkspace();
    renderOutput();
    renderNextState();
    scheduleResize();
  }

  function renderHeader() {
    const completedCount = normalizeCompleted(state.completedLevels).length;
    const reward = rewardSum(state.completedLevels);
    els.levelMeta.textContent = `Рівень ${state.currentLevel + 1} / ${LEVELS.length}`;
    els.xpValue.textContent = `${reward.xp} XP`;
    els.coinValue.textContent = `${reward.coins} монет`;
    els.progressFill.style.width = `${Math.round((completedCount / LEVELS.length) * 100)}%`;
  }

  function renderLevelTabs() {
    const completedCount = normalizeCompleted(state.completedLevels).length;
    const maxUnlocked = completedCount >= LEVELS.length ? LEVELS.length - 1 : completedCount;
    els.levelTabs.innerHTML = LEVELS.map((level, index) => {
      const active = index === state.currentLevel ? ' active' : '';
      const done = isCompleted(index) ? ' done' : '';
      const locked = index > maxUnlocked ? ' disabled' : '';
      return `<button class="level-tab${active}${done}" type="button" data-level="${index}" ${locked}>${index + 1}</button>`;
    }).join('');
  }

  function renderTask() {
    const level = LEVELS[state.currentLevel];
    els.taskTitle.textContent = level.title;
    els.missionBadge.textContent = level.badge || `Місія ${state.currentLevel + 1}`;
    els.missionReward.textContent = `+${LEVEL_REWARDS[state.currentLevel]?.xp || 0} XP`;
    els.missionLine.textContent = level.scene || '';
    els.taskText.textContent = level.task;
    els.taskHint.textContent = level.hint;
    els.neededTags.innerHTML = level.tags.map((tag) => `<code>&lt;${tag}&gt;</code>`).join('');
  }

  function renderTags() {
    const level = LEVELS[state.currentLevel];
    els.tagGrid.replaceChildren();
    level.tags.forEach((tag) => {
      const button = document.createElement('button');
      button.className = 'tag-chip';
      button.type = 'button';
      button.draggable = true;
      button.dataset.tag = tag;
      button.innerHTML = `<span>&lt;${tag}&gt;</span><small>drag або tap</small>`;
      button.addEventListener('dragstart', (event) => {
        dragged = { type: 'new', tag };
        event.dataTransfer.setData('application/x-html-crash-new', tag);
        event.dataTransfer.effectAllowed = 'copy';
      });
      button.addEventListener('dragend', clearDragState);
      button.addEventListener('click', () => addNode(tag, smartParentId(tag)));
      els.tagGrid.append(button);
    });
    updateTarget();
  }

  function renderWorkspace() {
    els.emptyState.hidden = state.tree.length > 0;
    els.workspace.querySelectorAll('.node').forEach((node) => node.remove());
    els.workspace.insertAdjacentHTML('beforeend', state.tree.map((node) => renderNode(node, 0)).join(''));
    updateTarget();
  }

  function renderNode(node, depth) {
    const selected = node.id === selectedId ? ' selected' : '';
    const attrs = Object.entries(node.attrs || {})
      .filter(([, value]) => textValue(value))
      .map(([name, value]) => `${name}="${escapeAttr(value)}"`)
      .join(' ');
    const summary = [
      TEXT_TAGS.has(node.tag) && textValue(node.text) ? node.text : '',
      attrs
    ].filter(Boolean).join(' · ');
    const canNest = canHaveChildren(node.tag);
    const depthStyle = `style="--depth:${Math.min(depth, 6)}"`;
    return `
      <article class="node${selected}" data-id="${node.id}" data-node-tag="${node.tag}" ${depthStyle} draggable="true">
        <div class="node-row" data-select-node="${node.id}">
          <span class="node-grip" aria-hidden="true">⋮⋮</span>
          <span class="node-tag">&lt;${node.tag}${attrs ? ` ${attrs}` : ''}${VOID_TAGS.has(node.tag) ? ' /' : ''}&gt;</span>
          <span class="node-summary">${escapeHtml(summary)}</span>
          <button class="node-tool" type="button" data-edit-node="${node.id}" aria-label="Редагувати">✎</button>
          <button class="node-tool danger" type="button" data-delete-node="${node.id}" aria-label="Видалити">×</button>
        </div>
        ${canNest ? `<div class="node-children drop-zone" data-drop-parent="${node.id}">${node.children.map((childNode) => renderNode(childNode, depth + 1)).join('')}<span class="drop-label">кинути в &lt;${node.tag}&gt;</span></div>` : ''}
      </article>
    `;
  }

  function renderOutput() {
    const code = serializeTree(state.tree);
    els.codeOutput.textContent = code || '<!-- порожньо -->';
    els.previewFrame.srcdoc = buildPreview();
  }

  function renderNextState() {
    if (state.courseCompleted) {
      els.nextBtn.hidden = true;
      return;
    }
    els.nextBtn.hidden = !isCompleted(state.currentLevel);
    els.nextBtn.textContent = 'Наступний рівень';
  }

  function updateTarget() {
    const node = selectedId ? findNode(selectedId) : null;
    selectedId = node && canHaveChildren(node.tag) ? selectedId : null;
    els.targetName.textContent = node ? `<${node.tag}>` : 'корінь/body';
  }

  function serializeTree(nodes, level = 0) {
    const pad = '  '.repeat(level);
    return nodes.map((node) => {
      const attrs = Object.entries(node.attrs || {})
        .filter(([, value]) => textValue(value))
        .map(([name, value]) => ` ${name}="${escapeAttr(value)}"`)
        .join('');
      if (VOID_TAGS.has(node.tag)) return `${pad}<${node.tag}${attrs}>`;
      const text = TEXT_TAGS.has(node.tag) ? textValue(node.text) : '';
      const childCode = serializeTree(node.children, level + 1);
      if (!childCode && text) return `${pad}<${node.tag}${attrs}>${escapeHtml(text)}</${node.tag}>`;
      if (!childCode) return `${pad}<${node.tag}${attrs}></${node.tag}>`;
      const textLine = text ? `${pad}  ${escapeHtml(text)}\n` : '';
      return `${pad}<${node.tag}${attrs}>\n${textLine}${childCode}\n${pad}</${node.tag}>`;
    }).join('\n');
  }

  function buildPreview() {
    const body = first('body');
    const html = first('html');
    const source = body ? serializeTree(body.children) : (html ? serializeTree(html.children) : serializeTree(state.tree));
    return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <style>
    *{box-sizing:border-box}
    body{margin:0;padding:22px;font:16px/1.5 Inter,Arial,sans-serif;color:#172033;background:linear-gradient(180deg,#f6f9ff,#eef4fb)}
    header,main,footer,section,nav,div{display:block;margin:10px 0;padding:14px;border:1px solid #d7e1ec;border-radius:10px;background:#fff;box-shadow:0 8px 22px rgba(23,32,51,.06)}
    header{background:#172033;color:#fff;border-color:#172033} main{background:#fbfdff} footer{background:#eaf1f8;color:#475569}
    nav{display:flex;gap:10px;flex-wrap:wrap;background:rgba(255,255,255,.1);box-shadow:none}
    section{border-left:4px solid #f7bd45} div{border-left:4px solid #6aa0ff}
    h1,h2,h3,p{margin-top:0} a{color:#2563eb;margin-right:10px;font-weight:700} button{padding:10px 15px;border:0;border-radius:8px;background:#f7bd45;color:#1c2430;font-weight:800} img{max-width:100%;border-radius:10px;display:block}
    ul{padding-left:24px}
  </style>
</head>
<body>${source || '<p>Preview зʼявиться тут.</p>'}</body>
</html>`;
  }

  function setFeedback(type, message) {
    els.feedback.className = `feedback ${type}`;
    els.feedback.textContent = message;
  }

  function openEditor(id) {
    editorNode = findNode(id);
    if (!editorNode) return;
    els.editorTitle.textContent = `Редагувати <${editorNode.tag}>`;
    const textField = TEXT_TAGS.has(editorNode.tag) ? fieldMarkup('text', 'Текст', editorNode.text) : '';
    const attrFields = (TAGS[editorNode.tag]?.attrs || [])
      .map((name) => fieldMarkup(`attr:${name}`, name, editorNode.attrs[name] || ''))
      .join('');
    els.editorFields.innerHTML = textField + attrFields || '<p class="muted">У цього тегу немає тексту або атрибутів.</p>';
    els.editor.hidden = false;
    els.editorFields.querySelector('input')?.focus();
  }

  function fieldMarkup(name, label, value) {
    return `
      <label class="editor-field">
        <span>${label}</span>
        <input type="text" name="${escapeAttr(name)}" value="${escapeAttr(value)}">
      </label>
    `;
  }

  function closeEditor() {
    editorNode = null;
    els.editor.hidden = true;
  }

  function saveEditor() {
    if (!editorNode) return;
    const editedTag = editorNode.tag;
    els.editorFields.querySelectorAll('input').forEach((input) => {
      if (input.name === 'text') editorNode.text = input.value;
      if (input.name.startsWith('attr:')) editorNode.attrs[input.name.slice(5)] = input.value;
    });
    saveTree();
    closeEditor();
    render();
    setFeedback('idle', `Оновлено <${editedTag}>.`);
  }

  function clearCurrentLevel() {
    state.tree = [];
    selectedId = null;
    saveTree();
    render();
    setFeedback('idle', 'Робочу зону очищено.');
  }

  function clearDragState() {
    dragged = null;
    document.querySelectorAll('.drop-zone, [data-drop-root]').forEach((zone) => {
      zone.classList.remove('drop-ready', 'drop-invalid');
    });
  }

  function readDrag(event) {
    if (dragged) return dragged;
    const newTag = event.dataTransfer.getData('application/x-html-crash-new');
    if (newTag) return { type: 'new', tag: newTag };
    const nodeId = event.dataTransfer.getData('application/x-html-crash-node');
    if (nodeId) return { type: 'move', nodeId };
    return null;
  }

  function dragTag(payload) {
    if (!payload) return '';
    return payload.type === 'new' ? payload.tag : findNode(payload.nodeId)?.tag || '';
  }

  function markDrop(event, parentId = '') {
    const payload = readDrag(event);
    const tag = dragTag(payload);
    if (!tag) return false;
    const parent = parentId ? findNode(parentId) : null;
    const node = payload.type === 'move' ? findNode(payload.nodeId) : tag;
    const problem = getDropProblem(parent, node);
    const target = event.currentTarget;
    target.classList.toggle('drop-ready', !problem);
    target.classList.toggle('drop-invalid', Boolean(problem));
    event.dataTransfer.dropEffect = problem ? 'none' : (payload.type === 'new' ? 'copy' : 'move');
    event.preventDefault();
    return !problem;
  }

  function performDrop(event, parentId = '') {
    event.preventDefault();
    const payload = readDrag(event);
    clearDragState();
    if (!payload) return;
    if (payload.type === 'new') addNode(payload.tag, parentId);
    if (payload.type === 'move') moveNode(payload.nodeId, parentId);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function appUrl(relativePath) {
    return new URL(`${APP_ROOT_PREFIX}${relativePath}`, window.location.href).href;
  }

  function postHost(type, payload = {}) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ source: 'html-crash-course', type, payload }, '*');
    }
  }

  function progressPayload(extra = {}) {
    const rewards = rewardSum(state.completedLevels);
    return {
      userId,
      currentLevel: state.currentLevel + 1,
      completedLevels: normalizeCompleted(state.completedLevels).map((level) => level + 1),
      doneCount: normalizeCompleted(state.completedLevels).length,
      totalLevels: LEVELS.length,
      earnedXp: rewards.xp,
      earnedCoins: rewards.coins,
      courseCompleted: Boolean(state.courseCompleted),
      rewardsSynced: Boolean(state.rewardsSynced),
      ...extra
    };
  }

  function postProgress() {
    postHost('progress', progressPayload());
  }

  function scheduleResize() {
    window.requestAnimationFrame(() => {
      postHost('content-size', {
        height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, els.game.scrollHeight)
      });
    });
  }

  function bindEvents() {
    els.workspace.addEventListener('dragstart', (event) => {
      const node = event.target.closest('.node');
      if (!node || event.target.closest('button')) {
        event.preventDefault();
        return;
      }
      dragged = { type: 'move', nodeId: node.dataset.id };
      event.dataTransfer.setData('application/x-html-crash-node', node.dataset.id);
      event.dataTransfer.effectAllowed = 'move';
      node.classList.add('dragging');
    });

    els.workspace.addEventListener('dragend', (event) => {
      event.target.closest('.node')?.classList.remove('dragging');
      clearDragState();
    });

    els.workspace.addEventListener('dragover', (event) => {
      const zone = event.target.closest('[data-drop-parent], [data-drop-root]');
      if (!zone) return;
      markDrop(event, zone.dataset.dropParent || '');
    });

    els.workspace.addEventListener('dragleave', (event) => {
      const zone = event.target.closest('[data-drop-parent], [data-drop-root]');
      if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('drop-ready', 'drop-invalid');
    });

    els.workspace.addEventListener('drop', (event) => {
      const zone = event.target.closest('[data-drop-parent], [data-drop-root]');
      if (!zone) return;
      performDrop(event, zone.dataset.dropParent || '');
    });

    els.workspace.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit-node]');
      const del = event.target.closest('[data-delete-node]');
      const select = event.target.closest('[data-select-node]');
      if (edit) {
        openEditor(edit.dataset.editNode);
        return;
      }
      if (del) {
        removeNode(del.dataset.deleteNode);
        if (selectedId === del.dataset.deleteNode) selectedId = null;
        saveTree();
        render();
        setFeedback('idle', 'Блок видалено.');
        return;
      }
      if (select) {
        const node = findNode(select.dataset.selectNode);
        selectedId = node && canHaveChildren(node.tag) ? node.id : null;
        renderWorkspace();
      }
    });

    els.levelTabs.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-level]');
      if (tab && !tab.disabled) setLevel(Number(tab.dataset.level));
    });

    els.checkBtn.addEventListener('click', checkLevel);
    els.nextBtn.addEventListener('click', goNext);
    els.clearBtn.addEventListener('click', clearCurrentLevel);
    els.selectRootBtn.addEventListener('click', () => {
      selectedId = null;
      renderWorkspace();
      setFeedback('idle', 'Нові теги додаватимуться в корінь/body.');
    });

    document.querySelectorAll('.mobile-tab').forEach((button) => {
      button.addEventListener('click', () => {
        document.body.dataset.mobileView = button.dataset.mobileView;
        document.querySelectorAll('.mobile-tab').forEach((item) => item.classList.toggle('active', item === button));
        scheduleResize();
      });
    });

    document.querySelectorAll('.output-tab').forEach((button) => {
      button.addEventListener('click', () => {
        const showCode = button.dataset.output === 'code';
        els.previewFrame.hidden = showCode;
        els.codeOutput.hidden = !showCode;
        els.copyCodeBtn.hidden = !showCode;
        document.querySelectorAll('.output-tab').forEach((item) => item.classList.toggle('active', item === button));
        scheduleResize();
      });
    });

    els.copyCodeBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(els.codeOutput.textContent || '');
        setFeedback('ok', 'Код скопійовано.');
      } catch {
        setFeedback('err', 'Не вдалося скопіювати код.');
      }
    });

    els.saveEditorBtn.addEventListener('click', saveEditor);
    els.editor.addEventListener('click', (event) => {
      if (event.target.closest('[data-close-editor]')) closeEditor();
    });

    els.replayBtn.addEventListener('click', () => {
      reviewingCompletedCourse = true;
      els.finishScreen.hidden = true;
      setLevel(LEVELS.length - 1);
    });

    els.homeBtn.addEventListener('click', () => postHost('navigate-home'));
    els.backBtn.addEventListener('click', () => {
      postHost('navigate-home');
      if (window.parent === window) window.location.href = appUrl('index.html');
    });

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== 'html-crash-host') return;
      if (data.type === 'rewards-synced') {
        state.rewardsSynced = true;
        saveState();
        postProgress();
      }
    });

    window.addEventListener('resize', scheduleResize);
  }

  bindEvents();
  render();
  postHost('ready', progressPayload());
  if (state.courseCompleted && !state.rewardsSynced) postHost('course-complete', progressPayload({ reward: TOTAL_REWARD }));
  scheduleResize();
})();
