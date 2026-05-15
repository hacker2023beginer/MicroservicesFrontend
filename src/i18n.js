import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationRU from './locales/ru/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  }
};

i18n
  .use(LanguageDetector) // Подключаем определение языка браузера
  .use(initReactI18next) // Передаем инстанс i18n в react-i18next
  .init({
    resources,
    fallbackLng: 'ru', // Если язык не определен, ставим русский
    debug: false, // Можно включить true для дебага в консоли

    interpolation: {
      escapeValue: false, // React уже защищает от XSS
    }
  });

export default i18n;