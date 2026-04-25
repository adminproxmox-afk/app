import type {
  CategoryDefinition,
  CategoryId,
  GameWithMeta,
  Gender,
  LessonLecture,
  LessonLogicBlueprint,
  LessonPracticeBlueprint,
  ShopProduct,
  WardrobeOption,
  WardrobeSlot
} from './types';

export const slotLabels: Record<WardrobeSlot, string> = {
  skin: 'Шкіра',
  hair: 'Волосся',
  shirt: 'Одяг',
  pants: 'Штани',
  shoes: 'Взуття',
  aura: 'Ефект'
};

export const slotOrder: WardrobeSlot[] = ['skin', 'hair', 'shirt', 'pants', 'shoes', 'aura'];

export const starterWardrobeByGender: Record<Gender, Record<WardrobeSlot, string>> = {
  male: {
    skin: 'skin-soft',
    hair: 'hair-classic',
    shirt: 'shirt-red',
    pants: 'pants-navy',
    shoes: 'shoes-black',
    aura: 'extra-soft'
  },
  female: {
    skin: 'skin-soft',
    hair: 'hair-blonde',
    shirt: 'shirt-violet',
    pants: 'pants-navy',
    shoes: 'shoes-white',
    aura: 'extra-soft'
  }
};

export const wardrobeCatalog: Record<WardrobeSlot, WardrobeOption[]> = {
  skin: [
    { id: 'skin-soft', slot: 'skin', label: 'Світлий', description: 'Базовий теплий тон.', color: '#f2bb7b', price: 0, tone: 'starter', starterFor: ['male', 'female'] },
    { id: 'skin-beige', slot: 'skin', label: 'Бежевий', description: 'М’який нейтральний відтінок.', color: '#e4ab72', price: 8, tone: 'common' },
    { id: 'skin-warm', slot: 'skin', label: 'Теплий', description: 'Сонячний і живий тон.', color: '#cf9865', price: 10, tone: 'common' },
    { id: 'skin-bronze', slot: 'skin', label: 'Бронза', description: 'Глибший контраст для сцени.', color: '#b17547', price: 14, tone: 'rare' }
  ],
  hair: [
    { id: 'hair-classic', slot: 'hair', label: 'Класика', description: 'Теплий базовий колір.', color: '#95694b', price: 0, tone: 'starter', starterFor: ['male'] },
    { id: 'hair-blonde', slot: 'hair', label: 'Блонд', description: 'Світле волосся для м’якішого образу.', color: '#c8a16c', price: 0, tone: 'starter', starterFor: ['female'] },
    { id: 'hair-dark', slot: 'hair', label: 'Темний', description: 'Контрастний темний відтінок.', color: '#3a2d2b', price: 12, tone: 'common' },
    { id: 'hair-copper', slot: 'hair', label: 'Мідний', description: 'Яскравий мідний акцент.', color: '#a75f41', price: 18, tone: 'rare' },
    { id: 'hair-plum', slot: 'hair', label: 'Слива', description: 'Неоновий фентезі-варіант.', color: '#755191', price: 22, tone: 'epic' }
  ],
  shirt: [
    { id: 'shirt-red', slot: 'shirt', label: 'Марсала', description: 'Класичний темно-червоний.', color: '#8a2d31', price: 0, tone: 'starter', starterFor: ['male'] },
    { id: 'shirt-violet', slot: 'shirt', label: 'Фіалка', description: 'Фірмовий стартовий фіолет.', color: '#604582', price: 0, tone: 'starter', starterFor: ['female'] },
    { id: 'shirt-blue', slot: 'shirt', label: 'Синій', description: 'Холодний clean-tech образ.', color: '#315ea4', price: 15, tone: 'common' },
    { id: 'shirt-green', slot: 'shirt', label: 'Хвоя', description: 'Спокійний натуральний тон.', color: '#356346', price: 16, tone: 'common' },
    { id: 'shirt-black', slot: 'shirt', label: 'Графіт', description: 'Темний стриманий стиль.', color: '#262a31', price: 18, tone: 'rare' }
  ],
  pants: [
    { id: 'pants-navy', slot: 'pants', label: 'Нічні', description: 'Базові темні штани.', color: '#27323e', price: 0, tone: 'starter', starterFor: ['male', 'female'] },
    { id: 'pants-gray', slot: 'pants', label: 'Сірі', description: 'Легше поєднання під світлий сет.', color: '#515b66', price: 13, tone: 'common' },
    { id: 'pants-black', slot: 'pants', label: 'Чорні', description: 'Мінімалістичний строгий варіант.', color: '#181e25', price: 14, tone: 'common' },
    { id: 'pants-olive', slot: 'pants', label: 'Олива', description: 'Землистий тон під природні палітри.', color: '#4c5644', price: 16, tone: 'rare' },
    { id: 'pants-plum', slot: 'pants', label: 'Пурпур', description: 'Сміливіший контраст для івентів.', color: '#584977', price: 18, tone: 'epic' }
  ],
  shoes: [
    { id: 'shoes-black', slot: 'shoes', label: 'Базові', description: 'Стартова пара для темного сету.', color: '#151d25', price: 0, tone: 'starter', starterFor: ['male'] },
    { id: 'shoes-white', slot: 'shoes', label: 'Світлі', description: 'Стартова пара для м’якого сету.', color: '#d9dde3', price: 0, tone: 'starter', starterFor: ['female'] },
    { id: 'shoes-gray', slot: 'shoes', label: 'Туман', description: 'Нейтральна сіра підошва.', color: '#404852', price: 8, tone: 'common' },
    { id: 'shoes-blue', slot: 'shoes', label: 'Океан', description: 'Акцент під технічні теми.', color: '#3563a6', price: 12, tone: 'rare' },
    { id: 'shoes-gold', slot: 'shoes', label: 'Золото', description: 'Преміальний контур взуття.', color: '#c59a35', price: 18, tone: 'epic' }
  ],
  aura: [
    { id: 'extra-soft', slot: 'aura', label: 'Без ефекту', description: 'Чистий силует без свічення.', color: '#77d1a8', price: 0, tone: 'starter', starterFor: ['male', 'female'] },
    { id: 'extra-ice', slot: 'aura', label: 'Лід', description: 'Холодний голубий шлейф.', color: '#78a8ff', price: 10, tone: 'common' },
    { id: 'extra-fire', slot: 'aura', label: 'Вогонь', description: 'Теплий динамічний контур.', color: '#ff7c56', price: 12, tone: 'rare' },
    { id: 'extra-night', slot: 'aura', label: 'Неон', description: 'Електричний неоновий акцент.', color: '#5fd4ff', price: 16, tone: 'epic' }
  ]
};

