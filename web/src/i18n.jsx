import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import arSA from "./locales/ar-SA/ar-SA.json";
import deDE from "./locales/de-DE/de-DE.json";
import enGB from "./locales/en-GB/en-GB.json";
import hiIN from "./locales/hi-IN/hi-IN.json";
import svSE from "./locales/sv-SE/sv-SE.json";
import zhCN from "./locales/zh-CN/zh-CN.json";
import frFR from "./locales/fr-FR/fr-FR.json";
import esES from "./locales/es-ES/es-ES.json";

const resources = {
  "ar-SA": {
    translation: arSA,
  },
  "de-DE": {
    translation: deDE,
  },
  "en-GB": {
    translation: enGB,
  },
  "hi-IN": {
    translation: hiIN,
  },
  "sv-SE": {
    translation: svSE,
  },
  "zh-CN": {
    translation: zhCN,
  },
  "fr-FR": {
    translation: frFR,
  },
  "es-ES": {
    translation: esES,
  }
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en-GB",
});

export default i18n;
