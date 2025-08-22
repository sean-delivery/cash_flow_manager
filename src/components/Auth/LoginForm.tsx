import React, { useState } from 'react';
import { Mail, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      alert('אנא הזן מייל');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">מכונת לידים</h1>
          <p className="text-gray-600">מערכת ניהול לקוחות מתקדמת</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                כתובת מייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading || !email.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 space-x-reverse ${
                isLoading || !email.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              <LogIn className="h-5 w-5" />
              <span>{isLoading ? 'מתחבר...' : 'התחבר למערכת'}</span>
            </button>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2 text-right">כניסה מהירה:</h3>
              <p className="text-sm text-blue-700 text-right">
                הזן כל מייל והסיסמה תהיה אוטומטית 123456
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;