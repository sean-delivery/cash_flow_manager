import React, { useState, useEffect } from 'react';
import { Mail, Download, RefreshCw, Calendar, DollarSign, Building2, AlertCircle, CheckCircle, ArrowRight, Search, Filter, Eye } from 'lucide-react';
import { gmailManager, ExtractedInvoice } from '../../lib/gmailAuth';
import { useAuth } from '../../contexts/AuthContext';

interface EmailExtractionManagerProps {
  onNavigate?: (view: string) => void;
}

const EmailExtractionManager: React.FC<EmailExtractionManagerProps> = ({ onNavigate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [invoices, setInvoices] = useState<ExtractedInvoice[]>([]);
  const [daysBack, setDaysBack] = useState(30);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    // Check if Gmail is already connected and token is valid
    if (gmailManager.isConnected()) {
      setIsConnected(true);
    }
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'gmail_auth') {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      console.log('🔄 מעבד OAuth callback...');
      const token = await gmailManager.exchangeCodeForToken(code);
      setIsConnected(true);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      alert('✅ התחברת בהצלחה ל-Gmail!');
    } catch (error: any) {
      console.error('❌ OAuth callback error:', error);
      setError(`❌ שגיאה בהתחברות: ${error.message}`);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setError('');
      console.log('🔐 מתחיל התחברות ל-Gmail...');
      
      // Use Google OAuth code flow with redirect
      gmailManager.requestGoogleCode();
      
    } catch (error: any) {
      console.error('❌ Gmail connection error:', error);
      setError(`❌ שגיאה בהתחברות: ${error.message || 'שגיאה לא ידועה'}`);
    }
  };

  const handleExtractInvoices = async () => {
    if (!isConnected) {
      alert('❌ יש להתחבר ל-Gmail קודם');
      return;
    }

    setIsExtracting(true);
    setError('');
    setProgress(0);
    setInvoices([]);

    try {
      console.log('🔍 מתחיל חילוץ חשבוניות...');
      setProgress(20);

      const extractedInvoices = await gmailManager.searchInvoices(daysBack);
      setProgress(80);

      // סינון כפילויות לפי messageId
      const uniqueInvoices = extractedInvoices.filter((invoice, index, self) =>
        index === self.findIndex(i => i.id === invoice.id)
      );

      setInvoices(uniqueInvoices);
      setProgress(100);

      console.log(`✅ חילוץ הושלם: ${uniqueInvoices.length} חשבוניות`);
      
      if (uniqueInvoices.length === 0) {
        setError('לא נמצאו חשבוניות או קבלות בטווח הזמן שנבחר');
      }

    } catch (error: any) {
      console.error('❌ שגיאה בחילוץ:', error);
      setError(`שגיאה בחילוץ נתונים: ${error.message}`);
    } finally {
      setIsExtracting(false);
      setProgress(0);
    }
  };

  const handleSelectInvoice = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  const handleAddToCashFlow = () => {
    const selectedInvoiceData = invoices.filter(inv => selectedInvoices.has(inv.id));
    
    if (selectedInvoiceData.length === 0) {
      alert('❌ אנא בחר לפחות חשבונית אחת');
      return;
    }

    // הוספה לתזרים מזומנים
    const cashflowEntries = selectedInvoiceData.map(invoice => ({
      id: `gmail_${invoice.id}`,
      type: 'expense' as const,
      amount: invoice.amount,
      description: `${invoice.supplier} - ${invoice.subject}`,
      client: invoice.supplier,
      date: invoice.date,
      paymentMethod: 'credit' as const,
      category: 'ספקים',
      notes: `יובא מ-Gmail - ${invoice.subject}`,
      source: 'Gmail',
      createdAt: new Date()
    }));

    // שמירה ב-localStorage
    const existingEntries = JSON.parse(localStorage.getItem('cashflow_entries') || '[]');
    const updatedEntries = [...existingEntries, ...cashflowEntries];
    localStorage.setItem('cashflow_entries', JSON.stringify(updatedEntries));

    alert(`✅ ${selectedInvoiceData.length} חשבוניות נוספו לתזרים המזומנים!`);
    setSelectedInvoices(new Set());
    
    // עדכון רכיבים
    window.dispatchEvent(new CustomEvent('cashflowUpdated'));
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      alert('❌ אין נתונים לייצוא');
      return;
    }

    const csvContent = [
      'תאריך,ספק,סכום,מטבע,נושא,מקור',
      ...filteredInvoices.map(inv => 
        `"${inv.date.toLocaleDateString('he-IL')}","${inv.supplier}","${inv.amount}","${inv.currency}","${inv.subject}","${inv.source}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gmail_invoices_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredInvoices = invoices.filter(invoice => {
    const currencyMatch = filterCurrency === '' || invoice.currency === filterCurrency;
    const supplierMatch = filterSupplier === '' || 
      invoice.supplier.toLowerCase().includes(filterSupplier.toLowerCase());
    return currencyMatch && supplierMatch;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => {
    if (inv.currency === 'ILS') {
      return sum + inv.amount;
    }
    // המרה פשוטה למטבעות אחרים (ניתן לשפר עם API של שער חליפין)
    const rate = inv.currency === 'USD' ? 3.7 : inv.currency === 'EUR' ? 4.0 : 1;
    return sum + (inv.amount * rate);
  }, 0);

  const currencies = [...new Set(invoices.map(inv => inv.currency))];
  const suppliers = [...new Set(invoices.map(inv => inv.supplier))];

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'ILS': '₪',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          {!isConnected ? (
            <button
              onClick={handleConnectGmail}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 space-x-reverse"
            >
              <Mail className="h-5 w-5" />
              <span>שליפת נתונים מהמייל</span>
            </button>
          ) : (
            <button
              onClick={handleExtractInvoices}
              disabled={isExtracting}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse ${
                isExtracting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExtracting ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>{isExtracting ? 'מחלץ...' : 'שליפת נתונים מהמייל'}</span>
            </button>
          )}
          
          {invoices.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse"
              >
                <Download className="h-5 w-5" />
                <span>ייצא CSV</span>
              </button>
              
              <button
                onClick={handleAddToCashFlow}
                disabled={selectedInvoices.size === 0}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse ${
                  selectedInvoices.size === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span>הוסף לתזרים ({selectedInvoices.size})</span>
              </button>
            </>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">הוצאת מידע מהמייל</h1>
          <p className="text-gray-600">
            {isConnected ? `${invoices.length} חשבוניות נמצאו` : 'לא מחובר ל-Gmail'}
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {isConnected ? 'מחובר ל-Gmail' : 'לא מחובר ל-Gmail'}
            </span>
            {isConnected && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                הרשאות קריאה בלבד
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <img 
              src="https://developers.google.com/gmail/images/gmail_icon.png" 
              alt="Gmail" 
              className="w-8 h-8"
            />
            <h3 className="text-lg font-semibold text-gray-900">Gmail Integration</h3>
          </div>
        </div>
      </div>

      {/* Search Configuration */}
      {isConnected && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">הגדרות חיפוש</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                טווח זמן (ימים)
              </label>
              <select
                value={daysBack}
                onChange={(e) => setDaysBack(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              >
                <option value={7}>שבוע אחרון</option>
                <option value={30}>חודש אחרון</option>
                <option value={90}>3 חודשים אחרונים</option>
                <option value={180}>6 חודשים אחרונים</option>
                <option value={365}>שנה אחרונה</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="w-full">
                <div className="text-sm text-gray-600 mb-2 text-right">מילות מפתח</div>
                <div className="text-xs text-gray-500 text-right">
                  חשבונית, קבלה, invoice, receipt, فاتورة, счёт
                </div>
              </div>
            </div>
            
            <div className="flex items-end">
              <div className="w-full text-sm text-gray-600 text-right">
                <div className="mb-2">שפות נתמכות:</div>
                <div className="text-xs text-gray-500">
                  עברית • English • العربية • Русский • Français • Español
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isExtracting && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{progress}%</span>
                <span className="text-sm font-medium text-gray-900 text-right">מחלץ נתונים...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isConnected && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 text-right">📧 איך זה עובד?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-2 text-right">🔐 אבטחה מלאה:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-right">
                <li>• הרשאות קריאה בלבד (read-only)</li>
                <li>• אין גישה לכתיבה או מחיקה</li>
                <li>• חיבור מאובטח דרך Google OAuth</li>
                <li>• הנתונים נשארים אצלך</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2 text-right">🎯 מה נמצא:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-right">
                <li>• חשבוניות ממספקים</li>
                <li>• קבלות מחנויות</li>
                <li>• אישורי תשלום</li>
                <li>• חשבוניות מס</li>
                <li>• בכל השפות (עברית, אנגלית, ערבית, רוסית)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש לפי ספק..."
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">כל המטבעות</option>
              {currencies.map(currency => (
                <option key={currency} value={currency}>
                  {getCurrencySymbol(currency)} {currency}
                </option>
              ))}
            </select>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                סה״כ: ₪{totalAmount.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {filteredInvoices.length} חשבוניות
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {invoices.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{selectedInvoices.size === filteredInvoices.length ? 'בטל בחירה' : 'בחר הכל'}</span>
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-right">
                חשבוניות שנמצאו ({filteredInvoices.length})
              </h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    בחירה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ספק
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מטבע
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    נושא
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מקור
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className={`hover:bg-gray-50 ${
                    selectedInvoices.has(invoice.id) ? 'bg-blue-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.has(invoice.id)}
                        onChange={() => handleSelectInvoice(invoice.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.date.toLocaleDateString('he-IL')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {invoice.date.toLocaleDateString('he-IL', { weekday: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900 max-w-48 truncate">
                        {invoice.supplier}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {invoice.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getCurrencySymbol(invoice.currency)} {invoice.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-900 max-w-64 truncate">
                        {invoice.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {invoice.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !isConnected ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">התחבר ל-Gmail</h3>
          <p className="text-gray-500 mb-6">
            התחבר לחשבון Gmail שלך כדי לשלוף חשבוניות וקבלות אוטומטית
          </p>
          <button
            onClick={handleConnectGmail}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            התחבר עכשיו
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">מוכן לחילוץ</h3>
          <p className="text-gray-500 mb-6">
            לחץ על "שליפת נתונים מהמייל" כדי להתחיל
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">סה״כ חשבוניות</p>
                <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">סה״כ סכום</p>
                <p className="text-2xl font-bold text-green-600">₪{totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">ספקים ייחודיים</p>
                <p className="text-2xl font-bold text-purple-600">{suppliers.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">מטבעות</p>
                <p className="text-2xl font-bold text-orange-600">{currencies.length}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailExtractionManager;