import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "../locales/en.json";
import hiTranslations from "../locales/hi.json";
import mrTranslations from "../locales/mr.json";

// The translations
const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  mr: { translation: mrTranslations },
};

i18n
  // Detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: "en",
    
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      // keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      // cache user language on
      caches: ['localStorage'],
    },

    saveMissing: true, // Warns if a key is missing
    missingKeyHandler: (lngs, namespace, key, res) => {
      console.warn(`[i18n] Missing key: "${key}" for language(s): ${lngs.join(', ')}`);
    },

    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
  });

export default i18n;
