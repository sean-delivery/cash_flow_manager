import React, { useState } from 'react';
import { HelpCircle, Book, MessageCircle, Mail, Phone, FileText, Search, ChevronDown, ChevronRight, Home, Users, DollarSign, Calendar, Settings, Star, Copy, BarChart3, MessageSquare, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SupportCenterProps {
  onNavigate?: (view: string) => void;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'faq' | 'sitemap' | 'contact'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = {
    he: [
      {
        id: '1',
        category: 'התחלת עבודה',
        question: 'איך מתחילים להשתמש במערכת?',
        answer: 'לאחר ההתחברות, תגיע לדשבורד הראשי. משם תוכל לנווט לכל החלקים: לידים, חיפוש גוגל, משימות ועוד. המערכת אינטואיטיבית ומותאמת לעברית.'
      },
      {
        id: '2',
        category: 'ניהול לידים',
        question: 'איך מוסיפים ליד חדש?',
        answer: 'יש 3 דרכים: 1) לחץ "ליד חדש" בדף הלידים 2) חפש בגוגל והוסף מהתוצאות 3) ייבא מ-Excel או Google Sheets'
      },
      {
        id: '3',
        category: 'חיפוש גוגל',
        question: 'איך עובד חיפוש העסקים בגוגל?',
        answer: 'המערכת מחוברת ל-Google Places API ומחפשת עסקים אמיתיים. פשוט הזן מה לחפש (רהיטים, עורכי דין) ואיפה (תל אביב, ירושלים) והמערכת תמצא עסקים עם טלפונים, כתובות ודירוגים.'
      },
      {
        id: '4',
        category: 'תזרים מזומנים',
        question: 'איך מנהלים תזרים מזומנים?',
        answer: 'הוסף הכנסות והוצאות, בחר אמצעי תשלום וקטגוריה. המערכת תחשב אוטומטית את היתרה ותציג דוחות מפורטים כולל דוח רווח והפסד.'
      },
      {
        id: '5',
        category: 'שיתוף',
        question: 'איך משתפים נתונים עם אחרים?',
        answer: 'כל משתמש יכול ליצור לינק שיתוף ייחודי לקטגוריה מסוימת. הלינק מאפשר צפייה, עריכה או בחירה לפי ההרשאות שתגדיר.'
      }
    ],
    en: [
      {
        id: '1',
        category: 'Getting Started',
        question: 'How to start using the system?',
        answer: 'After logging in, you\'ll reach the main dashboard. From there you can navigate to all sections: leads, Google search, tasks and more. The system is intuitive and user-friendly.'
      },
      {
        id: '2',
        category: 'Lead Management',
        question: 'How to add a new lead?',
        answer: 'There are 3 ways: 1) Click "New Lead" in the leads page 2) Search Google and add from results 3) Import from Excel or Google Sheets'
      },
      {
        id: '3',
        category: 'Google Search',
        question: 'How does Google business search work?',
        answer: 'The system connects to Google Places API and searches for real businesses. Simply enter what to search (furniture, lawyers) and where (Tel Aviv, Jerusalem) and the system will find businesses with phones, addresses and ratings.'
      },
      {
        id: '4',
        category: 'Cash Flow',
        question: 'How to manage cash flow?',
        answer: 'Add income and expenses, choose payment method and category. The system will automatically calculate balance and show detailed reports including profit & loss statement.'
      },
      {
        id: '5',
        category: 'Sharing',
        question: 'How to share data with others?',
        answer: 'Each user can create unique sharing links for specific categories. The link allows viewing, editing or selection based on permissions you set.'
      }
    ],
    ar: [
      {
        id: '1',
        category: 'البدء',
        question: 'كيف أبدأ في استخدام النظام؟',
        answer: 'بعد تسجيل الدخول، ستصل إلى لوحة التحكم الرئيسية. من هناك يمكنك التنقل إلى جميع الأقسام: العملاء المحتملين، بحث جوجل، المهام والمزيد.'
      },
      {
        id: '2',
        category: 'إدارة العملاء',
        question: 'كيف أضيف عميل محتمل جديد؟',
        answer: 'هناك 3 طرق: 1) انقر "عميل جديد" في صفحة العملاء 2) ابحث في جوجل وأضف من النتائج 3) استورد من Excel أو Google Sheets'
      }
    ],
    ru: [
      {
        id: '1',
        category: 'Начало работы',
        question: 'Как начать использовать систему?',
        answer: 'После входа в систему вы попадете на главную панель. Оттуда можно перейти ко всем разделам: лиды, поиск Google, задачи и многое другое.'
      },
      {
        id: '2',
        category: 'Управление лидами',
        question: 'Как добавить нового лида?',
        answer: 'Есть 3 способа: 1) Нажать "Новый лид" на странице лидов 2) Найти в Google и добавить из результатов 3) Импортировать из Excel или Google Sheets'
      }
    ]
  };

  const siteMap = [
    {
      title: t('nav.dashboard'),
      icon: Home,
      description: 'סקירה כללית, סטטיסטיקות ופעולות מהירות',
      children: [
        'סטטיסטיקות כלליות',
        'לידים אחרונים',
        'פעולות מהירות',
        'סיכום יומי'
      ]
    },
    {
      title: t('nav.leads'),
      icon: Users,
      description: 'ניהול מלא של לקוחות פוטנציאליים',
      children: [
        'רשימת לידים',
        'הוספת ליד חדש',
        'ייבוא מ-Excel',
        'ייצוא נתונים',
        'ניקוי טלפונים',
        'שיתוף קטגוריות'
      ]
    },
    {
      title: t('nav.google_search'),
      icon: Search,
      description: 'חיפוש עסקים אמיתי מ-Google Maps',
      children: [
        'Google Places API',
        'Python Scraper',
        'חיפושים מהירים',
        'היסטוריית חיפושים'
      ]
    },
    {
      title: t('nav.favorites'),
      icon: Star,
      description: 'לידים מועדפים למעקב מיוחד',
      children: [
        'רשימת מועדפים',
        'תזכורות',
        'פעולות מהירות',
        'ייצוא מועדפים'
      ]
    },
    {
      title: t('nav.cashflow'),
      icon: DollarSign,
      description: 'ניהול תזרים מזומנים ודוחות כספיים',
      children: [
        'הכנסות והוצאות',
        'דוח רווח והפסד',
        'תחזיות',
        'גרפים ותרשימים'
      ]
    },
    {
      title: t('nav.tasks'),
      icon: CheckSquare,
      description: 'ניהול משימות ותזכורות',
      children: [
        'משימות פעילות',
        'משימות שהושלמו',
        'תזכורות',
        'עדיפויות'
      ]
    },
    {
      title: t('nav.duplicates'),
      icon: Copy,
      description: 'זיהוי וניהול כפילויות',
      children: [
        'סריקת כפילויות',
        'מיזוג לידים',
        'התעלמות מכפילויות'
      ]
    },
    {
      title: t('nav.communication'),
      icon: MessageSquare,
      description: 'מרכז תקשורת עם לקוחות',
      children: [
        'הודעות WhatsApp',
        'מיילים',
        'שיחות טלפון',
        'הודעות מהירות'
      ]
    },
    {
      title: t('nav.calendar'),
      icon: Calendar,
      description: 'ניהול פגישות ואירועים',
      children: [
        'חיבור Google Calendar',
        'פגישות קרובות',
        'תזמון פגישות'
      ]
    },
    {
      title: t('nav.settings'),
      icon: Settings,
      description: 'הגדרות מערכת ואינטגרציות',
      children: [
        'הגדרות כלליות',
        'אינטגרציות',
        'התראות',
        'אבטחה',
        'Google Sheets'
      ]
    }
  ];

  const filteredFaq = faqData[language as keyof typeof faqData]?.filter(item =>
    searchTerm === '' ||
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-1 flex">
            {[
              { id: 'faq', label: 'שאלות נפוצות', icon: HelpCircle },
              { id: 'sitemap', label: 'מפת האתר', icon: FileText },
              { id: 'contact', label: 'צור קשר', icon: MessageCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 space-x-reverse ${
                  activeSection === tab.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-4 space-x-reverse mb-2">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <ArrowRight className="h-5 w-5" />
              <span>חזרה לדשבורד</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t('support.title')}
          </h1>
          <p className="text-slate-300">כל מה שאתה צריך לדעת על המערכת</p>
        </div>
      </div>

      {/* FAQ Section */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="relative">
              <Search className="absolute right-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="חיפוש בשאלות נפוצות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-400 text-right"
              />
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaq.map((item) => (
              <div key={item.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                  className="w-full p-6 text-right hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {expandedFaq === item.id ? (
                        <ChevronDown className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white">{item.question}</h3>
                  </div>
                </button>
                {expandedFaq === item.id && (
                  <div className="px-6 pb-6">
                    <div className="bg-slate-900/50 rounded-lg p-4 border-r-4 border-cyan-500">
                      <p className="text-slate-300 text-right leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Site Map */}
      {activeSection === 'sitemap' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-right">מפת האתר</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {siteMap.map((section, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-6 border border-slate-600">
                <div className="flex items-center justify-end space-x-3 space-x-reverse mb-4">
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="text-sm text-slate-400">{section.description}</p>
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-3">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <ul className="space-y-2">
                  {section.children.map((child, childIndex) => (
                    <li key={childIndex} className="flex items-center justify-end space-x-2 space-x-reverse">
                      <span className="text-sm text-slate-300">{child}</span>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      {activeSection === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-right">צור קשר</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-end space-x-3 space-x-reverse">
                <div className="text-right">
                  <div className="text-white font-medium">support@crm-israel.com</div>
                  <div className="text-slate-400 text-sm">תמיכה טכנית</div>
                </div>
                <div className="bg-blue-500 rounded-lg p-3">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 space-x-reverse">
                <div className="text-right">
                  <div className="text-white font-medium">050-123-4567</div>
                  <div className="text-slate-400 text-sm">תמיכה טלפונית</div>
                </div>
                <div className="bg-green-500 rounded-lg p-3">
                  <Phone className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 space-x-reverse">
                <div className="text-right">
                  <div className="text-white font-medium">WhatsApp Business</div>
                  <div className="text-slate-400 text-sm">תמיכה מהירה</div>
                </div>
                <div className="bg-green-600 rounded-lg p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-right">שלח הודעה</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                  נושא
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-400 text-right"
                  placeholder="נושא הפנייה"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                  הודעה
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-400 text-right"
                  placeholder="תאר את הבעיה או השאלה שלך..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium"
              >
                שלח הודעה
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCenter;