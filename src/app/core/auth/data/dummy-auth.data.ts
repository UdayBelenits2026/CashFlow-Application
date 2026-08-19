import {
  LoginRequest,
  AuthSidePanelConfig,
} from '../models/auth.models';
// Dummy Login Form
export const DUMMY_LOGIN_DATA: LoginRequest = {
  email: 'john.doe@example.com',
  password: 'Password@123',
  rememberMe: false,
};
// Sign In Side Panel
export const sidePanelConfig: AuthSidePanelConfig = {
  image: '/assets/images/sign-in.png',
  title: 'Smart Banking, Smarter Decisions.',
  description: 'Take control of your finances with CashFlow.',
  showCashFlowStats: true,
  showSecurityPoints: true,
};
// Sign Up Side Panel
export const SignUppanel: AuthSidePanelConfig = {
  image: '/assets/images/sign-up.png',
  title: 'Build Your Financial Future.',
  description: 'Create your CashFlow account and take control of your finances.',
  showCashFlowStats: true,
  showSecurityPoints: true,
};
// Dummy Valid Credentials
export const DUMMY_LOGIN_CREDENTIALS = {
  email: 'john.doe@example.com',
  password: 'Password@123',
} as const;