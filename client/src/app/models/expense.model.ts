export interface Expense {
  _id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  cardLast4?: string;
  uploadBatchId: string;
  type: 'expense' | 'income';
  createdAt: string;
  updatedAt: string;
}

export interface ManualEntry {
  type: 'expense' | 'income';
  category: string;
  description: string;
  amount: number;
  month: number;
  year: number;
}

export interface CategorySummary {
  _id: string;
  total: number;
  count: number;
}

export interface UploadResponse {
  message: string;
  batchId: string;
}

export interface MonthlyTrend {
  month: number;
  total: number;
  count: number;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
  count: number;
}

export interface TopMerchant {
  merchant: string;
  total: number;
  count: number;
}

export interface MonthlyIncome {
  month: number;
  total: number;
}

export interface SubscriptionGroup {
  key: string;
  label: string;
  transactions: Expense[];
  total: number;
}

export interface SubscriptionExclusion {
  _id: string;
  description: string;
  patternKey: string;
  label: string;
}

export interface DashboardData {
  yearTotal: number;
  avgMonthly: number;
  transactionCount: number;
  monthsUploaded: number;
  incomeTotal: number;
  netBalance: number;
  subscriptionTotal: number;
  monthlyTrend: MonthlyTrend[];
  monthlyIncome: MonthlyIncome[];
  categoryBreakdown: CategoryBreakdownItem[];
  topMerchants: TopMerchant[];
  largestTransactions: Expense[];
}
