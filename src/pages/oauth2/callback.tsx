import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { gmailManager } from '../../lib/gmailAuth';

const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('מעבד התחברות Google...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    console.log('📥 OAuth callback received:', { code: !!code, state, error });

    if (error) {
      setStatus('error');
      setMessage(`שגיאה בהתחברות: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('לא התקבל קוד התחברות מ-Google');
      return;
    }

    // Process the authorization code
    processAuthCode(code, state);
  }, []);

  const processAuthCode = async (code: string, state: string | null) => {
    try {
      setMessage('מחליף קוד לאסימון...');
      
      if (state === 'gmail_auth') {
        // Gmail authentication
        console.log('🔄 מחליף קוד Gmail לאסימון...');
        const token = await gmailManager.exchangeCodeForToken(code);
        
        setStatus('success');
        setMessage('התחברת בהצלחה ל-Gmail!');
        
        // Redirect back to email extraction page
        setTimeout(() => {
          window.location.href = '/#email-extraction';
        }, 2000);
      } else {
        // Regular Google authentication
        setStatus('success');
        setMessage('התחברות הושלמה בהצלחה!');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('❌ Token exchange error:', error);
      setStatus('error');
      setMessage(`שגיאה בהחלפת הקוד: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">מתחבר ל-Google</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">התחברות הושלמה!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">מעביר אותך למערכת...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">שגיאה בהתחברות</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/#email-extraction'}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                חזור לדף הוצאת מידע
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                חזור למערכת
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;