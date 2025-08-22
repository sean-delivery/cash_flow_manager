import React, { useState } from 'react';
import { sb } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const GoogleSignInButton: React.FC<{ text?: string }> = ({ text = 'התחברות עם Google' }) => {
  const [loading, setLoading] = useState(false);
  const { clearAuthGuard } = useAuth();

  const signIn = async () => {
    try {
      setLoading(true);
      const BASE_URL =
  import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

const returnTo = `${BASE_URL}/pages/oauth2/callback`;

      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: returnTo,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      if (error) throw error;
      clearAuthGuard();
    } catch (e: any) {
      console.error('Google OAuth error', e);
      alert(e.message || 'שגיאה בהתחברות Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-3 px-4 hover:bg-gray-50 flex items-center justify-center gap-3"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-5 w-5" />
      {loading ? 'מתחבר...' : text}
    </button>
  );
};

export default GoogleSignInButton;
