const currentUser = window.AppDB?.getCurrentUser?.();
if (!currentUser) {
  window.location.href = 'login.html';
}

const lang = window.AppUI?.getLanguage?.() === 'en' ? 'en' : 'uk';
const PROGRESS_TEMPLATE = {
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

const copy = {
  uk: {
    eyebrow: 'Learning Hub',
    pageTitle: 'Головна',
    subtitle: 'Профіль, аналітика і швидкий вибір ігор в одному екрані.',
    compactTopCategory: 'Топ категорія',
    compactStatsTitle: 'Статистика',
    compactLeaderboardTitle: 'Тижневий лідерборд',
    compactWeeklyScore: 'XP за тиждень',
    logout: 'Вийти з акаунту',
    profileTitle: 'Профіль гравця',
    profileText: 'Тримай під рукою свій прогрес, сильний напрямок і найближчі кроки.',
    xp: 'Рейтинг XP',
    gamesPlayed: 'Зіграно ігор',
    strongest: 'Найсильніша категорія',
    statsTitle: 'Статистика по категоріях',
    statsText: 'Дивись, де прогрес уже сильний, а де ще є простір для росту.',
    leaderboardTitle: 'Лідерборд',
    leaderboardText: 'Топ гравців по загальному рейтингу або окремому напрямку.',
    allCategories: 'Усі категорії',
    gameCategoriesTitle: 'Категорії ігор',
    gameCategoriesText: 'Обери напрямок, відкрий підкатегорію і одразу переходь до вправ.',
    subcategories: 'Підкатегорії',
    availableGames: 'Доступні ігри',
    popularGames: 'Популярні ігри',
    start: 'Запустити',
    openLecture: 'Лекція',
    rating: 'Рейтинг',
    duration: 'Тривалість',
    category: 'Категорія',
    coinsReward: 'монет',
    online: 'Online',
    noGames: 'У цій підкатегорії поки немає ігор.',
    you: 'Ви',
    strongestFallback: 'Ще формується',
    playedToast: 'за',
    leaderboardEmpty: 'Поки що немає гравців у цій категорії',
    lectureBadge: 'Міні-лекція',
    lectureTheoryTitle: 'Що треба знати',
    lectureFlowTitle: 'Як це буде в грі',
    lectureResultTitle: 'Результат після лекції',
    lectureDetailTitle: 'Логіка гри',
    lectureClose: 'Закрити',
    lectureStart: 'Почати гру',
    lectureComingSoon: 'Ігровий режим буде додано наступним кроком.',
    lectureDetailedReady: 'Логіка цієї гри вже детально продумана. Наступний крок: реалізація рівнів і перевірки.',
    gameBadgeLogic: 'Логіка гри',
    gameBadgePlay: 'Гра',
    gameContinue: 'До гри',
    gameLogicClose: 'Закрити',
    gameBack: 'Назад до логіки',
    gameClose: 'Закрити гру',
    gameCheck: 'Перевірити',
    gameNext: 'Далі',
    gameFinish: 'Завершити',
    gameRetry: 'Спробувати ще раз',
    gameRestart: 'Зіграти ще раз',
    gameSelectOption: 'Спочатку обери один варіант.',
    gameCorrect: 'Правильно',
    gameWrong: 'Поки що ні',
    gameCompletedTitle: 'Гру завершено',
    gameCompletedLead: 'Ти пройшов усі приклади. Нижче короткий результат проходження.',
    gameResultsLabel: 'Результат',
    gameTaskLabel: 'Завдання',
    gameScoreLabel: 'Правильних відповідей',
    gameMistakesLabel: 'Помилок',
    gameRewardLabel: 'Нагорода',
    gamePlayStatus: 'Основа гри',
    gameFallbackLogicSummary: 'Після лекції ти бачиш коротку логіку самої гри: що робить гравець, що перевіряє система і як проходить раунд.',
    gameFallbackPlayLabel: 'Демо-рівень',
    gameFallbackPlayTitle: 'Екран гри',
    gameFallbackPlayLead: 'Тут відкривається сама гра: завдання, зона відповіді, перевірка та завершення рівня.',
    lectureFallbackSummary: 'Коротко розберемо тему, а потім підготуємося до практики.',
    lectureFallbackResult: 'Ти матимеш базове розуміння теми й будеш готовий до гри.'
  },
  en: {
    eyebrow: 'Learning Hub',
    pageTitle: 'Home',
    subtitle: 'Profile, analytics and fast game selection in one screen.',
    compactTopCategory: 'Top Category',
    compactStatsTitle: 'Statistics',
    compactLeaderboardTitle: 'Weekly Leaderboard',
    compactWeeklyScore: 'Weekly XP',
    logout: 'Log out',
    profileTitle: 'Player Profile',
    profileText: 'Keep your progress, strongest track and next steps close at hand.',
    xp: 'XP Rating',
    gamesPlayed: 'Games played',
    strongest: 'Strongest category',
    statsTitle: 'Category Statistics',
    statsText: 'See where your progress is already strong and where there is room to grow.',
    leaderboardTitle: 'Leaderboard',
    leaderboardText: 'Top players by overall rating or a specific track.',
    allCategories: 'All categories',
    gameCategoriesTitle: 'Game Categories',
    gameCategoriesText: 'Choose a direction, open a subcategory and jump straight into exercises.',
    subcategories: 'Subcategories',
    availableGames: 'Available games',
    popularGames: 'Popular games',
    start: 'Launch',
    openLecture: 'Lesson',
    rating: 'Rating',
    duration: 'Duration',
    category: 'Category',
    coinsReward: 'coins',
    online: 'Online',
    noGames: 'No games in this subcategory yet.',
    you: 'You',
    strongestFallback: 'Still forming',
    playedToast: 'for',
    leaderboardEmpty: 'No players in this category yet',
    lectureBadge: 'Mini lesson',
    lectureTheoryTitle: 'What to know first',
    lectureFlowTitle: 'How it works in the game',
    lectureResultTitle: 'What you get after the lesson',
    lectureDetailTitle: 'Game logic',
    lectureClose: 'Close',
    lectureStart: 'Start game',
    lectureComingSoon: 'The game mode will be added in the next step.',
    lectureDetailedReady: 'The logic of this game is already designed in detail. The next step is implementing levels and validation.',
    gameBadgeLogic: 'Game logic',
    gameBadgePlay: 'Game',
    gameContinue: 'Go to game',
    gameLogicClose: 'Close',
    gameBack: 'Back to logic',
    gameClose: 'Close game',
    gameCheck: 'Validate',
    gameNext: 'Next',
    gameFinish: 'Finish',
    gameRetry: 'Try again',
    gameRestart: 'Play again',
    gameSelectOption: 'Choose one option first.',
    gameCorrect: 'Correct',
    gameWrong: 'Not yet',
    gameCompletedTitle: 'Game completed',
    gameCompletedLead: 'You finished all examples. Here is a short summary of your run.',
    gameResultsLabel: 'Result',
    gameTaskLabel: 'Task',
    gameScoreLabel: 'Correct answers',
    gameMistakesLabel: 'Mistakes',
    gameRewardLabel: 'Reward',
    gamePlayStatus: 'Game foundation',
    gameFallbackLogicSummary: 'After the lesson you see the short game logic itself: what the player does, what the system validates, and how one round works.',
    gameFallbackPlayLabel: 'Demo level',
    gameFallbackPlayTitle: 'Game screen',
    gameFallbackPlayLead: 'This is where the actual game opens: the task, answer area, validation, and level completion.',
    lectureFallbackSummary: 'We will briefly review the topic and then prepare for practice.',
    lectureFallbackResult: 'You will understand the basics and be ready for the game.'
  }
}[lang];

function text(value) {
  if (typeof value === 'string') return value;
  return value?.[lang] || value?.uk || '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const categories = {
  it: {
    id: 'it',
    icon: '💻',
    tone: 'it',
    name: { uk: 'IT', en: 'IT' },
    desc: { uk: 'Веб, код, безпека і тестування', en: 'Web, code, security and testing' },
    subcategories: {
      webdev: {
        id: 'webdev',
        icon: '🌐',
        name: { uk: 'Веб-розробка', en: 'Web Development' },
        games: [
          { id: 'character-layout', icon: '🧍', name: 'Персонаж і розкладка', desc: { uk: 'Створи персонажа й розстав речі на екрані за правилами HTML/CSS', en: 'Create a character and place items on the screen with HTML/CSS rules' }, xp: 36, reward: 32, rating: 4.9, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'html-crash', icon: '📄', name: 'HTML Crash Course', desc: { uk: 'Збери сторінку з блоків', en: 'Build a page from blocks' }, xp: 38, reward: 35, rating: 4.9, duration: { uk: '18 хв', en: '18 min' } },
          { id: 'css-diner', icon: '🍽️', name: 'CSS Diner', desc: { uk: 'Селектори CSS через гру', en: 'CSS selectors through play' }, xp: 28, reward: 25, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'flexbox-rush', icon: '🧩', name: 'Flexbox Rush', desc: { uk: 'Розкладай блоки через Flexbox', en: 'Arrange blocks with Flexbox' }, xp: 31, reward: 28, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } }
        ]
      },
      programming: {
        id: 'programming',
        icon: '⌨️',
        name: { uk: 'Програмування', en: 'Programming' },
        games: [
          { id: 'farm-bot-logic', icon: '🤖', name: 'Farm Bot Logic', desc: { uk: 'Автоматизуй фермера і складай команди для поля', en: 'Automate a farmer and build field commands' }, xp: 40, reward: 35, rating: 4.9, duration: { uk: '15 хв', en: '15 min' } },
          { id: 'code-combat', icon: '🐍', name: 'Code Combat', desc: { uk: 'Вивчай Python у грі', en: 'Learn Python in a game' }, xp: 40, reward: 30, rating: 4.8, duration: { uk: '15 хв', en: '15 min' } },
          { id: 'javascript-hero', icon: '📜', name: 'JavaScript Hero', desc: { uk: 'Основи JS з практикою', en: 'JS fundamentals with practice' }, xp: 34, reward: 25, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'loop-logic', icon: '🔁', name: 'Loop Logic Lab', desc: { uk: 'Розбери цикли й умови на практиці', en: 'Practice loops and conditions' }, xp: 37, reward: 32, rating: 4.8, duration: { uk: '13 хв', en: '13 min' } }
        ]
      },
      cybersecurity: {
        id: 'cybersecurity',
        icon: '🛡️',
        name: { uk: 'Кібербезпека', en: 'Cybersecurity' },
        games: [
          { id: 'reliable-password', icon: '🔐', name: 'Збери надійний пароль', desc: { uk: 'Комбінуй довжину, символи та другий фактор', en: 'Combine length, symbols and a second factor' }, xp: 29, reward: 27, rating: 4.8, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'phishing-hunter', icon: '🕵️', name: 'Phishing Hunter', desc: { uk: 'Визначай фейкові листи та сайти', en: 'Detect fake emails and websites' }, xp: 35, reward: 32, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'firewall-defender', icon: '🚧', name: 'Firewall Defender', desc: { uk: 'Налаштуй правила доступу без дірок', en: 'Configure access rules without gaps' }, xp: 38, reward: 34, rating: 4.8, duration: { uk: '13 хв', en: '13 min' } },
          { id: 'breach-response', icon: '🚨', name: 'Breach Response', desc: { uk: 'Реагуй на інцидент без паніки', en: 'Respond to an incident without panic' }, xp: 40, reward: 36, rating: 4.8, duration: { uk: '14 хв', en: '14 min' } }
        ]
      },
      testing: {
        id: 'testing',
        icon: '🧪',
        name: { uk: 'Тестування', en: 'Testing' },
        games: [
          { id: 'product-test-simulator', icon: '🧫', name: 'Симуляція тестування продукту', desc: { uk: 'Знаходь баги, перевіряй сценарії і вирішуй, чи готовий реліз', en: 'Find bugs, check scenarios and decide if the release is ready' }, xp: 34, reward: 31, rating: 4.8, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'bug-hunter', icon: '🐞', name: 'Bug Hunter', desc: { uk: 'Лови помилки за описом користувача', en: 'Catch defects from user reports' }, xp: 32, reward: 28, rating: 4.7, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'qa-checklist', icon: '✅', name: 'QA Checklist', desc: { uk: 'Збери перевірки для нового функціоналу', en: 'Build checks for a new feature' }, xp: 30, reward: 27, rating: 4.6, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'release-gate', icon: '🚦', name: 'Release Gate', desc: { uk: 'Прийми рішення: випускати продукт чи повертати на доопрацювання', en: 'Decide whether to ship or send the product back for fixes' }, xp: 36, reward: 33, rating: 4.8, duration: { uk: '13 хв', en: '13 min' } }
        ]
      }
    }
  },
  economy: {
    id: 'economy',
    icon: '📈',
    tone: 'economy',
    name: { uk: 'Економіка', en: 'Economy' },
    desc: { uk: 'Ринок, фінанси, стратегія', en: 'Markets, finance, strategy' },
    subcategories: {
      financialLiteracy: {
        id: 'financialLiteracy',
        icon: '💰',
        name: { uk: 'Фінансова грамотність', en: 'Financial Literacy' },
        games: [
          { id: 'newprek-30-days', icon: '🏢', name: 'NewPrek: 30 днів', desc: { uk: 'Обирай правильні угоди для компанії, заробляй XP і втримайся 30 днів', en: 'Choose the right company deals, earn XP and survive 30 days' }, xp: 42, reward: 40, rating: 4.9, duration: { uk: '18 хв', en: '18 min' } },
          { id: 'budget-challenge', icon: '💵', name: 'Budget Challenge', desc: { uk: 'Плануй бюджет', en: 'Plan a budget' }, xp: 26, reward: 30, rating: 4.5, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'cashflow-run', icon: '💼', name: 'Cashflow Run', desc: { uk: 'Втримай грошовий потік бізнесу', en: 'Keep a business cash flow healthy' }, xp: 35, reward: 36, rating: 4.8, duration: { uk: '14 хв', en: '14 min' } },
          { id: 'pricing-lab', icon: '🧮', name: 'Pricing Lab', desc: { uk: 'Шукай ціну без втрати попиту', en: 'Find the right price without losing demand' }, xp: 33, reward: 28, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } }
        ]
      },
      entrepreneurship: {
        id: 'entrepreneurship',
        icon: '🚀',
        name: { uk: 'Підприємництво', en: 'Entrepreneurship' },
        games: [
          { id: 'startup-founder', icon: '🏗️', name: 'Startup Founder', desc: { uk: 'Запусти ідею з обмеженим бюджетом', en: 'Launch an idea with a limited budget' }, xp: 38, reward: 35, rating: 4.7, duration: { uk: '14 хв', en: '14 min' } },
          { id: 'business-model-lab', icon: '🧱', name: 'Business Model Lab', desc: { uk: 'Збери модель доходів, витрат і клієнтів', en: 'Build a model of revenue, costs and customers' }, xp: 36, reward: 33, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'pitch-room', icon: '🎤', name: 'Pitch Room', desc: { uk: 'Поясни ідею інвестору коротко й переконливо', en: 'Explain an idea to an investor clearly and briefly' }, xp: 34, reward: 31, rating: 4.6, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'growth-choices', icon: '📈', name: 'Growth Choices', desc: { uk: 'Обирай кроки росту без зайвого ризику', en: 'Choose growth moves without needless risk' }, xp: 39, reward: 36, rating: 4.8, duration: { uk: '13 хв', en: '13 min' } }
        ]
      },
      marketing: {
        id: 'marketing',
        icon: '📣',
        name: { uk: 'Маркетинг', en: 'Marketing' },
        games: [
          { id: 'campaign-clicks', icon: '🎯', name: 'Campaign Clicks', desc: { uk: 'Запускай кампанії з кращим CTR', en: 'Launch campaigns with a stronger CTR' }, xp: 31, reward: 29, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'brand-pulse', icon: '💡', name: 'Brand Pulse', desc: { uk: 'Посилюй бренд через правильні меседжі', en: 'Strengthen a brand through the right messages' }, xp: 33, reward: 30, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'customer-journey', icon: '🛒', name: 'Customer Journey', desc: { uk: 'Побудуй шлях клієнта без втрат', en: 'Build a customer journey without drop-offs' }, xp: 35, reward: 33, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'ad-budget-boss', icon: '💸', name: 'Ad Budget Boss', desc: { uk: 'Розподіли рекламний бюджет розумно', en: 'Distribute ad budget wisely' }, xp: 34, reward: 32, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } }
        ]
      },
      investments: {
        id: 'investments',
        icon: '📉',
        name: { uk: 'Інвестиції', en: 'Investments' },
        games: [
          { id: 'stock-simulator', icon: '📉', name: 'Stock Simulator', desc: { uk: 'Торгуй акціями', en: 'Trade stocks' }, xp: 48, reward: 50, rating: 4.9, duration: { uk: '20 хв', en: '20 min' } },
          { id: 'investment-mix', icon: '🧺', name: 'Investment Mix', desc: { uk: 'Збери портфель під ризик і ціль', en: 'Build a portfolio for risk and goal' }, xp: 37, reward: 38, rating: 4.8, duration: { uk: '15 хв', en: '15 min' } },
          { id: 'risk-return', icon: '⚖️', name: 'Risk & Return', desc: { uk: 'Порівняй прибуток і ризик різних активів', en: 'Compare profit and risk across assets' }, xp: 36, reward: 34, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'portfolio-balance', icon: '🧮', name: 'Portfolio Balance', desc: { uk: 'Збалансуй портфель під ціль і термін', en: 'Balance a portfolio for a goal and timeline' }, xp: 39, reward: 37, rating: 4.8, duration: { uk: '14 хв', en: '14 min' } }
        ]
      }
    }
  },
  softskills: {
    id: 'softskills',
    icon: '🤝',
    tone: 'soft',
    name: { uk: 'Soft Skills', en: 'Soft Skills' },
    desc: { uk: 'Комунікація, лідерство, час та емоції', en: 'Communication, leadership, time and emotions' },
    subcategories: {
      communication: {
        id: 'communication',
        icon: '💬',
        name: { uk: 'Комунікація', en: 'Communication' },
        games: [
          { id: 'public-speaking', icon: '🎤', name: 'Public Speaking', desc: { uk: 'Тренуй виступи', en: 'Train public speaking' }, xp: 24, reward: 25, rating: 4.5, duration: { uk: '8 хв', en: '8 min' } },
          { id: 'active-listening', icon: '👂', name: 'Active Listening', desc: { uk: 'Розумій співрозмовника', en: 'Understand your partner' }, xp: 20, reward: 20, rating: 4.4, duration: { uk: '7 хв', en: '7 min' } },
          { id: 'negotiation-room', icon: '🗣️', name: 'Negotiation Room', desc: { uk: 'Обирай кращі фрази для переговорів', en: 'Pick the best phrases for negotiation' }, xp: 27, reward: 26, rating: 4.6, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'feedback-studio', icon: '🪞', name: 'Feedback Studio', desc: { uk: 'Давай корисний фідбек без конфлікту', en: 'Give useful feedback without conflict' }, xp: 25, reward: 23, rating: 4.5, duration: { uk: '8 хв', en: '8 min' } }
        ]
      },
      leadership: {
        id: 'leadership',
        icon: '👑',
        name: { uk: 'Лідерство', en: 'Leadership' },
        games: [
          { id: 'team-builder', icon: '🧠', name: 'Team Builder', desc: { uk: 'Збери команду мрії', en: 'Build a dream team' }, xp: 34, reward: 35, rating: 4.7, duration: { uk: '13 хв', en: '13 min' } },
          { id: 'crisis-manager', icon: '⚠️', name: 'Crisis Manager', desc: { uk: 'Вирішуй проблеми', en: 'Solve problems' }, xp: 39, reward: 40, rating: 4.8, duration: { uk: '15 хв', en: '15 min' } },
          { id: 'sprint-prioritizer', icon: '🗂️', name: 'Sprint Prioritizer', desc: { uk: 'Розстав пріоритети команди під дедлайн', en: 'Prioritize a team sprint under deadline' }, xp: 37, reward: 38, rating: 4.8, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'delegation-dash', icon: '🧭', name: 'Delegation Dash', desc: { uk: 'Передай задачі правильним людям', en: 'Delegate tasks to the right people' }, xp: 35, reward: 33, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } }
        ]
      },
      timeManagement: {
        id: 'timeManagement',
        icon: '⏳',
        name: { uk: 'Тайм-менеджмент', en: 'Time Management' },
        games: [
          { id: 'focus-sprint', icon: '⏱️', name: 'Focus Sprint', desc: { uk: 'Тримай фокус під час спринту', en: 'Stay focused during a sprint' }, xp: 24, reward: 22, rating: 4.5, duration: { uk: '8 хв', en: '8 min' } },
          { id: 'task-kanban', icon: '📋', name: 'Task Kanban', desc: { uk: 'Рухай задачі по дошці без перевантаження', en: 'Move tasks through a board without overload' }, xp: 27, reward: 25, rating: 4.6, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'deadline-planner', icon: '📆', name: 'Deadline Planner', desc: { uk: 'Розклади роботу так, щоб встигнути головне', en: 'Plan work so the main things are done on time' }, xp: 29, reward: 26, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'priority-matrix', icon: '🧠', name: 'Priority Matrix', desc: { uk: 'Розділи важливе та термінове', en: 'Separate urgent from important' }, xp: 28, reward: 26, rating: 4.6, duration: { uk: '9 хв', en: '9 min' } }
        ]
      },
      emotionalIntelligence: {
        id: 'emotionalIntelligence',
        icon: '🧠',
        name: { uk: 'Емоційний інтелект', en: 'Emotional Intelligence' },
        games: [
          { id: 'emotion-radar', icon: '📡', name: 'Emotion Radar', desc: { uk: 'Розпізнавай емоції в робочих ситуаціях', en: 'Recognize emotions in work situations' }, xp: 28, reward: 25, rating: 4.6, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'empathy-choice', icon: '💬', name: 'Empathy Choice', desc: { uk: 'Обирай реакцію, яка допомагає людині бути почутою', en: 'Choose the response that helps a person feel heard' }, xp: 30, reward: 28, rating: 4.7, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'conflict-cooldown', icon: '🧯', name: 'Conflict Cooldown', desc: { uk: 'Знижуй напругу без втрати позиції', en: 'Lower tension without losing your position' }, xp: 31, reward: 29, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'stress-balance', icon: '⚖️', name: 'Stress Balance', desc: { uk: 'Відрізняй сигнал стресу від робочого шуму', en: 'Separate stress signals from workplace noise' }, xp: 27, reward: 25, rating: 4.6, duration: { uk: '9 хв', en: '9 min' } }
        ]
      }
    }
  },
  agro: {
    id: 'agro',
    icon: '🌾',
    tone: 'agro',
    name: { uk: 'Аграрне', en: 'Agriculture' },
    desc: { uk: 'Рослини, тварини, бізнес і техніка', en: 'Crops, livestock, business and technology' },
    subcategories: {
      farming: {
        id: 'farming',
        icon: '🌱',
        name: { uk: 'Рослинництво', en: 'Crop Production' },
        games: [
          { id: 'farm-manager', icon: '🚜', name: 'Farm Manager', desc: { uk: 'Керуй фермою', en: 'Run a farm' }, xp: 25, reward: 25, rating: 4.5, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'crop-rotation', icon: '🌽', name: 'Crop Rotation', desc: { uk: 'Оптимальна сівозміна', en: 'Optimal crop rotation' }, xp: 22, reward: 20, rating: 4.4, duration: { uk: '9 хв', en: '9 min' } },
          { id: 'soil-lab', icon: '🧪', name: 'Soil Lab', desc: { uk: 'Підбери догляд під тип ґрунту', en: 'Match care to the soil type' }, xp: 29, reward: 27, rating: 4.6, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'weather-window', icon: '🌦️', name: 'Weather Window', desc: { uk: 'Плануй роботи під погодні вікна', en: 'Plan field work around weather windows' }, xp: 28, reward: 25, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } }
        ]
      },
      livestock: {
        id: 'livestock',
        icon: '🐄',
        name: { uk: 'Тваринництво', en: 'Livestock' },
        games: [
          { id: 'animal-care', icon: '🐮', name: 'Animal Care', desc: { uk: 'Догляд за тваринами', en: 'Animal care' }, xp: 30, reward: 30, rating: 4.6, duration: { uk: '14 хв', en: '14 min' } },
          { id: 'breeding-master', icon: '🐑', name: 'Breeding Master', desc: { uk: 'Селекція', en: 'Breeding' }, xp: 35, reward: 35, rating: 4.7, duration: { uk: '16 хв', en: '16 min' } },
          { id: 'feed-planner', icon: '🥣', name: 'Feed Planner', desc: { uk: 'Збери раціон для різних тварин', en: 'Build diets for different animals' }, xp: 31, reward: 29, rating: 4.6, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'health-check', icon: '🩺', name: 'Health Check', desc: { uk: 'Знайди проблему в стаді вчасно', en: 'Detect herd health issues in time' }, xp: 33, reward: 31, rating: 4.7, duration: { uk: '13 хв', en: '13 min' } }
        ]
      },
      agribusiness: {
        id: 'agribusiness',
        icon: '📦',
        name: { uk: 'Агробізнес', en: 'Agribusiness' },
        games: [
          { id: 'market-harvest', icon: '🌾', name: 'Market Harvest', desc: { uk: 'Продай урожай у правильний момент', en: 'Sell the harvest at the right moment' }, xp: 34, reward: 32, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'silo-control', icon: '🏗️', name: 'Silo Control', desc: { uk: 'Керуй зберіганням без втрат якості', en: 'Manage storage without quality loss' }, xp: 33, reward: 31, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'route-farm', icon: '🗺️', name: 'Route Farm', desc: { uk: 'Проклади найкращий шлях доставки', en: 'Map the best delivery route' }, xp: 31, reward: 29, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'supply-tractor', icon: '⛽', name: 'Supply Tractor', desc: { uk: 'Втримай техніку та запаси в русі', en: 'Keep machinery and supplies moving' }, xp: 32, reward: 30, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } }
        ]
      },
      techInnovations: {
        id: 'techInnovations',
        icon: '🤖',
        name: { uk: 'Техніка та інновації', en: 'Machinery and Innovation' },
        games: [
          { id: 'drone-scout', icon: '🚁', name: 'Drone Scout', desc: { uk: 'Оглядай поле з дрона та шукай ризики', en: 'Inspect fields by drone and spot risks' }, xp: 34, reward: 31, rating: 4.7, duration: { uk: '11 хв', en: '11 min' } },
          { id: 'sensor-grid', icon: '📡', name: 'Sensor Grid', desc: { uk: 'Читай датчики та приймай рішення', en: 'Read sensors and make decisions' }, xp: 32, reward: 30, rating: 4.6, duration: { uk: '10 хв', en: '10 min' } },
          { id: 'smart-irrigation', icon: '💧', name: 'Smart Irrigation', desc: { uk: 'Автоматизуй полив без перевитрати', en: 'Automate irrigation without waste' }, xp: 35, reward: 33, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } },
          { id: 'harvest-bot', icon: '🦾', name: 'Harvest Bot', desc: { uk: 'Оптимізуй збирання через техніку', en: 'Optimize harvesting with machinery' }, xp: 36, reward: 34, rating: 4.7, duration: { uk: '12 хв', en: '12 min' } }
        ]
      }
    }
  }
};

