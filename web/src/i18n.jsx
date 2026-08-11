import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const localeModules = import.meta.glob("./locales/*/*.json", { eager: true });

const resources = Object.fromEntries(
  Object.entries(localeModules).map(([path, mod]) => {
    const code = path.split("/").at(-2);
    return [code, { translation: mod.default }];
  })
);

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en-GB",
});

export default i18n;
