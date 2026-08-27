export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api/v1',
  transactionsApiBaseUrl: 'http://18.60.47.138:8080/api/v1',
  // Accounts still uses json-server (no real backend yet); URL centralized here.
  accountsApiBaseUrl: 'http://localhost:3007',
  // TEMP dev-only numeric user id, read via UserContextService. Replace with the authenticated
  // numeric userId (JWT claim or GET /me) when available.
  apiUserId: 1001,
  spendingApiBaseUrl: 'http://localhost:8083/api/v1',
  spendingMockBaseUrl: 'http://localhost:3003',
  incomeApiBaseUrl: 'http://localhost:8084/api/v1',
  incomeMockBaseUrl: 'http://localhost:3002',
  // Dev-only: resolved by the backend's dev auth shim via the X-User-Id header.
  spendingDevUserId: '42',
  // When true, failed backend calls fall back to json-server mocks.
  useMockFallback: true,
};
