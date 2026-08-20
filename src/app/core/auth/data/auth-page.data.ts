import { AuthSidePanelConfig } from '../models/auth.models';

export const sidePanelConfig: AuthSidePanelConfig = {
  image: '/assets/images/sign-in.png',
  title: 'Smart Banking, Smarter Decisions.',
  description: 'Take control of your finances with CashFlow.',
  showCashFlowStats: true,
  showSecurityPoints: true,
};

export const signUpPanelConfig: AuthSidePanelConfig = {
  image: '/assets/images/sign-up.png',
  title: 'Build Your Financial Future.',
  description: 'Create your CashFlow account and take control of your finances.',
  showCashFlowStats: true,
  showSecurityPoints: true,
};
