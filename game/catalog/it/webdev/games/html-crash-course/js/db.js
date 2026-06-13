const APP_DB_STORAGE_KEY = 'life-capital-academy-db-v1';

function getTodayStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDefaultDb() {
  return {
    user: {
      id: 'guest',
      name: 'Академіст',
      handle: '@guest',
      avatar: 'LC',
      streak: 7,
      city: 'Kyiv'
    },
    profile: {
      level: 6,
      coins: 1280,
      gems: 24,
      rank: 'Explorer',
      energy: 86
    },
    progress: {
      xp: 182,
      gamesPlayed: 1,
      completedLessons: 8,
      totalLessons: 18,
      categoryScores: {
        it: 182,
        economy: 64,
        softskills: 41,
        agro: 22
      },
      favoriteCategory: 'it',
      recentGames: []
    },
    academy: {
      hasSeenAuthPrompt: false,
      hasSeenHomeOnboarding: false,
      lastDailyRewardAt: '',
      claimedRewardDays: [],
      achievements: ['first_steps', 'focus_mode'],
      unlockedGames: ['html-crash']
    },
    settings: {
      darkMode: true,
      sound: true,
      haptics: true,
      notifications: true,
      reduceMotion: false
    }
  };
}

function safeClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDb() {
  try {
    const raw = localStorage.getItem(APP_DB_STORAGE_KEY);
    if (!raw) return createDefaultDb();

    const parsed = JSON.parse(raw);
    const fallback = createDefaultDb();

    return {
      ...fallback,
      ...parsed,
      user: {
        ...fallback.user,
        ...(parsed.user || {})
      },
      profile: {
        ...fallback.profile,
        ...(parsed.profile || {})
      },
      progress: {
        ...fallback.progress,
        ...(parsed.progress || {}),
        categoryScores: {
          ...fallback.progress.categoryScores,
          ...((parsed.progress || {}).categoryScores || {})
        },
        recentGames: Array.isArray(parsed?.progress?.recentGames) ? parsed.progress.recentGames : []
      },
      academy: {
        ...fallback.academy,
        ...(parsed.academy || {}),
        claimedRewardDays: Array.isArray(parsed?.academy?.claimedRewardDays) ? parsed.academy.claimedRewardDays : [],
        achievements: Array.isArray(parsed?.academy?.achievements) ? parsed.academy.achievements : fallback.academy.achievements,
        unlockedGames: Array.isArray(parsed?.academy?.unlockedGames) ? parsed.academy.unlockedGames : fallback.academy.unlockedGames
      },
      settings: {
        ...fallback.settings,
        ...(parsed.settings || {})
      }
    };
  } catch {
    return createDefaultDb();
  }
}

function writeDb(db) {
  localStorage.setItem(APP_DB_STORAGE_KEY, JSON.stringify(db));
  return db;
}

window.AppDB = window.AppDB || {
  getCurrentUser() {
    return readDb().user.id || 'guest';
  },
  getData() {
    return safeClone(readDb());
  },
  update(callback) {
    try {
      const db = readDb();
      callback(db);

      if (!db.academy.claimedRewardDays.includes(getTodayStamp()) && db.academy.lastDailyRewardAt === getTodayStamp()) {
        db.academy.claimedRewardDays.push(getTodayStamp());
      }

      writeDb(db);
      return safeClone(db);
    } catch (error) {
      console.warn('AppDB update failed', error);
      return safeClone(readDb());
    }
  }
};
