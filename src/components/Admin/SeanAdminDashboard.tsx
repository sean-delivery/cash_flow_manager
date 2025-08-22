import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  DollarSign,
  Globe,
  Lock,
  Code,
  FileText,
  Activity,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  TrendingUp,
  Database,
  Server,
  Wifi,
  HardDrive
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'view_only' | 'blocked';
  subscriptionStatus: 'trial' | 'active' | 'expired';
  trialEndsAt: Date;
  subscriptionEndsAt?: Date;
  lastLoginAt: Date;
  createdAt: Date;
  loginCount: number;
  dataUsage: number;
  permissions: string[];
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  viewOnlyUsers: number;
  blockedUsers: number;
  trialUsers: number;
  expiredUsers: number;
  totalRevenue: number;
  systemLoad: number;
  storageUsed: number;
  apiCalls: number;
}

const SeanAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'data' | 'analytics' | 'security' | 'settings'>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    viewOnlyUsers: 0,
    blockedUsers: 0,
    trialUsers: 0,
    expiredUsers: 0,
    totalRevenue: 0,
    systemLoad: 0,
    storageUsed: 0,
    apiCalls: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsRefreshing(true);
    
    // טעינת נתוני משתמשים
    const savedUsers = JSON.parse(localStorage.getItem('crm_all_users') || '[]');
    const usersWithDates = savedUsers.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      trialEndsAt: new Date(user.trialEndsAt),
      subscriptionEndsAt: user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : undefined,
      lastLoginAt: new Date(user.lastLoginAt),
      loginCount: user.loginCount || Math.floor(Math.random() * 50) + 1,
      dataUsage: user.dataUsage || Math.floor(Math.random() * 1000),
      permissions: user.permissions || ['read', 'write'],
      status: user.status || (user.email === 'seannon29@gmail.com' ? 'active' : 'view_only')
    }));
    
    setUsers(usersWithDates);
    
    // חישוב סטטיסטיקות
    const now = new Date();
    const activeUsers = usersWithDates.filter((u: AdminUser) => u.status === 'active').length;
    const viewOnlyUsers = usersWithDates.filter((u: AdminUser) => u.status === 'view_only').length;
    const blockedUsers = usersWithDates.filter((u: AdminUser) => u.status === 'blocked').length;
    const trialUsers = usersWithDates.filter((u: AdminUser) => u.subscriptionStatus === 'trial' && u.trialEndsAt > now).length;
    const expiredUsers = usersWithDates.filter((u: AdminUser) => u.trialEndsAt <= now && u.subscriptionStatus !== 'active').length;
    
    setStats({
      totalUsers: usersWithDates.length,
      activeUsers,
      viewOnlyUsers,
      blockedUsers,
      trialUsers,
      expiredUsers,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      systemLoad: Math.floor(Math.random() * 100),
      storageUsed: Math.floor(Math.random() * 80) + 10,
      apiCalls: Math.floor(Math.random() * 10000) + 1000
    });
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleUserStatusChange = (userId: string, newStatus: 'active' | 'view_only' | 'blocked') => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    );
    setUsers(updatedUsers);
    
    // עדכון ב-localStorage
    const allUsers = JSON.parse(localStorage.getItem('crm_all_users') || '[]');
    const updatedAllUsers = allUsers.map((u: any) => 
      u.id === userId ? { ...u, status: newStatus } : u
    );
    localStorage.setItem('crm_all_users', JSON.stringify(updatedAllUsers));
    
    // הודעה למשתמש
    const user = users.find(u => u.id === userId);
    if (user) {
      const statusText = {
        'active': 'פעיל מלא',
        'view_only': 'צפייה בלבד',
        'blocked': 'חסום'
      };
      alert(`✅ סטטוס ${user.name} שונה ל: ${statusText[newStatus]}`);
    }
  };

  const handleBulkAction = (action: string, selectedUsers: string[]) => {
    if (selectedUsers.length === 0) {
      alert('❌ אנא בחר משתמשים');
      return;
    }

    const actionText = {
      'block': 'חסום',
      'view_only': 'צפייה בלבד',
      'active': 'פעיל מלא'
    };

    if (confirm(`האם אתה בטוח שברצונך לשנות ${selectedUsers.length} משתמשים ל${actionText[action as keyof typeof actionText]}?`)) {
      selectedUsers.forEach(userId => {
        handleUserStatusChange(userId, action as any);
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === '' || user.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'view_only': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'view_only': return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'blocked': return <Ban className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={loadAdminData}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                isRefreshing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Sean Admin Control Panel</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">View Only</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.viewOnlyUsers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Eye className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Blocked</p>
                      <p className="text-2xl font-bold text-red-600">{stats.blockedUsers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-100">
                      <UserX className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Server Load</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${stats.systemLoad}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.systemLoad}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Storage Used</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${stats.storageUsed}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.storageUsed}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-600">API Calls Today</span>
                      </div>
                      <span className="text-sm font-medium">{stats.apiCalls.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">New user registered:</span>
                        <span className="text-gray-600 ml-1">user@example.com</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Trial expired:</span>
                        <span className="text-gray-600 ml-1">3 users moved to view-only</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">System backup:</span>
                        <span className="text-gray-600 ml-1">Completed successfully</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="view_only">View Only</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(user.status)}
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                {user.status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.subscriptionStatus)}`}>
                              {user.subscriptionStatus}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {user.subscriptionStatus === 'trial' 
                                ? `Expires: ${user.trialEndsAt.toLocaleDateString()}`
                                : user.subscriptionEndsAt 
                                  ? `Until: ${user.subscriptionEndsAt.toLocaleDateString()}`
                                  : 'No expiry'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.lastLoginAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUserStatusChange(user.id, 'active')}
                                className={`p-1 rounded ${user.status === 'active' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                title="Set Active"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserStatusChange(user.id, 'view_only')}
                                className={`p-1 rounded ${user.status === 'view_only' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                                title="Set View Only"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserStatusChange(user.id, 'blocked')}
                                className={`p-1 rounded ${user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                                title="Block User"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content can be added here */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">Data management features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Security</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">Security settings coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">System settings coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeanAdminDashboard;