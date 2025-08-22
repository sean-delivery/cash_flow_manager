import React from 'react';
import { useTranslation } from 'react-i18next';

const langs = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'he', label: 'עב', flag: '🇮🇱' },
  { code: 'ru', label: 'РУ', flag: '🇷🇺' },
  { code: 'ar', label: 'عر', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.split('-')[0];

  const change = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('app_lang', code);
  };

  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="בחירת שפה">
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => change(l.code)}
          aria-label={`שנה שפה ל${l.label}`}
          aria-pressed={current === l.code}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
            current === l.code
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  );
}