export const wardrobeOptions = slotOrder.flatMap((slot) => wardrobeCatalog[slot]);

export const wardrobeOptionMap = Object.fromEntries(
  wardrobeOptions.map((option) => [option.id, option])
) as Record<string, WardrobeOption>;

export const shopProducts: ShopProduct[] = [
  {
    id: 'xp-boost',
    title: 'XP Boost',
    subtitle: 'x2 до наступного забігу',
    description: 'Подвоює XP за найближчу успішну ігрову сесію.',
    price: 40,
    kind: 'boost',
    repeatable: true,
    accent: '#7ad1ff'
  },
  {
    id: 'mentor-badge',
    title: 'Mentor Badge',
    subtitle: 'Новий статус у профілі',
    description: 'Дає профілю бейдж Mentor і підкреслює прогрес на головній.',
    price: 70,
    kind: 'badge',
    repeatable: false,
    accent: '#ffc857'
  },
  {
    id: 'streak-core',
    title: 'Streak Core',
    subtitle: 'Плюс 2 до серії',
    description: 'Піднімає серію та допомагає швидше відкривати нові секції.',
    price: 45,
    kind: 'utility',
    repeatable: true,
    accent: '#77d1a8'
  }
];

export const shopProductMap = Object.fromEntries(
  shopProducts.map((product) => [product.id, product])
) as Record<string, ShopProduct>;

