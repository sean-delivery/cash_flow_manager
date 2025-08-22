import React from 'react';
import { Edit, Trash2, TrendingUp, TrendingDown, CheckSquare } from 'lucide-react';
import { CashFlowEntry } from '../../types/cashflow';

interface CashFlowTableProps {
  entries: CashFlowEntry[];
  onEdit: (entry: CashFlowEntry) => void;
  onDelete: (id: string) => void;
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({ 
  entries, 
  onEdit, 
  onDelete 
}) => {
  const getPaymentMethodIcon = (method: string) => {
    const icons: { [key: string]: string } = {
      cash: '💵',
      bit: '📱',
      paybox: '📱',
      credit: '💳',
      paypal: '🌐',
      bank_transfer: '🏦',
      check: '📄'
    };
    return icons[method] || '💰';
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

  // מיון לפי תאריך (הישן ביותר קודם) וחישוב יתרה מצטברת
  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let runningBalance = 0;
  const entriesWithBalance = sortedEntries.map(entry => {
    const amount = entry.type === 'income' ? entry.amount : -entry.amount;
    runningBalance += amount;
    return { ...entry, runningBalance };
  });

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <TrendingUp className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין רשומות תזרים מזומנים</h3>
        <p className="text-gray-500">הוסף רשומה ראשונה כדי להתחיל לעקוב אחר התזרים</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                תאריך
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                פרוט
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                לקוח/ספק
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                קטגוריה
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                אמצעי תשלום
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                סכום
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 uppercase tracking-wider">
                יתרה מצטברת
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entriesWithBalance.map((entry, index) => (
              <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
              }`}>

                {/* תאריך - עמודה ראשונה */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.date.toLocaleDateString('he-IL')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.date.toLocaleDateString('he-IL', { weekday: 'short' })}
                  </div>
                </td>

                {/* פרוט - תיאור + סוג */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900 max-w-48">
                    {entry.description}
                  </div>
                  <div className="flex items-center justify-end space-x-2 space-x-reverse mt-1">
                    <span className={`text-xs font-medium ${
                      entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.type === 'income' ? 'הכנסה' : 'הוצאה'}
                    </span>
                  </div>
                  {entry.notes && (
                    <div className="text-xs text-gray-500 mt-1 max-w-48 truncate">
                      {entry.notes}
                    </div>
                  )}
                </td>

                {/* לקוח/ספק */}
                <td className="px-4 py-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.client || '-'}
                  </div>
                </td>

                {/* קטגוריה */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    entry.type === 'income' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.category}
                  </span>
                </td>

                {/* אמצעי תשלום */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-700 font-medium">
                      {getPaymentMethodName(entry.paymentMethod)}
                    </span>
                    <span className="text-lg">
                      {getPaymentMethodIcon(entry.paymentMethod)}
                    </span>
                  </div>
                </td>

                {/* סכום - לפני האחרון */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className={`text-base font-semibold ${
                    entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.type === 'income' ? '+' : '-'}₪{entry.amount.toLocaleString()}
                  </div>
                </td>

                {/* יתרה מצטברת - עמודה אחרונה */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className={`text-lg font-bold ${
                    entry.runningBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₪{entry.runningBalance.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.runningBalance >= 0 ? 'יתרה חיובית' : 'יתרה שלילית'}
                  </div>
                </td>

                {/* פעולות - הוסרו מהטבלה הראשית */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1 space-x-reverse">
                    <button
                      onClick={() => onEdit(entry)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                      title="ערוך"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      title="מחק"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* סיכום תחתון */}
      <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              ₪{entriesWithBalance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">סה״כ הכנסות</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              ₪{entriesWithBalance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">סה״כ הוצאות</div>
          </div>
          <div>
            <div className={`text-xl font-bold ${
              runningBalance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              ₪{runningBalance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">יתרה סופית</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowTable;