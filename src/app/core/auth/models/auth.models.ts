// Auth Side Panel
export interface AuthSidePanelConfig {
  image: string;
  title: string;
  description: string;
  showCashFlowStats?: boolean;
  showSecurityPoints?: boolean;
}
// Login Request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}
//SignUp Request
export interface SignUpRequest{
  fullname:string;
  email:string;
  password:string;
  confirmPassword:string;
  terms:boolean;
}
