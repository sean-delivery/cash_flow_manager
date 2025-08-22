import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Send, Users, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface CommunicationManagerProps {
  onNavigate?: (view: string) => void;
}

const CommunicationManager: React.FC<CommunicationManagerProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'calls' | 'emails'>('messages');
  const [newMessage, setNewMessage] = useState('');

  const communications = [
    {
      id: '1',
      type: 'whatsapp',
      contact: 'דוד כהן',
      company: 'כהן טכנולוגיות',
      message: 'שלום, אשמח לקבל הצעת מחיר למערכת CRM',
      time: '10:30',
      date: 'היום',
      status: 'unread',
      phone: '052-1234567'
    },
    {
      id: '2',
      type: 'email',
      contact: 'שרה לוי',
      company: 'לוי ושותפים',
      message: 'תודה על הפגישה, נחזור אליכם בקרוב',
      time: '14:20',
      date: 'אתמול',
      status: 'read',
      email: 'sara@levi-partners.co.il'
    },
    {
      id: '3',
      type: 'call',
      contact: 'אחמד עלי',
      company: 'עלי בנייה',
      message: 'שיחה יוצאת - 5 דקות',
      time: '16:45',
      date: 'אתמול',
      status: 'completed',
      phone: '050-5555555'
    }
  ];

  const quickMessages = [
    'שלום, אשמח ליצור קשר',
    'תודה על הפנייה, נחזור אליך בקרוב',
    'האם תוכל לשלוח פרטים נוספים?',
    'נקבע פגישה לשבוע הבא?',
    'תודה על הזמן, נשלח הצעת מחיר'
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      case 'call': return '📞';
      default: return '💬';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse">
            <Send className="h-5 w-5" />
            <span>הודעה חדשה</span>
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">מרכז תקשורת</h1>
          <p className="text-gray-600">ניהול כל התקשורת עם הלקוחות</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">הודעות חדשות</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">שיחות היום</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">מיילים שנשלחו</p>
              <p className="text-2xl font-bold text-purple-600">24</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">זמן תגובה ממוצע</p>
              <p className="text-2xl font-bold text-orange-600">2.5ש</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 space-x-reverse px-6">
            {[
              { id: 'messages', label: 'הודעות', icon: MessageSquare },
              { id: 'calls', label: 'שיחות', icon: Phone },
              { id: 'emails', label: 'מיילים', icon: Mail }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Communications List */}
        <div className="divide-y divide-gray-200">
          {communications.map((comm) => (
            <div key={comm.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="text-2xl">{getTypeIcon(comm.type)}</span>
                  <div className="text-right">
                    <h4 className="font-medium text-gray-900">{comm.contact}</h4>
                    <p className="text-sm text-gray-600">{comm.company}</p>
                  </div>
                </div>
                
                <div className="flex-1 mx-6 text-right">
                  <p className="text-sm text-gray-700">{comm.message}</p>
                </div>
                
                <div className="text-left">
                  <div className="text-sm text-gray-500">{comm.date}</div>
                  <div className="text-sm font-medium text-gray-900">{comm.time}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(comm.status)}`}>
                    {comm.status === 'unread' ? 'לא נקרא' :
                     comm.status === 'read' ? 'נקרא' : 'הושלם'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-end space-x-2 space-x-reverse">
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                  השב
                </button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  התקשר
                </button>
                <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                  סמן כנקרא
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">הודעות מהירות</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => setNewMessage(message)}
              className="p-3 text-right bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              {message}
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center space-x-2 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            שלח
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="כתוב הודעה..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
          />
        </div>
      </div>
    </div>
  );
};

export default CommunicationManager;