const lectureTemplates = {
  programming: {
    summary: {
      uk: 'Програмування починається з чіткої послідовності дій: компʼютер виконує команди по черзі, тому важливі і порядок, і точний запис.',
      en: 'Programming starts with a clear sequence of actions: the computer runs commands one by one, so both order and exact syntax matter.'
    },
    points: [
      { uk: 'Алгоритм описує кроки, які треба виконати для отримання результату.', en: 'An algorithm describes the steps needed to get a result.' },
      { uk: 'Змінні зберігають дані, а умови та цикли допомагають керувати логікою.', en: 'Variables store data, while conditions and loops control the logic.' },
      { uk: 'Навіть маленька помилка в назві або символі може змінити поведінку програми.', en: 'Even a small typo in a name or symbol can change the program behavior.' }
    ],
    result: {
      uk: 'Після цієї лекції ти краще читатимеш простий код і розумітимеш, чому програма працює саме так.',
      en: 'After this lesson you will read simple code more confidently and understand why a program behaves this way.'
    }
  },
  webdev: {
    summary: {
      uk: 'У веб-розробці важливо розділяти структуру сторінки, її зовнішній вигляд і правила розміщення елементів.',
      en: 'In web development it is important to separate page structure, visual appearance, and layout rules.'
    },
    points: [
      { uk: 'HTML відповідає за зміст і структуру: заголовки, текст, списки, кнопки.', en: 'HTML is responsible for content and structure: headings, text, lists, and buttons.' },
      { uk: 'CSS оформлює сторінку: кольори, відступи, шрифти та адаптивність.', en: 'CSS styles the page: colors, spacing, fonts, and responsiveness.' },
      { uk: 'Селектори та сітки допомагають точно знайти елемент і розташувати його на екрані.', en: 'Selectors and grids help target the right element and place it correctly on the screen.' }
    ],
    result: {
      uk: 'Ти зрозумієш, як будуються прості сторінки та чому зовнішній вигляд залежить від структури.',
      en: 'You will understand how simple pages are built and why visual design depends on structure.'
    }
  },
  databases: {
    summary: {
      uk: 'Бази даних зберігають інформацію впорядковано, щоб її можна було швидко знайти, відфільтрувати та оновити.',
      en: 'Databases store information in an organized way so it can be found, filtered, and updated quickly.'
    },
    points: [
      { uk: 'Таблиці або колекції містять записи, а кожне поле відповідає за окрему властивість.', en: 'Tables or collections contain records, and each field stores a separate property.' },
      { uk: 'Запит допомагає вибрати тільки ті дані, які потрібні зараз.', en: 'A query helps select only the data needed right now.' },
      { uk: 'Зв’язки та умови дозволяють поєднувати дані та шукати закономірності.', en: 'Relationships and conditions allow data to be combined and patterns to be found.' }
    ],
    result: {
      uk: 'Після лекції ти краще зрозумієш, як шукати дані й читати прості запити.',
      en: 'After the lesson you will better understand how to find data and read simple queries.'
    }
  },
  micro: {
    summary: {
      uk: 'Мікроекономіка пояснює, як рішення окремих людей і компаній формують ціни, попит і пропозицію на ринку.',
      en: 'Microeconomics explains how the decisions of people and companies shape prices, demand, and supply in the market.'
    },
    points: [
      { uk: 'Попит показує, скільки товару готові купити за певною ціною.', en: 'Demand shows how much of a product people are willing to buy at a certain price.' },
      { uk: 'Пропозиція показує, скільки товару готові продати виробники.', en: 'Supply shows how much of a product producers are willing to sell.' },
      { uk: 'Рівновага виникає там, де інтереси покупців і продавців тимчасово збігаються.', en: 'Equilibrium appears where the interests of buyers and sellers temporarily match.' }
    ],
    result: {
      uk: 'Ти побачиш, як змінюється ринок, коли ціна або поведінка учасників рухається в інший бік.',
      en: 'You will see how the market changes when price or participant behavior moves in a different direction.'
    }
  },
  finance: {
    summary: {
      uk: 'Фінансова грамотність допомагає приймати рішення про гроші не інтуїтивно, а через план, ризик і цілі.',
      en: 'Financial literacy helps make money decisions not by guesswork but through planning, risk, and goals.'
    },
    points: [
      { uk: 'Бюджет показує, звідки приходять кошти і куди вони витрачаються.', en: 'A budget shows where money comes from and where it goes.' },
      { uk: 'Інвестиції можуть приносити дохід, але завжди пов’язані з ризиком.', en: 'Investments can generate income, but they are always linked to risk.' },
      { uk: 'Добре рішення враховує запас безпеки, мету та термін.', en: 'A good decision considers a safety buffer, a goal, and a time horizon.' }
    ],
    result: {
      uk: 'Після лекції ти краще оцінюватимеш фінансові рішення і не плутатимеш дохід із вигодою.',
      en: 'After the lesson you will evaluate financial decisions more clearly and not confuse income with true benefit.'
    }
  },
  communication: {
    summary: {
      uk: 'Сильна комунікація будується не лише на словах, а й на ясності, активному слуханні та доречній реакції.',
      en: 'Strong communication is built not only on words but also on clarity, active listening, and an appropriate response.'
    },
    points: [
      { uk: 'Повідомлення має бути простим: одна думка, одна мета, одна зрозуміла дія.', en: 'A message should be simple: one idea, one goal, one clear action.' },
      { uk: 'Активне слухання означає уточнювати, перепитувати і перевіряти, чи правильно ти зрозумів.', en: 'Active listening means clarifying, asking back, and checking whether you understood correctly.' },
      { uk: 'Тон і контекст впливають на результат не менше, ніж самі слова.', en: 'Tone and context affect the result no less than the words themselves.' }
    ],
    result: {
      uk: 'Ти зможеш краще будувати діалог і помічати, де саме комунікація починає ламатися.',
      en: 'You will be able to build dialogue better and notice where communication starts to break down.'
    }
  },
  leadership: {
    summary: {
      uk: 'Лідерство не про контроль над усіма, а про напрямок, відповідальність і допомогу команді рухатися вперед.',
      en: 'Leadership is not about controlling everyone, but about direction, responsibility, and helping the team move forward.'
    },
    points: [
      { uk: 'Лідер формулює ціль так, щоб команда розуміла, куди й навіщо рухається.', en: 'A leader states the goal so the team knows where it is going and why.' },
      { uk: 'Рішення мають враховувати людей, ресурси і час, а не лише бажаний результат.', en: 'Decisions should consider people, resources, and time, not only the desired outcome.' },
      { uk: 'У кризі важливо швидко визначити пріоритет, дії і відповідального.', en: 'In a crisis it is important to quickly define the priority, actions, and owner.' }
    ],
    result: {
      uk: 'Після лекції ти краще побачиш, як приймаються командні рішення і чому лідерство тримається на ясності.',
      en: 'After the lesson you will better see how team decisions are made and why leadership depends on clarity.'
    }
  },
  teamwork: {
    summary: {
      uk: 'Командна робота ефективна тоді, коли ролі, очікування і спільний результат зрозумілі кожному.',
      en: 'Teamwork becomes effective when roles, expectations, and the shared result are clear to everyone.'
    },
    points: [
      { uk: 'Кожен учасник має знати свою зону відповідальності і дедлайн.', en: 'Each participant should know their area of responsibility and deadline.' },
      { uk: 'Сильна команда домовляється про правила роботи і швидко ділиться статусом.', en: 'A strong team agrees on working rules and shares status quickly.' },
      { uk: 'Конфлікти краще вирішуються через факт, мету і конкретну домовленість.', en: 'Conflicts are resolved better through facts, goals, and a concrete agreement.' }
    ],
    result: {
      uk: 'Ти побачиш, як навіть проста координація сильно впливає на результат усієї групи.',
      en: 'You will see how even simple coordination strongly affects the result of the whole group.'
    }
  },
  farming: {
    summary: {
      uk: 'У рослинництві результат залежить від поєднання ґрунту, сезону, культури та правильної послідовності робіт.',
      en: 'In crop production the result depends on the combination of soil, season, crop, and the correct sequence of work.'
    },
    points: [
      { uk: 'Кожна культура має свої умови для росту: волога, температура, тип ґрунту.', en: 'Each crop has its own growth conditions: moisture, temperature, and soil type.' },
      { uk: 'Сівозміна допомагає не виснажувати землю і знижує ризик хвороб.', en: 'Crop rotation prevents soil exhaustion and reduces the risk of disease.' },
      { uk: 'Помилка в терміні або догляді впливає на врожай значно сильніше, ніж здається.', en: 'A mistake in timing or care affects yield much more than it may seem.' }
    ],
    result: {
      uk: 'Після лекції ти краще зрозумієш логіку польових рішень і вплив кожного етапу на врожай.',
      en: 'After the lesson you will better understand the logic of field decisions and how each stage affects yield.'
    }
  },
  livestock: {
    summary: {
      uk: 'У тваринництві стабільний результат тримається на догляді, раціоні, умовах утримання та контролі здоров’я.',
      en: 'In livestock farming stable results depend on care, diet, housing conditions, and health control.'
    },
    points: [
      { uk: 'Раціон тварини має відповідати її віку, стану і виробничій цілі.', en: 'An animal diet should match its age, condition, and production goal.' },
      { uk: 'Чистота, простір і режим напряму впливають на стан і продуктивність.', en: 'Cleanliness, space, and routine directly affect condition and productivity.' },
      { uk: 'Селекція та облік допомагають покращувати стадо не випадково, а системно.', en: 'Breeding and records help improve the herd systematically rather than by chance.' }
    ],
    result: {
      uk: 'Ти отримаєш базове розуміння, як приймати рішення по догляду й розвитку тваринництва.',
      en: 'You will gain a basic understanding of how to make care and livestock development decisions.'
    }
  },
  cybersecurity: {
    summary: {
      uk: 'Кібербезпека починається з помітності ризиків: де слабкий пароль, де фішинг, де неправильний доступ.',
      en: 'Cybersecurity starts with spotting risks: weak passwords, phishing, and incorrect access.'
    },
    points: [
      { uk: 'Будь-який акаунт захищений настільки, наскільки сильні пароль і другий фактор.', en: 'Any account is only as secure as its password and second factor.' },
      { uk: 'Фішингові повідомлення часто тиснуть на терміновість або страх.', en: 'Phishing messages often push urgency or fear.' },
      { uk: 'Доступ треба відкривати рівно настільки, наскільки це потрібно для задачі.', en: 'Access should be granted only as much as is needed for the task.' }
    ],
    result: {
      uk: 'Після лекції ти краще розрізнятимеш типові кіберризики і базові способи захисту.',
      en: 'After the lesson you will better distinguish common cyber risks and basic ways to stay protected.'
    }
  },
  accounting: {
    summary: {
      uk: 'Облік допомагає бачити не просто гроші, а точну картину руху ресурсів, боргів і результату бізнесу.',
      en: 'Accounting helps you see not just money, but the precise movement of resources, liabilities, and business results.'
    },
    points: [
      { uk: 'Кожна операція має бути віднесена до правильного рахунку.', en: 'Every transaction should be assigned to the correct account.' },
      { uk: 'Документи, суми і дати важливі так само, як і сама операція.', en: 'Documents, amounts, and dates matter as much as the transaction itself.' },
      { uk: 'Помилка в обліку часто спотворює рішення сильніше, ніж здається.', en: 'An accounting mistake often distorts decisions more than it first appears.' }
    ],
    result: {
      uk: 'Ти краще зрозумієш, як формується баланс і чому акуратність в обліку критична.',
      en: 'You will better understand how a balance sheet is formed and why accounting accuracy is critical.'
    }
  },
  marketing: {
    summary: {
      uk: 'Маркетинг будується на розумінні клієнта: що він бачить, що відчуває і чому ухвалює рішення.',
      en: 'Marketing is built on understanding the customer: what they see, feel, and why they make a decision.'
    },
    points: [
      { uk: 'Сильний меседж відповідає на конкретну потребу або біль клієнта.', en: 'A strong message answers a specific customer need or pain point.' },
      { uk: 'Канал просування має відповідати аудиторії, а не лише бюджету.', en: 'A promotion channel should fit the audience, not just the budget.' },
      { uk: 'Добрий маркетинг тестує ідеї, а не покладається лише на інтуїцію.', en: 'Good marketing tests ideas instead of relying only on intuition.' }
    ],
    result: {
      uk: 'Після лекції ти краще бачитимеш зв’язок між аудиторією, меседжем і результатом кампанії.',
      en: 'After the lesson you will better see the link between audience, message, and campaign results.'
    }
  },
  productivity: {
    summary: {
      uk: 'Продуктивність тримається не на постійному поспіху, а на правильному фокусі, порядку задач і межах навантаження.',
      en: 'Productivity depends not on constant rush, but on focus, task order, and healthy load boundaries.'
    },
    points: [
      { uk: 'Не все термінове є важливим, і не все важливе треба робити прямо зараз.', en: 'Not everything urgent is important, and not everything important must be done right now.' },
      { uk: 'Візуалізація задач допомагає бачити перевантаження і зависання роботи.', en: 'Visualizing tasks helps reveal overload and stalled work.' },
      { uk: 'Чіткий короткий фокус часто дає кращий результат, ніж багатозадачність.', en: 'Short clear focus often beats multitasking.' }
    ],
    result: {
      uk: 'Ти отримаєш базу для більш спокійної і керованої роботи без хаосу.',
      en: 'You will gain a foundation for calmer, more controlled work without chaos.'
    }
  },
  agrotech: {
    summary: {
      uk: 'Агротехнології допомагають приймати польові рішення не навмання, а на основі даних, автоматизації та спостереження.',
      en: 'AgriTech helps make field decisions not by guesswork, but through data, automation, and observation.'
    },
    points: [
      { uk: 'Датчики і дрони дають швидку картину стану поля або техніки.', en: 'Sensors and drones give a fast view of field or machinery condition.' },
      { uk: 'Автоматизація корисна тоді, коли її налаштовано під реальну задачу.', en: 'Automation is useful when configured for a real operational need.' },
      { uk: 'Дані важливі не самі по собі, а через рішення, які вони дозволяють прийняти.', en: 'Data matters not by itself, but through the decisions it enables.' }
    ],
    result: {
      uk: 'Після лекції ти краще бачитимеш, як технології підсилюють аграрну роботу на практиці.',
      en: 'After the lesson you will better see how technology strengthens agricultural work in practice.'
    }
  },
  logistics: {
    summary: {
      uk: 'Логістика в агро залежить від часу, умов перевезення, запасів і правильної маршрутизації.',
      en: 'Agro logistics depends on timing, transport conditions, supplies, and correct routing.'
    },
    points: [
      { uk: 'Навіть хороший урожай легко втратити на етапі зберігання або доставки.', en: 'Even a good harvest can be lost during storage or delivery.' },
      { uk: 'Маршрут і черговість дій часто впливають на витрати сильніше, ніж здається.', en: 'Routes and action order often affect costs more than it first appears.' },
      { uk: 'Контроль запасів і температури напряму впливає на якість продукції.', en: 'Supply and temperature control directly affects product quality.' }
    ],
    result: {
      uk: 'Ти краще зрозумієш, як логістичні рішення підтримують стабільність агробізнесу.',
      en: 'You will better understand how logistics decisions support agricultural business stability.'
    }
  },
  testing: {
    summary: {
      uk: 'Тестування допомагає знайти помилки до того, як продукт побачить користувач.',
      en: 'Testing helps find mistakes before a product reaches users.'
    },
    points: [
      { uk: 'Тест-кейс описує дію, очікуваний результат і умови перевірки.', en: 'A test case describes an action, expected result, and test conditions.' },
      { uk: 'Баг треба описувати конкретно: що зроблено, що сталося і як повторити проблему.', en: 'A bug should be described clearly: what was done, what happened, and how to reproduce it.' },
      { uk: 'Реліз готовий тільки тоді, коли критичні сценарії перевірені.', en: 'A release is ready only when critical scenarios are checked.' }
    ],
    result: {
      uk: 'Після лекції ти краще розумітимеш, як перевіряти продукт і не пропускати важливі помилки.',
      en: 'After the lesson you will better understand how to check a product and avoid missing important defects.'
    }
  },
  financialLiteracy: {
    summary: {
      uk: 'Фінансова грамотність допомагає приймати рішення через бюджет, ризик і запас безпеки.',
      en: 'Financial literacy helps make decisions through budget, risk, and a safety buffer.'
    },
    points: [
      { uk: 'Кожне фінансове рішення має короткий ефект і довший наслідок.', en: 'Every financial decision has a short effect and a longer consequence.' },
      { uk: 'Дохід, витрати, резерв і ризик треба дивитися разом.', en: 'Income, expenses, reserve, and risk should be considered together.' },
      { uk: 'Добра угода не завжди найбільша, а та, яку компанія реально витримає.', en: 'A good deal is not always the biggest one, but the one the company can actually sustain.' }
    ],
    result: {
      uk: 'Ти зможеш краще оцінювати варіанти і не плутати швидку вигоду зі здоровим рішенням.',
      en: 'You will be able to evaluate options better and not confuse quick gain with a healthy decision.'
    }
  },
  entrepreneurship: {
    summary: {
      uk: 'Підприємництво починається з ідеї, але тримається на клієнтах, витратах і здатності швидко перевіряти рішення.',
      en: 'Entrepreneurship starts with an idea, but depends on customers, costs, and quick validation.'
    },
    points: [
      { uk: 'Бізнес-модель пояснює, хто клієнт, за що він платить і які ресурси потрібні.', en: 'A business model explains who the customer is, what they pay for, and what resources are needed.' },
      { uk: 'Перші рішення краще перевіряти малими кроками, а не витрачати весь бюджет одразу.', en: 'Early decisions should be tested in small steps instead of spending the whole budget at once.' },
      { uk: 'Зростання корисне тільки тоді, коли команда може його обслуговувати.', en: 'Growth is useful only when the team can support it.' }
    ],
    result: {
      uk: 'Після лекції ти краще бачитимеш, як запускати ідею без хаотичних рішень.',
      en: 'After the lesson you will better see how to launch an idea without chaotic decisions.'
    }
  },
  investments: {
    summary: {
      uk: 'Інвестиції поєднують очікуваний дохід, ризик, термін і ціль.',
      en: 'Investments combine expected return, risk, timeline, and goal.'
    },
    points: [
      { uk: 'Вищий потенційний прибуток часто означає вищий ризик.', en: 'Higher potential return often means higher risk.' },
      { uk: 'Портфель допомагає не залежати від одного активу.', en: 'A portfolio helps avoid dependence on a single asset.' },
      { uk: 'Рішення має відповідати меті: короткій, середній або довгій.', en: 'A decision should match the goal: short, medium, or long term.' }
    ],
    result: {
      uk: 'Ти краще розумітимеш, як порівнювати інвестиційні варіанти без випадкового ризику.',
      en: 'You will better understand how to compare investment options without random risk.'
    }
  },
  timeManagement: {
    summary: {
      uk: 'Тайм-менеджмент допомагає бачити пріоритети, дедлайни і реальну місткість дня.',
      en: 'Time management helps see priorities, deadlines, and the real capacity of a day.'
    },
    points: [
      { uk: 'Не все термінове є важливим, і не все важливе треба робити просто зараз.', en: 'Not everything urgent is important, and not everything important must be done right now.' },
      { uk: 'План працює краще, коли в ньому є запас на несподівані задачі.', en: 'A plan works better when it includes room for unexpected tasks.' },
      { uk: 'Фокус на одній головній задачі часто сильніший за багатозадачність.', en: 'Focusing on one main task is often stronger than multitasking.' }
    ],
    result: {
      uk: 'Після лекції ти краще розкладатимеш задачі так, щоб встигати головне без хаосу.',
      en: 'After the lesson you will plan tasks better and finish the main work without chaos.'
    }
  },
  emotionalIntelligence: {
    summary: {
      uk: 'Емоційний інтелект допомагає розпізнавати свій стан, чути інших і не ламати діалог під напругою.',
      en: 'Emotional intelligence helps recognize your state, hear others, and keep dialogue intact under pressure.'
    },
    points: [
      { uk: 'Емоція часто показує потребу або ризик, який варто назвати.', en: 'An emotion often points to a need or risk that should be named.' },
      { uk: 'Емпатія не означає погодитися з усім, вона означає зрозуміти позицію людини.', en: 'Empathy does not mean agreeing with everything; it means understanding the person position.' },
      { uk: 'У конфлікті важливо спочатку знизити напругу, а потім шукати рішення.', en: 'In conflict it is important to lower tension first, then look for a solution.' }
    ],
    result: {
      uk: 'Ти краще бачитимеш, де реакція допомагає домовитися, а де тільки підсилює конфлікт.',
      en: 'You will better see where a reaction helps agreement and where it only increases conflict.'
    }
  },
  agribusiness: {
    summary: {
      uk: 'Агробізнес поєднує виробництво, зберігання, продаж і логістику в одну систему рішень.',
      en: 'Agribusiness connects production, storage, sales, and logistics into one decision system.'
    },
    points: [
      { uk: 'Хороший урожай треба ще правильно зберегти, перевезти і продати.', en: 'A good harvest still needs to be stored, transported, and sold correctly.' },
      { uk: 'Ціна залежить від моменту продажу, якості продукту і витрат на доставку.', en: 'Price depends on sale timing, product quality, and delivery costs.' },
      { uk: 'Втрати на складі або маршруті можуть знищити прибуток.', en: 'Losses in storage or routing can destroy profit.' }
    ],
    result: {
      uk: 'Після лекції ти краще розумітимеш, як рішення після збору врожаю впливають на бізнес.',
      en: 'After the lesson you will better understand how post-harvest decisions affect the business.'
    }
  },
  techInnovations: {
    summary: {
      uk: 'Техніка та інновації в агро допомагають працювати точніше через дані, датчики, дрони та автоматизацію.',
      en: 'Machinery and innovation in agriculture help work more precisely through data, sensors, drones, and automation.'
    },
    points: [
      { uk: 'Дані з поля корисні тільки тоді, коли перетворюються на конкретну дію.', en: 'Field data is useful only when it turns into a concrete action.' },
      { uk: 'Техніка має економити час або ресурс, а не просто виглядати сучасно.', en: 'Machinery should save time or resources, not just look modern.' },
      { uk: 'Автоматизація потребує правильної настройки під реальну задачу.', en: 'Automation needs correct setup for the real task.' }
    ],
    result: {
      uk: 'Ти краще бачитимеш, як технології підтримують аграрні рішення на практиці.',
      en: 'You will better see how technology supports agricultural decisions in practice.'
    }
  }
};

