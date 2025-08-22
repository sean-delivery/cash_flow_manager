import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'he' | 'en' | 'ar' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  he: {
    // Navigation
    'nav.dashboard': 'דשבורד',
    'nav.leads': 'לידים',
    'nav.google_search': 'חיפוש גוגל',
    'nav.favorites': 'מועדפים',
    'nav.tasks': 'משימות',
    'nav.cashflow': 'תזרים מזומנים',
    'nav.duplicates': 'כפילויות',
    'nav.communication': 'תקשורת',
    'nav.calendar': 'יומן פגישות',
    'nav.settings': 'הגדרות',
    'nav.admin': 'פאנל ניהול',
    'nav.support': 'תמיכה',
    
    // Common
    'common.save': 'שמור',
    'common.cancel': 'ביטול',
    'common.delete': 'מחק',
    'common.edit': 'ערוך',
    'common.add': 'הוסף',
    'common.search': 'חיפוש',
    'common.filter': 'סינון',
    'common.export': 'ייצוא',
    'common.import': 'ייבוא',
    'common.share': 'שתף',
    'common.phone': 'טלפון',
    'common.email': 'מייל',
    'common.address': 'כתובת',
    'common.category': 'קטגוריה',
    'common.status': 'סטטוס',
    'common.notes': 'הערות',
    'common.date': 'תאריך',
    'common.amount': 'סכום',
    'common.total': 'סה״כ',
    
    // Dashboard
    'dashboard.title': 'דשבורד ראשי',
    'dashboard.overview': 'סקירה כללית של המערכת',
    'dashboard.total_leads': 'סה״כ לידים',
    'dashboard.new_leads': 'לידים חדשים',
    'dashboard.favorites': 'מועדפים',
    'dashboard.current_balance': 'יתרה נוכחית',
    
    // Leads
    'leads.title': 'ניהול לידים',
    'leads.new_lead': 'ליד חדש',
    'leads.phone_cleanup': 'ניקוי טלפונים',
    'leads.share_category': 'שתף קטגוריה',
    'leads.bulk_actions': 'פעולות מרובות',
    
    // Cash Flow
    'cashflow.title': 'תזרים מזומנים',
    'cashflow.profit_loss': 'דוח רווח והפסד',
    'cashflow.income': 'הכנסות',
    'cashflow.expenses': 'הוצאות',
    'cashflow.balance': 'יתרה',
    
    // Support
    'support.title': 'מרכז תמיכה',
    'support.sitemap': 'מפת האתר',
    'support.contact': 'צור קשר',
    'support.faq': 'שאלות נפוצות'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.google_search': 'Google Search',
    'nav.favorites': 'Favorites',
    'nav.tasks': 'Tasks',
    'nav.cashflow': 'Cash Flow',
    'nav.duplicates': 'Duplicates',
    'nav.communication': 'Communication',
    'nav.calendar': 'Calendar',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin Panel',
    'nav.support': 'Support',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.share': 'Share',
    'common.phone': 'Phone',
    'common.email': 'Email',
    'common.address': 'Address',
    'common.category': 'Category',
    'common.status': 'Status',
    'common.notes': 'Notes',
    'common.date': 'Date',
    'common.amount': 'Amount',
    'common.total': 'Total',
    
    // Dashboard
    'dashboard.title': 'Main Dashboard',
    'dashboard.overview': 'System Overview',
    'dashboard.total_leads': 'Total Leads',
    'dashboard.new_leads': 'New Leads',
    'dashboard.favorites': 'Favorites',
    'dashboard.current_balance': 'Current Balance',
    
    // Leads
    'leads.title': 'Lead Management',
    'leads.new_lead': 'New Lead',
    'leads.phone_cleanup': 'Phone Cleanup',
    'leads.share_category': 'Share Category',
    'leads.bulk_actions': 'Bulk Actions',
    
    // Cash Flow
    'cashflow.title': 'Cash Flow',
    'cashflow.profit_loss': 'Profit & Loss Report',
    'cashflow.income': 'Income',
    'cashflow.expenses': 'Expenses',
    'cashflow.balance': 'Balance',
    
    // Support
    'support.title': 'Support Center',
    'support.sitemap': 'Site Map',
    'support.contact': 'Contact Us',
    'support.faq': 'FAQ'
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.leads': 'العملاء المحتملين',
    'nav.google_search': 'بحث جوجل',
    'nav.favorites': 'المفضلة',
    'nav.tasks': 'المهام',
    'nav.cashflow': 'التدفق النقدي',
    'nav.duplicates': 'المكررات',
    'nav.communication': 'التواصل',
    'nav.calendar': 'التقويم',
    'nav.settings': 'الإعدادات',
    'nav.admin': 'لوحة الإدارة',
    'nav.support': 'الدعم',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تحرير',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.share': 'مشاركة',
    'common.phone': 'هاتف',
    'common.email': 'بريد إلكتروني',
    'common.address': 'عنوان',
    'common.category': 'فئة',
    'common.status': 'حالة',
    'common.notes': 'ملاحظات',
    'common.date': 'تاريخ',
    'common.amount': 'مبلغ',
    'common.total': 'المجموع',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم الرئيسية',
    'dashboard.overview': 'نظرة عامة على النظام',
    'dashboard.total_leads': 'إجمالي العملاء',
    'dashboard.new_leads': 'عملاء جدد',
    'dashboard.favorites': 'المفضلة',
    'dashboard.current_balance': 'الرصيد الحالي',
    
    // Leads
    'leads.title': 'إدارة العملاء المحتملين',
    'leads.new_lead': 'عميل جديد',
    'leads.phone_cleanup': 'تنظيف الهواتف',
    'leads.share_category': 'مشاركة الفئة',
    'leads.bulk_actions': 'إجراءات متعددة',
    
    // Cash Flow
    'cashflow.title': 'التدفق النقدي',
    'cashflow.profit_loss': 'تقرير الأرباح والخسائر',
    'cashflow.income': 'الإيرادات',
    'cashflow.expenses': 'المصروفات',
    'cashflow.balance': 'الرصيد',
    
    // Support
    'support.title': 'مركز الدعم',
    'support.sitemap': 'خريطة الموقع',
    'support.contact': 'اتصل بنا',
    'support.faq': 'الأسئلة الشائعة'
  },
  ru: {
    // Navigation
    'nav.dashboard': 'Панель управления',
    'nav.leads': 'Лиды',
    'nav.google_search': 'Поиск Google',
    'nav.favorites': 'Избранное',
    'nav.tasks': 'Задачи',
    'nav.cashflow': 'Денежный поток',
    'nav.duplicates': 'Дубликаты',
    'nav.communication': 'Связь',
    'nav.calendar': 'Календарь',
    'nav.settings': 'Настройки',
    'nav.admin': 'Админ панель',
    'nav.support': 'Поддержка',
    
    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.add': 'Добавить',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.export': 'Экспорт',
    'common.import': 'Импорт',
    'common.share': 'Поделиться',
    'common.phone': 'Телефон',
    'common.email': 'Email',
    'common.address': 'Адрес',
    'common.category': 'Категория',
    'common.status': 'Статус',
    'common.notes': 'Заметки',
    'common.date': 'Дата',
    'common.amount': 'Сумма',
    'common.total': 'Итого',
    
    // Dashboard
    'dashboard.title': 'Главная панель',
    'dashboard.overview': 'Обзор системы',
    'dashboard.total_leads': 'Всего лидов',
    'dashboard.new_leads': 'Новые лиды',
    'dashboard.favorites': 'Избранное',
    'dashboard.current_balance': 'Текущий баланс',
    
    // Leads
    'leads.title': 'Управление лидами',
    'leads.new_lead': 'Новый лид',
    'leads.phone_cleanup': 'Очистка телефонов',
    'leads.share_category': 'Поделиться категорией',
    'leads.bulk_actions': 'Массовые действия',
    
    // Cash Flow
    'cashflow.title': 'Денежный поток',
    'cashflow.profit_loss': 'Отчет о прибылях и убытках',
    'cashflow.income': 'Доходы',
    'cashflow.expenses': 'Расходы',
    'cashflow.balance': 'Баланс',
    
    // Support
    'support.title': 'Центр поддержки',
    'support.sitemap': 'Карта сайта',
    'support.contact': 'Связаться с нами',
    'support.faq': 'FAQ'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>(i18n.language.split('-')[0] as Language);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng.split('-')[0] as Language);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const dir = language === 'ar' || language === 'he' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      dir
    }}>
      {children}
    </LanguageContext.Provider>
  );
};