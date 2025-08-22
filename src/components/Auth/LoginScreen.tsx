import React, { useState } from 'react';
import { Shield, Eye, Users } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';

interface LoginScreenProps {
  onLogin: (userType: 'admin' | 'google' | 'guest') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingUserType, setPendingUserType] = useState<'admin' | 'google' | 'guest' | null>(null);

  const handleUserTypeSelect = (userType: 'admin' | 'google' | 'guest') => {
    setPendingUserType(userType);
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    if (pendingUserType) {
      localStorage.setItem('user_consent', JSON.stringify({
        accepted: true,
        acceptedAt: new Date().toISOString(),
        userType: pendingUserType
      }));
      onLogin(pendingUserType);
    }
    setShowConsentModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">מכונת לידים</h1>
          <p className="text-slate-300">מערכת ניהול לקוחות מתקדמת</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">אבטחה מתקדמת</h3>
            </div>
            <p className="text-blue-800 text-center text-sm">
              🔒 כניסה מאובטחת עם Google בלבד<br/>
              חובה להתחבר עם חשבון Google מאומת
            </p>
          </div>

          {/* Google Login */}
          <GoogleSignInButton 
            onSuccess={() => handleUserTypeSelect('google')}
            className="w-full bg-white text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3 space-x-reverse border border-gray-300"
          />
          
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              🔒 חיבור לגוגל נדרש - אבטחה מקסימלית
            </p>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-right">
                אישור שימוש בנתונים
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-right text-sm leading-relaxed">
                  השימוש במערכת כפוף לתנאי השימוש. הנתונים משמשים לשיפור המערכת ואבטחה.
                  המערכת אוספת נתוני שימוש בסיסיים לצורך שיפור החוויה.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ביטול
                </button>
                <button
                  onClick={handleConsentAccept}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  מאשר ומתחיל
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;