const lectureGameFlow = {
  'character-layout': {
    uk: 'Ти створюєш персонажа, отримуєш набір речей і розставляєш їх у правильні зони екрана, тренуючи структуру сторінки та розкладку.',
    en: 'You create a character, receive a set of items, and place them into the right screen zones while practicing page structure and layout.'
  },
  'farm-bot-logic': {
    uk: 'Гра працює як фермерська автоматизація: ти задаєш команди боту, щоб він садив, збирав і не витрачав ходи дарма.',
    en: 'The game works like farm automation: you give commands to a bot so it plants, harvests, and avoids wasting moves.'
  },
  'reliable-password': {
    uk: 'Тут потрібно зібрати пароль із достатньою довжиною, різними типами символів і правильним додатковим захистом.',
    en: 'Here you build a password with enough length, varied character types, and the right extra protection.'
  },
  'product-test-simulator': {
    uk: 'Ти проходиш сценарії тестування продукту, знаходиш дефекти й вирішуєш, чи можна віддавати версію в реліз.',
    en: 'You run product testing scenarios, find defects, and decide whether the version can go to release.'
  },
  'bug-hunter': {
    uk: 'У грі треба зіставляти скарги користувачів із реальними кроками відтворення бага.',
    en: 'In the game you match user complaints with real steps to reproduce the bug.'
  },
  'qa-checklist': {
    uk: 'Ти складаєш чекліст перевірок для нового функціоналу і прибираєш зайві або слабкі пункти.',
    en: 'You build a checklist for a new feature and remove unnecessary or weak checks.'
  },
  'release-gate': {
    uk: 'Тут потрібно оцінити ризики перед релізом і вирішити, що випускати, а що повернути на виправлення.',
    en: 'Here you assess release risks and decide what can ship and what should return for fixes.'
  },
  'newprek-30-days': {
    uk: 'Ти працюєш у компанії NewPrek: щодня з 2-3 карток обираєш рішення для угоди, отримуєш XP і відсоток від правильного вибору. Мета: протриматися 30 днів.',
    en: 'You work at NewPrek: each day you choose a deal decision from 2-3 cards, earn XP and a percentage from the correct choice. The goal is to last 30 days.'
  },
  'startup-founder': {
    uk: 'Ти запускаєш малий проєкт, обираєш перші витрати, тестуєш попит і намагаєшся не спалити бюджет.',
    en: 'You launch a small project, choose early expenses, test demand, and try not to burn the budget.'
  },
  'business-model-lab': {
    uk: 'Гра допомагає зібрати бізнес-модель: клієнт, цінність, дохід, витрати і ключові ресурси.',
    en: 'The game helps build a business model: customer, value, revenue, costs, and key resources.'
  },
  'pitch-room': {
    uk: 'Ти готуєш короткий пітч і вибираєш, які аргументи краще покажуть цінність ідеї.',
    en: 'You prepare a short pitch and choose which arguments best show the value of the idea.'
  },
  'growth-choices': {
    uk: 'Тут потрібно обирати кроки росту бізнесу, не перевантажуючи команду і бюджет.',
    en: 'Here you choose business growth steps without overloading the team and budget.'
  },
  'risk-return': {
    uk: 'Ти порівнюєш активи за ризиком і потенційним доходом, щоб не гнатися тільки за найбільшим відсотком.',
    en: 'You compare assets by risk and potential return so you do not chase only the biggest percentage.'
  },
  'portfolio-balance': {
    uk: 'У грі треба зібрати портфель під мету, термін і допустимий ризик.',
    en: 'In the game you build a portfolio for a goal, timeline, and acceptable risk.'
  },
  'deadline-planner': {
    uk: 'Ти розкладаєш задачі по часу, резерву і важливості, щоб команда не зірвала дедлайн.',
    en: 'You organize tasks by time, buffer, and importance so the team does not miss the deadline.'
  },
  'emotion-radar': {
    uk: 'Гра тренує розпізнавання емоційних сигналів у діалозі до того, як ситуація стане конфліктом.',
    en: 'The game trains recognizing emotional signals in dialogue before the situation becomes conflict.'
  },
  'empathy-choice': {
    uk: 'Тут потрібно обрати відповідь, яка показує, що ти почув людину і зрозумів її стан.',
    en: 'Here you choose a response that shows you heard the person and understood their state.'
  },
  'conflict-cooldown': {
    uk: 'Ти шукаєш формулювання, які знижують напругу і переводять розмову до рішення.',
    en: 'You look for wording that lowers tension and moves the conversation toward a solution.'
  },
  'stress-balance': {
    uk: 'Гра допомагає визначати, де стрес уже заважає рішенню, і який крок повертає контроль.',
    en: 'The game helps identify where stress blocks a decision and which step restores control.'
  },
  'market-harvest': {
    uk: 'Ти обираєш момент продажу врожаю, враховуючи ціну, якість, склад і витрати на доставку.',
    en: 'You choose when to sell the harvest while considering price, quality, storage, and delivery costs.'
  },
  'code-combat': {
    uk: 'У грі ти збиратимеш послідовність команд Python, щоб герой рухався, реагував на перешкоди і виконував завдання без помилок.',
    en: 'In the game you will assemble Python commands so the hero moves, reacts to obstacles, and completes tasks without mistakes.'
  },
  'javascript-hero': {
    uk: 'Тут потрібно буде вибирати правильні фрагменти JavaScript: змінні, умови та прості функції для маленьких сценаріїв.',
    en: 'Here you will choose the correct JavaScript pieces: variables, conditions, and simple functions for small scenarios.'
  },
  'loop-logic': {
    uk: 'Гра навчить бачити, коли потрібен цикл, де має стояти умова виходу і як не зламати логіку повторення.',
    en: 'The game teaches you to see when a loop is needed, where the exit condition belongs, and how to keep repetition logic correct.'
  },
  'algorithm-arena': {
    uk: 'Тут потрібно буде збирати правильну послідовність кроків, щоб задача вирішувалась без пропусків і зайвих дій.',
    en: 'Here you will assemble the correct step sequence so a task is solved without gaps or unnecessary actions.'
  },
  'html-crash': {
    uk: 'Ти будуватимеш сторінку з блоків і вчитимешся розуміти, де має бути заголовок, текст, кнопка чи секція.',
    en: 'You will build a page from blocks and learn where a heading, text, button, or section should go.'
  },
  'css-diner': {
    uk: 'Гра покаже, як селектори знаходять елементи на сторінці: за тегом, класом, вкладеністю або станом.',
    en: 'The game will show how selectors find elements on a page: by tag, class, nesting, or state.'
  },
  'grid-garden': {
    uk: 'Ти тренуватимешся розкладати елементи по колонках і рядках, щоб побудувати зрозумілу сітку сторінки.',
    en: 'You will practice placing elements into columns and rows to build a clear page grid.'
  },
  'flexbox-rush': {
    uk: 'Тут потрібно буде вирівнювати блоки по осі, переносити їх у ряд і шукати правильне `justify-content` та `align-items`.',
    en: 'Here you will align blocks on the axis, wrap them into rows, and find the right `justify-content` and `align-items`.'
  },
  'sql-mystery': {
    uk: 'У цій грі доведеться читати підказки, будувати SQL-запити і крок за кроком звужувати пошук потрібного запису.',
    en: 'In this game you will read clues, build SQL queries, and narrow the search for the correct record step by step.'
  },
  'nosql-quest': {
    uk: 'Тут ти працюватимеш із колекціями документів: шукатимеш записи за полями та порівнюватимеш структури даних.',
    en: 'Here you will work with document collections: searching records by fields and comparing data structures.'
  },
  'schema-architect': {
    uk: 'Гра покаже, як правильно зʼєднувати сутності між собою, щоб таблиці не дублювали дані і запити залишалися зручними.',
    en: 'The game will show how to connect entities correctly so tables avoid duplication and queries stay practical.'
  },
  'query-optimizer': {
    uk: 'Тут ти шукатимеш, які запити працюють повільно, і підбиратимеш кращу структуру або фільтрацію для швидкого результату.',
    en: 'Here you will spot slow queries and choose better structure or filtering for a faster result.'
  },
  'phishing-hunter': {
    uk: 'Гра вчить помічати підозрілі посилання, підроблені листи й фальшиві сторінки до того, як користувач натисне не туди.',
    en: 'The game teaches you to spot suspicious links, fake emails, and forged pages before a user clicks the wrong thing.'
  },
  'password-fortress': {
    uk: 'Тут потрібно буде збирати сильні паролі і вибирати правильний спосіб захисту акаунта під різні ризики.',
    en: 'Here you build strong passwords and choose the right account protection for different risks.'
  },
  'firewall-defender': {
    uk: 'У грі доведеться налаштовувати доступ так, щоб потрібний трафік проходив, а зайвий блокувався.',
    en: 'In the game you configure access so the needed traffic passes while unwanted traffic stays blocked.'
  },
  'breach-response': {
    uk: 'Тут ти реагуватимеш на інцидент: відсікаєш ризик, фіксуєш проблему і обираєш правильну послідовність дій.',
    en: 'Here you respond to an incident by isolating the risk, documenting the issue, and choosing the right action sequence.'
  },
  'supply-demand': {
    uk: 'Ти змінюватимеш ціну й умови ринку та дивитимешся, як це впливає на рівновагу, дефіцит або надлишок.',
    en: 'You will change price and market conditions and watch how this affects equilibrium, shortage, or surplus.'
  },
  'monopoly-master': {
    uk: 'Гра зосередиться на ринковій силі: ти оцінюватимеш, коли вигідно розширюватися, а коли це шкодить конкуренції.',
    en: 'The game will focus on market power: you will evaluate when expansion is beneficial and when it harms competition.'
  },
  'pricing-lab': {
    uk: 'Тут ти тестуватимеш різні ціни, дивитимешся на реакцію клієнтів і шукатимеш точку, де прибуток зростає без сильного падіння попиту.',
    en: 'Here you will test different prices, watch customer reaction, and find the point where profit grows without a steep demand drop.'
  },
  'market-balance': {
    uk: 'Гра покаже, як зміни пропозиції, попиту і ціни рухають ринок до рівноваги або навпаки ламають її.',
    en: 'The game shows how changes in supply, demand, and price move the market toward or away from equilibrium.'
  },
  'stock-simulator': {
    uk: 'Тут потрібно буде приймати інвестиційні рішення за неповної інформації й бачити зв’язок між ризиком і прибутком.',
    en: 'Here you will make investment decisions with incomplete information and see the link between risk and return.'
  },
  'budget-challenge': {
    uk: 'Ти розподілятимеш обмежений бюджет між потребами, цілями та резервом, щоб уникати фінансових провалів.',
    en: 'You will allocate a limited budget between needs, goals, and reserves to avoid financial failures.'
  },
  'cashflow-run': {
    uk: 'У грі треба буде втримати бізнес у плюсі: контролювати надходження, витрати й моменти, коли касовий розрив стає небезпечним.',
    en: 'In the game you need to keep the business positive by controlling inflows, expenses, and moments when cash gaps become dangerous.'
  },
  'investment-mix': {
    uk: 'Тут ти поєднуватимеш активи з різним ризиком, щоб зібрати збалансований портфель під мету і термін.',
    en: 'Here you combine assets with different risk levels to build a balanced portfolio for a goal and time horizon.'
  },
  'ledger-master': {
    uk: 'У грі потрібно буде правильно розносити операції по рахунках, щоб фінансова картина не перекосилася.',
    en: 'In the game you must post transactions to the correct accounts so the financial picture stays accurate.'
  },
  'tax-route': {
    uk: 'Тут ти вибиратимеш правильну податкову дію залежно від типу операції, строку і документа.',
    en: 'Here you choose the correct tax action depending on transaction type, timing, and document.'
  },
  'invoice-flow': {
    uk: 'Гра покаже шлях рахунка від створення до підтвердження і допоможе не загубити важливі кроки.',
    en: 'The game shows the path of an invoice from creation to confirmation and helps you avoid missing key steps.'
  },
  'balance-sheet': {
    uk: 'Тут потрібно буде поєднати активи, пасиви і капітал так, щоб баланс зійшовся без логічних помилок.',
    en: 'Here you must match assets, liabilities, and equity so the balance sheet closes without logic errors.'
  },
  'campaign-clicks': {
    uk: 'У грі ти тестуватимеш креативи і канали, щоб підвищити клікабельність та не спалити бюджет дарма.',
    en: 'In the game you test creatives and channels to improve click-through without burning the budget.'
  },
  'brand-pulse': {
    uk: 'Тут ти шукатимеш тон і меседж бренду, який найбільше відгукується цільовій аудиторії.',
    en: 'Here you search for the brand tone and message that resonates best with the target audience.'
  },
  'customer-journey': {
    uk: 'Гра допоможе побачити, на якому етапі клієнт губиться, і що треба змінити, щоб довести його до покупки.',
    en: 'The game helps you see where a customer drops off and what to change to move them toward purchase.'
  },
  'ad-budget-boss': {
    uk: 'Ти розподілятимеш бюджет між каналами, порівнюватимеш результат і шукатимеш найкращу комбінацію витрат.',
    en: 'You distribute budget across channels, compare results, and search for the best spending mix.'
  },
  'public-speaking': {
    uk: 'У грі доведеться збирати сильний виступ: структура, короткі меседжі та впевнена подача дадуть кращий результат.',
    en: 'In the game you will build a strong speech: structure, short messages, and confident delivery will lead to a better result.'
  },
  'active-listening': {
    uk: 'Тут потрібно буде обирати правильну реакцію співрозмовнику: слухати, уточнювати і не поспішати з висновками.',
    en: 'Here you will choose the right response to a conversation partner: listen, clarify, and avoid rushing to conclusions.'
  },
  'negotiation-room': {
    uk: 'Ти вестимеш переговори крок за кроком: фіксуватимеш інтереси сторін, знижуватимеш напругу і шукатимеш вигідне рішення.',
    en: 'You will run negotiations step by step: capture both sides interests, lower tension, and search for a workable agreement.'
  },
  'feedback-studio': {
    uk: 'Тут потрібно буде формулювати корисний зворотний зв’язок так, щоб людина зрозуміла суть і не пішла в захист.',
    en: 'Here you formulate useful feedback so the person understands the point without becoming defensive.'
  },
  'team-builder': {
    uk: 'Ти збиратимеш команду під задачу, поєднуючи ролі, сильні сторони людей і загальну мету проєкту.',
    en: 'You will assemble a team for a task by combining roles, people strengths, and the overall project goal.'
  },
  'crisis-manager': {
    uk: 'Гра навчить швидко визначати пріоритет дій, комунікувати рішення і тримати фокус на головному під тиском.',
    en: 'The game will teach you to quickly set action priorities, communicate decisions, and stay focused under pressure.'
  },
  'sprint-prioritizer': {
    uk: 'Тут потрібно швидко розставити задачі по важливості, ризику і строках, щоб команда встигла головне до дедлайну.',
    en: 'Here you must rank tasks by importance, risk, and timing so the team finishes the most important work before the deadline.'
  },
  'delegation-dash': {
    uk: 'Гра покаже, як роздати задачі між людьми так, щоб не перевантажити команду і не втратити швидкість.',
    en: 'The game shows how to distribute tasks across people without overloading the team or losing momentum.'
  },
  'collaboration-quest': {
    uk: 'Тут ти побачиш, як обмін інформацією, ролі й узгодження рішень впливають на спільний результат команди.',
    en: 'Here you will see how information sharing, roles, and aligned decisions affect the shared team result.'
  },
  'standup-sync': {
    uk: 'Гра покаже, як коротка щоденна синхронізація прибирає блокери, дублювання роботи і туман у відповідальності.',
    en: 'The game shows how a short daily sync removes blockers, duplicate work, and confusion around responsibility.'
  },
  'workflow-merge': {
    uk: 'Тут потрібно буде з’єднувати паралельні задачі команди так, щоб робота не конфліктувала і не зависала.',
    en: 'Here you connect parallel team tasks so the work does not conflict or stall.'
  },
  'role-match': {
    uk: 'Гра допоможе побачити, кому краще дати яку роль, щоб команда спрацювала сильніше як єдина система.',
    en: 'The game helps you see who should take which role so the team performs better as one system.'
  },
  'focus-sprint': {
    uk: 'Тут ти відсікаєш зайві відволікання і вибудовуєш короткий фокусований ритм роботи на одну важливу ціль.',
    en: 'Here you cut distractions and build a short focused work rhythm around one important goal.'
  },
  'task-kanban': {
    uk: 'Гра вчить не накопичувати забагато роботи одночасно і рухати задачі по етапах без перевантаження.',
    en: 'The game teaches you not to pile up too much work at once and move tasks through stages without overload.'
  },
  'email-zero': {
    uk: 'Тут потрібно буде швидко розбирати пошту: що архівувати, що делегувати, що зробити одразу, а що винести в задачі.',
    en: 'Here you quickly sort email: what to archive, delegate, do immediately, or move into tasks.'
  },
  'priority-matrix': {
    uk: 'Гра показує, як відокремлювати справді важливі задачі від просто шумних і термінових.',
    en: 'The game shows how to separate truly important tasks from merely noisy and urgent ones.'
  },
  'farm-manager': {
    uk: 'У грі ти плануватимеш посів, полив і догляд за полем, щоб отримати стабільний врожай без зайвих втрат.',
    en: 'In the game you will plan sowing, watering, and field care to get stable yields without unnecessary losses.'
  },
  'crop-rotation': {
    uk: 'Тут треба буде правильно змінювати культури по сезонах, щоб зберігати якість ґрунту й ефективність поля.',
    en: 'Here you will rotate crops across seasons to preserve soil quality and field efficiency.'
  },
  'soil-lab': {
    uk: 'Тут ти аналізуватимеш стан ґрунту, рівень вологи й кислотність, щоб підібрати правильний догляд перед посівом.',
    en: 'Here you will analyze soil condition, moisture, and acidity to choose the right care before sowing.'
  },
  'weather-window': {
    uk: 'Тут доведеться ловити правильний момент для польових робіт між ризиком дощу, спеки і втрати часу.',
    en: 'Here you must catch the right moment for field work between the risks of rain, heat, and lost time.'
  },
  'animal-care': {
    uk: 'Гра покаже, як догляд, чистота і раціон впливають на здоров’я тварин та щоденний результат господарства.',
    en: 'The game will show how care, cleanliness, and diet affect animal health and daily farm results.'
  },
  'breeding-master': {
    uk: 'Ти працюватимеш із вибором пар, якостями стада і довгостроковим покращенням результатів через селекцію.',
    en: 'You will work with pair selection, herd qualities, and long-term improvement through breeding.'
  },
  'feed-planner': {
    uk: 'У грі потрібно буде складати раціон під вік, вагу й цілі тварини, не виходячи за межі ресурсів господарства.',
    en: 'In the game you will compose diets by age, weight, and animal goals while staying within the farm resource limits.'
  },
  'health-check': {
    uk: 'Тут ти шукатимеш симптоми проблеми в стаді й визначатимеш, яке рішення потрібно прийняти першим.',
    en: 'Here you identify herd problem symptoms and decide which action should come first.'
  },
  'drone-scout': {
    uk: 'Гра покаже, як знімки з дрона допомагають швидко знайти ділянки ризику і прийняти точне рішення по полю.',
    en: 'The game shows how drone images help quickly spot risk areas and make precise field decisions.'
  },
  'sensor-grid': {
    uk: 'Тут ти читатимеш дані з датчиків і перетворюватимеш цифри на практичні польові дії.',
    en: 'Here you read sensor data and turn the numbers into practical field actions.'
  },
  'smart-irrigation': {
    uk: 'У грі ти налаштовуватимеш полив так, щоб культура отримала вологу вчасно, але ресурс не витрачався дарма.',
    en: 'In the game you configure irrigation so crops get moisture on time without wasting resources.'
  },
  'harvest-bot': {
    uk: 'Тут потрібно буде організувати збирання через техніку і графік так, щоб мінімізувати втрати та простої.',
    en: 'Here you organize harvesting through machines and scheduling to minimize losses and downtime.'
  },
  'cold-chain': {
    uk: 'Гра покаже, як зберегти температуру продукції від поля до точки доставки без зриву ланцюга.',
    en: 'The game shows how to keep product temperature stable from field to delivery point without breaking the chain.'
  },
  'route-farm': {
    uk: 'Тут ти шукатимеш маршрут, який скорочує час, паливо і ризик затримки під час доставки.',
    en: 'Here you search for a route that cuts time, fuel use, and delivery delay risk.'
  },
  'silo-control': {
    uk: 'У грі доведеться керувати зберіганням партій так, щоб не втратити якість і не допустити перевантаження складу.',
    en: 'In the game you manage batch storage so quality stays high and the warehouse does not overload.'
  },
  'supply-tractor': {
    uk: 'Тут потрібно буде тримати техніку, пальне і матеріали в русі, щоб польові роботи не зупинилися в невдалий момент.',
    en: 'Here you keep machinery, fuel, and supplies moving so field work does not stop at the worst moment.'
  }
};

