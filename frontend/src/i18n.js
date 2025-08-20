// Plik: frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Usunęliśmy LanguageDetector

// Importujemy pliki z tłumaczeniami
import translationEN from './locales/en/translation.json';
import translationPL from './locales/pl/translation.json';
import translationUK from './locales/uk/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  pl: {
    translation: translationPL
  },
  uk: {
    translation: translationUK
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pl', // Ustawiamy polski jako domyślny język startowy
    fallbackLng: 'pl',
    debug: true,
    interpolation: {
      escapeValue: false, 
    }
  });

export default i18n;
