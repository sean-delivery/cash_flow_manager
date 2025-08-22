import React from 'react';
import { Bell, Settings, User, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  currentView: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onMenuClick }) => {
  const { user, email } = useAuth();

  const getViewTitle = (view: string) => {
    const titles: { [key: string]: string } = {
      'dashboard': 'דשבורד',
      'leads': 'לידים',
      'google-search': 'חיפוש גוגל',
      'favorites': 'מועדפים',
      'tasks': 'משימות',
      'cashflow': 'תזרים מזומנים',
      'duplicates': 'כפילויות',
      'communication': 'תקשורת',
      'calendar': 'יומן פגישות',
      'settings': 'הגדרות',
      'support': 'תמיכה'
    };
    return titles[view] || view;
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg border-b border-slate-600 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            className="header__menu-btn md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            aria-label="פתח תפריט"
            onClick={onMenuClick}
          >
            ☰
          </button>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {getViewTitle(currentView)}
          </h1>
          <div className="hidden xl:flex items-center bg-slate-700/50 rounded-lg px-3 py-2 min-w-80 border border-slate-600">
            <Search className="h-4 w-4 text-slate-400 ml-2" />
            <button
              type="button"
              placeholder="חפש מוצר / מיקום / לקוח…"
              className="bg-transparent border-none outline-none text-sm flex-1 text-right text-white placeholder-slate-400"
            >
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="bg-blue-500 rounded-full p-2">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user?.name || 'משתמש'}</div>
              <div className="text-xs text-slate-300">{email || user?.email || 'לא מחובר'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;