const detailedGameBlueprints = {
  'javascript-hero': {
    summary: {
      uk: 'Коротка логічна гра: читаєш задачу, складаєш код і одразу бачиш результат.',
      en: 'A short logic game: read the task, assemble code, and immediately see the result.'
    },
    cards: [
      {
        title: {
          uk: 'Суть',
          en: 'Core idea'
        },
        lines: [
          {
            uk: 'На кожному рівні треба скласти маленьке правильне JavaScript-рішення.',
            en: 'On each level you must assemble one small correct JavaScript solution.'
          },
          {
            uk: 'Теми йдуть по черзі: змінні, умови, цикли, масиви.',
            en: 'Topics progress step by step: variables, conditions, loops, arrays.'
          }
        ]
      },
      {
        title: {
          uk: 'Як проходить раунд',
          en: 'How a round works'
        },
        lines: [
          {
            uk: '1. Бачиш коротке завдання і очікуваний результат.',
            en: '1. You see a short task and the expected result.'
          },
          {
            uk: '2. Обираєш або дописуєш правильний код.',
            en: '2. You choose or complete the correct code.'
          },
          {
            uk: '3. Отримуєш перевірку: правильно чи ні, і коротку підказку.',
            en: '3. You get validation: correct or not, with a short hint.'
          }
        ]
      },
      {
        title: {
          uk: 'Що перевіряє гра',
          en: 'What the game checks'
        },
        lines: [
          {
            uk: 'Чи код без синтаксичної помилки.',
            en: 'Whether the code has no syntax errors.'
          },
          {
            uk: 'Чи результат відповідає умові рівня.',
            en: 'Whether the result matches the level condition.'
          }
        ]
      }
    ]
  },
  'flexbox-rush': {
    summary: {
      uk: 'Візуальна логічна гра про Flexbox: ти бачиш розкладку елементів і підбираєш властивість, яка дає потрібний результат.',
      en: 'A visual logic game about Flexbox: you see a target layout and choose the property that produces the needed result.'
    },
    cards: [
      {
        title: {
          uk: 'Суть',
          en: 'Core idea'
        },
        lines: [
          {
            uk: 'На кожному рівні треба вирівняти картки або кнопки так, як показано в макеті.',
            en: 'On each level you must align cards or buttons exactly as shown in the layout.'
          },
          {
            uk: 'Гравець працює з базовими flex-властивостями: напрямок, вирівнювання, перенесення.',
            en: 'The player works with core flex properties: direction, alignment, and wrapping.'
          }
        ]
      },
      {
        title: {
          uk: 'Як проходить раунд',
          en: 'How a round works'
        },
        lines: [
          {
            uk: '1. Бачиш поточну і цільову розкладку елементів.',
            en: '1. You see the current and target element layout.'
          },
          {
            uk: '2. Обираєш правильну CSS-команду або комбінацію.',
            en: '2. You choose the correct CSS rule or combination.'
          },
          {
            uk: '3. Гра показує, чи збіглася структура з ціллю.',
            en: '3. The game shows whether the structure matched the target.'
          }
        ]
      },
      {
        title: {
          uk: 'Що перевіряє гра',
          en: 'What the game checks'
        },
        lines: [
          {
            uk: 'Чи правильно обрана flex-властивість для конкретної задачі.',
            en: 'Whether the correct flex property was chosen for the specific task.'
          },
          {
            uk: 'Чи відповідає фінальна розкладка очікуваній схемі.',
            en: 'Whether the final layout matches the expected scheme.'
          }
        ]
      }
    ]
  },
  'negotiation-room': {
    summary: {
      uk: 'Сценарна гра про переговори: ти реагуєш на репліки співрозмовника і намагаєшся втримати конструктивний діалог.',
      en: 'A scenario-based negotiation game: you react to the other side and try to keep the conversation constructive.'
    },
    cards: [
      {
        title: {
          uk: 'Суть',
          en: 'Core idea'
        },
        lines: [
          {
            uk: 'Кожен раунд дає конфліктну або напружену ситуацію з клієнтом, партнером чи командою.',
            en: 'Each round presents a conflict or tense situation with a client, partner, or team.'
          },
          {
            uk: 'Потрібно обрати фразу, яка не загострює суперечку і рухає діалог до рішення.',
            en: 'You must choose the phrase that avoids escalation and moves the dialogue toward a solution.'
          }
        ]
      },
      {
        title: {
          uk: 'Як проходить раунд',
          en: 'How a round works'
        },
        lines: [
          {
            uk: '1. Отримуєш короткий контекст і позицію іншої сторони.',
            en: '1. You get a short context and the position of the other side.'
          },
          {
            uk: '2. Обираєш одну з реплік для відповіді.',
            en: '2. You choose one reply option.'
          },
          {
            uk: '3. Бачиш, чи вдалося зберегти контакт і підвести розмову до домовленості.',
            en: '3. You see whether contact was preserved and the conversation moved toward agreement.'
          }
        ]
      },
      {
        title: {
          uk: 'Що перевіряє гра',
          en: 'What the game checks'
        },
        lines: [
          {
            uk: 'Чи ти чуєш інтерес іншої сторони, а не тільки свою позицію.',
            en: 'Whether you hear the other side interests, not only your own position.'
          },
          {
            uk: 'Чи відповідь знижує напругу і конкретизує наступний крок.',
            en: 'Whether the reply lowers tension and clarifies the next step.'
          }
        ]
      }
    ]
  },
  'pricing-lab': {
    summary: {
      uk: 'Економічна гра-симулятор: гравець тестує ціни й дивиться, як змінюються попит, виручка та прибуток.',
      en: 'An economics simulation game: the player tests prices and sees how demand, revenue, and profit change.'
    },
    cards: [
      {
        title: {
          uk: 'Суть',
          en: 'Core idea'
        },
        lines: [
          {
            uk: 'Ти змінюєш ціну продукту і відстежуєш реакцію ринку.',
            en: 'You change the product price and observe market reaction.'
          },
          {
            uk: 'Мета не просто підняти ціну, а знайти баланс між обсягом продажів і маржею.',
            en: 'The goal is not simply to raise the price but to balance sales volume and margin.'
          }
        ]
      },
      {
        title: {
          uk: 'Як проходить раунд',
          en: 'How a round works'
        },
        lines: [
          {
            uk: '1. Бачиш поточний попит, собівартість і ціль по прибутку.',
            en: '1. You see current demand, cost, and a profit target.'
          },
          {
            uk: '2. Обираєш одну цінову стратегію.',
            en: '2. You choose one pricing strategy.'
          },
          {
            uk: '3. Гра рахує результат і показує, чи не став попит надто слабким.',
            en: '3. The game calculates the result and shows whether demand became too weak.'
          }
        ]
      }
    ]
  },
  'soil-lab': {
    summary: {
      uk: 'Аграрний діагностичний концепт: гравець аналізує стан ґрунту й підбирає правильну підготовку поля.',
      en: 'An agricultural diagnostic concept: the player analyzes soil condition and selects the right field preparation.'
    },
    cards: [
      {
        title: {
          uk: 'Суть',
          en: 'Core idea'
        },
        lines: [
          {
            uk: 'Перед посівом ти отримуєш короткі дані про ґрунт, вологу й попередню культуру.',
            en: 'Before sowing you receive short data about soil, moisture, and the previous crop.'
          },
          {
            uk: 'Далі обираєш, який догляд або корекція потрібні полю першими.',
            en: 'Then you choose which care action or correction the field needs first.'
          }
        ]
      },
      {
        title: {
          uk: 'Що перевіряє гра',
          en: 'What the game checks'
        },
        lines: [
          {
            uk: 'Чи ти правильно читаєш сигнали проблеми: нестача вологи, кислотність, виснаження.',
            en: 'Whether you correctly read the problem signals: lack of moisture, acidity, or depletion.'
          },
          {
            uk: 'Чи твій вибір реально готує поле до кращого врожаю, а не просто витрачає ресурс.',
            en: 'Whether your choice truly prepares the field for a better yield rather than wasting resources.'
          }
        ]
      }
    ]
  }
};

