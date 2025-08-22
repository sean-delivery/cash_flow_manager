import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, CheckCircle, XCircle, Clock, Settings, Download, Search, Filter } from 'lucide-react';
import { User, PaymentCode, AdminStats } from '../../types/user';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [paymentCodes, setPaymentCodes] = useState<PaymentCode[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    trialUsers: 0,
    paidUsers: 0,
    expiredUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'codes' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // טעינת משתמשים
    const savedUsers = JSON.parse(localStorage.getItem('crm_all_users') || '[]');
    const usersWithDates = savedUsers.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      trialEndsAt: new Date(user.trialEndsAt),
      subscriptionEndsAt: user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : undefined,
      lastLoginAt: new Date(user.lastLoginAt),
      searchCount: user.searchCount || 0,
      maxSearches: user.maxSearches || (user.email === 'seannon29@gmail.com' ? 999999 : 5)
    }));
    setUsers(usersWithDates);

    // טעינת קודי תשלום
    const savedCodes = JSON.parse(localStorage.getItem('crm_payment_codes') || '[]');
    const codesWithDates = savedCodes.map((code: any) => ({
      ...code,
      createdAt: new Date(code.createdAt),
      expiresAt: new Date(code.expiresAt),
      usedAt: code.usedAt ? new Date(code.usedAt) : undefined
    }));
    setPaymentCodes(codesWithDates);

    // טעינת לוגי כניסה
    const savedLogs = JSON.parse(localStorage.getItem('crm_login_logs') || '[]');
    setLoginLogs(savedLogs);

    // חישוב סטטיסטיקות
    calculateStats(usersWithDates, codesWithDates);
  };

  const calculateStats = (users: User[], codes: PaymentCode[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeUsers = users.filter(user => {
      if (user.subscriptionStatus === 'active') {
        return !user.subscriptionEndsAt || user.subscriptionEndsAt > now;
      }
      return user.trialEndsAt > now;
    }).length;

    const trialUsers = users.filter(user => 
      user.subscriptionStatus === 'trial' && user.trialEndsAt > now
    ).length;

    const paidUsers = users.filter(user => 
      user.subscriptionStatus === 'active'
    ).length;

    const expiredUsers = users.filter(user => {
      if (user.subscriptionStatus === 'active') {
        return user.subscriptionEndsAt && user.subscriptionEndsAt <= now;
      }
      return user.trialEndsAt <= now;
    }).length;

    const usedCodes = codes.filter(code => code.status === 'used');
    const totalRevenue = usedCodes.reduce((sum, code) => sum + code.amount, 0);
    
    const monthlyRevenue = usedCodes
      .filter(code => code.usedAt && code.usedAt >= thisMonth)
      .reduce((sum, code) => sum + code.amount, 0);

    const pendingPayments = codes.filter(code => code.status === 'pending').length;

    setStats({
      totalUsers: users.length,
      activeUsers,
      trialUsers,
      paidUsers,
      expiredUsers,
      totalRevenue,
      monthlyRevenue,
      pendingPayments
    });
  };

  const generatePaymentCode = () => {
    const email = prompt('הזן כתובת מייל של הלקוח:');
    if (!email) return;

    const amount = parseFloat(prompt('הזן סכום התשלום:') || '0');
    if (!amount || amount <= 0) return;

    const months = parseInt(prompt('מספר חודשי מנוי:') || '1');
    if (!months || months <= 0) return;

    const code = `CRM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // פג תוקף תוך שבוע

    const newCode: PaymentCode = {
      id: `code_${Date.now()}`,
      code,
      email,
      amount,
      currency: 'ILS',
      status: 'pending',
      createdAt: now,
      expiresAt,
      subscriptionMonths: months
    };

    const updatedCodes = [...paymentCodes, newCode];
    setPaymentCodes(updatedCodes);
    localStorage.setItem('crm_payment_codes', JSON.stringify(updatedCodes));

    alert(`קוד תשלום נוצר:\n\n${code}\n\nהעבר קוד זה ללקוח לאחר קבלת התשלום.`);
    loadData();
  };

  const verifyPayment = (codeId: string) => {
    if (!confirm('האם אתה בטוח שהתשלום התקבל?')) return;

    const updatedCodes = paymentCodes.map(code =>
      code.id === codeId ? { ...code, status: 'verified' as const } : code
    );
    setPaymentCodes(updatedCodes);
    localStorage.setItem('crm_payment_codes', JSON.stringify(updatedCodes));
    loadData();
  };

  const deletePaymentCode = (codeId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קוד זה?')) return;

    const updatedCodes = paymentCodes.filter(code => code.id !== codeId);
    setPaymentCodes(updatedCodes);
    localStorage.setItem('crm_payment_codes', JSON.stringify(updatedCodes));
    loadData();
  };

  const exportData = () => {
    const data = {
      users,
      paymentCodes,
      stats,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_admin_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === '' || user.subscriptionStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredCodes = paymentCodes.filter(code => {
    const matchesSearch = searchTerm === '' || 
      code.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === '' || code.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={generatePaymentCode}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
          >
            <CreditCard className="h-5 w-5" />
            <span>צור קוד תשלום</span>
          </button>
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse"
          >
            <Download className="h-5 w-5" />
            <span>ייצא נתונים</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">פאנל ניהול</h1>
          <p className="text-gray-600">ניהול משתמשים ותשלומים</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">סה״כ משתמשים</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">משתמשים פעילים</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">הכנסות חודשיות</p>
              <p className="text-2xl font-bold text-purple-600">₪{stats.monthlyRevenue}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">תשלומים ממתינים</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 space-x-reverse px-6">
            {[
              { id: 'users', label: 'משתמשים', icon: Users },
              { id: 'payments', label: 'תשלומים', icon: DollarSign },
              { id: 'codes', label: 'קודי תשלום', icon: CreditCard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">כל הסטטוסים</option>
              {activeTab === 'users' && (
                <>
                  <option value="trial">ניסיון</option>
                  <option value="active">פעיל</option>
                  <option value="expired">פג תוקף</option>
                </>
              )}
              {(activeTab === 'payments' || activeTab === 'codes') && (
                <>
                  <option value="pending">ממתין</option>
                  <option value="verified">מאומת</option>
                  <option value="used">בשימוש</option>
                </>
              )}
              {activeTab === 'logs' && (
                <>
                  <option value="success">הצליח</option>
                  <option value="failed">נכשל</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === 'users' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    משתמש
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    תאריך הצטרפות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    כניסה אחרונה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    תוקף
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.subscriptionStatus)}`}>
                        {user.subscriptionStatus === 'trial' ? 'ניסיון' :
                         user.subscriptionStatus === 'active' ? 'פעיל' : 'פג תוקף'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {user.createdAt.toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {user.lastLoginAt.toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {user.subscriptionStatus === 'active' && user.subscriptionEndsAt
                        ? user.subscriptionEndsAt.toLocaleDateString('he-IL')
                        : user.trialEndsAt.toLocaleDateString('he-IL')
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeTab === 'payments' || activeTab === 'codes') && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    קוד
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    לקוח
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    סכום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    תאריך יצירה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-900">{code.code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {code.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ₪{code.amount} ({code.subscriptionMonths} חודשים)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(code.status)}`}>
                        {code.status === 'pending' ? 'ממתין' :
                         code.status === 'verified' ? 'מאומת' : 
                         code.status === 'used' ? 'בשימוש' : code.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {code.createdAt.toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {code.status === 'pending' && (
                          <button
                            onClick={() => verifyPayment(code.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            אמת תשלום
                          </button>
                        )}
                        <button
                          onClick={() => deletePaymentCode(code.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;