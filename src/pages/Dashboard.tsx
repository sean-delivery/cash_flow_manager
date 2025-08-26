import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  user: string;
}

const Card: React.FC<{ to: string; icon: string; title: string; desc: string }> = ({ to, icon, title, desc }) => (
  <Link
    to={to}
    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center"
  >
    <span className="text-4xl mb-2">{icon}</span>
    <h2 className="font-medium">{title}</h2>
    <p className="text-sm text-gray-600">{desc}</p>
  </Link>
);

const Dashboard: React.FC<Props> = ({ user }) => (
  <div className="min-h-screen p-4 flex flex-col">
    <h1 className="text-2xl font-semibold text-center mb-6">ברוך הבא, {user}</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
      <Card
        to="/app1"
        icon="🧭"
        title="מציאת לקוחות ומעקב לקוחות"
        desc="איתור לידים, שמירת קשרים, ניהול סטטוסי לקוח"
      />
      <Card
        to="/app2"
        icon="💰"
        title="תזרים מזומנים"
        desc="דוחות הכנסות/הוצאות, מעקב תשלומים"
      />
      <Card
        to="/app3"
        icon="📦"
        title="ניהול מחסן / מלאי אישי"
        desc="כניסות/יציאות, תעודות משלוח, איתורי מלאי"
      />
      <Card
        to="/app4"
        icon="📝"
        title="הכנה ופרסום מאמרים וסרטונים"
        desc="יצירת תוכן SEO ופרסום אוטומטי"
      />
    </div>
    <div className="mt-4 flex justify-center gap-4">
      <Link to="/settings" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
        <span>⚙️</span>
        <span>הגדרות</span>
      </Link>
      <Link to="/support" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
        <span>❓</span>
        <span>תמיכה</span>
      </Link>
    </div>
  </div>
);

export default Dashboard;