const gamePlayBlueprints = {
  'javascript-hero': {
    label: {
      uk: 'Демо-рівень 1',
      en: 'Demo level 1'
    },
    title: {
      uk: 'Змінні та підрахунок результату',
      en: 'Variables and result calculation'
    },
    lead: {
      uk: 'Гравець бачить коротке завдання і має правильно скласти рішення з базових JavaScript-блоків.',
      en: 'The player sees a short task and must assemble the correct solution from basic JavaScript blocks.'
    },
    tasks: [
      {
        id: 'sum',
        title: {
          uk: 'Приклад 1. Змінні',
          en: 'Example 1. Variables'
        },
        lead: {
          uk: 'У тебе вже є `score = 12` і `bonus = 8`. Обери рядок, який правильно обчислює `total`.',
          en: 'You already have `score = 12` and `bonus = 8`. Choose the line that correctly calculates `total`.'
        },
        lines: [
          {
            uk: 'Очікуваний результат: `total = 20`.',
            en: 'Expected result: `total = 20`.'
          }
        ],
        options: [
          { id: 'a', code: 'let total = score - bonus;' },
          { id: 'b', code: 'let total = score + bonus;' },
          { id: 'c', code: 'let total = "score + bonus";' },
          { id: 'd', code: 'let total = score * bonus;' }
        ],
        correctOptionId: 'b',
        success: {
          uk: 'Так, оператор `+` додає два числа і дає `20`.',
          en: 'Yes, the `+` operator adds two numbers and gives `20`.'
        },
        hint: {
          uk: 'Подумай, яка дія потрібна, щоб із `12` і `8` отримати саме `20`.',
          en: 'Think about which operation turns `12` and `8` into exactly `20`.'
        }
      },
      {
        id: 'condition',
        title: {
          uk: 'Приклад 2. Умова if/else',
          en: 'Example 2. if/else condition'
        },
        lead: {
          uk: 'Змінна `age = 17`. Який фрагмент правильно записує `minor`, якщо вік менший за 18?',
          en: 'The variable `age = 17`. Which snippet correctly sets `minor` when age is less than 18?'
        },
        lines: [
          {
            uk: 'Очікуваний результат: при `17` змінна `status` має стати `minor`.',
            en: 'Expected result: with `17`, the variable `status` should become `minor`.'
          }
        ],
        options: [
          {
            id: 'a',
            code: `if (age > 18) {\n  status = 'minor';\n} else {\n  status = 'adult';\n}`
          },
          {
            id: 'b',
            code: `if (age < 18) {\n  status = 'minor';\n} else {\n  status = 'adult';\n}`
          },
          {
            id: 'c',
            code: `if (age = 18) {\n  status = 'minor';\n}`
          },
          {
            id: 'd',
            code: `status = age + 'minor';`
          }
        ],
        correctOptionId: 'b',
        success: {
          uk: 'Вірно: тут перевірка саме `age < 18`, і гілка `else` покриває всі інші випадки.',
          en: 'Correct: it checks `age < 18`, and the `else` branch covers all other cases.'
        },
        hint: {
          uk: 'Потрібно і правильне порівняння, і дві гілки: для `minor` та `adult`.',
          en: 'You need both the correct comparison and two branches: one for `minor` and one for `adult`.'
        }
      },
      {
        id: 'loop',
        title: {
          uk: 'Приклад 3. Цикл',
          en: 'Example 3. Loop'
        },
        lead: {
          uk: 'Є масив `numbers = [2, 4, 6]`. Обери код, який проходить по масиву й рахує суму елементів.',
          en: 'There is an array `numbers = [2, 4, 6]`. Choose the code that loops through the array and sums its elements.'
        },
        lines: [
          {
            uk: 'Очікуваний результат: після циклу `sum = 12`.',
            en: 'Expected result: after the loop `sum = 12`.'
          }
        ],
        options: [
          {
            id: 'a',
            code: `let sum = 0;\nfor (let i = 0; i < numbers.length; i++) {\n  sum += numbers[i];\n}`
          },
          {
            id: 'b',
            code: `let sum = 0;\nfor (let i = 0; i > numbers.length; i++) {\n  sum += numbers[i];\n}`
          },
          {
            id: 'c',
            code: `let sum = 0;\nfor (let i = 0; i < numbers.length; i++) {\n  sum = numbers[i];\n}`
          },
          {
            id: 'd',
            code: `let sum = numbers.length;`
          }
        ],
        correctOptionId: 'a',
        success: {
          uk: 'Саме так: цикл проходить всі індекси й додає кожен елемент до `sum`.',
          en: 'Exactly: the loop visits every index and adds each element to `sum`.'
        },
        hint: {
          uk: 'Подивись, де цикл реально проходить по всіх елементах і не перезаписує суму щоразу.',
          en: 'Look for the loop that truly goes through all items and does not overwrite the sum each time.'
        }
      },
      {
        id: 'array-method',
        title: {
          uk: 'Приклад 4. Масив',
          en: 'Example 4. Array'
        },
        lead: {
          uk: 'Є `const fruits = ["apple", "pear"]`. Яка команда додає `"plum"` в кінець масиву?',
          en: 'There is `const fruits = ["apple", "pear"]`. Which command adds `"plum"` to the end of the array?'
        },
        lines: [
          {
            uk: 'Очікуваний результат: `["apple", "pear", "plum"]`.',
            en: 'Expected result: `["apple", "pear", "plum"]`.'
          }
        ],
        options: [
          { id: 'a', code: `fruits.add('plum')` },
          { id: 'b', code: `fruits.push('plum')` },
          { id: 'c', code: `fruits = 'plum'` },
          { id: 'd', code: `fruits.pop('plum')` }
        ],
        correctOptionId: 'b',
        success: {
          uk: 'Так, `push()` додає новий елемент в кінець масиву.',
          en: 'Yes, `push()` adds a new element to the end of the array.'
        },
        hint: {
          uk: 'Згадай стандартний метод масиву для додавання елемента в кінець.',
          en: 'Recall the standard array method used to add an item to the end.'
        }
      }
    ],
    cards: [
      {
        title: {
          uk: 'Завдання рівня',
          en: 'Level task'
        },
        lines: [
          {
            uk: 'Створи `score = 12` і `bonus = 8`.',
            en: 'Create `score = 12` and `bonus = 8`.'
          },
          {
            uk: 'Знайди `total = 20`.',
            en: 'Find `total = 20`.'
          }
        ]
      },
      {
        title: {
          uk: 'Що бачить гравець',
          en: 'What the player sees'
        },
        lines: [
          {
            uk: 'Коротку умову, блоки коду і кнопку перевірки.',
            en: 'A short prompt, code blocks, and a validate button.'
          },
          {
            uk: 'Після правильної відповіді відкривається наступний рівень.',
            en: 'After a correct answer the next level is unlocked.'
          }
        ]
      }
    ]
  },
  'flexbox-rush': {
    label: {
      uk: 'Демо-рівень Flexbox',
      en: 'Flexbox demo level'
    },
    title: {
      uk: 'Вирівнювання елементів у контейнері',
      en: 'Aligning elements inside a container'
    },
    lead: {
      uk: 'Ти бачиш цільову розкладку елементів і маєш вибрати ту CSS-властивість, що дає правильне вирівнювання.',
      en: 'You see a target layout and must choose the CSS property that produces the correct alignment.'
    },
    tasks: [
      {
        id: 'justify-center',
        title: {
          uk: 'Приклад 1. Центрування по горизонталі',
          en: 'Example 1. Horizontal centering'
        },
        lead: {
          uk: 'Елементи мають стати по центру рядка всередині flex-контейнера. Що обрати?',
          en: 'The items should move to the center of the row inside a flex container. What should you choose?'
        },
        lines: [
          {
            uk: 'Потрібно вирівняти елементи по головній осі контейнера.',
            en: 'You need to align the items along the main axis of the container.'
          }
        ],
        options: [
          { id: 'a', code: 'justify-content: center;' },
          { id: 'b', code: 'align-items: center;' },
          { id: 'c', code: 'flex-wrap: wrap;' },
          { id: 'd', code: 'flex-direction: column;' }
        ],
        correctOptionId: 'a',
        success: {
          uk: 'Так, `justify-content` вирівнює елементи вздовж головної осі.',
          en: 'Yes, `justify-content` aligns items along the main axis.'
        },
        hint: {
          uk: 'Подумай саме про горизонтальний розподіл у рядку, а не про вертикальну вісь.',
          en: 'Think specifically about horizontal distribution in a row, not the vertical axis.'
        }
      },
      {
        id: 'align-center',
        title: {
          uk: 'Приклад 2. Центр по вертикалі',
          en: 'Example 2. Vertical centering'
        },
        lead: {
          uk: 'Картки стоять у ряд, але їх треба вирівняти по центру по поперечній осі контейнера.',
          en: 'Cards are already in a row, but they need to be centered on the cross axis of the container.'
        },
        lines: [
          {
            uk: 'Працюємо з поперечною віссю flex-контейнера.',
            en: 'We are working with the cross axis of the flex container.'
          }
        ],
        options: [
          { id: 'a', code: 'justify-content: space-between;' },
          { id: 'b', code: 'align-items: center;' },
          { id: 'c', code: 'align-content: stretch;' },
          { id: 'd', code: 'flex-grow: 1;' }
        ],
        correctOptionId: 'b',
        success: {
          uk: 'Вірно, `align-items: center` центрує елементи по поперечній осі.',
          en: 'Correct, `align-items: center` centers items on the cross axis.'
        },
        hint: {
          uk: 'Шукай властивість, яка працює не з відстанями між блоками, а з їх положенням по другій осі.',
          en: 'Look for the property that controls position on the second axis rather than spacing between blocks.'
        }
      },
      {
        id: 'wrap',
        title: {
          uk: 'Приклад 3. Перенесення елементів',
          en: 'Example 3. Wrapping elements'
        },
        lead: {
          uk: 'У контейнері забагато карток для одного рядка. Що дозволить переносити їх на новий ряд?',
          en: 'There are too many cards for one row in the container. What will let them move onto a new line?'
        },
        lines: [
          {
            uk: 'Потрібно дозволити flex-елементам переноситися.',
            en: 'You need to allow flex items to wrap.'
          }
        ],
        options: [
          { id: 'a', code: 'flex-wrap: wrap;' },
          { id: 'b', code: 'justify-content: wrap;' },
          { id: 'c', code: 'align-items: wrap;' },
          { id: 'd', code: 'display: block;' }
        ],
        correctOptionId: 'a',
        success: {
          uk: 'Саме так, за перенесення елементів відповідає `flex-wrap`.',
          en: 'Exactly, `flex-wrap` controls whether items wrap.'
        },
        hint: {
          uk: 'Згадай властивість, яка дозволяє flex-елементам переходити на новий ряд.',
          en: 'Recall the property that allows flex items to move onto a new line.'
        }
      }
    ],
    cards: [
      {
        title: {
          uk: 'Що бачить гравець',
          en: 'What the player sees'
        },
        lines: [
          {
            uk: 'Макет, цільове положення елементів і кілька CSS-відповідей.',
            en: 'A layout, the target arrangement of elements, and several CSS answer options.'
          }
        ]
      }
    ]
  },
  'negotiation-room': {
    label: {
      uk: 'Демо-переговори',
      en: 'Negotiation demo'
    },
    title: {
      uk: 'Розмова без ескалації',
      en: 'A conversation without escalation'
    },
    lead: {
      uk: 'Ти обираєш репліки у складній діловій розмові. Мета: зберегти контакт і вийти на наступний конструктивний крок.',
      en: 'You choose replies in a difficult business conversation. The goal is to preserve contact and move toward a constructive next step.'
    },
    tasks: [
      {
        id: 'acknowledge',
        title: {
          uk: 'Приклад 1. Старт напруженої розмови',
          en: 'Example 1. Opening a tense conversation'
        },
        lead: {
          uk: 'Партнер каже: “Ваш дедлайн нереалістичний, ми так не встигнемо”. Яка відповідь найкраща?',
          en: 'A partner says: “Your deadline is unrealistic, we will not make it.” Which reply is best?'
        },
        lines: [
          {
            uk: 'Потрібно не сперечатися одразу, а зафіксувати проблему й перейти до обговорення варіантів.',
            en: 'You should not argue immediately, but first acknowledge the issue and move toward options.'
          }
        ],
        options: [
          { id: 'a', code: 'Це ваші проблеми, дедлайн не змінюється.' },
          { id: 'b', code: 'Давайте уточнимо, що саме блокує термін, і подивимось на варіанти пріоритетів.' },
          { id: 'c', code: 'Ви знову затягуєте процес.' },
          { id: 'd', code: 'Тоді просто скасовуємо весь проєкт.' }
        ],
        correctOptionId: 'b',
        success: {
          uk: 'Так, ця відповідь визнає проблему і переводить розмову в площину рішень.',
          en: 'Yes, this reply acknowledges the problem and shifts the conversation toward solutions.'
        },
        hint: {
          uk: 'Шукай відповідь, яка не звинувачує, а уточнює причину і відкриває шлях до домовленості.',
          en: 'Look for the reply that avoids blame, clarifies the reason, and opens the path to agreement.'
        }
      },
      {
        id: 'tradeoff',
        title: {
          uk: 'Приклад 2. Торг за умови',
          en: 'Example 2. Negotiating terms'
        },
        lead: {
          uk: 'Клієнт просить знижку, але хоче залишити весь обсяг робіт. Що відповісти найкраще?',
          en: 'A client asks for a discount but wants to keep the full scope of work. What is the best response?'
        },
        lines: [
          {
            uk: 'Потрібно зберегти цінність роботи й запропонувати варіант обміну поступками.',
            en: 'You need to preserve the value of the work and offer a trade-off.'
          }
        ],
        options: [
          { id: 'a', code: 'Добре, знижка буде, але ми нічого не міняємо.' },
          { id: 'b', code: 'Ніяких знижок нікому не даємо.' },
          { id: 'c', code: 'Можемо переглянути бюджет, якщо разом звузимо обсяг або змінимо етапність.' },
          { id: 'd', code: 'Я ще не знаю, зробимо якось потім.' }
        ],
        correctOptionId: 'c',
        success: {
          uk: 'Вірно: це не жорстке "ні", а керована пропозиція з обміном умов.',
          en: 'Correct: it is not a hard "no", but a managed proposal with exchanged conditions.'
        },
        hint: {
          uk: 'Краща відповідь тримає межі, але дає простір для варіанта "щось за щось".',
          en: 'The best reply keeps boundaries while creating room for a "something for something" trade-off.'
        }
      },
      {
        id: 'close-next-step',
        title: {
          uk: 'Приклад 3. Завершення розмови',
          en: 'Example 3. Closing the conversation'
        },
        lead: {
          uk: 'Сторони вже майже погодилися. Яка фраза найкраще закриє розмову в дію?',
          en: 'The sides are almost aligned. Which phrase best closes the conversation into action?'
        },
        lines: [
          {
            uk: 'Потрібно зафіксувати конкретний наступний крок, а не залишити все "на потім".',
            en: 'You need to define a concrete next step instead of leaving everything vague.'
          }
        ],
        options: [
          { id: 'a', code: 'Добре, тоді якось спишемось.' },
          { id: 'b', code: 'Супер, тоді завтра до 12:00 я надсилаю оновлений план, а ви підтверджуєте обсяг.' },
          { id: 'c', code: 'Ну, в принципі, поговорили.' },
          { id: 'd', code: 'Побачимо, як піде.' }
        ],
        correctOptionId: 'b',
        success: {
          uk: 'Так, домовленість стала конкретною: хто, що і коли робить далі.',
          en: 'Yes, the agreement became concrete: who does what and by when.'
        },
        hint: {
          uk: 'Шукай формулювання з чітким виконавцем, дією і дедлайном.',
          en: 'Look for the wording with a clear owner, action, and deadline.'
        }
      }
    ],
    cards: [
      {
        title: {
          uk: 'Ключова навичка',
          en: 'Core skill'
        },
        lines: [
          {
            uk: 'Не доводити свою правоту будь-якою ціною, а вести діалог до керованої домовленості.',
            en: 'Do not prove yourself right at any cost, but move the dialogue toward a manageable agreement.'
          }
        ]
      }
    ]
  },
  'pricing-lab': {
    label: {
      uk: 'Симулятор ціни',
      en: 'Pricing simulator'
    },
    title: {
      uk: 'Баланс попиту і прибутку',
      en: 'Balancing demand and profit'
    },
    lead: {
      uk: 'Ти змінюєш ціну продукту й одразу бачиш, як це впливає на попит, виручку та маржу.',
      en: 'You change the price of a product and immediately see how it affects demand, revenue, and margin.'
    },
    cards: [
      {
        title: {
          uk: 'Сценарій',
          en: 'Scenario'
        },
        lines: [
          {
            uk: 'Магазин запускає новий товар і має знайти робочу стартову ціну.',
            en: 'A store is launching a new product and must find a workable starting price.'
          },
          {
            uk: 'Кожен вибір дає новий рівень попиту й прибутковості.',
            en: 'Each choice produces a new level of demand and profitability.'
          }
        ]
      }
    ]
  },
  'soil-lab': {
    label: {
      uk: 'Діагностика поля',
      en: 'Field diagnostics'
    },
    title: {
      uk: 'Підготовка ґрунту до посіву',
      en: 'Preparing soil for sowing'
    },
    lead: {
      uk: 'Перед посівом ти аналізуєш параметри поля й обираєш, яка дія зараз дасть найкращий ефект.',
      en: 'Before sowing you analyze field parameters and choose which action will have the best effect right now.'
    },
    cards: [
      {
        title: {
          uk: 'Що бачить гравець',
          en: 'What the player sees'
        },
        lines: [
          {
            uk: 'Короткий звіт по волозі, кислотності, структурі ґрунту і попередній культурі.',
            en: 'A short report on moisture, acidity, soil structure, and the previous crop.'
          },
          {
            uk: 'Нижче кілька дій: корекція, добриво, відпочинок поля або інший підхід.',
            en: 'Below that are several actions: correction, fertilizer, rest for the field, or another approach.'
          }
        ]
      }
    ]
  }
};

