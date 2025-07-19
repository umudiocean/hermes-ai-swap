import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language,
    isReady: i18n.isInitialized
  };
}