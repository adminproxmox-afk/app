import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AvatarStage from './components/AvatarStage.jsx';
import PhaserPreview from './components/PhaserPreview.jsx';
import { categories, leaderboard, shopItems, stats } from './data.js';
import { useAppStore } from './store.js';

const wardrobeColors = {
  hair: ['#95694b', '#3a2d2b', '#c8a16c', '#a75f41', '#755191'],
  shirt: ['#8a2d31', '#315ea4', '#356346', '#604582', '#2c7a82'],
  pants: ['#27323e', '#515b66', '#181e25', '#584977', '#4c5644'],
  shoes: ['#151d25', '#404852', '#d9dde3', '#3563a6', '#6a53a1']
};

function RegistrationPanel() {
  const register = useAppStore((state) => state.register);
  const [name, setName] = useState('Авантюрист');
  const [gender, setGender] = useState('male');

  return (
    <motion.section
      className="registration-band"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="registration-copy">
        <span className="section-kicker">Швидкий старт</span>
        <h2>Створи профіль і одразу побач свого персонажа</h2>
      </div>

      <div className="register-controls" aria-label="Реєстрація">
        <label className="text-input">
          <span>Ім'я</span>
          <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} />
        </label>

        <div className="segmented" role="radiogroup" aria-label="Стать">
          <button className={gender === 'male' ? 'is-active' : ''} type="button" onClick={() => setGender('male')}>
            Чоловік
          </button>
          <button className={gender === 'female' ? 'is-active' : ''} type="button" onClick={() => setGender('female')}>
            Жінка
          </button>
        </div>

        <button className="primary-action" type="button" onClick={() => register({ name, gender })}>
          Запустити макет
        </button>
      </div>
    </motion.section>
  );
}

function MiniProfile() {
  const profile = useAppStore((state) => state.profile);
  const coins = useAppStore((state) => state.coins);
  const gender = useAppStore((state) => state.gender);

  return (
    <section className="mini-profile">
      <div className="profile-token" aria-hidden="true">
        {gender === 'female' ? 'Ж' : 'Ч'}
      </div>
      <div>
        <span className="section-kicker">Міні профіль</span>
        <h1>{profile.name}</h1>
        <p>@{profile.username} · рівень {profile.level} · {profile.status}</p>
      </div>
      <div className="coin-pill">
        <span aria-hidden="true" />
        {coins}
      </div>
    </section>
  );
}

function StatsGrid() {
  return (
    <section className="stats-grid" aria-label="Статистика">
      {stats.map((item) => (
        <motion.div className={`stat-card stat-card--${item.tone}`} key={item.label} whileHover={{ y: -3 }}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </motion.div>
      ))}
    </section>
  );
}

function Leaderboard() {
  return (
    <section className="leaderboard">
      <div className="section-head">
        <span className="section-kicker">Лідерборд</span>
        <h2>Топ тижня</h2>
      </div>
      <div className="leader-list">
        {leaderboard.map((player, index) => (
          <div className="leader-row" key={player.name}>
            <span className="rank">{index + 1}</span>
            <strong>{player.name}</strong>
            <small>{player.badge}</small>
            <b>{player.xp} XP</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryHub() {
  const selectedCategory = useAppStore((state) => state.selectedCategory);
  const setCategory = useAppStore((state) => state.setCategory);
  const activeCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategory) || categories[0],
    [selectedCategory]
  );

  return (
    <section className="category-hub">
      <div className="section-head">
        <span className="section-kicker">Категорії</span>
        <h2>Навчання через міні-ігри</h2>
      </div>

      <div className="category-tabs" role="tablist" aria-label="Категорії">
        {categories.map((category) => (
          <button
            className={category.id === selectedCategory ? 'is-active' : ''}
            key={category.id}
            type="button"
            style={{ '--tab-accent': category.accent }}
            onClick={() => setCategory(category.id)}
          >
            {category.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="subcategory-grid"
          key={activeCategory.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24 }}
        >
          {activeCategory.subcategories.map((subcategory) => (
            <article className="subcategory-card" key={subcategory.title}>
              <div className="subcategory-title">
                <span style={{ background: activeCategory.accent }} />
                <h3>{subcategory.title}</h3>
              </div>

              <div className="game-stack">
                {subcategory.games.length ? (
                  subcategory.games.map((game) => (
                    <button className="game-card" type="button" key={game.title}>
                      <span>{game.tag}</span>
                      <strong>{game.title}</strong>
                      <p>{game.text}</p>
                      <b>+{game.xp} XP</b>
                    </button>
                  ))
                ) : (
                  <div className="empty-game">
                    <strong>Слот готовий</strong>
                    <p>Сюди можна швидко додати наступну гру.</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function AvatarWorkshop() {
  const wardrobe = useAppStore((state) => state.wardrobe);
  const setWardrobeColor = useAppStore((state) => state.setWardrobeColor);

  return (
    <section className="avatar-workshop">
      <div className="avatar-panel">
        <AvatarStage />
      </div>
      <div className="wardrobe-panel">
        <div className="section-head">
          <span className="section-kicker">Персонаж</span>
          <h2>Гардероб</h2>
        </div>

        {Object.entries(wardrobeColors).map(([slot, colors]) => (
          <div className="swatch-row" key={slot}>
            <span>{slot}</span>
            <div>
              {colors.map((color) => (
                <button
                  className={wardrobe[slot] === color ? 'is-active' : ''}
                  key={color}
                  type="button"
                  aria-label={`${slot} ${color}`}
                  style={{ background: color }}
                  onClick={() => setWardrobeColor(slot, color)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopPreview() {
  const spendCoins = useAppStore((state) => state.spendCoins);

  return (
    <section className="shop-preview">
      <div className="section-head">
        <span className="section-kicker">Магазин</span>
        <h2>Швидкі покупки</h2>
      </div>
      <div className="shop-grid">
        {shopItems.map((item) => (
          <button className="shop-item" type="button" key={item.id} onClick={() => spendCoins(item.price)}>
            <span>{item.price}</span>
            <strong>{item.title}</strong>
            <p>{item.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function GameLab() {
  return (
    <section className="game-lab">
      <div className="section-head">
        <span className="section-kicker">Phaser</span>
        <h2>Живий ігровий блок</h2>
      </div>
      <PhaserPreview />
    </section>
  );
}

function BottomNav() {
  const page = useAppStore((state) => state.page);
  const setPage = useAppStore((state) => state.setPage);
  const nav = [
    ['home', 'Головна', '⌂'],
    ['avatar', 'Аватар', '●'],
    ['shop', 'Магазин', '▣'],
    ['lab', 'Ігри', '▶']
  ];

  return (
    <nav className="bottom-nav" aria-label="Нижня навігація">
      {nav.map(([id, label, icon]) => (
        <button className={page === id ? 'is-active' : ''} key={id} type="button" onClick={() => setPage(id)}>
          <span aria-hidden="true">{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

function MainContent() {
  const page = useAppStore((state) => state.page);

  if (page === 'avatar') {
    return <AvatarWorkshop />;
  }

  if (page === 'shop') {
    return <ShopPreview />;
  }

  if (page === 'lab') {
    return <GameLab />;
  }

  return (
    <>
      <MiniProfile />
      <StatsGrid />
      <Leaderboard />
      <CategoryHub />
    </>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-frame">
        <RegistrationPanel />
        <MainContent />
        <BottomNav />
      </main>
    </div>
  );
}