const leaderboardPlayers = [
  {
    name: 'Nova',
    avatar: '🚀',
    xp: 980,
    favoriteCategory: 'it',
    categoryScores: { it: 520, economy: 180, softskills: 170, agro: 110 }
  },
  {
    name: 'Mia',
    avatar: '📈',
    xp: 910,
    favoriteCategory: 'economy',
    categoryScores: { it: 160, economy: 470, softskills: 140, agro: 140 }
  },
  {
    name: 'Kai',
    avatar: '🤝',
    xp: 860,
    favoriteCategory: 'softskills',
    categoryScores: { it: 150, economy: 160, softskills: 410, agro: 140 }
  },
  {
    name: 'Leo',
    avatar: '🌾',
    xp: 790,
    favoriteCategory: 'agro',
    categoryScores: { it: 120, economy: 130, softskills: 140, agro: 400 }
  }
];

const state = {
  leaderboardFilter: 'all',
  selectedCategory: 'it',
  selectedSubcategory: 'webdev',
  activeLecture: null,
  activeGame: null
};

let toastTimer;

const lectureElements = {
  modal: document.getElementById('lectureModal'),
  badge: document.getElementById('lectureBadge'),
  title: document.getElementById('lectureTitle'),
  summary: document.getElementById('lectureSummary'),
  theoryTitle: document.getElementById('lectureTheoryTitle'),
  flowTitle: document.getElementById('lectureFlowTitle'),
  resultTitle: document.getElementById('lectureResultTitle'),
  points: document.getElementById('lecturePoints'),
  flowText: document.getElementById('lectureFlowText'),
  resultText: document.getElementById('lectureResultText'),
  detailSection: document.getElementById('lectureDetailSection'),
  detailTitle: document.getElementById('lectureDetailTitle'),
  detailGrid: document.getElementById('lectureDetailGrid'),
  closeBtn: document.getElementById('lectureCloseBtn'),
  closeIcon: document.getElementById('lectureCloseIcon'),
  startBtn: document.getElementById('lectureStartBtn')
};

const gameElements = {
  modal: document.getElementById('gameModal'),
  badge: document.getElementById('gameBadge'),
  closeIcon: document.getElementById('gameCloseIcon'),
  logicStep: document.getElementById('gameLogicStep'),
  logicTitle: document.getElementById('gameLogicTitle'),
  logicSummary: document.getElementById('gameLogicSummary'),
  logicGrid: document.getElementById('gameLogicGrid'),
  logicCloseBtn: document.getElementById('gameLogicCloseBtn'),
  continueBtn: document.getElementById('gameContinueBtn'),
  playStep: document.getElementById('gamePlayStep'),
  playLabel: document.getElementById('gamePlayLabel'),
  playStatus: document.getElementById('gamePlayStatus'),
  playTitle: document.getElementById('gamePlayTitle'),
  playLead: document.getElementById('gamePlayLead'),
  playCards: document.getElementById('gamePlayCards'),
  backBtn: document.getElementById('gameBackBtn'),
  closeBtn: document.getElementById('gameCloseBtn')
};

function getDb() {
  return window.AppDB?.getData?.() || {};
}

function getProfile() {
  return getDb().profile || {};
}

function getProgress() {
  const progress = getDb().progress || {};
  return {
    ...PROGRESS_TEMPLATE,
    ...progress,
    categoryScores: {
      ...PROGRESS_TEMPLATE.categoryScores,
      ...(progress.categoryScores || {})
    },
    recentGames: Array.isArray(progress.recentGames) ? progress.recentGames : []
  };
}

function updateBalance() {
  const balanceSpan = document.getElementById('coinBalance');
  if (balanceSpan) balanceSpan.innerText = String(getProfile().coins || 125);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function getCategoryName(categoryId) {
  return text(categories[categoryId]?.name) || copy.strongestFallback;
}

function getStrongestCategoryId(scores) {
  const best = Object.entries(scores || {}).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] <= 0) return null;
  return best[0];
}

function getSubcategoryName(categoryId, subcategoryId) {
  return text(categories[categoryId]?.subcategories?.[subcategoryId]?.name) || copy.strongestFallback;
}

function getLectureContent(gameId, subcategoryId) {
  const template = lectureTemplates[subcategoryId];
  return {
    summary: text(template?.summary) || copy.lectureFallbackSummary,
    points: (template?.points || []).map((point) => text(point)).filter(Boolean),
    result: text(template?.result) || copy.lectureFallbackResult,
    flow: text(lectureGameFlow[gameId]) || copy.lectureComingSoon
  };
}

function getGameLogicContent(gameId, subcategoryId) {
  const blueprint = detailedGameBlueprints[gameId];

  if (blueprint?.cards?.length) {
    return {
      summary: text(blueprint.summary) || text(lectureGameFlow[gameId]) || copy.gameFallbackLogicSummary,
      cards: blueprint.cards
    };
  }

  return {
    summary: text(lectureGameFlow[gameId]) || copy.gameFallbackLogicSummary,
    cards: [
      {
        title: { uk: 'Що робить гравець', en: 'What the player does' },
        lines: [
          { uk: 'Читає задачу і бачить мету раунду.', en: 'Reads the task and sees the round goal.' },
          { uk: 'Виконує одну навчальну дію та відправляє відповідь на перевірку.', en: 'Performs one learning action and submits an answer for validation.' }
        ]
      },
      {
        title: { uk: 'Що перевіряє гра', en: 'What the game checks' },
        lines: [
          { uk: 'Правильність рішення, логіку кроків і очікуваний результат.', en: 'Correctness of the solution, the logic of steps, and the expected result.' },
          { uk: 'Після перевірки гравець переходить до наступної задачі.', en: 'After validation the player moves to the next task.' }
        ]
      }
    ]
  };
}

function getGamePlayContent(game, categoryId, subcategoryId) {
  const blueprint = gamePlayBlueprints[game.id];

  if (blueprint?.cards?.length) {
    return blueprint;
  }

  return {
    label: { uk: copy.gameFallbackPlayLabel, en: copy.gameFallbackPlayLabel },
    title: { uk: game.name, en: game.name },
    lead: { uk: copy.gameFallbackPlayLead, en: copy.gameFallbackPlayLead },
    cards: [
      {
        title: { uk: 'Сценарій', en: 'Scenario' },
        lines: [
          { uk: `Категорія: ${getCategoryName(categoryId)}.`, en: `Category: ${getCategoryName(categoryId)}.` },
          { uk: `Підкатегорія: ${getSubcategoryName(categoryId, subcategoryId)}.`, en: `Subcategory: ${getSubcategoryName(categoryId, subcategoryId)}.` }
        ]
      },
      {
        title: { uk: 'Наступний крок', en: 'Next step' },
        lines: [
          { uk: 'Тут буде поле відповіді, кнопка перевірки та завершення раунду.', en: 'This is where the answer area, validate button, and round completion will be placed.' }
        ]
      }
    ]
  };
}

