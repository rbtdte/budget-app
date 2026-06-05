import type { DashboardData } from '@/types';

export const MOCK_DASHBOARD: DashboardData = {
  totalSpentThisMonth: 2847.52,
  totalBudget: 3550,
  categoryBreakdown: [
    { category: 'Rent', spent: 1500, limit: 2000 },
    { category: 'Groceries', spent: 387.43, limit: 400 },
    { category: 'Dining', spent: 243.18, limit: 200 },
    { category: 'Subscriptions', spent: 89.97, limit: 100 },
    { category: 'Gas', spent: 124.56, limit: 150 },
    { category: 'Shopping', spent: 312.80, limit: 300 },
    { category: 'Utilities', spent: 189.58, limit: 200 },
    { category: 'Other', spent: 0, limit: 200 },
  ],
  recentTransactions: [
    { id: '1', amount: 1500, merchant: 'Rent Payment', date: '2024-06-01', category: 'Rent', accountId: 'demo', status: 'posted', plaidTransactionId: 't1' },
    { id: '2', amount: 127.43, merchant: 'Vons Grocery', date: '2024-06-03', category: 'Groceries', accountId: 'demo', status: 'posted', plaidTransactionId: 't2' },
    { id: '3', amount: 58.20, merchant: 'Cheesecake Factory', date: '2024-06-04', category: 'Dining', accountId: 'demo', status: 'posted', plaidTransactionId: 't3' },
    { id: '4', amount: 15.99, merchant: 'Netflix', date: '2024-06-05', category: 'Subscriptions', accountId: 'demo', status: 'posted', plaidTransactionId: 't4' },
    { id: '5', amount: 67.82, merchant: 'Shell Gas Station', date: '2024-06-06', category: 'Gas', accountId: 'demo', status: 'posted', plaidTransactionId: 't5' },
    { id: '6', amount: 189.58, merchant: 'SDG&E', date: '2024-06-07', category: 'Utilities', accountId: 'demo', status: 'posted', plaidTransactionId: 't6' },
    { id: '7', amount: 89.99, merchant: 'Amazon', date: '2024-06-08', category: 'Shopping', accountId: 'demo', status: 'posted', plaidTransactionId: 't7' },
    { id: '8', amount: 14.99, merchant: 'Spotify', date: '2024-06-09', category: 'Subscriptions', accountId: 'demo', status: 'posted', plaidTransactionId: 't8' },
  ],
  monthlyTrend: [
    { month: 'Jan', total: 2980 },
    { month: 'Feb', total: 2650 },
    { month: 'Mar', total: 3120 },
    { month: 'Apr', total: 2890 },
    { month: 'May', total: 2750 },
    { month: 'Jun', total: 2847 },
  ],
  upcomingBills: [
    { id: 'b1', merchant: 'Rent Payment', avgAmount: 1500, frequency: 'monthly', nextDueDate: '2024-07-01', category: 'Rent' },
    { id: 'b2', merchant: 'SDG&E', avgAmount: 185, frequency: 'monthly', nextDueDate: '2024-06-20', category: 'Utilities' },
    { id: 'b3', merchant: 'Netflix', avgAmount: 15.99, frequency: 'monthly', nextDueDate: '2024-06-22', category: 'Subscriptions' },
    { id: 'b4', merchant: 'Spotify', avgAmount: 14.99, frequency: 'monthly', nextDueDate: '2024-06-25', category: 'Subscriptions' },
  ],
};
