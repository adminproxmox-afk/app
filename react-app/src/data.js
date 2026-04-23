export const categories = [
  {
    id: 'it',
    title: 'IT',
    accent: '#4e9cff',
    subcategories: [
      {
        title: 'Веб-розробка',
        games: [
          {
            title: 'Персонаж і розкладка',
            text: 'Створи персонажа та розстав UI-речі по логіці сторінки.',
            xp: 120,
            tag: 'React'
          }
        ]
      },
      {
        title: 'Програмування',
        games: [
          {
            title: 'Farm Bot Logic',
            text: 'Міні-гра в стилі The Farmer Was Replaced: автоматизуй дії бота.',
            xp: 160,
            tag: 'Phaser'
          }
        ]
      },
      {
        title: 'Кібербезпека',
        games: [
          {
            title: 'Збери надійний пароль',
            text: 'Комбінуй правила безпеки та отримуй бонус за складність.',
            xp: 100,
            tag: 'Security'
          }
        ]
      },
      {
        title: 'Тестування',
        games: [
          {
            title: 'Симуляція тестування продукту',
            text: 'Знайди баги, пріоритизуй ризики та випусти стабільну версію.',
            xp: 115,
            tag: 'QA'
          }
        ]
      }
    ]
  },
  {
    id: 'economy',
    title: 'Економіка',
    accent: '#ffc857',
    subcategories: [
      {
        title: 'Фінансова грамотність',
        games: [
          {
            title: 'NewPrek: 30 днів',
            text: 'Обирай правильні картки угод, заробляй XP і втримай компанію місяць.',
            xp: 140,
            tag: 'Cards'
          }
        ]
      },
      { title: 'Підприємництво', games: [] },
      { title: 'Маркетинг', games: [] },
      { title: 'Інвестиції', games: [] }
    ]
  },
  {
    id: 'soft',
    title: 'Soft Skills',
    accent: '#8be28b',
    subcategories: [
      { title: 'Комунікація', games: [] },
      { title: 'Лідерство', games: [] },
      { title: 'Тайм-менеджмент', games: [] },
      { title: 'Емоційний інтелект', games: [] }
    ]
  },
  {
    id: 'agro',
    title: 'Аграрне',
    accent: '#d9a15f',
    subcategories: [
      { title: 'Рослинництво', games: [] },
      { title: 'Тваринництво', games: [] },
      { title: 'Агробізнес', games: [] },
      { title: 'Техніка та інновації', games: [] }
    ]
  }
];

export const leaderboard = [
  { name: 'Maks', xp: 4280, badge: 'QA' },
  { name: 'Anya', xp: 3910, badge: 'IT' },
  { name: 'Danylo', xp: 3440, badge: 'Agro' },
  { name: 'Sofia', xp: 3180, badge: 'Soft' }
];

export const shopItems = [
  { id: 'hair', title: 'Волосся', subtitle: 'Блонд / мідний / темний', price: 16 },
  { id: 'shirt', title: 'Одяг', subtitle: 'Фіалка, хвоя, графіт', price: 18 },
  { id: 'boost', title: 'XP Boost', subtitle: 'x2 на наступну гру', price: 30 },
  { id: 'badge', title: 'Бейдж', subtitle: 'Показ у профілі', price: 45 }
];

export const stats = [
  { label: 'XP', value: '1 280', tone: 'blue' },
  { label: 'Монети', value: '125', tone: 'gold' },
  { label: 'Ігор', value: '7', tone: 'mint' },
  { label: 'Серія', value: '3 дні', tone: 'rose' }
];