function getPlayableGameBlueprint(gameId) {
  const blueprint = gamePlayBlueprints[gameId];
  return Array.isArray(blueprint?.tasks) && blueprint.tasks.length ? blueprint : null;
}

function buildGameReward(game, correctAnswers, totalTasks, mistakes) {
  const accuracy = totalTasks ? correctAnswers / totalTasks : 0;
  const mistakePenalty = Math.max(0, 1 - mistakes * 0.12);
  const factor = Math.max(0.45, Math.min(1, accuracy * mistakePenalty + 0.25));

  return {
    xp: Math.max(10, Math.round(game.xp * factor)),
    coins: Math.max(8, Math.round(game.reward * factor))
  };
}

function applyGameRewards(categoryId, subcategoryId, game, reward) {
  window.AppDB?.update?.((db) => {
    db.profile.coins = Number(db.profile.coins || 125) + reward.coins;
    db.progress = {
      ...PROGRESS_TEMPLATE,
      ...(db.progress || {}),
      categoryScores: {
        ...PROGRESS_TEMPLATE.categoryScores,
        ...((db.progress || {}).categoryScores || {})
      },
      recentGames: Array.isArray(db.progress?.recentGames) ? db.progress.recentGames : []
    };
    db.progress.xp = Number(db.progress.xp || 0) + reward.xp;
    db.progress.gamesPlayed = Number(db.progress.gamesPlayed || 0) + 1;
    db.progress.categoryScores[categoryId] = Number(db.progress.categoryScores[categoryId] || 0) + reward.xp;
    db.progress.favoriteCategory = getStrongestCategoryId(db.progress.categoryScores) || categoryId;
    db.progress.recentGames.unshift({
      id: game.id,
      name: game.name,
      categoryId,
      subcategoryId,
      xp: reward.xp,
      reward: reward.coins,
      playedAt: Date.now()
    });
    db.progress.recentGames = db.progress.recentGames.slice(0, 6);
  });
}

function resetActiveGameProgress() {
  if (!state.activeGame) return;
  state.activeGame.currentTaskIndex = 0;
  state.activeGame.selectedOptionId = null;
  state.activeGame.checked = false;
  state.activeGame.lastWasCorrect = false;
  state.activeGame.feedbackMessage = '';
  state.activeGame.correctAnswers = 0;
  state.activeGame.mistakes = 0;
  state.activeGame.completed = false;
  state.activeGame.awarded = false;
  state.activeGame.reward = null;
}

function getActiveGameTask() {
  if (!state.activeGame) return null;
  const blueprint = getPlayableGameBlueprint(state.activeGame.game.id);
  if (!blueprint) return null;
  return blueprint.tasks[state.activeGame.currentTaskIndex] || null;
}

function selectGameOption(optionId) {
  if (!state.activeGame || state.activeGame.completed || state.activeGame.checked) return;
  state.activeGame.selectedOptionId = optionId;
  renderGameModal();
}

function checkGameAnswer() {
  const task = getActiveGameTask();
  if (!task || !state.activeGame) return;

  if (!state.activeGame.selectedOptionId) {
    showToast(copy.gameSelectOption);
    return;
  }

  const isCorrect = state.activeGame.selectedOptionId === task.correctOptionId;
  state.activeGame.checked = true;
  state.activeGame.lastWasCorrect = isCorrect;
  state.activeGame.feedbackMessage = text(isCorrect ? task.success : task.hint);

  if (isCorrect) {
    state.activeGame.correctAnswers += 1;
  } else {
    state.activeGame.mistakes += 1;
  }

  renderGameModal();
}

function retryGameTask() {
  if (!state.activeGame) return;
  state.activeGame.selectedOptionId = null;
  state.activeGame.checked = false;
  state.activeGame.lastWasCorrect = false;
  state.activeGame.feedbackMessage = '';
  renderGameModal();
}

function finishPlayableGame() {
  if (!state.activeGame || state.activeGame.completed) return;
  const blueprint = getPlayableGameBlueprint(state.activeGame.game.id);
  const totalTasks = blueprint?.tasks?.length || 0;
  const reward = buildGameReward(
    state.activeGame.game,
    state.activeGame.correctAnswers,
    totalTasks,
    state.activeGame.mistakes
  );

  state.activeGame.completed = true;
  state.activeGame.reward = reward;

  if (!state.activeGame.awarded) {
    applyGameRewards(state.activeGame.categoryId, state.activeGame.subcategoryId, state.activeGame.game, reward);
    state.activeGame.awarded = true;
    updateBalance();
    renderHome();
    showToast(`${state.activeGame.game.name}: +${reward.xp} XP, +${reward.coins} ${copy.coinsReward}`);
  }

  renderGameModal();
}

function nextGameTask() {
  if (!state.activeGame) return;
  const blueprint = getPlayableGameBlueprint(state.activeGame.game.id);
  if (!blueprint) return;

  const isLastTask = state.activeGame.currentTaskIndex >= blueprint.tasks.length - 1;
  if (isLastTask) {
    finishPlayableGame();
    return;
  }

  state.activeGame.currentTaskIndex += 1;
  state.activeGame.selectedOptionId = null;
  state.activeGame.checked = false;
  state.activeGame.lastWasCorrect = false;
  state.activeGame.feedbackMessage = '';
  renderGameModal();
}

function openModal(modal) {
  if (!modal) return;
  modal.style.display = 'flex';
}

function closeModal(modal) {
  if (!modal) return;
  modal.style.display = 'none';
  if (modal === lectureElements.modal) state.activeLecture = null;
  if (modal === gameElements.modal) state.activeGame = null;
}

function renderLectureModal() {
  if (!state.activeLecture) return;
  const { game, categoryId, subcategoryId } = state.activeLecture;
  const lecture = getLectureContent(game.id, subcategoryId);

  lectureElements.badge.textContent = `${copy.lectureBadge} • ${getSubcategoryName(categoryId, subcategoryId)}`;
  lectureElements.title.textContent = game.name;
  lectureElements.summary.textContent = lecture.summary;
  lectureElements.theoryTitle.textContent = copy.lectureTheoryTitle;
  lectureElements.flowTitle.textContent = copy.lectureFlowTitle;
  lectureElements.resultTitle.textContent = copy.lectureResultTitle;
  lectureElements.flowText.textContent = lecture.flow;
  lectureElements.resultText.textContent = lecture.result;
  lectureElements.closeBtn.textContent = copy.lectureClose;
  lectureElements.startBtn.textContent = copy.lectureStart;
  lectureElements.points.innerHTML = lecture.points.map((point, index) => `
    <div class="lecture-point">
      <span class="lecture-point__index">${index + 1}</span>
      <span class="lecture-point__text">${point}</span>
    </div>
  `).join('');
  lectureElements.detailSection.hidden = true;
  lectureElements.detailGrid.innerHTML = '';
}

