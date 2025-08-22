export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  trialEndsAt: Date;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  subscriptionEndsAt?: Date;
  paymentCode?: string;
  isActive: boolean;
  lastLoginAt: Date;
  status?: 'active' | 'view_only' | 'blocked';
  loginCount?: number;
  dataUsage?: number;
  permissions?: string[];
  searchCount?: number;
  maxSearches?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  trialDaysLeft: number;
}

export interface PaymentCode {
  id: string;
  code: string;
  email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'used' | 'expired';
  createdAt: Date;
  usedAt?: Date;
  expiresAt: Date;
  subscriptionMonths: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  paidUsers: number;
  expiredUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
}