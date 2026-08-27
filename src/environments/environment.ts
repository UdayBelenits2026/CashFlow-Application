export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8082/api/v1',
  spendingApiBaseUrl: 'http://localhost:8083/api/v1',
  incomeApiBaseUrl: 'http://localhost:8084/api/v1',
  // Dev-only: resolved by the backend's dev auth shim via the X-User-Id header.
  spendingDevUserId: '42',
};
