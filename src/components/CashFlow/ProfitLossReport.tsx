import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, PieChart } from 'lucide-react';
import { CashFlowEntry } from '../../types/cashflow';

interface ProfitLossReportProps {
  entries: CashFlowEntry[];
  selectedPeriod: 'month' | 'quarter' | 'year';
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({ entries, selectedPeriod }) => {
  const reportData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const periodEntries = entries.filter(entry => entry.date >= startDate && entry.date <= now);
    
    // קיבוץ הכנסות לפי קטגוריה
    const incomeByCategory: { [key: string]: number } = {};
    const expensesByCategory: { [key: string]: number } = {};
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    periodEntries.forEach(entry => {
      if (entry.type === 'income') {
        incomeByCategory[entry.category] = (incomeByCategory[entry.category] || 0) + entry.amount;
        totalIncome += entry.amount;
      } else {
        expensesByCategory[entry.category] = (expensesByCategory[entry.category] || 0) + entry.amount;
        totalExpenses += entry.amount;
      }
    });

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      incomeByCategory,
      expensesByCategory,
      periodName: selectedPeriod === 'month' ? 'החודש' : 
                  selectedPeriod === 'quarter' ? 'הרבעון' : 'השנה'
    };
  }, [entries, selectedPeriod]);

  const CategoryBreakdown = ({ title, data, color, icon }: any) => (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center justify-end space-x-2 space-x-reverse mb-4">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([category, amount]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="text-white font-medium">₪{(amount as number).toLocaleString()}</div>
            <div className="text-slate-300 text-sm">{category}</div>
          </div>
        ))}
        {Object.keys(data).length === 0 && (
          <div className="text-slate-400 text-center py-4">אין נתונים</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white mb-2">דוח רווח והפסד</h2>
            <p className="text-slate-300">{reportData.periodName} הנוכחי</p>
          </div>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-3">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-green-300 text-sm font-medium">סה״כ הכנסות</p>
              <p className="text-2xl font-bold text-green-400">₪{reportData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-green-500 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-red-300 text-sm font-medium">סה״כ הוצאות</p>
              <p className="text-2xl font-bold text-red-400">₪{reportData.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-red-500 rounded-lg p-3">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`${reportData.netProfit >= 0 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-red-500/20 border-red-500/30'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className={`${reportData.netProfit >= 0 ? 'text-blue-300' : 'text-red-300'} text-sm font-medium`}>רווח נקי</p>
              <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                ₪{reportData.netProfit.toLocaleString()}
              </p>
            </div>
            <div className={`${reportData.netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-lg p-3`}>
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-purple-300 text-sm font-medium">שולי רווח</p>
              <p className={`text-2xl font-bold ${reportData.profitMargin >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                {reportData.profitMargin.toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <PieChart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown
          title="הכנסות לפי קטגוריה"
          data={reportData.incomeByCategory}
          color="bg-green-500/20"
          icon={<TrendingUp className="h-5 w-5 text-green-400" />}
        />
        <CategoryBreakdown
          title="הוצאות לפי קטגוריה"
          data={reportData.expensesByCategory}
          color="bg-red-500/20"
          icon={<TrendingDown className="h-5 w-5 text-red-400" />}
        />
      </div>

      {/* Financial Health Indicators */}
      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4 text-right">מדדי בריאות כלכלית</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              reportData.profitMargin > 20 ? 'text-green-400' :
              reportData.profitMargin > 10 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {reportData.profitMargin > 20 ? '🟢' : reportData.profitMargin > 10 ? '🟡' : '🔴'}
            </div>
            <div className="text-white font-medium">שולי רווח</div>
            <div className="text-slate-400 text-sm">
              {reportData.profitMargin > 20 ? 'מצוין' :
               reportData.profitMargin > 10 ? 'טוב' : 'דורש שיפור'}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              reportData.totalIncome > reportData.totalExpenses * 1.5 ? 'text-green-400' :
              reportData.totalIncome > reportData.totalExpenses ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {reportData.totalIncome > reportData.totalExpenses * 1.5 ? '🟢' :
               reportData.totalIncome > reportData.totalExpenses ? '🟡' : '🔴'}
            </div>
            <div className="text-white font-medium">יחס הכנסות/הוצאות</div>
            <div className="text-slate-400 text-sm">
              {reportData.totalExpenses > 0 ? (reportData.totalIncome / reportData.totalExpenses).toFixed(1) : '∞'}:1
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              reportData.netProfit > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {reportData.netProfit > 0 ? '📈' : '📉'}
            </div>
            <div className="text-white font-medium">מגמה</div>
            <div className="text-slate-400 text-sm">
              {reportData.netProfit > 0 ? 'רווחי' : 'הפסדי'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;