export const categories: CategoryDefinition[] = [
  {
    id: 'it',
    title: 'IT',
    accent: '#4e9cff',
    description: 'Розробка, логіка інтерфейсів, автоматизація та практика коду через симуляції.',
    subcategories: [
      {
        id: 'webdev',
        title: 'Веб-розробка',
        intro: 'Складай сторінки, тренуй UI-композицію та розумій поведінку інтерфейсів.',
        games: [
          { id: 'ui-layout-sprint', title: 'UI Layout Sprint', text: 'Швидка збірка інтерфейсу з пріоритетом на читабельність і правильну структуру.', tag: 'React', xp: 95, coins: 24, difficulty: 'easy', loopLabel: 'layout' }
        ]
      },
      {
        id: 'automation',
        title: 'Автоматизація',
        intro: 'Керуй ботом, збирай ресурси та будуй повторювану логіку без хаосу.',
        games: [
          { id: 'farm-bot-logic', title: 'Farm Bot Logic', text: 'Повноцінний забіг із рівнями, таймером і XP-нагородою за ефективний маршрут.', tag: 'Phaser', xp: 140, coins: 34, difficulty: 'mid', loopLabel: 'automation' }
        ]
      },
      {
        id: 'security',
        title: 'Кібербезпека',
        intro: 'Відпрацьовуй мислення захисту, доступів і швидких перевірок ризику.',
        games: [
          { id: 'signal-lock', title: 'Signal Lock', text: 'Забіг із підвищеним тиском часу та дорожчими, але вигіднішими нагородами.', tag: 'Security', xp: 160, coins: 40, difficulty: 'hard', loopLabel: 'security' }
        ]
      }
    ]
  },
  {
    id: 'economy',
    title: 'Економіка',
    accent: '#ffc857',
    description: 'Рішення про гроші, стабільність, угоди й контроль темпу через короткі цикли.',
    subcategories: [
      {
        id: 'finance',
        title: 'Фінансова грамотність',
        intro: 'Приймай рішення під тиском часу та не втрачай стабільність потоку.',
        games: [
          { id: 'cash-flow-run', title: 'Cash Flow Run', text: 'Маневруй між ризиком і вигодою, збираючи ресурси до закінчення часу.', tag: 'Economy', xp: 110, coins: 28, difficulty: 'mid', loopLabel: 'finance' }
        ]
      },
      {
        id: 'entrepreneurship',
        title: 'Підприємництво',
        intro: 'Працюй із темпом, пріоритетами й вартістю кожного рішення.',
        games: [
          { id: 'deal-rush', title: 'Deal Rush', text: 'Чим вищий рівень, тим більше нагорода за точний маршрут і контроль ризику.', tag: 'Deals', xp: 135, coins: 33, difficulty: 'hard', loopLabel: 'deal' }
        ]
      }
    ]
  },
  {
    id: 'soft',
    title: 'Soft Skills',
    accent: '#77d1a8',
    description: 'Комунікація, темп команди, м’яке лідерство та вибір правильної реакції.',
    subcategories: [
      {
        id: 'communication',
        title: 'Комунікація',
        intro: 'Тренуй темп, синхронність та реакцію на дрібні конфлікти.',
        games: [
          { id: 'team-sync', title: 'Team Sync', text: 'Ритмічна сцена про швидке збирання сигналів без перевантаження команди.', tag: 'Coordination', xp: 90, coins: 22, difficulty: 'easy', loopLabel: 'sync' }
        ]
      },
      {
        id: 'leadership',
        title: 'Лідерство',
        intro: 'Працюй із вищими ставками, але більшими бонусами за точне рішення.',
        games: [
          { id: 'calm-command', title: 'Calm Command', text: 'Зберігай контроль над маршрутом і не дозволяй загрозам збити темп.', tag: 'Leadership', xp: 125, coins: 30, difficulty: 'mid', loopLabel: 'lead' }
        ]
      }
    ]
  },
  {
    id: 'agro',
    title: 'Аграрне',
    accent: '#d9a15f',
    description: 'Маршрути, сезонні рішення, ресурсні вузли та стабільність польових процесів.',
    subcategories: [
      {
        id: 'fieldwork',
        title: 'Польові роботи',
        intro: 'Маршрут, ресурс і темп у реальному циклі виконання.',
        games: [
          { id: 'field-window', title: 'Field Window', text: 'Збирай потрібні вузли до того, як погодне вікно закриється.', tag: 'Field', xp: 100, coins: 26, difficulty: 'mid', loopLabel: 'field' }
        ]
      },
      {
        id: 'supply',
        title: 'Логістика',
        intro: 'Доставка, запас і правильний рух без простоїв.',
        games: [
          { id: 'supply-route', title: 'Supply Route', text: 'Темповий забіг на стабільність маршруту й контроль перешкод.', tag: 'Route', xp: 118, coins: 31, difficulty: 'hard', loopLabel: 'supply' }
        ]
      }
    ]
  }
];

export const categoryMap = Object.fromEntries(
  categories.map((category) => [category.id, category])
) as Record<CategoryId, CategoryDefinition>;

export const allGames: GameWithMeta[] = categories.flatMap((category) =>
  category.subcategories.flatMap((subcategory) =>
    subcategory.games.map((game) => ({
      ...game,
      categoryId: category.id,
      categoryTitle: category.title,
      subcategoryId: subcategory.id,
      subcategoryTitle: subcategory.title,
      accent: category.accent
    }))
  )
);

export const gameMap = Object.fromEntries(
  allGames.map((game) => [game.id, game])
) as Record<string, GameWithMeta>;

export const subcategoryLessonMap: Record<string, LessonLecture> = {
  webdev: {
    summary: 'У веб-розробці важливо розділяти структуру сторінки, її зовнішній вигляд і правила розміщення елементів.',
    points: [
      'HTML формує зміст і структуру: заголовки, секції, кнопки та картки.',
      'CSS відповідає за зовнішній вигляд, відступи, кольори й адаптивну поведінку.',
      'Grid і Flex допомагають тримати інтерфейс читабельним і передбачуваним.'
    ],
    result: 'Після міні-лекції ти краще бачиш, як зібрати простий інтерфейс без хаотичної розкладки.'
  },
  automation: {
    summary: 'Автоматизація тримається на чіткій послідовності дій: бот має виконувати потрібні кроки без зайвих ходів.',
    points: [
      'Команди повинні бути короткими, точними й без суперечностей.',
      'Одна хороша автоматизація економить час лише тоді, коли цикл дій повторюваний.',
      'Найкращий маршрут часто не найкоротший, а найстабільніший під обмеження.'
    ],
    result: 'Ти швидше зрозумієш, як перетворювати ручні кроки на керований сценарій.'
  },
  security: {
    summary: 'Кібербезпека починається з помітності ризику: де слабкий пароль, де зайвий доступ і де тиск на терміновість.',
    points: [
      'Захист облікового запису залежить від сили пароля і додаткового фактору.',
      'Фішингові повідомлення часто маскуються під термінову або дуже вигідну дію.',
      'Доступ потрібно давати лише в межах реальної задачі.'
    ],
    result: 'Після лекції легше помітити типові точки ризику до того, як вони стануть проблемою.'
  },
  finance: {
    summary: 'Фінансова грамотність допомагає приймати рішення через бюджет, ризик і запас безпеки, а не навмання.',
    points: [
      'Кожне рішення має короткий ефект і довший наслідок.',
      'Доходи, витрати, резерв і ризик потрібно дивитися разом.',
      'Сильна стратегія не лише заробляє, а й витримує невдалий сценарій.'
    ],
    result: 'Ти краще побачиш різницю між швидкою вигодою та стійким фінансовим рішенням.'
  },
  entrepreneurship: {
    summary: 'Підприємництво починається з ідеї, але живе за рахунок пріоритетів, клієнта і вміння не спалити ресурс занадто рано.',
    points: [
      'Бізнес-рішення потрібно перевіряти малими кроками.',
      'Не кожна велика можливість є доброю, якщо команда не витримає її ціну.',
      'Темп росту має збігатися з реальними можливостями процесу.'
    ],
    result: 'Ти отримаєш базу для більш спокійного вибору між ризиком, темпом і потенційною вигодою.'
  },
  communication: {
    summary: 'Сильна комунікація будується на ясності, активному слуханні та правильній реакції на сигнал від команди.',
    points: [
      'Одна думка, одна мета і одна чітка дія зменшують шум.',
      'Активне слухання допомагає швидше знаходити справжню проблему.',
      'Тон і контекст часто впливають на результат не менше, ніж слова.'
    ],
    result: 'Після міні-лекції легше помітити, де комунікація підтримує команду, а де розсипає темп.'
  },
  leadership: {
    summary: 'Лідерство не про тиск, а про напрямок, відповідальність і ясність дії під навантаженням.',
    points: [
      'Команда має розуміти, куди рухається і навіщо.',
      'Добре рішення враховує людей, час і ресурс, а не лише бажаний результат.',
      'У кризі важливо швидко визначити пріоритет і наступний крок.'
    ],
    result: 'Ти краще побачиш, як спокійне керування тримає систему стабільною навіть під тиском.'
  },
  fieldwork: {
    summary: 'Польова робота залежить від часу, маршруту й послідовності кроків: хороше рішення часто визначається вікном можливості.',
    points: [
      'Не кожен вузол ресурсу однаково важливий у конкретний момент.',
      'Зайвий рух по полю швидко з’їдає темп і запас часу.',
      'Стабільний маршрут важливіший за хаотичне реагування на кожен сигнал.'
    ],
    result: 'Після лекції простіше оцінювати маршрут і не втрачати темп на дрібних відволіканнях.'
  },
  supply: {
    summary: 'Логістика тримається на правильному маршруті, запасі міцності та контролі перешкод по дорозі.',
    points: [
      'Хороший маршрут зменшує не лише час, а й кількість помилок.',
      'Запас і доставка мають працювати як одна система, а не окремі дії.',
      'Перешкоди важливо обходити так, щоб не ламати весь ланцюг.'
    ],
    result: 'Ти краще зрозумієш, як стабільність маршруту впливає на підсумковий результат.'
  }
};

