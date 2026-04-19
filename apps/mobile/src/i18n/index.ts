import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru';
import en from './locales/en';

i18next.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: 'ru',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18next;
