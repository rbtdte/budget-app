export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  date: string;
  category: Category;
  accountId: string;
  status: 'pending' | 'posted';
  plaidTransactionId: string;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  accessToken: string;
  syncCursor: string | null;
}

export type Category =
  | 'Rent'
  | 'Utilities'
  | 'Groceries'
  | 'Dining'
  | 'Gas'
  | 'Subscriptions'
  | 'Shopping'
  | 'Other';

export interface Budget {
  category: Category;
  monthlyLimit: number;
}

export interface RecurringBill {
  id: string;
  merchant: string;
  avgAmount: number;
  frequency: 'monthly' | 'weekly' | 'annual';
  nextDueDate: string;
  category: Category;
}

export interface DashboardData {
  totalSpentThisMonth: number;
  totalBudget: number;
  categoryBreakdown: { category: Category; spent: number; limit: number }[];
  recentTransactions: Transaction[];
  monthlyTrend: { month: string; total: number }[];
  upcomingBills: RecurringBill[];
}
