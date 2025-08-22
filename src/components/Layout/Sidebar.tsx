import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Search,
  CheckSquare, 
  BarChart3, 
  Copy, 
  Calendar,
  MessageSquare,
  Settings,
  Star,
  DollarSign,
  Shield,
  HelpCircle,
  Mail
} from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  sidebarOpen: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, sidebarOpen, onMobileClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'דשבורד', badge: null },
    { id: 'leads', icon: Users, label: 'רשימת לקוחות קרים', badge: '12' },
    { id: 'google-search', icon: Search, label: 'חיפוש גוגל', badge: 'חדש' },
    { id: 'favorites', icon: Star, label: 'מועדפים', badge: '5' },
    { id: 'tasks', icon: CheckSquare, label: 'משימות', badge: '7' },
    { id: 'duplicates', icon: Copy, label: 'כפילויות', badge: '3' },
    { id: 'communication', icon: MessageSquare, label: 'תקשורת', badge: '12' },
    { id: 'calendar', icon: Calendar, label: 'יומן פגישות', badge: null },
    { id: 'email-extraction', icon: Mail, label: 'הוצאת מידע מהמייל', badge: 'חדש' }
  ];

  const handleViewChange = (view: string) => {
    onViewChange(view);
    onMobileClose?.(); // סגירת תפריט במובייל
  };

  return (
    <aside className={`sidebar bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white w-64 min-h-screen flex-shrink-0 overflow-y-auto border-r border-slate-700 ${sidebarOpen ? 'is-open' : ''}`} role="navigation" aria-label="תפריט ראשי">
      <div className="p-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-2">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">מכונת לידים</h2>
            <p className="text-sm text-slate-400">Pro Version</p>
            <div className="mt-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleViewChange(item.id)}
            aria-label={`עבור ל${item.label}`}
            aria-current={currentView === item.id ? 'page' : undefined}
            className={`w-full flex items-center justify-between px-6 py-4 text-right hover:bg-gray-800 transition-colors touch-manipulation ${
              currentView === item.id ? 'bg-slate-800/80 border-r-4 border-cyan-500 shadow-lg' : 'hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full px-2 py-1 shadow-lg">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto p-6">
        <button 
          onClick={() => handleViewChange('support')}
          aria-label="עבור לתמיכה"
          className="w-full flex items-center space-x-3 space-x-reverse px-4 py-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors mb-3 touch-manipulation"
        >
          <HelpCircle className="h-5 w-5" />
          <span>תמיכה</span>
        </button>
        <button 
          onClick={() => handleViewChange('settings')}
          aria-label="עבור להגדרות"
          className="w-full flex items-center space-x-3 space-x-reverse px-4 py-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors touch-manipulation"
        >
          <Settings className="h-5 w-5" />
          <span>הגדרות</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;