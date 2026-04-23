import { create } from 'zustand';

const starterWardrobe = {
  male: {
    hair: '#95694b',
    shirt: '#8a2d31',
    pants: '#27323e',
    shoes: '#151d25'
  },
  female: {
    hair: '#c8a16c',
    shirt: '#604582',
    pants: '#27323e',
    shoes: '#d9dde3'
  }
};

export const useAppStore = create((set) => ({
  page: 'home',
  gender: 'male',
  profile: {
    name: 'Авантюрист',
    username: 'adventurer',
    level: 4,
    status: 'Online'
  },
  coins: 125,
  selectedCategory: 'it',
  wardrobe: starterWardrobe.male,
  owned: ['skin-soft', 'hair-classic', 'shirt-red', 'pants-navy', 'shoes-black'],
  setPage: (page) => set({ page }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  register: ({ name, gender }) => set({
    gender,
    profile: {
      name: name || 'Авантюрист',
      username: (name || 'adventurer').trim().toLowerCase().replace(/\s+/g, '_'),
      level: 4,
      status: 'Online'
    },
    wardrobe: starterWardrobe[gender] || starterWardrobe.male,
    page: 'home'
  }),
  setWardrobeColor: (key, value) => set((state) => ({
    wardrobe: {
      ...state.wardrobe,
      [key]: value
    }
  })),
  spendCoins: (price) => set((state) => ({
    coins: Math.max(0, state.coins - price)
  }))
}));
