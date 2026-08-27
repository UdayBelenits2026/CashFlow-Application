export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8082/api/v1',
  transactionsApiBaseUrl: 'http://18.60.47.138:8080/api/v1',
  accountsApiBaseUrl: 'http://18.60.47.138:8080/cashflow-account-service/api/v1',
  // TEMP dev-only numeric user id, read via UserContextService. Replace with the authenticated
  // numeric userId (JWT claim or GET /me) when available.
  apiUserId: 1001,
  spendingApiBaseUrl: 'http://localhost:8083/api/v1',
  incomeApiBaseUrl: 'http://localhost:8084/api/v1',
  // Dev-only: resolved by the backend's dev auth shim via the X-User-Id header.
  spendingDevUserId: '42',
};