export const gameFlowMap: Record<string, string> = {
  'ui-layout-sprint': 'Ти бачиш цільову структуру екрана, добираєш правильні HTML/CSS-рішення й поступово збираєш читабельний інтерфейс.',
  'farm-bot-logic': 'Ти задаєш маршрут і логіку дій боту, щоб він збирав потрібні вузли без зайвих кроків та втрати часу.',
  'signal-lock': 'Гра змушує швидко оцінювати загрозу, обирати безпечний шлях і не провалювати темп через одну помилку.',
  'cash-flow-run': 'Ти балансуєш між вигодою і стабільністю, збираючи ресурси так, щоб не зламати фінансовий ритм.',
  'deal-rush': 'У кожному раунді треба обрати хід, який дає користь бізнесу, але не перевантажує команду і ризик.',
  'team-sync': 'Ти збираєш потрібні сигнали команди в правильній послідовності, не допускаючи перевантаження і плутанини.',
  'calm-command': 'Маршрут потрібно тримати спокійно: не кожен ризик вартий реакції, якщо він збиває всю систему.',
  'field-window': 'Ти працюєш у вузькому часовому вікні, тому кожен рух має вести до результату, а не просто займати секунди.',
  'supply-route': 'Завдання тренує стабільність маршруту: правильні рішення утримують постачання, помилки швидко накопичують тиск.'
};

export const gameLogicMap: Record<string, LessonLogicBlueprint> = {
  'ui-layout-sprint': {
    summary: 'Ти розкладаєш інтерфейс на правильні структурні блоки і вибираєш ті CSS-рішення, які утримують картки читабельними на різних екранах.',
    cards: [
      {
        title: 'Що робить гравець',
        lines: [
          'Читає коротке UI-завдання і бачить цільову структуру екрана.',
          'Обирає правильний HTML-елемент або CSS-властивість для наступного кроку.'
        ]
      },
      {
        title: 'Що перевіряє система',
        lines: [
          'Чи відповідає вибір структурі сторінки або правилу розкладки.',
          'Чи не ламає рішення читабельність і адаптивність інтерфейсу.'
        ]
      }
    ]
  },
  'farm-bot-logic': {
    summary: 'Це жива сцена з Phaser: ти рухаєшся по полі, збираєш ресурси, уникаєш загроз і встигаєш до завершення таймера.',
    cards: [
      {
        title: 'Що робить гравець',
        lines: [
          'Збирає потрібні вузли на карті і стежить за маршрутом.',
          'Уникає рухомих загроз і не витрачає секунди на зайві петлі.'
        ]
      },
      {
        title: 'Що перевіряє система',
        lines: [
          'Чи пройдено всі рівні в межах часу.',
          'Чи втримано темп без зіткнень і хаотичних рішень.'
        ]
      }
    ]
  }
};

