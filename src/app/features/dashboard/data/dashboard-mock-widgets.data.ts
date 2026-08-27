import { QuickAction, OnboardingStep, OnboardingAction } from '../models/dashboard-item.model';
// Mock quick actions shown on the dashboard
export const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { id: 'add-income', title: 'Add Income', icon: 'fa-arrow-trend-up' },
  { id: 'add-expense', title: 'Add Expense', icon: 'fa-arrow-trend-down' },
  { id: 'upload-statement', title: 'Upload Statement', icon: 'fa-cloud-arrow-up' },
  { id: 'create-budget', title: 'Create Budget', icon: 'fa-wallet' },
  { id: 'transfer-funds', title: 'Transfer Funds', icon: 'fa-arrow-right-arrow-left' },
  { id: 'view-reports', title: 'View Reports', icon: 'fa-chart-column' },
];
// Mock onboarding steps for new users
export const MOCK_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'complete-profile',
    title: 'Complete your profile setup',
    actionId: 'complete-profile',
    completed: false,
  },
  {
    id: 'connect-account',
    title: 'Connect your first bank account',
    actionId: 'connect-account',
    completed: false,
  },
  { id: 'add-income', title: 'Add your first income', actionId: 'add-income', completed: false },
  {
    id: 'add-expense',
    title: 'Add your first expense',
    actionId: 'add-expense',
    completed: false,
  },
  {
    id: 'create-budget',
    title: 'Create your first budget',
    actionId: 'create-budget',
    completed: false,
  },
  {
    id: 'customize-dashboard',
    title: 'Customize your dashboard',
    actionId: 'customize-dashboard',
    completed: false,
  },
];
// Mock onboarding actions with descriptions and styling tones
export const MOCK_ONBOARDING_ACTIONS: OnboardingAction[] = [
  {
    id: 'connect-account',
    title: 'Connect Bank Account',
    description: 'Securely connect your bank accounts to automatically import transactions.',
    icon: 'bank',
    tone: 'blue',
  },
  {
    id: 'add-income',
    title: 'Add First Income',
    description: 'Record your first income source to see your cash flow take shape.',
    icon: 'wallet',
    tone: 'green',
  },
  {
    id: 'add-expense',
    title: 'Add First Expense',
    description: 'Track your first expense to understand where your money goes.',
    icon: 'receipt',
    tone: 'red',
  },
  {
    id: 'create-budget',
    title: 'Create Your Budget',
    description: 'Set spending limits and stay on track with your financial goals.',
    icon: 'chart',
    tone: 'purple',
  },
];