function renderGameModal() {
  if (!state.activeGame) return;

  const { game, categoryId, subcategoryId, step } = state.activeGame;
  const logic = getGameLogicContent(game.id, subcategoryId);
  const play = getGamePlayContent(game, categoryId, subcategoryId);
  const playableBlueprint = getPlayableGameBlueprint(game.id);
  const isPlayStep = step === 'play';

  gameElements.badge.textContent = isPlayStep ? copy.gameBadgePlay : copy.gameBadgeLogic;
  gameElements.logicTitle.textContent = game.name;
  gameElements.logicSummary.textContent = logic.summary;
  gameElements.logicGrid.innerHTML = logic.cards.map((card) => `
    <article class="game-logic-card">
      <h4>${text(card.title)}</h4>
      <ul>
        ${card.lines.map((line) => `<li>${text(line)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
  gameElements.logicCloseBtn.textContent = copy.gameLogicClose;
  gameElements.continueBtn.textContent = copy.gameContinue;

  if (playableBlueprint && isPlayStep) {
    if (state.activeGame.completed) {
      const totalTasks = playableBlueprint.tasks.length;
      const reward = state.activeGame.reward || buildGameReward(
        game,
        state.activeGame.correctAnswers,
        totalTasks,
        state.activeGame.mistakes
      );

      gameElements.playLabel.textContent = copy.gameResultsLabel;
      gameElements.playStatus.textContent = `${state.activeGame.correctAnswers}/${totalTasks}`;
      gameElements.playTitle.textContent = copy.gameCompletedTitle;
      gameElements.playLead.textContent = copy.gameCompletedLead;
      gameElements.playCards.innerHTML = `
        <article class="game-play-card">
          <h4>${copy.gameScoreLabel}</h4>
          <ul>
            <li>${state.activeGame.correctAnswers}/${totalTasks}</li>
            <li>${copy.gameMistakesLabel}: ${state.activeGame.mistakes}</li>
          </ul>
        </article>
        <article class="game-play-card">
          <h4>${copy.gameRewardLabel}</h4>
          <ul>
            <li>+${reward.xp} XP</li>
            <li>+${reward.coins} ${copy.coinsReward}</li>
          </ul>
        </article>
      `;
      gameElements.backBtn.textContent = copy.gameRestart;
    } else {
      const task = getActiveGameTask();
      const isLastTask = state.activeGame.currentTaskIndex >= playableBlueprint.tasks.length - 1;
      const feedbackClass = state.activeGame.lastWasCorrect ? 'is-correct' : 'is-wrong';
      const primaryAction = !state.activeGame.checked
        ? { id: 'check', label: copy.gameCheck, disabled: !state.activeGame.selectedOptionId }
        : state.activeGame.lastWasCorrect
          ? { id: 'next', label: isLastTask ? copy.gameFinish : copy.gameNext, disabled: false }
          : { id: 'retry', label: copy.gameRetry, disabled: false };

      gameElements.playLabel.textContent = `${copy.gameFallbackPlayLabel} ${state.activeGame.currentTaskIndex + 1}/${playableBlueprint.tasks.length}`;
      gameElements.playStatus.textContent = `${copy.gameScoreLabel}: ${state.activeGame.correctAnswers}/${playableBlueprint.tasks.length}`;
      gameElements.playTitle.textContent = text(task.title);
      gameElements.playLead.textContent = text(task.lead);
        gameElements.playCards.innerHTML = `
          <article class="game-play-card game-task-card">
            <h4>${copy.gameTaskLabel}</h4>
            <ul class="game-task-list">
              ${(task.lines || []).map((line) => `<li>${escapeHtml(text(line))}</li>`).join('')}
            </ul>
          </article>
          <div class="game-options">
          ${task.options.map((option, index) => {
            const isSelected = state.activeGame.selectedOptionId === option.id;
              const isCorrectOption = state.activeGame.checked && option.id === task.correctOptionId;
              const isWrongSelected = state.activeGame.checked && isSelected && option.id !== task.correctOptionId;
              return `
                <button class="game-option ${isSelected ? 'is-selected' : ''} ${isCorrectOption ? 'is-correct' : ''} ${isWrongSelected ? 'is-wrong' : ''}" data-option-id="${option.id}" type="button" aria-pressed="${isSelected ? 'true' : 'false'}" ${state.activeGame.checked ? 'disabled' : ''}>
                  <span class="game-option__letter">${String.fromCharCode(65 + index)}</span>
                  <pre>${escapeHtml(option.code)}</pre>
                </button>
              `;
            }).join('')}
        </div>
        ${state.activeGame.checked ? `
          <div class="game-feedback ${feedbackClass}">
            <strong>${state.activeGame.lastWasCorrect ? copy.gameCorrect : copy.gameWrong}</strong>
            <p>${escapeHtml(state.activeGame.feedbackMessage || '')}</p>
          </div>
        ` : ''}
        <div class="game-inline-actions">
          <button class="modal-save game-inline-button" data-game-action="${primaryAction.id}" type="button" ${primaryAction.disabled ? 'disabled' : ''}>${primaryAction.label}</button>
        </div>
      `;
      gameElements.backBtn.textContent = copy.gameBack;
    }
  } else {
    gameElements.playLabel.textContent = text(play.label);
    gameElements.playStatus.textContent = copy.gamePlayStatus;
    gameElements.playTitle.textContent = text(play.title);
    gameElements.playLead.textContent = text(play.lead);
    gameElements.playCards.innerHTML = play.cards.map((card) => `
      <article class="game-play-card">
        <h4>${text(card.title)}</h4>
        <ul>
          ${card.lines.map((line) => `<li>${text(line)}</li>`).join('')}
        </ul>
      </article>
    `).join('');
    gameElements.backBtn.textContent = copy.gameBack;
  }

  gameElements.closeBtn.textContent = copy.gameClose;

  gameElements.logicStep.hidden = isPlayStep;
  gameElements.playStep.hidden = !isPlayStep;
}

function getStrongestCategory(progress) {
  const bestCategoryId = getStrongestCategoryId(progress.categoryScores);
  if (!bestCategoryId) return copy.strongestFallback;
  return getCategoryName(bestCategoryId);
}

function getAvatarMarkup(profile) {
  const avatarImage = String(profile.avatarImage || '').trim();
  if (avatarImage) {
    return `<img class="profile-avatar__image" src="${avatarImage}" alt="avatar">`;
  }
  return `<span class="profile-avatar__emoji">${profile.currentAvatar || profile.avatar || '👨‍🎓'}</span>`;
}

function getPlayerAvatarMarkup(player, imageClass, fallbackClass) {
  const avatarImage = String(player.avatarImage || '').trim();
  if (avatarImage) {
    return `<img class="${imageClass}" src="${escapeHtml(avatarImage)}" alt="avatar">`;
  }
  return `<span class="${fallbackClass}">${escapeHtml(player.avatar || '👨‍🎓')}</span>`;
}

function getSelectedCategory() {
  return categories[state.selectedCategory] || categories.it;
}

function getSelectedSubcategory() {
  const category = getSelectedCategory();
  return category.subcategories[state.selectedSubcategory] || Object.values(category.subcategories)[0];
}

function flattenGames() {
  return Object.values(categories).flatMap((category) =>
    Object.values(category.subcategories).flatMap((subcategory) =>
      subcategory.games.map((game) => ({ ...game, categoryId: category.id, subcategoryId: subcategory.id }))
    )
  );
}

function getPopularGames() {
  return flattenGames()
    .sort((a, b) => (b.rating * 100 + b.xp) - (a.rating * 100 + a.xp))
    .slice(0, 4);
}

function getLeaderboard(filterId = state.leaderboardFilter) {
  const profile = getProfile();
  const progress = getProgress();
  const currentPlayer = {
    name: profile.name || currentUser,
    avatar: profile.currentAvatar || profile.avatar || '👨‍🎓',
    avatarImage: profile.avatarImage || '',
    xp: progress.xp,
    favoriteCategory: getStrongestCategoryId(progress.categoryScores) || progress.favoriteCategory || 'it',
    categoryScores: {
      ...PROGRESS_TEMPLATE.categoryScores,
      ...(progress.categoryScores || {})
    },
    isCurrentUser: true
  };

  const allPlayers = [...leaderboardPlayers, currentPlayer];

  if (filterId === 'all') {
    return allPlayers
      .map((player) => ({
        ...player,
        boardScore: Number(player.xp || 0),
        boardMeta: getCategoryName(getStrongestCategoryId(player.categoryScores) || player.favoriteCategory)
      }))
      .sort((a, b) => b.boardScore - a.boardScore);
  }

  return allPlayers
    .map((player) => ({
      ...player,
      boardScore: Number(player.categoryScores?.[filterId] || 0),
      boardMeta: getCategoryName(filterId)
    }))
    .filter((player) => player.boardScore > 0 || player.isCurrentUser)
    .sort((a, b) => b.boardScore - a.boardScore);
}

function renderProfileSection(profile, progress) {
  return `
    <section class="dashboard-section profile-overview">
      <div class="profile-overview__main">
        <div class="profile-avatar">${getAvatarMarkup(profile)}</div>
        <div class="profile-copy">
          <p class="section-kicker">${copy.profileTitle}</p>
          <h2>${profile.name || currentUser}</h2>
          <p>${copy.profileText}</p>
          <div class="profile-status">${copy.online}</div>
        </div>
      </div>
      <div class="profile-metrics">
        <article class="metric-card"><span>${copy.xp}</span><strong>${progress.xp}</strong></article>
        <article class="metric-card"><span>${copy.gamesPlayed}</span><strong>${progress.gamesPlayed}</strong></article>
        <article class="metric-card"><span>${copy.strongest}</span><strong>${getStrongestCategory(progress)}</strong></article>
      </div>
    </section>
  `;
}

function renderStatsSection(progress) {
  const total = Math.max(100, ...Object.values(progress.categoryScores));
  const markup = Object.values(categories).map((category) => {
    const score = progress.categoryScores[category.id] || 0;
    const percent = Math.min(100, Math.round((score / total) * 100));
    return `
      <article class="progress-card ${category.tone}">
        <div class="progress-card__top">
          <div><span class="progress-card__icon">${category.icon}</span><strong>${text(category.name)}</strong></div>
          <b>${score} XP</b>
        </div>
        <p>${text(category.desc)}</p>
        <div class="progress-bar"><span style="width:${percent}%"></span></div>
      </article>
    `;
  }).join('');

  return `
    <section class="dashboard-section">
      <div class="section-heading"><div><p class="section-kicker">${copy.statsTitle}</p><h3>${copy.statsText}</h3></div></div>
      <div class="progress-grid">${markup}</div>
    </section>
  `;
}

function renderLeaderboardSection() {
  const filters = [
    { id: 'all', label: copy.allCategories },
    ...Object.values(categories).map((category) => ({ id: category.id, label: text(category.name) }))
  ];

  const filterMarkup = filters.map((filter) => `
    <button class="filter-chip ${state.leaderboardFilter === filter.id ? 'active' : ''}" type="button" onclick="setLeaderboardFilter('${filter.id}')">${filter.label}</button>
  `).join('');

  const players = getLeaderboard();
  const rows = players.length
    ? players.map((player, index) => `
      <article class="leaderboard-row ${player.isCurrentUser ? 'is-current-user' : ''}">
        <div class="leaderboard-rank">${index + 1}</div>
        <div class="leaderboard-avatar">${getPlayerAvatarMarkup(player, 'leaderboard-avatar__image', 'leaderboard-avatar__emoji')}</div>
        <div class="leaderboard-copy">
          <strong>${escapeHtml(player.name)}${player.isCurrentUser ? ` <span>${copy.you}</span>` : ''}</strong>
          <small>${escapeHtml(player.boardMeta)}</small>
        </div>
        <div class="leaderboard-score">${player.boardScore} XP</div>
      </article>
    `).join('')
    : `<div class="leaderboard-empty">${copy.leaderboardEmpty}</div>`;

  return `
    <section class="dashboard-section">
      <div class="section-heading"><div><p class="section-kicker">${copy.leaderboardTitle}</p><h3>${copy.leaderboardText}</h3></div></div>
      <div class="filter-row">${filterMarkup}</div>
      <div class="leaderboard-list">${rows}</div>
    </section>
  `;
}

function renderCategoryExplorer() {
  const categoryMarkup = Object.values(categories).map((category) => `
    <div class="swiper-slide">
      <button class="category-card ${category.tone} ${state.selectedCategory === category.id ? 'active' : ''}" type="button" onclick="selectCategory('${category.id}')">
        <span class="category-card__icon">${category.icon}</span>
        <strong>${text(category.name)}</strong>
        <small>${text(category.desc)}</small>
      </button>
    </div>
  `).join('');

  const selectedCategory = getSelectedCategory();
  const subMarkup = Object.values(selectedCategory.subcategories).map((subcategory) => `
    <button class="subcategory-pill ${state.selectedSubcategory === subcategory.id ? 'active' : ''}" type="button" onclick="selectSubcategory('${selectedCategory.id}','${subcategory.id}')">
      <span>${subcategory.icon}</span>${text(subcategory.name)}
    </button>
  `).join('');

  return `
    <section class="dashboard-section">
      <div class="section-heading"><div><p class="section-kicker">${copy.gameCategoriesTitle}</p><h3>${copy.gameCategoriesText}</h3></div></div>
      <div class="swiper home-swiper home-category-swiper">
        <div class="swiper-wrapper">${categoryMarkup}</div>
        <div class="swiper-pagination"></div>
      </div>
      <div class="subcategory-block"><p class="section-mini">${copy.subcategories}</p><div class="subcategory-row">${subMarkup}</div></div>
    </section>
  `;
}

function renderGamesSection(title, games, selectedCategory) {
  const cards = games.length
    ? games.map((game) => {
      const categoryId = game.categoryId || selectedCategory.id;
      const subcategoryId = game.subcategoryId || state.selectedSubcategory;
      return `
        <article class="game-card">
          <div class="game-card__top">
            <div class="game-card__icon">${game.icon}</div>
            <div><strong>${game.name}</strong><p>${text(game.desc)}</p></div>
          </div>
          <div class="game-meta">
            <span>${copy.rating}: ${game.rating}</span>
            <span>${copy.duration}: ${text(game.duration)}</span>
            <span>${copy.category}: ${getCategoryName(categoryId)}</span>
          </div>
          <div class="game-card__bottom">
            <div class="game-bonus"><b>+${game.xp} XP</b><small>+${game.reward} ${copy.coinsReward}</small></div>
            <button class="launch-button" type="button" onclick="openLecture('${categoryId}','${subcategoryId}','${game.id}')">${copy.openLecture}</button>
          </div>
        </article>
      `;
    }).join('')
    : `<div class="empty-games">${copy.noGames}</div>`;

  return `
    <section class="dashboard-section">
      <div class="section-heading"><div><p class="section-kicker">${title}</p></div></div>
      <div class="games-cards">${cards}</div>
    </section>
  `;
}

function getHomeAvatarMarkup(profile) {
  const avatarImage = String(profile.avatarImage || '').trim();
  if (avatarImage) {
    return `<img class="home-profile-card__avatar-image" src="${avatarImage}" alt="avatar">`;
  }
  return `<span class="home-profile-card__avatar-emoji">${profile.currentAvatar || profile.avatar || '👨‍🎓'}</span>`;
}

function getHomeTopCategories(progress) {
  const ranked = Object.values(categories)
    .map((category) => ({
      ...category,
      score: Number(progress.categoryScores?.[category.id] || 0)
    }))
    .sort((a, b) => b.score - a.score || text(a.name).localeCompare(text(b.name)));

  return ranked.slice(0, 3);
}

function renderHomeProfileCard(profile, progress) {
  const topCategoryId = getStrongestCategoryId(progress.categoryScores) || 'it';
  return `
    <section class="home-profile-card">
      <div class="home-profile-card__avatar">${getHomeAvatarMarkup(profile)}</div>
      <div class="home-profile-card__body">
        <strong class="home-profile-card__name">${escapeHtml(profile.name || currentUser)}</strong>
        <span class="home-profile-card__xp">XP: ${progress.xp}</span>
        <span class="home-profile-card__meta">${copy.compactTopCategory}: ${escapeHtml(getCategoryName(topCategoryId))}</span>
      </div>
    </section>
  `;
}

function renderHomeStatsCard(progress) {
  const topCategories = getHomeTopCategories(progress);
  const maxScore = Math.max(100, ...topCategories.map((category) => category.score || 0));
  const rows = topCategories.map((category) => {
    const percent = Math.max(10, Math.round(((category.score || 0) / maxScore) * 100));
    return `
      <article class="home-stats-row">
        <div class="home-stats-row__top">
          <span>${escapeHtml(text(category.name))}</span>
          <b>${category.score} XP</b>
        </div>
        <div class="home-stats-row__track"><span style="width:${percent}%"></span></div>
      </article>
    `;
  }).join('');

  return `
    <section class="home-panel">
      <div class="home-panel__header">
        <h3>${copy.compactStatsTitle}</h3>
      </div>
      <div class="home-stats-list">${rows}</div>
    </section>
  `;
}

function renderHomeGameCard(game, categoryId, subcategoryId) {
  return `
    <article class="home-game-card">
      <div class="home-game-card__top">
        <div class="home-game-card__icon">${game.icon}</div>
        <div class="home-game-card__copy">
          <strong>${escapeHtml(game.name)}</strong>
          <p>${escapeHtml(text(game.desc))}</p>
        </div>
      </div>
      <div class="home-game-card__meta">
        <span>${escapeHtml(getCategoryName(categoryId))}</span>
        <span>${escapeHtml(text(game.duration))}</span>
        <span>${game.rating} ★</span>
      </div>
      <div class="home-game-card__bottom">
        <div class="home-game-card__reward">
          <b>+${game.xp} XP</b>
          <small>+${game.reward} ${copy.coinsReward}</small>
        </div>
        <button class="home-game-card__button" type="button" onclick="openLecture('${categoryId}','${subcategoryId}','${game.id}')">${copy.openLecture}</button>
      </div>
    </article>
  `;
}

function renderHomePopularGames() {
  const popularGames = getPopularGames();
  const popularMarkup = popularGames.length
    ? popularGames.map((game) => `
      <div class="swiper-slide">
        ${renderHomeGameCard(game, game.categoryId, game.subcategoryId)}
      </div>
    `).join('')
    : `<div class="empty-games">${copy.noGames}</div>`;

  return `
    <section class="home-panel home-panel--games home-popular-section">
      <div class="home-panel__header home-panel__header--games">
        <div>
          <span class="home-panel__eyebrow">${copy.popularGames}</span>
          <h3>${copy.popularGames}</h3>
          <p class="home-panel__text">${copy.gameCategoriesText}</p>
        </div>
      </div>
      <div class="swiper home-swiper home-popular-swiper">
        <div class="swiper-wrapper">${popularMarkup}</div>
        <div class="swiper-pagination"></div>
      </div>
    </section>
  `;
}

function renderHomeGamesPreview(selectedCategory, selectedSubcategory, availableGames) {
  const featuredGames = availableGames;
  const selectedCategoryName = getCategoryName(selectedCategory.id);
  const selectedSubcategoryName = getSubcategoryName(selectedCategory.id, selectedSubcategory.id);

  const featuredMarkup = featuredGames.length
    ? featuredGames.map((game) => `
      <div class="swiper-slide">
        ${renderHomeGameCard(game, selectedCategory.id, selectedSubcategory.id)}
      </div>
    `).join('')
    : `<div class="empty-games">${copy.noGames}</div>`;

  return `
    <section class="home-panel home-panel--games">
      <div class="home-panel__header home-panel__header--games">
        <div>
          <span class="home-panel__eyebrow">${copy.availableGames}</span>
          <h3>${copy.availableGames}</h3>
        </div>
      </div>
      <div class="home-chip-row">
        <span class="home-chip">${escapeHtml(selectedCategoryName)}</span>
        <span class="home-chip home-chip--muted">${escapeHtml(selectedSubcategoryName)}</span>
      </div>
      <div class="swiper home-swiper home-games-swiper">
        <div class="swiper-wrapper">${featuredMarkup}</div>
        <div class="swiper-pagination"></div>
      </div>
    </section>
  `;
}

function renderHomeLeaderboardCard() {
  const podiumTones = ['gold', 'silver', 'bronze'];
  const players = getLeaderboard('all').slice(0, 3);
  const markup = players.length
    ? players.map((player, index) => `
      <article class="home-podium-card home-podium-card--${podiumTones[index] || 'silver'} ${player.isCurrentUser ? 'is-current-user' : ''}">
        <div class="home-podium-card__cup">${index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}</div>
        <div class="home-podium-card__rank">#${index + 1}</div>
        <div class="home-podium-card__avatar">${getPlayerAvatarMarkup(player, 'home-podium-card__avatar-image', 'home-podium-card__avatar-emoji')}</div>
        <strong>${escapeHtml(player.name)}</strong>
        <span class="home-podium-card__score">${player.boardScore} XP</span>
        <div class="home-podium-card__base" aria-hidden="true"></div>
      </article>
    `).join('')
    : `<div class="leaderboard-empty">${copy.leaderboardEmpty}</div>`;

  return `
    <section class="home-panel home-panel--leaderboard">
      <div class="home-panel__header home-panel__header--leaderboard">
        <div>
          <span class="home-panel__eyebrow">TOP 3</span>
          <h3>${copy.compactLeaderboardTitle}</h3>
        </div>
        <span class="home-panel__badge" aria-hidden="true">🏆</span>
      </div>
      <div class="home-podium">${markup}</div>
    </section>
  `;
}

function renderHome() {
  const profile = getProfile();
  const progress = getProgress();
  const selectedCategory = getSelectedCategory();
  const selectedSubcategory = getSelectedSubcategory();
  const availableGames = (selectedSubcategory?.games || []).map((game) => ({ ...game, categoryId: selectedCategory.id, subcategoryId: selectedSubcategory.id }));
  const container = document.getElementById('contentContainer');

  document.getElementById('pageTitle').textContent = copy.pageTitle;
  document.getElementById('logoutBtn').textContent = copy.logout;
  const eyebrow = document.querySelector('.eyebrow');
  if (eyebrow) eyebrow.textContent = copy.eyebrow;

  container.innerHTML = `
    <section class="home-dashboard">
      ${renderHomeProfileCard(profile, progress)}
      ${renderHomeStatsCard(progress)}
      ${renderHomeLeaderboardCard()}
      ${renderHomePopularGames()}
      ${renderCategoryExplorer()}
      ${renderHomeGamesPreview(selectedCategory, selectedSubcategory, availableGames)}
    </section>
  `;

  window.AppEnhancements?.refresh?.();
}

function ensureProgressDefaults() {
  window.AppDB?.update?.((db) => {
    db.progress = {
      ...PROGRESS_TEMPLATE,
      ...(db.progress || {}),
      categoryScores: {
        ...PROGRESS_TEMPLATE.categoryScores,
        ...((db.progress || {}).categoryScores || {})
      },
      recentGames: Array.isArray(db.progress?.recentGames) ? db.progress.recentGames : []
    };
  });
}

function selectCategory(categoryId) {
  const category = categories[categoryId];
  if (!category) return;
  state.selectedCategory = categoryId;
  state.selectedSubcategory = Object.values(category.subcategories)[0].id;
  renderHome();
}

function selectSubcategory(categoryId, subcategoryId) {
  if (!categories[categoryId]?.subcategories[subcategoryId]) return;
  state.selectedCategory = categoryId;
  state.selectedSubcategory = subcategoryId;
  renderHome();
}

function setLeaderboardFilter(filterId) {
  state.leaderboardFilter = filterId;
  renderHome();
}

function findGame(categoryId, subcategoryId, gameId) {
  return categories[categoryId]?.subcategories[subcategoryId]?.games.find((game) => game.id === gameId) || null;
}

function openLecture(categoryId, subcategoryId, gameId) {
  const game = findGame(categoryId, subcategoryId, gameId);
  if (!game) return;

  state.activeLecture = { categoryId, subcategoryId, game };
  renderLectureModal();
  openModal(lectureElements.modal);
}

function startPlannedGame() {
  if (!state.activeLecture) return;
  state.activeGame = { ...state.activeLecture, step: 'logic' };
  resetActiveGameProgress();
  closeModal(lectureElements.modal);
  renderGameModal();
  openModal(gameElements.modal);
}

function continueToGamePlay() {
  if (!state.activeGame) return;
  state.activeGame.step = 'play';
  renderGameModal();
}

function backToGameLogic() {
  if (!state.activeGame) return;
  const playableBlueprint = getPlayableGameBlueprint(state.activeGame.game.id);

  if (state.activeGame.completed && playableBlueprint) {
    resetActiveGameProgress();
    state.activeGame.step = 'play';
  } else {
    state.activeGame.step = 'logic';
  }

  renderGameModal();
}

function closeGameExperience() {
  closeModal(gameElements.modal);
}

window.selectCategory = selectCategory;
window.selectSubcategory = selectSubcategory;
window.setLeaderboardFilter = setLeaderboardFilter;
window.openLecture = openLecture;

function initLectureModal() {
  lectureElements.closeBtn?.addEventListener('click', () => closeModal(lectureElements.modal));
  lectureElements.closeIcon?.addEventListener('click', () => closeModal(lectureElements.modal));
  lectureElements.startBtn?.addEventListener('click', startPlannedGame);

  lectureElements.modal?.addEventListener('click', (event) => {
    if (event.target === lectureElements.modal) closeModal(lectureElements.modal);
  });
}

function initGameModal() {
  gameElements.closeIcon?.addEventListener('click', closeGameExperience);
  gameElements.logicCloseBtn?.addEventListener('click', closeGameExperience);
  gameElements.continueBtn?.addEventListener('click', continueToGamePlay);
  gameElements.backBtn?.addEventListener('click', backToGameLogic);
  gameElements.closeBtn?.addEventListener('click', closeGameExperience);
  gameElements.playCards?.addEventListener('click', (event) => {
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget) return;

    const optionButton = eventTarget.closest('[data-option-id]');
    if (optionButton) {
      selectGameOption(optionButton.dataset.optionId);
      return;
    }

    const actionButton = eventTarget.closest('[data-game-action]');
    if (!actionButton) return;

    if (actionButton.dataset.gameAction === 'check') checkGameAnswer();
    if (actionButton.dataset.gameAction === 'next') nextGameTask();
    if (actionButton.dataset.gameAction === 'retry') retryGameTask();
  });

  gameElements.modal?.addEventListener('click', (event) => {
    if (event.target === gameElements.modal) closeGameExperience();
  });
}

function initBottomNav() {
  document.querySelectorAll('.bottom-nav__item').forEach((item) => {
    item.addEventListener('click', () => {
      const navType = item.dataset.nav;
      document.querySelectorAll('.bottom-nav__item').forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
      if (navType === 'home') renderHome();
      if (navType === 'profile') window.location.href = 'pages/character.html';
      if (navType === 'shop') window.location.href = 'pages/shop.html';
      if (navType === 'settings') window.location.href = 'pages/setting.html';
    });
  });
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  window.AppDB?.clearCurrentUser?.();
  window.location.href = 'login.html';
});

function init() {
  ensureProgressDefaults();
  updateBalance();
  renderHome();
  initLectureModal();
  initGameModal();
  initBottomNav();
}

init();
