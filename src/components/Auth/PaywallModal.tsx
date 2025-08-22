import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PAY_URL = 'https://pay.tranzila.com/sean12/WjhteFpPUXVTWEpkdWczZ2pSZmZ4UT09';
const PRICE_NIS = 299; // כולל מע"מ

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
  const [licenseCode, setLicenseCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, updateUser } = useAuth();

  const handleActivateLicense = async () => {
    if (!licenseCode.trim()) {
      setError('אנא הזן קוד רישוי');
      return;
    }

    setIsActivating(true);
    setError('');

    try {
      // בדיקת קודי רישוי תקינים
      const validCodes = ['PREMIUM2024', 'UNLOCK123', 'FULLACCESS', 'SEAN2024'];
      
      if (validCodes.includes(licenseCode.toUpperCase())) {
        // הפעלת רישוי
        updateUser({
          subscriptionStatus: 'active',
          maxSearches: 999999,
          searchCount: 0
        });
        
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setLicenseCode('');
        }, 2000);
      } else {
        setError('קוד רישוי לא תקין');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהפעלת הרישוי');
    } finally {
      setIsActivating(false);
    }
  };

  // עקיפה לאדמין
  if (user?.email === 'seannon29@gmail.com') {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 text-right">
            הפעלת חיפושים ללא הגבלה
          </h2>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                הרישוי הופעל בהצלחה!
              </h3>
              <p className="text-green-600">
                תוכל להמשיך להשתמש במערכת ללא הגבלה
              </p>
            </div>
          ) : (
            <>
              {/* Payment Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    תשלום מאובטח
                  </h3>
                  <p className="text-2xl font-bold text-blue-800 mb-2">
                    עלות: {PRICE_NIS} ₪ (כולל מע״מ)
                  </p>
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-green-900 mb-2">💳 קישור תשלום מאובטח:</h4>
                    <a
                      href="https://did.li/dVBaa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      https://did.li/dVBaa
                    </a>
                  </div>
                  <a
                    href={PAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 space-x-reverse bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>לתשלום מאובטח</span>
                  </a>
                  <p className="text-sm text-blue-700">
                    לאחר התשלום תתקבל חשבונית אוטומטית.
                  </p>
                </div>
              </div>

              {/* License Code Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    קוד רישוי
                  </label>
                  <div className="relative">
                    <Shield className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={licenseCode}
                      onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                      className="w-full pl-3 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg"
                      placeholder="XXXX-XXXX-XXXX"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    הזן את קוד הרישוי שקיבלת לאחר ביצוע התשלום
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleActivateLicense}
                  disabled={isActivating}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    isActivating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
                >
                  {isActivating ? 'מפעיל רישוי...' : 'הפעל רישוי'}
                </button>
              </div>

              {/* Features List */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 text-right">
                  מה תקבל עם הרישוי:
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span>חיפושים ללא הגבלה</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span>נתונים אמיתיים מ-Google Maps</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span>ייבוא/ייצוא ללא הגבלה</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span>תמיכה מלאה</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-right">
                  צריך עזרה?
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="text-right">📧 support@crm-israel.com</p>
                  <p className="text-right">📱 050-123-4567</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;