export const practiceGameMap: Record<string, LessonPracticeBlueprint> = {
  'ui-layout-sprint': {
    label: 'Практика UI',
    title: 'Структура екрана і розкладка',
    lead: 'Нижче короткі завдання з HTML/CSS. Обирай рішення, яке наближає інтерфейс до чистої та читабельної структури.',
    cards: [
      {
        title: 'Мета раунду',
        lines: [
          'Швидко впізнати правильний HTML-елемент або CSS-правило.',
          'Не просто вгадати, а зберегти логіку структури та адаптивності.'
        ]
      },
      {
        title: 'Що дає перемога',
        lines: [
          'Ти одразу отримуєш XP і монети назад у foundation.',
          'Після практики можна продовжити міграцію вже на живих сценах Game Lab.'
        ]
      }
    ],
    tasks: [
      {
        id: 'main-structure',
        title: 'Завдання 1. Основний контент',
        lead: 'На сторінці вже є `header` і `footer`. Який HTML-елемент найкраще підходить для головної області з картками категорій?',
        lines: [
          'Потрібен семантичний контейнер для центрального вмісту сторінки.'
        ],
        options: [
          { id: 'a', code: '<main>' },
          { id: 'b', code: '<aside>' },
          { id: 'c', code: '<span>' },
          { id: 'd', code: '<label>' }
        ],
        correctOptionId: 'a',
        success: 'Так, `<main>` позначає головний зміст сторінки і підходить для центральної зони з картками.',
        hint: 'Подумай про семантичну роль елемента, а не просто про контейнер без змісту.'
      },
      {
        id: 'two-columns',
        title: 'Завдання 2. Дві колонки',
        lead: 'Треба показати дві картки категорій в один ряд на телефоні без жорсткої ширини. Яке CSS-рішення найкраще?',
        lines: [
          'Потрібна адаптивна сітка на 2 колонки однакової ширини.'
        ],
        options: [
          { id: 'a', code: 'grid-template-columns: repeat(2, minmax(0, 1fr));' },
          { id: 'b', code: 'display: block;' },
          { id: 'c', code: 'width: 500px;' },
          { id: 'd', code: 'position: absolute;' }
        ],
        correctOptionId: 'a',
        success: 'Вірно, `repeat(2, minmax(0, 1fr))` дає дві гнучкі колонки без жорсткої фіксації ширини.',
        hint: 'Тут потрібна саме сітка, а не фіксований розмір або позиціонування.'
      },
      {
        id: 'button-row',
        title: 'Завдання 3. Кнопки внизу картки',
        lead: 'У картці є текст і кнопка. Що допоможе притиснути блок з кнопкою донизу, щоб усі картки виглядали рівно?',
        lines: [
          'Потрібно, щоб нижній блок займав місце після основного контенту.'
        ],
        options: [
          { id: 'a', code: 'margin-top: auto;' },
          { id: 'b', code: 'z-index: 999;' },
          { id: 'c', code: 'font-weight: 900;' },
          { id: 'd', code: 'opacity: 0.5;' }
        ],
        correctOptionId: 'a',
        success: 'Саме так: `margin-top: auto` відштовхує нижній блок донизу в колонковому контейнері.',
        hint: 'Потрібне правило, яке працює з розподілом простору всередині картки.'
      }
    ]
  }
};

export const leaderboardSeed = [
  { name: 'Maks', xp: 4280, badge: 'Automation', tone: '#4e9cff' },
  { name: 'Anya', xp: 3910, badge: 'UI Systems', tone: '#77d1a8' },
  { name: 'Danylo', xp: 3440, badge: 'Supply', tone: '#d9a15f' },
  { name: 'Sofia', xp: 3180, badge: 'Calm Lead', tone: '#ffc857' }
];
