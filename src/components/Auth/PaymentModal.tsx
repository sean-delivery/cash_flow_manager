import React, { useState } from 'react';
import { X, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [paymentCode, setPaymentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { activateSubscription, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentCode.trim()) {
      setError('אנא הזן קוד תשלום');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await activateSubscription(paymentCode.trim());
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setPaymentCode('');
        }, 2000);
      } else {
        setError('קוד תשלום לא תקין או פג תוקף');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהפעלת המנוי');
    } finally {
      setIsLoading(false);
    }
  };

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
            הפעלת מנוי
          </h2>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                המנוי הופעל בהצלחה!
              </h3>
              <p className="text-green-600">
                תוכל להמשיך להשתמש במערכת ללא הגבלה
              </p>
            </div>
          ) : (
            <>
              {/* Trial Status */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <h3 className="font-medium text-orange-800">סטטוס תקופת הניסיון</h3>
                </div>
                <p className="text-orange-700 text-center">
                  {user?.subscriptionStatus === 'trial' 
                    ? 'תקופת הניסיון הסתיימה' 
                    : 'המנוי פג תוקף'
                  }
                </p>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    קוד תשלום
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={paymentCode}
                      onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
                      className="w-full pl-3 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg"
                      placeholder="XXXX-XXXX-XXXX"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    הזן את קוד התשלום שקיבלת לאחר ביצוע התשלום
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
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {isLoading ? 'מפעיל מנוי...' : 'הפעל מנוי'}
                </button>
              </form>

              {/* Contact Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-right">
                  צריך עזרה?
                </h4>
                <p className="text-sm text-gray-600 text-right">
                  לקבלת קוד תשלום או לתמיכה, צור קשר:
                </p>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
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

export default PaymentModal;