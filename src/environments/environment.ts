export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  spendingApiBaseUrl: 'http://localhost:8083/api/v1',
  spendingMockBaseUrl: 'http://localhost:3003',
  incomeApiBaseUrl: 'http://localhost:8084/api/v1',
  incomeMockBaseUrl: 'http://localhost:3002',
  // Dev-only: resolved by the backend's dev auth shim via the X-User-Id header.
  spendingDevUserId: '42',
  // When true, failed backend calls fall back to json-server mocks.
  useMockFallback: true,
};
