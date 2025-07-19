import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, getDefaultLanguage } from '@/lib/i18n';

interface LanguageState {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: getDefaultLanguage(),
      setLanguage: (language: Language) => {
        set({ currentLanguage: language });
        // Update document language for accessibility
        document.documentElement.lang = language;
      },
    }),
    {
      name: 'hermes-language-storage',
    }
  )
);