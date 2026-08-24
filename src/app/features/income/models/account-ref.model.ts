export interface AccountRef {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT_CARD' | 'OTHER';
  accountNumberLast4: string;
  balance: number;
  isActive: boolean;
}
