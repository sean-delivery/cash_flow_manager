import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const RTL_LANGS = new Set(['he', 'ar']);

function applyDirLang(lang: string) {
  const l = lang.split('-')[0];
  const dir = RTL_LANGS.has(l) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', l);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'he',
    supportedLngs: ['en', 'he', 'ru', 'ar'],
    ns: ['common'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_lang',
      lookupQuerystring: 'lang',
    },
    resources: {
      en: {
        common: {
          app_title: "CRM Israel Pro",
          search_placeholder: "Search products / locations / customers…",
          save: "Save",
          cancel: "Cancel",
          language: "Language",
          english: "English",
          hebrew: "Hebrew",
          russian: "Russian",
          arabic: "Arabic"
        }
      },
      he: {
        common: {
          app_title: "CRM ישראל Pro",
          search_placeholder: "חפש מוצר / מיקום / לקוח…",
          save: "שמור",
          cancel: "ביטול",
          language: "שפה",
          english: "אנגלית",
          hebrew: "עברית",
          russian: "רוסית",
          arabic: "ערבית"
        }
      },
      ru: {
        common: {
          app_title: "CRM Израиль Pro",
          search_placeholder: "Поиск: товары / локации / клиенты…",
          save: "Сохранить",
          cancel: "Отмена",
          language: "Язык",
          english: "Английский",
          hebrew: "Иврит",
          russian: "Русский",
          arabic: "Арабский"
        }
      },
      ar: {
        common: {
          app_title: "CRM إسرائيل Pro",
          search_placeholder: "ابحث عن منتج / موقع / عميل…",
          save: "حفظ",
          cancel: "إلغاء",
          language: "اللغة",
          english: "الإنجليزية",
          hebrew: "العبرية",
          russian: "الروسية",
          arabic: "العربية"
        }
      }
    },
    interpolation: { escapeValue: false },
  });

applyDirLang(i18n.language);
i18n.on('languageChanged', applyDirLang);

export default i18n;