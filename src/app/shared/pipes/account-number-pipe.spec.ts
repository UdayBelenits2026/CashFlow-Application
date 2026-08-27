import { AccountNumberPipe } from './account-number-pipe';

describe('AccountNumberPipe', () => {
  let pipe: AccountNumberPipe;

  beforeEach(() => (pipe = new AccountNumberPipe()));

  it('should return empty string for null/undefined/empty', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should return the raw value when length <= visible digits', () => {
    expect(pipe.transform('12')).toBe('12');
    expect(pipe.transform('1234')).toBe('1234');
  });

  it('should mask all but the last 4 digits by default', () => {
    expect(pipe.transform('12345678')).toBe('•••• 5678');
  });

  it('should respect a custom number of visible digits', () => {
    expect(pipe.transform('12345678', 2)).toBe('•••• 78');
  });

  it('should trim whitespace before masking', () => {
    expect(pipe.transform('  987654321  ')).toBe('•••• 4321');
  });
});
