import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target, PieChart, LineChart } from 'lucide-react';

const AnalyticsManager: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'leads' | 'revenue' | 'conversion'>('leads');

  // נתונים לדוגמה
  const analyticsData = {
    leads: {
      total: 156,
      growth: 12.5,
      byStatus: {
        'חדש': 45,
        'בטיפול': 67,
        'הצעה': 23,
        'נסגר': 21
      },
      bySource: {
        'אתר אינטרנט': 45,
        'חיפוש גוגל': 38,
        'המלצות': 32,
        'רשתות חברתיות': 25,
        'אחר': 16
      }
    },
    revenue: {
      total: 485000,
      growth: 8.3,
      byMonth: [
        { month: 'ינואר', amount: 75000 },
        { month: 'פברואר', amount: 82000 },
        { month: 'מרץ', amount: 91000 },
        { month: 'אפריל', amount: 88000 },
        { month: 'מאי', amount: 95000 },
        { month: 'יוני', amount: 54000 }
      ]
    },
    conversion: {
      rate: 13.5,
      growth: -2.1,
      funnel: {
        'לידים': 156,
        'פגישות': 89,
        'הצעות': 34,
        'עסקאות': 21
      }
    }
  };

  const StatCard = ({ title, value, growth, icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2 justify-end">
            {growth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 ml-1" />
            )}
            <span className={`text-sm font-medium ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
            <span className="text-sm text-gray-500 mr-1">מהחודש הקודם</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-white rounded-lg p-1 flex">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === 'week' ? 'שבוע' : 
                 range === 'month' ? 'חודש' :
                 range === 'quarter' ? 'רבעון' : 'שנה'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">אנליטיקס ודוחות</h1>
          <p className="text-gray-600">תובנות עסקיות מתקדמות</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="סה״כ לידים"
          value={analyticsData.leads.total}
          growth={analyticsData.leads.growth}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="הכנסות"
          value={`₪${(analyticsData.revenue.total / 1000).toFixed(0)}K`}
          growth={analyticsData.revenue.growth}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="שיעור המרה"
          value={`${analyticsData.conversion.rate}%`}
          growth={analyticsData.conversion.growth}
          icon={<Target className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="עסקאות חדשות"
          value="21"
          growth={15.2}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Leads by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">לידים לפי סטטוס</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.leads.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / analyticsData.leads.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">מגמת הכנסות</h3>
          <div className="space-y-3">
            {analyticsData.revenue.byMonth.map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-sm font-medium text-gray-900">
                    ₪{(item.amount / 1000).toFixed(0)}K
                  </span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(item.amount / Math.max(...analyticsData.revenue.byMonth.map(m => m.amount))) * 100}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-right">משפך המרות</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(analyticsData.conversion.funnel).map(([stage, count], index) => (
            <div key={stage} className="text-center">
              <div className={`mx-auto mb-3 rounded-lg p-4 ${
                index === 0 ? 'bg-blue-100' :
                index === 1 ? 'bg-green-100' :
                index === 2 ? 'bg-yellow-100' : 'bg-purple-100'
              }`}>
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-blue-600' :
                  index === 1 ? 'text-green-600' :
                  index === 2 ? 'text-yellow-600' : 'text-purple-600'
                }`}>
                  {count}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">{stage}</div>
              {index > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {((count / Object.values(analyticsData.conversion.funnel)[index - 1]) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">מקורות לידים</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(analyticsData.leads.bySource).map(([source, count]) => (
            <div key={source} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{source}</div>
              <div className="text-xs text-gray-500 mt-1">
                {((count / analyticsData.leads.total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;