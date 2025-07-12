import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from "./locales/en/en.json";
import sv from "./locales/sv/sv.json";

const resources = {
  en: {
    translation: en
  },
  sv: {
    translation: sv
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
  });


export default i18n;