/** File purpose: Implements logic for app\features\accounts\data\account.mock.ts. */
import { Account } from '../models/accounts.model';

// Seed data used for local demos and fallback development flows.
export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'ACC001',
    accountName: 'Main Checking',
    accountType: 'Bank Account',
    accountNumber: 'â€¢â€¢â€¢â€¢1234',
    balance: 12450,
    availableBalance: 12300,
    bankName: 'Chase Bank',
    routingNumber: '021000021',
    currency: 'USD',
    openDate: '2024-01-15',
    status: 'Active'
  },
  {
    id: 'ACC002',
    accountName: 'Savings Account',
    accountType: 'Bank Account',
    accountNumber: 'â€¢â€¢â€¢â€¢5678',
    balance: 10000,
    availableBalance: 10000,
    bankName: 'Chase Bank',
    routingNumber: '021000021',
    currency: 'USD',
    openDate: '2024-02-10',
    status: 'Active'
  },
  {
    id: 'ACC003',
    accountName: 'Credit Card',
    accountType: 'Credit Card',
    accountNumber: 'â€¢â€¢â€¢â€¢5678',
    balance: -2310,
    availableBalance: 2690,
    bankName: 'Chase Bank',
    currency: 'USD',
    openDate: '2024-03-20',
    status: 'Active'
  },
  {
    id: 'ACC004',
    accountName: 'Cash Wallet',
    accountType: 'Cash / Wallet',
    accountNumber: 'CASH001',
    balance: 1250,
    availableBalance: 1250,
    currency: 'USD',
    openDate: '2024-04-01',
    status: 'Active'
  },
  {
    id: 'ACC005',
    accountName: 'Investment Account',
    accountType: 'Investment',
    accountNumber: 'INV001',
    balance: 2000,
    availableBalance: 2000,
    currency: 'USD',
    openDate: '2024-05-15',
    status: 'Active'
  },
  {
    id: 'ACC006',
    accountName: 'Business Account',
    accountType: 'Bank Account',
    accountNumber: 'â€¢â€¢â€¢â€¢3468',
    balance: 8960,
    availableBalance: 8960,
    bankName: 'Chase Bank',
    routingNumber: '021000021',
    currency: 'USD',
    openDate: '2024-06-01',
    status: 'Active'
  }
];
