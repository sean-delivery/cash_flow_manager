import React from 'react';

const Settings: React.FC = () => (
  <div className="min-h-screen p-4">
    <h1 className="text-2xl font-semibold mb-4">הגדרות</h1>
    <ul className="space-y-2">
      <li>⚙️ אוטומציות</li>
      <li>👤 חיבור יוזר</li>
      <li>👥 ניהול משתמשים</li>
      <li>🔗 שיתוף</li>
      <li>💳 תשלום ותכנית פעילה</li>
    </ul>
  </div>
);

export default Settings;
