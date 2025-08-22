export interface CashFlowEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  client?: string;
  date: Date;
  paymentMethod: 'cash' | 'bit' | 'paybox' | 'credit' | 'paypal' | 'bank_transfer' | 'check';
  category: string;
  notes?: string;
  isRecurring?: boolean;
  recurringMonths?: number;
  createdAt: Date;
}

export interface CashFlowSummary {
  currentBalance: number;
  balanceInOneMonth: number;
  balanceInThreeMonths: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface MonthlyProjection {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  cumulativeBalance: number;
}