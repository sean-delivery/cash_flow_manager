import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, User, Mail, Shield, CreditCard, Star } from 'lucide-react';

const SettingsManager: React.FC = () => {
  const { user, email, isGoogleAuth } = useAuth();

  // Payment Link Section - at the top
  const PaymentSection = () => (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 mb-6 text-white shadow-lg">
      <div className="text-center">
        <CreditCard className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">💳 מנוי פרמיום</h3>
        <p className="mb-4 opacity-90">קבל גישה מלאה לכל התכונות המתקדמות</p>
        <a 
          href="https://did.li/dVBaa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2 space-x-reverse shadow-lg"
        >
          <CreditCard className="h-5 w-5" />
          <span>קנה עכשיו ₪299</span>
        </a>
        <div className="mt-3 text-sm opacity-75">
          תשלום מאובטח • חשבונית מס • תמיכה מלאה
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Settings className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <PaymentSection />

      {/* User Profile */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-right flex items-center space-x-2 space-x-reverse">
          <User className="h-5 w-5" />
          <span>פרופיל משתמש</span>
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">שם</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-right"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">מייל</label>
              <div className="relative">
                <input
                  type="email"
                  value={email || user?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 text-right pr-10 font-medium"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Shield className="h-4 w-4 text-green-500" title="מאומת Google" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-1 text-right">✅ מאומת Google - אבטחה מקסימלית</p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-right">
                  💡 במידה ותרצו לבצע יותר מחיפוש 1 התשלום יהיה בקישור: 
                  <a 
                    href="https://did.li/dVBaa" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline mr-1 font-medium"
                  >
                    לתשלום מאובטח
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">תפקיד</label>
              <input
                type="text"
                value={user?.role === 'admin' ? 'מנהל' : user?.role === 'user' ? 'משתמש' : 'אורח'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-right"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">סטטוס</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  user?.subscriptionStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.subscriptionStatus === 'active' ? 'פעיל' : 'ניסיון'}
                </span>
                {user?.role === 'admin' && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-right flex items-center space-x-2 space-x-reverse">
          <Shield className="h-5 w-5" />
          <span>אבטחה</span>
        </h2>
        
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">אימות Google מאובטח</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              החשבון שלך מאובטח באמצעות Google Authentication
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-right flex items-center space-x-2 space-x-reverse">
          <Mail className="h-5 w-5" />
          <span>תמיכה</span>
        </h2>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">יש לך שאלות או זקוק לעזרה?</p>
          <a
            href="mailto:support@sean-control-cash.com"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2 space-x-reverse"
          >
            <Mail className="h-4 w-4" />
            <span>צור קשר</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;