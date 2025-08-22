import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign, CreditCard, Smartphone, Building2, Wallet, Download, Filter, BarChart3, ArrowRight } from 'lucide-react';
import { CashFlowEntry, CashFlowSummary, MonthlyProjection } from '../../types/cashflow';
import CashFlowForm from './CashFlowForm';
import CashFlowTable from './CashFlowTable';
import CashFlowSummaryCard from './CashFlowSummaryCard';
import CashFlowChart from './CashFlowChart';
import ProfitLossReport from './ProfitLossReport';

interface CashFlowManagerProps {
  onNavigate?: (view: string) => void;
}

const CashFlowManager: React.FC<CashFlowManagerProps> = ({ onNavigate }) => {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [activeView, setActiveView] = useState<'table' | 'chart' | 'report'>('table');
  const [reportPeriod, setReportPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [summary, setSummary] = useState<CashFlowSummary>({
    currentBalance: 0,
    balanceInOneMonth: 0,
    balanceInThreeMonths: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });

  // טעינת נתונים מ-localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('cashflow_entries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt)
        }));
        setEntries(entriesWithDates);
      } catch (error) {
        console.error('Error loading cash flow entries:', error);
      }
    }
  }, []);

  // שמירת נתונים ל-localStorage
  useEffect(() => {
    localStorage.setItem('cashflow_entries', JSON.stringify(entries));
    calculateSummary();
  }, [entries]);

  // חישוב סיכום
  const calculateSummary = () => {
    const now = new Date();
    const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    let currentBalance = 0;
    let balanceInOneMonth = 0;
    let balanceInThreeMonths = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    entries.forEach(entry => {
      const amount = entry.type === 'income' ? entry.amount : -entry.amount;
      
      // יתרה נוכחית (רק עבר)
      if (entry.date <= now) {
        currentBalance += amount;
      }
      
      // יתרה בחודש
      if (entry.date <= oneMonthFromNow) {
        balanceInOneMonth += amount;
      }
      
      // יתרה בשלושה חודשים
      if (entry.date <= threeMonthsFromNow) {
        balanceInThreeMonths += amount;
      }

      // סיכומים כלליים
      if (entry.type === 'income') {
        totalIncome += entry.amount;
      } else {
        totalExpenses += entry.amount;
      }
    });

    // חישוב ממוצע חודשי
    const monthsRange = 3;
    const monthlyIncome = totalIncome / monthsRange;
    const monthlyExpenses = totalExpenses / monthsRange;

    setSummary({
      currentBalance,
      balanceInOneMonth,
      balanceInThreeMonths,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses
    });
  };

  // הוספת רשומה חדשה
  const handleAddEntry = (entryData: Omit<CashFlowEntry, 'id' | 'createdAt'>) => {
    if (entryData.isRecurring && entryData.recurringMonths && entryData.recurringMonths > 1) {
      // יצירת רשומות חוזרות
      const newEntries: CashFlowEntry[] = [];
      for (let i = 0; i < entryData.recurringMonths; i++) {
        const entryDate = new Date(entryData.date);
        entryDate.setMonth(entryDate.getMonth() + i);
        
        newEntries.push({
          ...entryData,
          id: `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          date: entryDate,
          description: i === 0 ? entryData.description : `${entryData.description} (חודש ${i + 1})`,
          createdAt: new Date()
        });
      }
      setEntries(prev => [...prev, ...newEntries]);
    } else {
      // רשומה יחידה
      const newEntry: CashFlowEntry = {
        ...entryData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };
      setEntries(prev => [...prev, newEntry]);
    }
    
    setShowForm(false);
  };

  // עריכת רשומה
  const handleEditEntry = (entryData: Omit<CashFlowEntry, 'id' | 'createdAt'>) => {
    if (editingEntry) {
      const updatedEntry: CashFlowEntry = {
        ...entryData,
        id: editingEntry.id,
        createdAt: editingEntry.createdAt
      };
      setEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      ));
      setEditingEntry(null);
      setShowForm(false);
    }
  };

  // מחיקת רשומה
  const handleDeleteEntry = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      setSelectedEntries(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    }
  };

  // סינון רשומות
  const filteredEntries = entries.filter(entry => {
    const typeMatch = filterType === 'all' || entry.type === filterType;
    const monthMatch = !filterMonth || 
      entry.date.toISOString().substring(0, 7) === filterMonth;
    return typeMatch && monthMatch;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // ייצוא ל-CSV
  const handleExport = () => {
    const csvContent = [
      'תאריך,סוג,סכום,תיאור,לקוח,אמצעי תשלום,קטגוריה,הערות',
      ...filteredEntries.map(entry => 
        `"${entry.date.toLocaleDateString('he-IL')}","${entry.type === 'income' ? 'הכנסה' : 'הוצאה'}","${entry.amount}","${entry.description}","${entry.client || ''}","${getPaymentMethodName(entry.paymentMethod)}","${entry.category}","${entry.notes || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cashflow_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: 'מזומן',
      bit: 'ביט',
      paybox: 'פייבוקס',
      credit: 'אשראי',
      paypal: 'פייפאל',
      bank_transfer: 'העברה בנקאית',
      check: 'צ\'ק'
    };
    return methods[method] || method;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveView('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'table'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              טבלה
            </button>
            <button
              onClick={() => setActiveView('chart')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'chart'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              גרפים
            </button>
            <button
              onClick={() => setActiveView('report')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'report'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              דוח רווח והפסד
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="h-5 w-5" />
            <span>רשומה חדשה</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 flex items-center space-x-2 space-x-reverse"
          >
            <Download className="h-5 w-5" />
            <span>ייצוא</span>
          </button>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-4 space-x-reverse mb-2">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <ArrowRight className="h-5 w-5" />
              <span>חזרה לדשבורד</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">תזרים מזומנים</h1>
          <p className="text-gray-600">{filteredEntries.length} רשומות</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CashFlowSummaryCard
          title="יתרה היום"
          amount={summary.currentBalance}
          icon={<Wallet className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          isBalance={true}
        />
        <CashFlowSummaryCard
          title="יתרה בחודש"
          amount={summary.balanceInOneMonth}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          isBalance={true}
        />
        <CashFlowSummaryCard
          title="סה״כ הכנסות"
          amount={summary.totalIncome}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <CashFlowSummaryCard
          title="סה״כ הוצאות"
          amount={summary.totalExpenses}
          icon={<TrendingDown className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Chart */}
      {activeView === 'chart' && (
        <div className="mb-8">
          <CashFlowChart entries={entries} />
        </div>
      )}

      {/* Profit & Loss Report */}
      {activeView === 'report' && (
        <div className="mb-8">
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                {(['month', 'quarter', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setReportPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      reportPeriod === period
                        ? 'bg-cyan-500 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {period === 'month' ? 'חודש' : period === 'quarter' ? 'רבעון' : 'שנה'}
                  </button>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-white text-right">תקופת דוח</h3>
            </div>
          </div>
          <ProfitLossReport entries={entries} selectedPeriod={reportPeriod} />
        </div>
      )}

      {/* Filters */}
      {activeView === 'table' && (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                סוג רשומה
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white text-right"
              >
                <option value="all">הכל</option>
                <option value="income">הכנסות</option>
                <option value="expense">הוצאות</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                חודש
              </label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white text-right"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterMonth('');
                }}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-lg hover:from-slate-700 hover:to-slate-800"
              >
                נקה סינונים
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {activeView === 'table' && (
        <CashFlowTable
          entries={filteredEntries}
          onEdit={(entry) => {
            setEditingEntry(entry);
            setShowForm(true);
          }}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <CashFlowForm
          entry={editingEntry}
          onSubmit={editingEntry ? handleEditEntry : handleAddEntry}
          onCancel={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

export default CashFlowManager;