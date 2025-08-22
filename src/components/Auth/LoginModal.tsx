import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';

export default function LoginModal() {
  const { showLoginModal, authGuardReason, clearAuthGuard } = useAuth();
  
  if (!showLoginModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={clearAuthGuard}>
      <div className="bg-white p-4 rounded-xl min-w-[300px]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg mb-2">כניסה נדרשת</h3>
        <p className="mb-3">{authGuardReason || 'חובה להתחבר עם Google'}</p>
        <GoogleSignInButton />
      </div>
    </div>
  );
}