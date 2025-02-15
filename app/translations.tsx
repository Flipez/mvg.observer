// eslint-disable-next-line import/no-named-as-default
import i18n from "i18next"
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from "react-i18next"

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      Title: "Is the MVG working or should you walk?",
      Welcome: {
        Card: {
          Status: {
            Title: "Status"
          }
        }
      }
    },
  },
  de: {
    translation: {
      Title: "Geht die MVG oder gehst du zu Fuß?",
      Welcome: {
        Card: {
          Status: {
            Title: "Zustand"
          }
        }
      }
    },
  },
}

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
