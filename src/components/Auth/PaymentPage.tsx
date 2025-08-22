import React, { useState } from 'react';
import { CreditCard, CheckCircle, Clock, Shield, Star, Users, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentPageProps {
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // פתיחת לינק התשלום
    window.open('https://did.li/dVBaa', '_blank');
    
    // סימולציה של תהליך תשלום
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentCompleted(true);
      
      // הודעה למשתמש
      alert('🎉 תשלום הושלם!\n\nתקבל קוד הפעלה במייל תוך 24 שעות.\nהקוד יאפשר לך גישה ללא הגבלה למערכת.');
    }, 3000);
  };

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">תשלום הושלם!</h1>
          <p className="text-gray-600 mb-6">
            תקבל קוד הפעלה במייל תוך 24 שעות.
            הקוד יאפשר לך גישה ללא הגבלה למערכת.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזור למערכת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">שדרג למנוי פרמיום</h1>
          <p className="text-gray-600">גישה ללא הגבלה לכל התכונות</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pricing Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block">
                הכי פופולרי
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">מנוי חודשי</h2>
              <div className="text-4xl font-bold text-blue-600 mb-2">₪293</div>
              <p className="text-gray-600">לחודש</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">חיפושים ללא הגבלה</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Google Places API מלא</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Python Scraper מתקדם</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">ייבוא/ייצוא ללא הגבלה</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">תמיכה מלאה</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">עדכונים אוטומטיים</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200 ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>מעבר לתשלום...</span>
                </div>
              ) : (
                'שלם עכשיו ₪293'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              תשלום מאובטח דרך מערכת התשלומים שלנו
            </p>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">הסטטוס הנוכחי שלך</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">חיפושים שנותרו:</span>
                  <span className="font-bold text-blue-600">
                    {user?.maxSearches && user?.searchCount !== undefined 
                      ? `${user.maxSearches - user.searchCount} מתוך ${user.maxSearches}`
                      : '5 מתוך 5'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">סטטוס מנוי:</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                    ניסיון חינם
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">תוקף:</span>
                  <span className="text-gray-900 font-medium">
                    {user?.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('he-IL') : 'לא מוגדר'}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">השוואת תוכניות</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-2">ניסיון חינם</div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">5</div>
                    <div className="text-xs text-gray-500">חיפושים בלבד</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                    <div className="text-sm font-medium mb-2">מנוי פרמיום</div>
                    <div className="text-2xl font-bold mb-2">∞</div>
                    <div className="text-xs">ללא הגבלה</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">אבטחה ואמינות</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">תשלום מאובטח SSL</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">מאות לקוחות מרוצים</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">הפעלה מיידית</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">דירוג 5 כוכבים</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>חזור למערכת</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 CRM ישראל Pro - מערכת ניהול לקוחות מתקדמת</p>
          <p className="mt-1">תמיכה: support@crm-israel.com | 050-123-4567</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;