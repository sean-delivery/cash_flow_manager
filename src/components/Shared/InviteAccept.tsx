import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, UserPlus, Clock } from 'lucide-react';
import { sb } from '../../lib/supabase';

interface InviteAcceptProps {
  token: string;
  onSuccess: () => void;
}

const InviteAccept: React.FC<InviteAcceptProps> = ({ token, onSuccess }) => {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success' | 'error'>('loading');
  const [inviteInfo, setInviteInfo] = useState<any>(null);

  useEffect(() => {
    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      const { data, error } = await sb
        .from('invites')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setStatus('invalid');
        return;
      }

      setInviteInfo(data);
      setStatus('valid');
    } catch (error) {
      console.error('Error validating invite:', error);
      setStatus('invalid');
    }
  };

  const acceptInvite = async () => {
    try {
      const { data: user } = await sb.auth.getUser();
      if (!user.user) {
        alert('יש להתחבר קודם');
        return;
      }

      const { data, error } = await sb.rpc('accept_invite', { invite_token: token });

      if (error || !data) {
        console.error('Error accepting invite:', error);
        setStatus('error');
        return;
      }

      setStatus('success');
      setTimeout(() => onSuccess(), 2000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">בודק הזמנה...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">הזמנה לא תקינה</h2>
          <p className="text-gray-600">ההזמנה פגה תוקף או לא קיימת</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">הצטרפת בהצלחה!</h2>
          <p className="text-gray-600">מעביר אותך למערכת...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <UserPlus className="h-16 w-16 text-blue-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">הזמנה לשיתוף</h2>
        
        {inviteInfo && (
          <div className="mb-6 text-right">
            <p className="text-gray-600 mb-2">הוזמנת להצטרף כ:</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              inviteInfo.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {inviteInfo.role === 'editor' ? 'עורך - צפייה ועריכה' : 'צופה - צפייה בלבד'}
            </span>
            {inviteInfo.invitee_email && (
              <p className="text-sm text-gray-500 mt-2">עבור: {inviteInfo.invitee_email}</p>
            )}
          </div>
        )}

        <button
          onClick={acceptInvite}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          קבל הזמנה
        </button>
      </div>
    </div>
  );
};

export default InviteAccept;