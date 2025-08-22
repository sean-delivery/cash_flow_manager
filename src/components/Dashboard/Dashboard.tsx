import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CheckSquare, TrendingUp, Star } from 'lucide-react';
import StatsCard from './StatsCard';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalLeads: 156,
    newLeads: 23,
    favorites: 12,
    currentBalance: 45000
  });

  const recentLeads = [
    { id: '1', name: 'דוד כהן', company: 'כהן טכנולוגיות', status: 'חדש' },
    { id: '2', name: 'שרה לוי', company: 'לוי ושותפים', status: 'בטיפול' },
    { id: '3', name: 'אחמד עלי', company: 'עלי בנייה', status: 'הצעה' }
  ];

  const tasks = [
    { id: '1', title: 'להתקשר לדוד כהן', priority: 'גבוהה', completed: false },
    { id: '2', title: 'להכין הצעת מחיר לשרה', priority: 'גבוהה', completed: false },
    { id: '3', title: 'פגישה עם אחמד בנצרת', priority: 'בינונית', completed: true }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 text-right mb-2">דשבורד ראשי</h1>
        <p className="text-gray-600 text-right">סקירה כללית של המערכת</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="סה״כ לידים"
          value={stats.totalLeads}
          change={12.5}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatsCard
          title="לידים חדשים"
          value={stats.newLeads}
          change={15.3}
          icon={<Star className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatsCard
          title="מועדפים"
          value={stats.favorites}
          change={8.7}
          icon={<Star className="h-6 w-6 text-white" />}
          color="bg-orange-500"
        />
        <StatsCard
          title="יתרה נוכחית"
          value={`₪${stats.currentBalance.toLocaleString()}`}
          change={12.4}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">לידים אחרונים</h3>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lead.status === 'חדש' ? 'bg-blue-100 text-blue-800' :
                  lead.status === 'בטיפול' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {lead.status}
                </span>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">משימות השבוע</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'גבוהה' ? 'bg-red-100 text-red-800' :
                    task.priority === 'בינונית' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.completed ? 'הושלם' : 'פעיל'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{task.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;