import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { CashFlowEntry } from '../../types/cashflow';

interface CashFlowChartProps {
  entries: CashFlowEntry[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ entries }) => {
  const chartData = useMemo(() => {
    // חישוב פשוט של סיכומים
    let totalIncome = 0;
    let totalExpenses = 0;
    
    entries.forEach(entry => {
      if (entry.type === 'income') {
        totalIncome += entry.amount;
      } else {
        totalExpenses += entry.amount;
      }
    });
    
    return [{
      month: 'סיכום כולל',
      monthKey: 'total',
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    }];
  }, [entries]);

  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.income, d.expenses)),
    1000
  );

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתונים לתצוגה</h3>
        <p className="text-gray-500">הוסף רשומות תזרים מזומנים כדי לראות גרף</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">הכנסות</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">הוצאות</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">יתרה</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-right">סיכום תזרים מזומנים</h3>
      </div>

      <div className="space-y-4">
        {chartData.map((data, index) => (
          <div key={data.monthKey} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                ₪{data.balance.toLocaleString()}
              </div>
              <div className="font-medium text-gray-900">{data.month}</div>
            </div>
            
            <div className="space-y-1">
              {/* הכנסות */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(data.income / maxValue) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      ₪{data.income.toLocaleString()}
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              
              {/* הוצאות */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(data.expenses / maxValue) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      ₪{data.expenses.toLocaleString()}
                    </span>
                  </div>
                </div>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              ₪{chartData.reduce((sum, d) => sum + d.income, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">סה״כ הכנסות</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              ₪{chartData.reduce((sum, d) => sum + d.expenses, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">סה״כ הוצאות</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              chartData.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              ₪{chartData.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">יתרה כוללת</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowChart;