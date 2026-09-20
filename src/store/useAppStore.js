import { create } from 'zustand';

const useAppStore = create((set) => ({
  // App State
  currentView: 'home', // 'home', 'assistant', 'generating', 'report'
  setView: (view) => set({ currentView: view }),

  // Language
  language: 'fr', // 'fr', 'en', 'darija', 'tamazight'
  setLanguage: (lang) => set({ language: lang }),

  // User Inputs
  animalType: '',
  animalBreed: '',
  herdSize: '',
  age: '',
  location: '',
  season: 'winter', // default
  budget: '',
  
  setAnimalType: (type) => set({ animalType: type }),
  setAnimalBreed: (breed) => set({ animalBreed: breed }),
  setHerdSize: (size) => set({ herdSize: size }),
  setAge: (val) => set({ age: val }),
  setLocation: (val) => set({ location: val }),
  setSeason: (val) => set({ season: val }),
  setBudget: (val) => set({ budget: val }),

  // Report Data
  currentReport: null,
  setCurrentReport: (report) => set({ currentReport: report }),
}));

export default useAppStore;
