export interface SummaryCard {
  id: 'income' | 'expenses' | 'cashFlow' | 'savings';
  title: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down';
  comparison: string;
  icon: string;
}
export interface DashboardItem {
  id: number;
  title: string;
  date: string;
  amount: number;
  icon: string;
  type: 'income' | 'expense' | 'bill';
}
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
}
export interface OnboardingStep {
  id: string;
  title: string;
  actionId: string;
  completed: boolean;
}
export interface OnboardingAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: 'blue' | 'green' | 'red' | 'purple';
}
export interface CashBalanceData {
  totalBalance: number;
  inAccounts: number;
  pending: number;
}
export interface DashboardApiResponse {
  summaryCards: SummaryCard[];
  upcomingBills: DashboardItem[];
  recentTransactions: DashboardItem[];
  recentIncome: DashboardItem[];
  recentExpenses: DashboardItem[];
  quickActions: QuickAction[];
  onboardingSteps: OnboardingStep[];
  onboardingActions: OnboardingAction[];
  isNewUser: boolean;
  cashBalance: CashBalanceData;
}
export interface DashboardState {
  summaryCards: SummaryCard[];
  upcomingBills: DashboardItem[];
  recentTransactions: DashboardItem[];
  recentIncome: DashboardItem[];
  recentExpenses: DashboardItem[];
  quickActions: QuickAction[];
  onboardingSteps: OnboardingStep[];
  onboardingActions: OnboardingAction[];
  isNewUser: boolean;
  cashBalance: CashBalanceData;
  selectedAction: string | null;
  loading: boolean;
  loadError: boolean;
}
